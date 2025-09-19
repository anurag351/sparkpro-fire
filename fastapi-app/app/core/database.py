# app/core/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

DATABASE_URL = settings.DATABASE_URL

# Engine
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# Session
async_session = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)

# Base model
Base = declarative_base()


# Dependency for routes
from typing import AsyncGenerator

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session



# ✅ Init DB on startup
async def init_db():
    async with engine.begin() as conn:
        # yahan sare models import karne hote hain taki Base.metadata me aa jaye
        from app.models import user, employee, leave  # aur jitne bhi models hain
        await conn.run_sync(Base.metadata.create_all)
