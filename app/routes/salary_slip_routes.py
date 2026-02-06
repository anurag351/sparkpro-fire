from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session as get_db
from app.schemas.salary_schema import SalaryRequest, SalaryResponse
from app.services.salary_slip_service import create_salary_slip,calculate_and_update_salary

router = APIRouter(prefix="/salary", tags=["Salary"])

@router.post("/calculate/{employee_id}", response_model=SalaryResponse)
async def calc_salary(employee_id: str, payload:SalaryRequest, db: AsyncSession = Depends(get_db)):
    salary_obj = await calculate_and_update_salary(employee_id,payload, db)

    response = {
        "id": salary_obj.id,
        "employee_id": salary_obj.employee_id,
        "month": salary_obj.month,
        "year": salary_obj.year,
        "basic_salary": salary_obj.basic_salary,
        "advance_salary":salary_obj.advance_salary,
        "allowances": salary_obj.allowances,
        "overtime_hours": salary_obj.overtime_hours,
        "overtime_rate": salary_obj.overtime_rate,
        "deductions": salary_obj.deductions,
        "payable_salary":salary_obj.net_salary-salary_obj.advance_salary,
        "net_salary": salary_obj.net_salary,
        "overtime_salary": salary_obj.overtime_hours * salary_obj.overtime_rate
    }

    return response

    

@router.get("/slip/{employee_id}/{year}/{month}")
async def get_salary_slip(employee_id: str, year: int, month: int, db: AsyncSession = Depends(get_db)):
    # optional basic validation here as well
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="month must be an integer between 1 and 12")

    pdf_buffer = await create_salary_slip(employee_id, year, month, db)

    # filename with month name
    from calendar import month_name
    month_str = month_name[month]

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=salary-slip-{employee_id}-{year}-{month_str}.pdf"
        },
    )
