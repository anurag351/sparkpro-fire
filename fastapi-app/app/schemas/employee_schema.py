# app/schemas/employee_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.employee import RoleEnum

class EmployeeCreate(BaseModel):
    name: str
    role: RoleEnum
    manager_id: Optional[str] = None
    contact: Optional[str] = None

class EmployeeOut(BaseModel):
    id: str
    name: str
    role: RoleEnum
    manager_id: Optional[str]
    contact: Optional[str]
    is_active: bool
    class Config:
        from_attributes = True
