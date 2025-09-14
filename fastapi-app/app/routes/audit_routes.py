# app/routes/audit_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..core.database import get_session
from ..models.audit import AuditLog
from ..schemas.audit_schema import AuditOut
from typing import List

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/", response_model=List[AuditOut])
async def list_audit_logs(limit: int = 100, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit))
    rows = result.scalars().all()
    return rows
