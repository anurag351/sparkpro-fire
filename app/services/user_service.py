# app/services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.services.security import hash_password
from app.services.audit_service import log_audit as write_audit
async def create_user(db, username: str, password: str):
    # Check if user already exists
    result = await db.execute(select(User).where(User.username == username))
    existing_user = result.scalar_one_or_none()
    hashed_password = hash_password(password)
    if existing_user:
        # Agar user exist karta hai -> password update karo
        existing_user.hashed_password = hashed_password
        existing_user.temp_password = False  # ya True agar tum temporary rakhna chahte ho
        db.add(existing_user)
        await db.commit()
        await db.refresh(existing_user)
        return existing_user
    else:
        # Agar user exist nahi karta -> naya create karo
        u = User(username=username, hashed_password=hashed_password, temp_password=True)
        db.add(u)
        await db.commit()
        await db.refresh(u)
        return u

async def get_user_by_username(db: AsyncSession, username: str, password: str):
    res = await db.execute(select(User).where(User.username == username and User.hashed_password==hash_password(password)))
    return res.scalars().first()
