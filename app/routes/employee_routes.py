# app/routes/employee_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.employee_schema import EmployeeCreate, EmployeeOut,EmployeeResponse
from app.models.employee import RoleEnum
from app.services.employee_service import *
router = APIRouter(prefix="/employees", tags=["employees"])

@router.post("/createdBy/{createdBy}", response_model=EmployeeOut)
async def create_employee(createdBy:str, payload: EmployeeCreate, db: AsyncSession = Depends(get_session)):
    emp = await create_employee_service(db, payload,createdBy)
    return emp

@router.get("/employeeID/{employee_id}", response_model=EmployeeResponse)
async def get_employee(employee_id: str, db: AsyncSession = Depends(get_session)):
    emp = await get_employee_by_id(db, employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

# Get all employees
@router.get("/all", response_model=list[EmployeeOut])
async def get_all_employees(db: AsyncSession = Depends(get_session)):
    return await get_all_employees_service(db)

# Get all managers
@router.get("/managers", response_model=list[EmployeeOut])
async def get_managers(db: AsyncSession = Depends(get_session)):
    return await get_employees_by_role_service(db, RoleEnum.Manager)

# Get all Employee
@router.get("/employee", response_model=list[EmployeeOut])
async def get_managers(db: AsyncSession = Depends(get_session)):
    return await get_employees_by_role_service(db, RoleEnum.Employee)

# Get all APDs

@router.get("/apd", response_model=list[EmployeeOut])
async def get_apds(db: AsyncSession = Depends(get_session)):
    return await get_employees_by_role_service(db, RoleEnum.APD)

# Get all PDs
@router.get("/pd", response_model=list[EmployeeOut])
async def get_pds(db: AsyncSession = Depends(get_session)):
    return await get_employees_by_role_service(db, RoleEnum.PD)

# Get all MDs
@router.get("/md", response_model=list[EmployeeOut])
async def get_mds(db: AsyncSession = Depends(get_session)):
    return await get_employees_by_role_service(db, RoleEnum.MD)
# Update employee
@router.put("/update/{employee_id}", response_model=EmployeeOut)
async def update_employee(employee_id: str, payload: EmployeeCreate, db: AsyncSession = Depends(get_session)):
    return await update_employee_service(db, employee_id, payload)


# Delete employee
@router.delete("/delete/{employee_id}")
async def delete_employee(employee_id: str, db: AsyncSession = Depends(get_session)):
    return await delete_employee_service(db, employee_id)

@router.post("/{employee_id}/upload-photo")
async def upload_employee_photo(
    employee_id: str,
    file: UploadFile,
    db: AsyncSession = Depends(get_session)
):
    try:
        result = await save_employee_photo(db, employee_id, file)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

