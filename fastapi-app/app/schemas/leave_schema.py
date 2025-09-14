# app/schemas/leave_schema.py
from pydantic import BaseModel
from datetime import date
from typing import Optional
from ..models.leave import LeaveStatusEnum

class LeaveRequest(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveApproval(BaseModel):
    approver_id: int
    approve: bool
    comments: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    status: LeaveStatusEnum

    class Config:
        orm_mode = True
# app/schemas/leave_schema.py
from pydantic import BaseModel
from datetime import date
from typing import Optional
from ..models.leave import LeaveStatusEnum

class LeaveRequest(BaseModel):
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    reason: Optional[str] = None

class LeaveApproval(BaseModel):
    approver_id: int
    approve: bool
    comments: Optional[str] = None

class LeaveOut(BaseModel):
    id: int
    employee_id: int
    leave_type: str
    start_date: date
    end_date: date
    status: LeaveStatusEnum

    class Config:
        orm_mode = True
