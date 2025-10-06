from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "SparkPro Fire Controls API"

    # Database URL: use .env in real setup
    DATABASE_URL: str = "sqlite+aiosqlite:///./sparkpro.db"
    # Example for Postgres (set in .env instead):
    #DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/sparkpro
    FRONTEND_BUILD_DIR: str = "frontend/build"
    TEMP_PW_EXPIRES_MINUTES: int = 60
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
