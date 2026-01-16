"""
LLM Service - Groq (Primary) + Gemini (Fallback)
Handles AI-powered semantic dependency detection
"""

import os
import json
import logging
from typing import List, Optional
from groq import Groq
import google.generativeai as genai

from config import settings
from models.schemas import TaskInput, SuggestedDependency, DependencyType

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Prompt template for dependency detection
DEPENDENCY_DETECTION_PROMPT = """You are an expert project manager AI. Analyze these project tasks and identify hidden dependencies that humans might miss.

Look for:
1. **Semantic relationships**: Tasks that reference each other's outputs (e.g., "Design API" → "Implement API" → "Test API")
2. **Logical sequencing**: Tasks that must happen in order (e.g., "Database schema" before "Backend CRUD")
3. **Resource dependencies**: Tasks that require completion of shared resources
4. **Technical prerequisites**: Development patterns (Frontend needs Backend API ready)

TASKS:
{tasks_json}

EXISTING DEPENDENCIES (already defined, do not repeat these):
{existing_deps}

Return a JSON object with an array of suggested NEW dependencies:
{{
    "dependencies": [
        {{
            "taskId": "id-of-task-that-depends",
            "dependsOnTaskId": "id-of-task-it-depends-on",
            "confidence": 0.85,
            "reason": "Brief explanation why this dependency exists"
        }}
    ]
}}

RULES:
- Only suggest high-confidence dependencies (confidence >= 0.7)
- Do not create circular dependencies
- Do not repeat existing dependencies
- Maximum 5 suggestions
- If no clear dependencies found, return empty array

Return ONLY the JSON object, no other text."""


class LLMService:
    """
    LLM service with Groq as primary and Gemini as fallback.
    Both are free tier APIs.
    """
    
    def __init__(self):
        self.groq_client = None
        self.gemini_model = None
        self._initialize_clients()
    
    def _initialize_clients(self):
        """Initialize LLM clients"""
        # Initialize Groq
        if settings.GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
                logger.info("✅ Groq client initialized")
            except Exception as e:
                logger.warning(f"⚠️ Groq initialization failed: {e}")
        
        # Initialize Gemini
        if settings.GEMINI_API_KEY:
            try:
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("✅ Gemini client initialized")
            except Exception as e:
                logger.warning(f"⚠️ Gemini initialization failed: {e}")
    
    def _format_tasks_for_prompt(self, tasks: List[TaskInput]) -> str:
        """Format tasks into a readable string for the prompt"""
        formatted = []
        for task in tasks:
            formatted.append({
                "id": task.id,
                "title": task.title,
                "description": task.description or "No description",
                "status": task.status.value,
                "priority": task.priority.value,
                "assignee": task.assigneeName or task.assigneeId,
                "due_date": task.due_date.isoformat()
            })
        return json.dumps(formatted, indent=2)
    
    def _parse_llm_response(self, response_text: str) -> List[SuggestedDependency]:
        """Parse LLM response into SuggestedDependency objects"""
        try:
            # Clean the response
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            data = json.loads(cleaned)
            dependencies = data.get("dependencies", [])
            
            result = []
            for dep in dependencies:
                if dep.get("confidence", 0) >= 0.7:
                    result.append(SuggestedDependency(
                        taskId=dep["taskId"],
                        dependsOnTaskId=dep["dependsOnTaskId"],
                        type=DependencyType.FINISH_TO_START,
                        confidence=min(1.0, max(0.0, dep.get("confidence", 0.8))),
                        reason=dep.get("reason", "AI detected semantic relationship")
                    ))
            
            return result[:5]  # Max 5 suggestions
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM response: {e}")
            logger.error(f"Response was: {response_text[:500]}")
            return []
        except Exception as e:
            logger.error(f"Error parsing dependencies: {e}")
            return []
    
    async def detect_dependencies_groq(
        self, 
        tasks: List[TaskInput], 
        existing_deps: List[str] = []
    ) -> List[SuggestedDependency]:
        """Use Groq (Llama 3.3 70B) for dependency detection"""
        if not self.groq_client:
            raise Exception("Groq client not initialized")
        
        prompt = DEPENDENCY_DETECTION_PROMPT.format(
            tasks_json=self._format_tasks_for_prompt(tasks),
            existing_deps=json.dumps(existing_deps) if existing_deps else "None"
        )
        
        response = self.groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert project manager. Return only valid JSON."
                },
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=1024
        )
        
        return self._parse_llm_response(response.choices[0].message.content)
    
    async def detect_dependencies_gemini(
        self, 
        tasks: List[TaskInput], 
        existing_deps: List[str] = []
    ) -> List[SuggestedDependency]:
        """Use Gemini 1.5 Flash for dependency detection (fallback)"""
        if not self.gemini_model:
            raise Exception("Gemini client not initialized")
        
        prompt = DEPENDENCY_DETECTION_PROMPT.format(
            tasks_json=self._format_tasks_for_prompt(tasks),
            existing_deps=json.dumps(existing_deps) if existing_deps else "None"
        )
        
        response = self.gemini_model.generate_content(
            prompt,
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.1,
                "max_output_tokens": 1024
            }
        )
        
        return self._parse_llm_response(response.text)
    
    async def detect_dependencies(
        self, 
        tasks: List[TaskInput], 
        existing_deps: List[str] = []
    ) -> List[SuggestedDependency]:
        """
        Detect semantic dependencies using LLM.
        Uses Groq as primary, falls back to Gemini on rate limit or error.
        """
        if len(tasks) < 2:
            return []  # Need at least 2 tasks for dependencies
        
        # Try Groq first (faster)
        if self.groq_client:
            try:
                logger.info("🧠 Using Groq for dependency detection")
                return await self.detect_dependencies_groq(tasks, existing_deps)
            except Exception as e:
                error_str = str(e).lower()
                if "rate_limit" in error_str or "429" in error_str:
                    logger.warning("⚠️ Groq rate limited, falling back to Gemini")
                else:
                    logger.error(f"Groq error: {e}, falling back to Gemini")
        
        # Fallback to Gemini
        if self.gemini_model:
            try:
                logger.info("🔄 Using Gemini for dependency detection")
                return await self.detect_dependencies_gemini(tasks, existing_deps)
            except Exception as e:
                logger.error(f"Gemini error: {e}")
                return []
        
        logger.error("❌ No LLM available for dependency detection")
        return []


# Singleton instance
llm_service = LLMService()
