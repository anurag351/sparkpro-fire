# app/services/employee_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from app.models.employee import Employee
from app.services.audit_service import write_audit
from app.schemas.employee_schema import EmployeeCreate
from fastapi import HTTPException
def generate_employee_code(name: str, serial_no: int) -> str:
    prefix = ''.join([c for c in name if c.isalpha()])[:2].upper() or "EM"
    return f"{prefix}{str(serial_no).zfill(6)}"

async def create_employee_service(db: AsyncSession, payload: EmployeeCreate):
    # Step 1: Insert temporary row
    temp = Employee(
        id="TEMP",
        name=payload.name,
        role=payload.role,
        manager_id=payload.manager_id,
        contact=payload.contact,
    )
    db.add(temp)
    await db.flush()         # serial_no milega
    await db.refresh(temp)   # abhi safe hai, kyunki "TEMP" record exist karta hai

    # Step 2: Generate proper employee_code
    emp_code = f"{temp.name[:2].upper()}{str(temp.serial_no).zfill(6)}"
    temp.id = emp_code

    await db.commit()  # id update ke baad commit
    # ⚠️ Yaha refresh ki zarurat nahi, warna woh TEMP dhoondhega

    return temp

# Get employee by ID
async def get_employee_by_id(db: AsyncSession, employee_id: str):
    res = await db.execute(select(Employee).where(Employee.id == employee_id))
    return res.scalars().first()

# Get all employees
async def get_all_employees_service(db: AsyncSession):
    result = await db.execute(select(Employee))
    return result.scalars().all()

# Get employees by role
async def get_employees_by_role_service(db: AsyncSession, role: str):
    result = await db.execute(select(Employee).where(Employee.role == role.upper()))
    return result.scalars().all()

# Update employee by ID
async def update_employee_service(db: AsyncSession, employee_id: str, payload: EmployeeCreate):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    emp.name = payload.name
    emp.role = payload.role
    emp.manager_id = payload.manager_id
    emp.contact = payload.contact

    await db.commit()
    await db.refresh(emp)
    return emp


# Delete employee by ID
async def delete_employee_service(db: AsyncSession, employee_id: str):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    await db.delete(emp)
    await db.commit()
    return {"msg": f"Employee {employee_id} deleted successfully"}
