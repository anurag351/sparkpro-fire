from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "SparkPro Fire Controls API"

    # Correct: type annotation required
    DATABASE_URL: str = "postgresql+asyncpg://sparkpro_user:Anurag@dpg-xxxxx.a.render.com:5432/sparkpro"

    FRONTEND_BUILD_DIR: str = "frontend/build"
    TEMP_PW_EXPIRES_MINUTES: int = 60
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
