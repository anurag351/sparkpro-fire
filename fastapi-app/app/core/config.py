# app/core/config.py
from pydantic_settings import BaseSettings
class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Anurag@localhost:5432/sparkpro"
    HIDDEN_MD_ID: int = 1

    class Config:
        env_file = ".env"

settings = Settings()
