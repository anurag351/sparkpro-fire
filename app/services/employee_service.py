# app/services/employee_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, UploadFile
from typing import Optional
from app.models.employee import Employee, RoleEnum
from app.services.audit_service import log_audit as write_audit
from app.schemas.employee_schema import EmployeeCreate
import os, shutil
from PIL import Image


# ---------------- Helper Functions ----------------
def generate_employee_code(prefix: str, serial_no: int) -> str:
    """Generate a unique employee ID based on role prefix and serial number."""
    return f"{prefix}{str(serial_no).zfill(6)}"


# Role hierarchy validation
ALLOWED_MANAGER_ROLES = {
    "Employee": ["Manager", "APD", "PD", "MD"],
    "Manager": ["APD", "PD", "MD"],
    "APD": ["PD", "MD"],
    "PD": ["MD"],
    "MD": []
}


async def _validate_manager_relationship(db: AsyncSession, employee_role: str, manager_id: Optional[str]):
    """Ensure manager exists and is valid for the employee’s role."""
    if employee_role == "MD":
        if manager_id:
            raise HTTPException(status_code=400, detail="MD cannot have a manager")
        return None

    if not manager_id:
        return None

    res = await db.execute(select(Employee).where(Employee.id == manager_id))
    manager = res.scalar_one_or_none()
    if not manager:
        raise HTTPException(status_code=400, detail="Selected manager does not exist")

    allowed_roles = ALLOWED_MANAGER_ROLES.get(employee_role, [])
    if manager.role.name not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid manager role '{manager.role.name}' for employee role '{employee_role}'. "
                   f"Allowed roles: {allowed_roles}"
        )
    return manager


# ---------------- CREATE ----------------
async def create_employee_service(db: AsyncSession, payload: EmployeeCreate, performed_by: str = "SYSTEM"):
    """Create a new employee and auto-generate unique ID."""
    # Validate role–manager relationship
    await _validate_manager_relationship(db, payload.role, payload.manager_id)

    # Insert a temporary employee to get serial_no
    temp = Employee(
        name=payload.name,
        role=RoleEnum[payload.role] if isinstance(payload.role, str) else payload.role,
        manager_id=payload.manager_id,
        contact=payload.contact,
        is_active=True,
        salary_per_month=payload.salary_per_month,
        overtime_charge_per_hour=payload.overtime_charge_per_hour,
        deduct_per_hour=payload.deduct_per_hour,
        deduct_per_day=payload.deduct_per_day,
        aadhaar_number=payload.aadhaar_number,
        passport_photo_filename=getattr(payload, "passport_photo_filename", None)
    )
    db.add(temp)
    await db.flush()  # ensures serial_no is assigned

    # Generate proper unique employee ID
    prefix = payload.role[:2].upper() if payload.role else "EM"
    temp.id = generate_employee_code(prefix, temp.serial_no)

    await db.commit()
    await db.refresh(temp)

    # Audit Log
    await write_audit(
        db=db,
        entity_type="Employee",
        entity_id=temp.id,
        action="CREATE",
        performed_by=performed_by,
        comment=f"Employee {temp.name} ({temp.id}) created successfully"
    )

    return temp


# ---------------- READ ----------------
async def get_employee_by_id(db: AsyncSession, employee_id: str):
    res = await db.execute(select(Employee).where(Employee.id == employee_id))
    return res.scalar_one_or_none()


async def get_all_employees_service(db: AsyncSession):
    res = await db.execute(select(Employee))
    return res.scalars().all()


async def get_employees_by_role_service(db: AsyncSession, role: str):
    try:
        role_enum = RoleEnum[role] if role in RoleEnum.__members__ else RoleEnum[role.upper()]
    except Exception:
        match = next((r for r in RoleEnum if r.name.lower() == role.lower()), None)
        if not match:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
        role_enum = match

    res = await db.execute(select(Employee).where(Employee.role == role_enum))
    return res.scalars().all()


# ---------------- UPDATE ----------------
async def update_employee_service(db: AsyncSession, employee_id: str, payload: EmployeeCreate, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    await _validate_manager_relationship(db, payload.role, payload.manager_id)

    old_data = {k: getattr(emp, k) for k in emp.__dict__.keys() if not k.startswith("_")}

    emp.name = payload.name
    emp.role = RoleEnum[payload.role] if isinstance(payload.role, str) else payload.role
    emp.manager_id = payload.manager_id
    emp.contact = payload.contact
    emp.salary_per_month = payload.salary_per_month
    emp.overtime_charge_per_hour = payload.overtime_charge_per_hour
    emp.deduct_per_hour = payload.deduct_per_hour
    emp.deduct_per_day = payload.deduct_per_day
    emp.aadhaar_number = payload.aadhaar_number
    if getattr(payload, "passport_photo_filename", None):
        emp.passport_photo_filename = payload.passport_photo_filename

    await db.commit()
    await db.refresh(emp)

    # Log changed fields
    diffs = [
        f"{k}: '{old_data.get(k)}' → '{getattr(emp, k)}'"
        for k in old_data if old_data.get(k) != getattr(emp, k)
    ]

    await write_audit(
        db=db,
        entity_type="Employee",
        entity_id=employee_id,
        action="UPDATE",
        performed_by=performed_by,
        comment="; ".join(diffs) if diffs else "No changes"
    )

    return emp


# ---------------- DELETE ----------------
async def delete_employee_service(db: AsyncSession, employee_id: str, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    await db.delete(emp)
    await db.commit()

    await write_audit(
        db=db,
        entity_type="Employee",
        entity_id=employee_id,
        action="DELETE",
        performed_by=performed_by,
        comment=f"Employee {employee_id} deleted"
    )
    return {"msg": f"Employee {employee_id} deleted successfully"}


# ---------------- PHOTO UPLOAD ----------------
UPLOAD_DIR = "uploads/passports"
os.makedirs(UPLOAD_DIR, exist_ok=True)
async def save_employee_photo(db: AsyncSession, employee_id: str, file: UploadFile):
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > 2 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 2MB allowed.")

    try:
        img = Image.open(file.file)
        if img.format not in ("JPEG", "JPG", "PNG"):
            raise HTTPException(status_code=400, detail="Only JPG/PNG images are allowed.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    # ✅ Reset pointer after reading with PIL
    file.file.seek(0)

    res = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = res.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png"):
        ext = ".jpg"

    filename = f"{employee_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    if emp.passport_photo_filename:
        old_path = os.path.join(UPLOAD_DIR, emp.passport_photo_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    # ✅ Save actual file correctly
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    emp.passport_photo_filename = filename
    await db.commit()
    await db.refresh(emp)

    return {"msg": "Photo uploaded successfully", "photo_url": f"/static/passports/{filename}"}
