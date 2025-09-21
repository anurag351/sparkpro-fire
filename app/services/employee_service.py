# app/services/employee_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from fastapi import HTTPException
from typing import Optional
from app.models.employee import Employee, RoleEnum
from app.services.audit_service import log_audit as write_audit
from app.schemas.employee_schema import EmployeeCreate
import os, shutil
from fastapi import UploadFile
from PIL import Image

def generate_employee_code(name: str, serial_no: int) -> str:
    prefix = ''.join([c for c in name if c.isalpha()])[:2].upper() or "EM"
    return f"{prefix}{str(serial_no).zfill(6)}"

# Helper: allowed manager roles mapping (server-side enforcement of UI rules)
ALLOWED_MANAGER_ROLES = {
    "Employee": ["Manager", "APD", "PD", "MD"],  # employee can have any manager-role
    "Manager": ["PD", "APD"],                    # if employee.role == Manager -> manager must be PD or APD
    "APD": ["PD"],                               # if APD -> manager must be PD
    "PD": ["MD"],                                # if PD -> manager must be MD
    "MD": []                                     # MD should not have a manager
}

async def _validate_manager_relationship(db: AsyncSession, employee_role: str, manager_id: Optional[str]):
    """Ensure manager exists and manager.role is allowed for the employee_role."""
    # If employee role is MD, manager_id must be None
    if employee_role == "MD":
        if manager_id:
            raise HTTPException(status_code=400, detail="MD cannot have a manager")
        return None

    if manager_id is None:
        return None

    res = await db.execute(select(Employee).where(Employee.id == manager_id))
    manager = res.scalar_one_or_none()
    if not manager:
        raise HTTPException(status_code=400, detail="Selected manager does not exist")

    allowed = ALLOWED_MANAGER_ROLES.get(employee_role, [])
    if manager.role.name not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Manager role must be one of {allowed} for employee role {employee_role}"
        )
    return manager

# ---------------- CREATE ----------------
async def create_employee_service(db: AsyncSession, payload: EmployeeCreate, performed_by: str = "SYSTEM"):
    """
    Create an employee:
      - inserts a temporary row to obtain serial_no (autoincrement)
      - generates employee.id using generate_employee_code
      - writes audit
    Validates manager-role relationships and copies all new model fields.
    """
    # Validate manager relationship first (this will raise HTTPException if invalid)
    await _validate_manager_relationship(db, payload.role, payload.manager_id)

    # Step 1: Insert temporary row to get serial_no
    temp = Employee(
        name=payload.name,
        role=RoleEnum[payload.role] if isinstance(payload.role, str) else payload.role,
        manager_id=payload.manager_id,
        contact=payload.contact,
        is_active=True,
        # set optional financial and identity fields if provided
        salary_per_month=payload.salary_per_month,
        overtime_charge_per_hour=payload.overtime_charge_per_hour,
        deduct_per_hour=payload.deduct_per_hour,
        deduct_per_day=payload.deduct_per_day,
        aadhaar_number=payload.aadhaar_number,
        passport_photo_filename=getattr(payload, "passport_photo_filename", None)
    )
    db.add(temp)
    # ensure serial_no is assigned by flush
    await db.flush()
    await db.refresh(temp)

    # Step 2: Generate proper employee code and commit
    emp_code = generate_employee_code(temp.name, temp.serial_no)
    temp.id = emp_code

    # commit once (fixed duplicate commit from old code)
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
    return res.scalars().first()

async def get_all_employees_service(db: AsyncSession):
    result = await db.execute(select(Employee))
    return result.scalars().all()

async def get_employees_by_role_service(db: AsyncSession, role: str):
    # accept both enum name or proper case-insensitive string
    role_norm = role.strip()
    try:
        role_enum = RoleEnum[role_norm] if role_norm in RoleEnum.__members__ else RoleEnum[role_norm.upper()]
    except Exception:
        # try match by value-case insensitive
        matched = next((r for r in RoleEnum if r.name.lower() == role_norm.lower() or r.value.lower() == role_norm.lower()), None)
        if not matched:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
        role_enum = matched

    result = await db.execute(select(Employee).where(Employee.role == role_enum))
    return result.scalars().all()

