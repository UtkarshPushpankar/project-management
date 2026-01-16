"""
Analysis Router - API endpoints for AI analysis
"""

from fastapi import APIRouter, HTTPException
from datetime import datetime
import httpx
import logging

from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, RiskAnalysis,
    DependencyDetectionRequest, DependencyDetectionResponse,
    CriticalPathResponse, RiskScoreResponse, DependencyInput
)
from services.rule_engine import RuleEngine
from services.llm_service import llm_service
from config import settings

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_project(request: AnalyzeRequest):
    """
    Full project analysis including:
    - Risk score calculation
    - Critical path detection
    - AI dependency suggestions
    - Alert generation
    """
    try:
        project = request.project
        
        # Initialize rule engine
        engine = RuleEngine(
            tasks=project.tasks,
            dependencies=project.existingDependencies
        )
        
        # Calculate critical path
        critical_path, total_days = engine.calculate_critical_path()
        
        # Calculate risk score
        risk_score, risk_level, factors = engine.calculate_risk_score()
        
        # Generate alerts
        alerts = engine.generate_alerts()
        
        # Generate bottlenecks
        bottlenecks = engine.generate_bottlenecks(critical_path)
        
        # Detect resource conflicts
        resource_conflicts = engine.detect_resource_conflicts()
        
        # AI dependency detection (if tasks exist)
        suggested_deps = []
        if len(project.tasks) >= 2:
            existing_dep_pairs = [
                f"{d.taskId}->{d.dependsOnTaskId}" 
                for d in project.existingDependencies
            ]
            suggested_deps = await llm_service.detect_dependencies(
                project.tasks, 
                existing_dep_pairs
            )
        
        # Create analysis result
        analysis = RiskAnalysis(
            projectId=project.id,
            riskScore=risk_score,
            riskLevel=risk_level,
            criticalPathIds=critical_path,
            bottlenecks=bottlenecks,
            alerts=alerts,
            suggestedDependencies=suggested_deps,
            resourceConflicts=resource_conflicts,
            analyzedAt=datetime.now()
        )
        
        # Send email alert if risk is critical
        if risk_score < settings.RISK_ALERT_THRESHOLD:
            await send_risk_alert(project.id, project.name, risk_score, risk_level)
        
        return AnalyzeResponse(success=True, analysis=analysis)
        
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return AnalyzeResponse(success=False, error=str(e))


@router.post("/dependencies/detect", response_model=DependencyDetectionResponse)
async def detect_dependencies(request: DependencyDetectionRequest):
    """
    Detect semantic dependencies using AI.
    """
    try:
        if len(request.tasks) < 2:
            return DependencyDetectionResponse(
                success=True,
                dependencies=[],
                error="Need at least 2 tasks for dependency detection"
            )
        
        dependencies = await llm_service.detect_dependencies(request.tasks)
        
        return DependencyDetectionResponse(
            success=True,
            dependencies=dependencies
        )
        
    except Exception as e:
        logger.error(f"Dependency detection failed: {e}")
        return DependencyDetectionResponse(success=False, error=str(e))


@router.post("/risk/calculate", response_model=RiskScoreResponse)
async def calculate_risk(request: AnalyzeRequest):
    """
    Calculate risk score for a project.
    """
    try:
        engine = RuleEngine(
            tasks=request.project.tasks,
            dependencies=request.project.existingDependencies
        )
        
        risk_score, risk_level, factors = engine.calculate_risk_score()
        
        return RiskScoreResponse(
            success=True,
            riskScore=risk_score,
            riskLevel=risk_level,
            factors=factors
        )
        
    except Exception as e:
        logger.error(f"Risk calculation failed: {e}")
        return RiskScoreResponse(success=False, error=str(e))


@router.post("/critical-path", response_model=CriticalPathResponse)
async def get_critical_path(request: AnalyzeRequest):
    """
    Calculate critical path for a project.
    """
    try:
        engine = RuleEngine(
            tasks=request.project.tasks,
            dependencies=request.project.existingDependencies
        )
        
        critical_path, total_days = engine.calculate_critical_path()
        
        return CriticalPathResponse(
            success=True,
            criticalPathIds=critical_path,
            totalDays=total_days
        )
        
    except Exception as e:
        logger.error(f"Critical path calculation failed: {e}")
        return CriticalPathResponse(success=False, error=str(e))


async def send_risk_alert(project_id: str, project_name: str, risk_score: int, risk_level: str):
    """
    Send email alert via Node.js backend when risk is critical.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.NODE_API_URL}/api/internal/risk-alert",
                json={
                    "projectId": project_id,
                    "projectName": project_name,
                    "riskScore": risk_score,
                    "riskLevel": risk_level
                },
                timeout=10.0
            )
            if response.status_code == 200:
                logger.info(f"📧 Risk alert sent for project {project_name}")
            else:
                logger.warning(f"Failed to send risk alert: {response.status_code}")
    except Exception as e:
        logger.warning(f"Could not send risk alert: {e}")
