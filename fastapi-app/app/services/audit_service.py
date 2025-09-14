# app/services/audit_service.py
# Functions for logging audit entries.
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

def log_audit(
    db: Session,
    entity_type: str,
    entity_id: int,
    action: str,
    performed_by: int,
    comments: str = None,
    old_data: str = None,
    new_data: str = None
):
    log_entry = AuditLog(
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        performed_by=performed_by,
        comments=comments,
        old_data=old_data,
        new_data=new_data
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return log_entry
