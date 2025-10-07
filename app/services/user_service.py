# app/services/user_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.services.security import hash_password
from app.services.audit_service import log_audit as write_audit
from fastapi import HTTPException

async def create_user(db, username: str, password: str, performed_by: str, tempPassword: bool):
    result = await db.execute(select(User).where(User.username == username))
    existing_user = result.scalar_one_or_none()
    hashed_password = hash_password(password)

    try:
        # ⚡ Move audit after commit to avoid premature FK check
        if existing_user:
            existing_user.hashed_password = hashed_password
            existing_user.temp_password = tempPassword
            db.add(existing_user)
            await db.commit()
            await db.refresh(existing_user)
            await write_audit(
                db=db,
                entity_type="Password",
                entity_id=username,
                action="UPDATE",
                performed_by=performed_by,
                comment=f"Employee {performed_by} updated {username} password successfully"
            )
            return existing_user
        else:
            u = User(username=username, hashed_password=hashed_password, temp_password=False)
            db.add(u)
            await db.commit()
            await db.refresh(u)
            await write_audit(
                db=db,
                entity_type="Password",
                entity_id=username,
                action="CREATE",
                performed_by=performed_by,
                comment=f"Employee {performed_by} created {username} password successfully"
            )
            return u
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AUDIT ERROR: {str(e)}")

async def get_user_by_username(db: AsyncSession, username: str, password: str):
    res = await db.execute(select(User).where(User.username == username and User.hashed_password==hash_password(password)))
    return res.scalars().first()
