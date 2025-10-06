# app/schemas/employee_schema.py
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.models.employee import RoleEnum
from pydantic import BaseModel, validator
from typing import Optional
from datetime import date
from enum import Enum

class RoleEnumStr(str, Enum):
    Employee = "Employee"
    Manager = "Manager"
    APD = "APD"
    PD = "PD"
    MD = "MD"

class EmployeeCreate(BaseModel):
    name: str
    role: RoleEnumStr
    manager_id: Optional[str] = None
    contact: Optional[str] = None
    salary_per_month: Optional[float] = None
    overtime_charge_per_hour: Optional[float] = None
    deduct_per_hour: Optional[float] = None
    deduct_per_day: Optional[float] = None
    aadhaar_number: Optional[str] = None
    passport_photo_filename: Optional[str] = None

    @validator('contact')
    def validate_contact(cls, v):
        if v is None:
            return v
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Please Enter a valid Phone No')
        return v

    @validator('aadhaar_number')
    def validate_aadhaar(cls, v):
        if v is None:
            return v
        if not v.isdigit() or len(v) != 12:
            raise ValueError('Please Enter a valid Aadhaar No')
        return v

class EmployeeResponse(EmployeeCreate):
    serial_no: int
    is_active: bool
    id:str

class EmployeeOut(BaseModel):
    id: str
    name: str
    role: RoleEnum
    manager_id: Optional[str]
    contact: Optional[str]
    is_active: bool
    class Config:
        from_attributes = True
