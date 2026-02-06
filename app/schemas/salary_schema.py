from pydantic import BaseModel
class SalaryRequest(BaseModel):
    employee_id: str
    month: int
    year: int
    advance_salary:float

class SalaryResponse(BaseModel):
    id: int
    employee_id: str
    month: int
    year: int
    basic_salary: float
    allowances: float
    advance_salary:float
    overtime_hours: float
    overtime_rate: float
    deductions: float
    net_salary: float
    payable_salary:float
    overtime_salary: float

    class Config:
        orm_mode = True
