# app/routes/salary_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..core.database import get_session
from ..models.salary import Salary
from ..schemas.salary_schema import SalaryOut
from typing import List

router = APIRouter(prefix="/salary", tags=["salary"])

@router.get("/{employee_id}", response_model=List[SalaryOut])
async def get_salary_for_employee(employee_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Salary).where(Salary.employee_id == employee_id))
    rows = result.scalars().all()
    return rows
