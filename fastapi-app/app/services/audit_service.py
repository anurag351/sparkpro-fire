# app/services/audit_service.py
import json
from app.models.audit import AuditLog
from sqlalchemy.ext.asyncio import AsyncSession

async def write_audit(db: AsyncSession, entity_type: str, entity_id: str | int | None, action: str, performed_by: int | None, details: dict | None = None):
    rec = AuditLog(
        entity_type=entity_type,
        entity_id=str(entity_id) if entity_id is not None else None,
        action=action,
        performed_by=performed_by,
        details=json.dumps(details) if details else None
    )
    db.add(rec)
    await db.commit()
