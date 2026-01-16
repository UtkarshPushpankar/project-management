"""
AI Dependency Brain - FastAPI Application
Main entry point for the AI service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from routers import analysis
from config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    print(f"🧠 AI Dependency Brain starting on port {settings.PORT}")
    print(f"📊 Primary LLM: Groq (Llama 3.3 70B)")
    print(f"🔄 Fallback LLM: Gemini 1.5 Flash")
    yield
    print("👋 AI Dependency Brain shutting down")


app = FastAPI(
    title="AI Dependency Brain",
    description="AI-powered dependency detection and risk analysis for project management",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(analysis.router, prefix="/api/v1", tags=["Analysis"])


@app.get("/")
def root():
    """Root endpoint"""
    return {
        "service": "AI Dependency Brain",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "primary_llm": "groq",
        "fallback_llm": "gemini"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
