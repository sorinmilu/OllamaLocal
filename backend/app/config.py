"""
Configuration settings for the Ollama Web Interface backend.
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    APP_NAME: str = "Ollama Web Interface"
    VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_TIMEOUT: float = 60.0
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./ollama_web.db"
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    
    # Context
    DEFAULT_CONTEXT_SIZE: int = 10
    MAX_CONTEXT_SIZE: int = 50
    
    # Default parameters
    DEFAULT_TEMPERATURE: float = 0.7
    DEFAULT_TOP_P: float = 0.9
    DEFAULT_TOP_K: int = 40
    DEFAULT_REPEAT_PENALTY: float = 1.1
    DEFAULT_NUM_CTX: int = 2048
    DEFAULT_NUM_PREDICT: int = 512
    DEFAULT_NUM_THREAD: int = 4
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
