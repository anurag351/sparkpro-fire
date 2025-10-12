# app/services/audit_service.py
from app.models.audit import AuditLog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Insert new audit log
async def log_audit(
    db: AsyncSession,
    entity_type: str,
    entity_id: str,
    action: str,
    performed_by: str,
    comment: str = None,
):  
    log = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        performed_by=performed_by,
        comment=comment
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log

# Get all audit logs (with pagination)
async def get_all_audits(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(AuditLog).offset(skip).limit(limit)
    )
    return result.scalars().all()

# Get audits for a specific entity (Employee / Request etc.)
async def get_audits_by_entity(db: AsyncSession, entity_type: str, entity_id: str):
    result = await db.execute(
        select(AuditLog).where(
            AuditLog.entity_type == entity_type,
            AuditLog.entity_id == entity_id
        )
    )
    return result.scalars().all()

# Get audits performed by a specific user
async def get_audits_by_user(db: AsyncSession, performed_by: str):
    result = await db.execute(
        select(AuditLog).where(AuditLog.performed_by == performed_by)
    )
    return result.scalars().all()

# ✅ Get audits filtered by action type
async def get_audits_by_action(db: AsyncSession, action: str):
    result = await db.execute(
        select(AuditLog).where(AuditLog.action == action)
    )
    return result.scalars().all()
