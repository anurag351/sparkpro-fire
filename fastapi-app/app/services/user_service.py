# app/services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.services.security import hash_password
from app.services.audit_service import write_audit

async def create_user(db: AsyncSession, username: str, email: str, password: str):
    u = User(username=username, email=email, hashed_password=hash_password(password))
    db.add(u)
    await db.commit()
    await db.refresh(u)
    await write_audit(db, "User", u.id, "CreateUser", None, {"username": username})
    return u

async def get_user_by_email(db: AsyncSession, email: str):
    res = await db.execute(select(User).where(User.email == email))
    return res.scalars().first()
