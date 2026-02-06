# app/schemas/leave_schema.py
from pydantic import BaseModel
from datetime import date
from typing import Optional
from app.models.leave import LeaveStatusEnum
from enum import Enum

class LeaveStatusEnum(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"

class LeaveBase(BaseModel):
    employee_id: str
    reason: Optional[str]
    start_date: date
    end_date: date
    reason: Optional[str]
    approver_l1: Optional[str] = None
    approver_l2: Optional[str] = None

class LeaveCreate(LeaveBase):
    approver_l1: str  # always required at creation

class LeaveUpdate(BaseModel):
    reason: Optional[str]
    review_comment:Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
class LeaveReject(BaseModel):
    review_comment: str
    status: LeaveStatusEnum

class LeaveResponse(BaseModel):
    id: int
    employee_id: str
    reason: Optional[str]
    review_comment:Optional[str]
    status: LeaveStatusEnum
    start_date: date
    end_date: date
    approver_l1: Optional[str]
    approver_l2: Optional[str]
    class Config:
        from_attributes = True  # pydantic v2 style
