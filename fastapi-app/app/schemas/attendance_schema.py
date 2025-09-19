# app/schemas/attendance_schema.py
from pydantic import BaseModel
from typing import Optional

class AttendanceIn(BaseModel):
    employee_id: str

class AttendanceOut(BaseModel):
    id: int
    employee_id: str
    time_in: str
    time_out: Optional[str]
    status: str
    class Config:
        from_attributes = True
