# app/schemas/audit_schema.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AuditOut(BaseModel):
    id: int
    entity_type: str
    entity_id: Optional[str]
    action: str
    performed_by: Optional[int]
    timestamp: datetime
    comments: Optional[str]
    old_data: Optional[str]
    new_data: Optional[str]

    class Config:
        orm_mode = True
