"""
Application configuration using pydantic-settings.
"""
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # General
    APP_NAME: str = "axiovital-ai"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "info"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:4000"]

    # Database (for AI service direct access if needed)
    DATABASE_URL: str = "postgresql://axiovital_user:change-me@localhost:5432/axiovital"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Backend API
    BACKEND_URL: str = "http://localhost:4000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()
