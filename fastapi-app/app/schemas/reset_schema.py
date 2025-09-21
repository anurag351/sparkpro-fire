# app/schemas/reset_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class ResetRequestCreate(BaseModel):
    user_email: EmailStr
    reason: Optional[str] = None

class ResetRequestOut(BaseModel):
    id: int
    requested_by: int
    status: str
    requested_at: str
    reason: Optional[str]
    class Config:
        from_attributes = True

class ResetApproveIn(BaseModel):
    approver_id: int
    approver_comment: Optional[str] = None
    expires_in_minutes: int = 60
