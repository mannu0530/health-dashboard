from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Health Dashboard API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False
    
    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # CORS
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/health_dashboard"
    DATABASE_ECHO: bool = False
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    
    # Monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    # External Services
    PROMETHEUS_URL: Optional[str] = None
    GRAFANA_URL: Optional[str] = None
    
    # Email (for notifications)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_TLS: bool = True
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Session
    SESSION_SECRET: str = "your-session-secret-change-in-production"
    SESSION_EXPIRE_HOURS: int = 24
    
    # Health Check
    HEALTH_CHECK_TIMEOUT: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()

# Environment-specific overrides
if settings.ENVIRONMENT == "production":
    settings.DEBUG = False
    settings.DATABASE_ECHO = False
    settings.ALLOWED_HOSTS = [
        "health-dashboard.com",
        "www.health-dashboard.com",
        "api.health-dashboard.com"
    ]
elif settings.ENVIRONMENT == "staging":
    settings.DEBUG = True
    settings.DATABASE_ECHO = True
    settings.ALLOWED_HOSTS = [
        "staging.health-dashboard.com",
        "staging-api.health-dashboard.com"
    ]
else:  # development
    settings.DEBUG = True
    settings.DATABASE_ECHO = True
    settings.ALLOWED_HOSTS = ["*"]
