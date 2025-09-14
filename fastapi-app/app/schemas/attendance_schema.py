# app/schemas/attendance_schema.py
from pydantic import BaseModel
from datetime import date, time
from typing import Optional
from ..models.attendance import AttendanceStatusEnum

class TimeInRequest(BaseModel):
    employee_id: int
    date: date

class TimeOutRequest(BaseModel):
    employee_id: int
    date: date
    time_out: Optional[time] = None

class AttendanceOut(BaseModel):
    id: int
    employee_id: int
    date: date
    time_in: Optional[time]
    time_out: Optional[time]
    overtime_hours: float
    status: AttendanceStatusEnum

    class Config:
        orm_mode = True
