# app/schemas/salary_schema.py
from pydantic import BaseModel

class SalaryOut(BaseModel):
    id: int
    employee_id: int
    month: str
    base_pay: float
    overtime_pay: float
    total_pay: float

    class Config:
        orm_mode = True
