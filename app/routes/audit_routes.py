# app/routes/audit_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.audit_schema import AuditLogOut
from app.services import audit_service

router = APIRouter(prefix="/audits", tags=["audits"])

# ✅ Get all audit logs
@router.get("/", response_model=list[AuditLogOut])
async def get_all(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_session)):
    return await audit_service.get_all_audits(db, skip, limit)

# ✅ Get audits by entity
@router.get("/entity/{entity_type}/{entity_id}", response_model=list[AuditLogOut])
async def get_by_entity(entity_type: str, entity_id: str, db: AsyncSession = Depends(get_session)):
    return await audit_service.get_audits_by_entity(db, entity_type, entity_id)

# ✅ Get audits by user
@router.get("/user/{performed_by}", response_model=list[AuditLogOut])
async def get_by_user(performed_by: str, db: AsyncSession = Depends(get_session)):
    return await audit_service.get_audits_by_user(db, performed_by)

# ✅ Get audits by action type
@router.get("/action/{action}", response_model=list[AuditLogOut])
async def get_by_action(action: str, db: AsyncSession = Depends(get_session)):
    return await audit_service.get_audits_by_action(db, action)
