from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..core.database import get_session
from ..models.employee import Employee
from ..schemas.employee_schema import EmployeeCreate, EmployeeOut
from ..services.employee_service import create_employee as create_employee_service
from ..core.logger import logger   # import logger

router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("/", response_model=EmployeeOut)
async def create_employee(payload: EmployeeCreate, session: AsyncSession = Depends(get_session)):
    logger.debug(f"Received payload for employee creation: {payload.dict()}")
    emp = await create_employee_service(session, payload)
    logger.info(f"Employee created with ID: {emp.id}")
    return emp


@router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(employee_id: str, session: AsyncSession = Depends(get_session)):
    logger.debug(f"Fetching employee with ID: {employee_id}")
    result = await session.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalars().first()
    if not emp:
        logger.warning(f"Employee with ID {employee_id} not found")
        raise HTTPException(status_code=404, detail="Employee not found")
    logger.info(f"Found employee: {emp.name}, role: {emp.role}")
    return emp
