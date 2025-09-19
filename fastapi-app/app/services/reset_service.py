# app/services/reset_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.reset_request import ResetRequest
from app.models.user import User
from app.services.security import generate_temp_password, hash_password, temp_pw_expires
from app.services.audit_service import write_audit
from datetime import datetime

async def create_reset_request(db: AsyncSession, user_email: str, reason: str | None, requested_by_id: int | None = None):
    # find user
    res = await db.execute(select(User).where(User.email == user_email))
    user = res.scalars().first()
    if not user:
        raise ValueError("User not found")
    req = ResetRequest(requested_by=user.id, reason=reason)
    db.add(req)
    await db.commit()
    await db.refresh(req)
    await write_audit(db, "PasswordReset", req.id, "CreateRequest", user.id, {"reason": reason})
    return req

async def list_pending_requests(db: AsyncSession):
    res = await db.execute(select(ResetRequest).where(ResetRequest.status == "Pending"))
    return res.scalars().all()

async def approve_request(db: AsyncSession, request_id: int, approver_id: int, expires_in_minutes: int):
    res = await db.execute(select(ResetRequest).where(ResetRequest.id == request_id))
    req = res.scalars().first()
    if not req:
        raise ValueError("Request not found")
    if req.status != "Pending":
        raise ValueError("Already processed")
    # load user
    res = await db.execute(select(User).where(User.id == req.requested_by))
    user = res.scalars().first()
    if not user:
        raise ValueError("User not found")

    temp_pw = generate_temp_password()
    hashed = hash_password(temp_pw)
    user.hashed_password = hashed
    # Note: For temporary expiry tracking, you can add columns to User (not included here)
    db.add(user)
    req.status = "Approved"
    req.approver_id = approver_id
    req.approved_at = datetime.utcnow()
    db.add(req)
    await db.commit()
    await write_audit(db, "PasswordReset", req.id, "ApproveReset", approver_id, {"expires_in_minutes": expires_in_minutes})
    # IMPORTANT: send temp_pw to user via secure channel (email/SMS). For demo return it.
    return {"temp_password": temp_pw}
