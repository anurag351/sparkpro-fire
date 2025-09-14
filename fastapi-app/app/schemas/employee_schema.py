from pydantic import BaseModel
from typing import Optional
from ..models.employee import RoleEnum


class EmployeeCreate(BaseModel):
    name: str
    role: RoleEnum
    manager_id: Optional[str] = None
    contact: Optional[str] = None
    password: str


class EmployeeOut(BaseModel):
    id: str  # employee_code
    name: str
    role: RoleEnum
    manager_id: Optional[str]
    contact: Optional[str]
    is_active: bool

    class Config:
        orm_mode = True
