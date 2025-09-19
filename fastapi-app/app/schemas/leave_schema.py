# app/schemas/leave_schema.py
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.models.leave import LeaveStatusEnum


# Employee submit leave request
class LeaveRequest(BaseModel):
    employee_id: str
    start_date: date
    end_date: date
    reason: Optional[str] = None


# Manager / PD approve or reject
class LeaveApproval(BaseModel):
    leave_id: str
    status: LeaveStatusEnum
    comment: Optional[str] = None


# Response model
class LeaveOut(BaseModel):
    id: str
    employee_id: str
    start_date: date
    end_date: date
    reason: Optional[str]
    status: LeaveStatusEnum

    class Config:
        from_attributes = True  # pydantic v2 style
