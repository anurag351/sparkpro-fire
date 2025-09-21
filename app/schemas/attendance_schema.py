# app/schemas/attendance_schema.py
from pydantic import BaseModel
from datetime import date, time
from typing import Optional

class AttendanceBase(BaseModel):
    employee_id: str
    date: date
    time_in: time
    time_out: time

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    time_in: time
    time_out: time
    hours_worked: Optional[int]
    overtime_hours: Optional[int]
    status: str
    approved_by: Optional[int]

    class Config:
        orm_mode = True

