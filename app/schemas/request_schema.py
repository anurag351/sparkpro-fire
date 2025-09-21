from pydantic import BaseModel
from enum import Enum
from typing import Optional

class RequestTypeEnum(str, Enum):
    LEAVE = "LEAVE"
    ATTENDANCE = "ATTENDANCE"
    OTHER = "OTHER"

class RequestStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class RequestActionEnum(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    REASSIGN = "REASSIGN"

# Create Request
class RequestCreate(BaseModel):
    request_type: RequestTypeEnum
    assigned_to: str
    comment: Optional[str] = None

# Act on Request
class RequestAction(BaseModel):
    action: RequestActionEnum
    by_employee_id: str
    comment: Optional[str] = None
    new_assigned_to: Optional[str] = None  # only for REASSIGN

# Response
class RequestOut(BaseModel):
    id: int
    request_type: RequestTypeEnum
    assigned_to: str
    created_by: str
    status: RequestStatusEnum
    comment: Optional[str]

    class Config:
        from_attributes = True
