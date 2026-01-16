"""
Configuration settings using Pydantic
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # LLM API Keys
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    # Database
    DATABASE_URL: str = ""
    
    # Node.js backend for email notifications
    NODE_API_URL: str = "http://localhost:5000"
    
    # Server settings
    PORT: int = 8000
    
    # Risk thresholds
    RISK_ALERT_THRESHOLD: int = 50  # Send email when score drops below this
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
