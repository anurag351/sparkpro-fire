# app/schemas/audit_schema.py
from pydantic import BaseModel
from datetime import datetime

class AuditLogBase(BaseModel):
    entity_type: str
    entity_id: str
    action: str
    performed_by: str
    comment: str | None = None

class AuditLogOut(AuditLogBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
