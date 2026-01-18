from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "INDICATOR"
    
    # Настройки безопасности (Занятие 8)
    SECRET_KEY: str = "super_secret_key_change_me_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Настройки базы данных (Занятие 3)
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"

    class Config:
        env_file = ".env"

# Вот эта строка критически важна!
settings = Settings()