# ---------------- UPDATE ----------------
async def update_employee_service(db: AsyncSession, employee_id: str, payload: EmployeeCreate, performed_by: str = "SYSTEM"):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Validate manager-role relationship for updated data
    await _validate_manager_relationship(db, payload.role, payload.manager_id)

    # Keep old values for audit
    old_values = {
        "name": emp.name,
        "role": emp.role.name if emp.role else None,
        "manager_id": emp.manager_id,
        "contact": emp.contact,
        "salary_per_month": emp.salary_per_month,
        "overtime_charge_per_hour": emp.overtime_charge_per_hour,
        "deduct_per_hour": emp.deduct_per_hour,
        "deduct_per_day": emp.deduct_per_day,
        "aadhaar_number": emp.aadhaar_number,
        "passport_photo_filename": emp.passport_photo_filename
    }

    # Update fields
    emp.name = payload.name
    emp.role = RoleEnum[payload.role] if isinstance(payload.role, str) else payload.role
    emp.manager_id = payload.manager_id
    emp.contact = payload.contact
    emp.salary_per_month = payload.salary_per_month
    emp.overtime_charge_per_hour = payload.overtime_charge_per_hour
    emp.deduct_per_hour = payload.deduct_per_hour
    emp.deduct_per_day = payload.deduct_per_day
    emp.aadhaar_number = payload.aadhaar_number
    # passport filename might be set via multipart upload handler, update if provided
    if getattr(payload, "passport_photo_filename", None):
        emp.passport_photo_filename = payload.passport_photo_filename

    await db.commit()
    await db.refresh(emp)

    # Compose an informative audit comment listing changed fields
    diffs = []
    for k, old_v in old_values.items():
        new_v = getattr(emp, k)
        # convert RoleEnum type to its name for comparison
        if isinstance(new_v, RoleEnum):
            new_v = new_v.name
        if old_v != new_v:
            diffs.append(f"{k}: '{old_v}' -> '{new_v}'")

    await write_audit(
        db=db,
        entity_type="Employee",
        entity_id=emp.id,
        action="UPDATE",
        performed_by=performed_by,
        comment="; ".join(diffs) if diffs else "No changes"
    )

    return emp

# ---------------- DELETE ----------------
async def delete_employee_service(db: AsyncSession, employee_id: str, performed_by: str = "SYSTEM"):
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    await db.delete(emp)
    await db.commit()

    # Audit Log
    await write_audit(
        db=db,
        entity_type="Employee",
        entity_id=employee_id,
        action="DELETE",
        performed_by=performed_by,
        comment=f"Employee {employee_id} deleted"
    )

    return {"msg": f"Employee {employee_id} deleted successfully"}


UPLOAD_DIR = "uploads/passports"
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def save_employee_photo(db: AsyncSession, employee_id: str, file: UploadFile):
    # check file size (< 2 MB)
    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > 2 * 1024 * 1024:  # 2 MB
        raise HTTPException(status_code=400, detail="File too large. Max 2MB allowed.")

    # validate image type using Pillow
    try:
        img = Image.open(file.file)
        if img.format not in ("JPEG", "JPG", "PNG"):
            raise HTTPException(status_code=400, detail="Only JPG/PNG images are allowed.")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image file.")

    # reset pointer for saving
    file.file.seek(0)

    # check employee exists
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    emp = result.scalar_one_or_none()
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")

    # build filename
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    if ext not in (".jpg", ".jpeg", ".png"):
        ext = ".jpg"
    filename = f"{employee_id}{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # delete old photo if exists
    if emp.passport_photo_filename:
        old_path = os.path.join(UPLOAD_DIR, emp.passport_photo_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    # save new file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # update db
    emp.passport_photo_filename = filename
    await db.commit()
    await db.refresh(emp)

    return {
        "msg": "Photo uploaded successfully",
        "photo_url": f"/static/passports/{filename}"
    }