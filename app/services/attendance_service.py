# app/services/attendance_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import extract, update, delete
from datetime import datetime, date,timedelta
from fastapi import HTTPException
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.leave import Leave
from app.schemas.attendance_schema import AttendanceCreate,AttendanceUpdate
from app.services.audit_service import log_audit as write_audit
from sqlalchemy import select, and_
from io import BytesIO
from openpyxl import Workbook
from fastapi.responses import StreamingResponse
def calculate_hours(time_in, time_out):
    """Calculate total hours worked."""
    delta = datetime.combine(datetime.today(), time_out) - datetime.combine(datetime.today(), time_in)
    hours = delta.seconds // 3600
    return hours


# ------------------ CREATE ------------------
async def add_attendance(db: AsyncSession, attendance_data: AttendanceCreate, created_by: str):
    """
    Add new attendance record.
    Auto-approve if creator role is MD or PD.
    Prevent duplicate attendance entry for same employee & date.
    Log the creation in audit logs.
    """
    # Step 1: Check for duplicate attendance entry
    duplicate_query = await db.execute(
        select(Attendance).where(
            and_(
                Attendance.employee_id == attendance_data.employee_id,
                Attendance.date == attendance_data.date
            )
        )
    )
    existing_record = duplicate_query.scalar_one_or_none()

    if existing_record:
        raise HTTPException(
            status_code=400,
            detail=f"Duplicate Attendance Error: Employee {attendance_data.employee_id} already has an attendance record for {attendance_data.date}"
        )
    time_in_obj = _to_time(attendance_data.time_in)
    time_out_obj = _to_time(attendance_data.time_out)
    # 🚫 Validation: Start time must be less than end time
    if time_in_obj >= time_out_obj:
        raise HTTPException(
            status_code=400,
            detail="Invalid time range: 'Time In' must be earlier than 'Time Out'."
        )
    # Step 2: Calculate hours worked
    hours_worked = calculate_hours(attendance_data.time_in, attendance_data.time_out)

    # Step 3: Fetch creator details
    creator_result = await db.execute(select(Employee).where(Employee.id == created_by))
    creator = creator_result.scalar_one_or_none()

    if not creator:
        raise HTTPException(status_code=404, detail=f"Creator employee {created_by} not found")

    # Step 4: Determine approval status based on role
    status = "Approved" if creator.role in ["MD", "PD"] else "Pending"
    perform_by_detail = f"{creator.name} ({creator.id})"

    # Step 5: Create new attendance record
    new_attendance = Attendance(
        employee_id=attendance_data.employee_id,
        date=attendance_data.date,
        time_in=attendance_data.time_in,
        time_out=attendance_data.time_out,
        hours_worked=hours_worked,
        overtime_hours=max(0, hours_worked - 8),
        status=status,
        approved_by=creator.id if status == "Approved" else attendance_data.approved_by,
    )

    db.add(new_attendance)
    await db.commit()
    await db.refresh(new_attendance)

    # Step 6: Log the action in audit logs
    await write_audit(
        db,
        entity_type="Attendance",
        entity_id=str(new_attendance.id),
        action="CREATE",
        performed_by=perform_by_detail,
        comment=f"Attendance created for employee {attendance_data.employee_id} with status '{status}'"
    )

    return new_attendance

# ------------------ READ ------------------
async def get_attendance_by_employee(db: AsyncSession, employee_id: str):
    """Get all attendance records for a specific employee."""
    result = await db.execute(select(Attendance).where(Attendance.employee_id == employee_id))
    return result.scalars().all()


async def get_attendance_by_month(db: AsyncSession, employee_id: str, year: int, month: int):
    """Get attendance records for a specific month."""
    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            extract("year", Attendance.date) == year,
            extract("month", Attendance.date) == month
        )
    )
    return result.scalars().all()


async def get_attendance_by_status_by_approver(db: AsyncSession, approver_id: str, status: str):
    """Get attendance records filtered by approver and status."""
    result = await db.execute(
        select(Attendance).where(
            Attendance.id == approver_id,
            Attendance.status == status
        )
    )
    return result.scalars().all()


async def get_attendance_by_status_by_employee(db: AsyncSession, employee_id: str, status: str):
    """Get attendance records filtered by employee and status."""
    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.status == status
        )
    )
    return result.scalars().all()


# ------------------ UPDATE ------------------
async def update_attendance(db: AsyncSession, created_by: str, date_value: date, new_data: AttendanceUpdate):
    """Update attendance of a specific employee for a specific date."""
    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == new_data.employee_id,
            Attendance.date == date_value
        )
    )
    attendance = result.scalar_one_or_none()

    perform_by_detail="SYSTEM"
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    try:
        time_in_obj = _to_time(new_data.time_in)
        time_out_obj = _to_time(new_data.time_out)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid time format, expected HH:MM:SS")

    if time_in_obj >= time_out_obj:
        raise HTTPException(
            status_code=400,
            detail="Invalid time range: 'Time In' must be earlier than 'Time Out'."
        )
    if created_by != new_data.employee_id:
        creator_result = await db.execute(select(Employee).where(Employee.id == created_by))
        creator = creator_result.scalar_one_or_none()
        perform_by_detail = creator.name + "("+creator.id+")"
        if not creator:
            raise HTTPException(status_code=404, detail=f"Creator employee {created_by} not found")
    else:
        perform_by_detail = created_by
    # Update fields
    attendance.time_in = new_data.time_in
    attendance.time_out = new_data.time_out
    attendance.hours_worked = calculate_hours(new_data.time_in, new_data.time_out)
    attendance.overtime_hours = max(0, attendance.hours_worked - 8)
    await db.commit()
    await db.refresh(attendance)
    await write_audit(
        db,
        entity_type="Attendance",
        entity_id=attendance.employee_id,
        action="UPDATE",
        performed_by=perform_by_detail,
        comment=f"Attendance Update for employee {attendance.employee_id} on   {date_value}'"
    )
    return attendance


# ------------------ DELETE ------------------
async def delete_attendance(db: AsyncSession, employee_id: str, attendance_date: date):
    """
    Delete attendance record for a given employee and date.
    Handles duplicates and logs the deletion.
    """
    result = await db.execute(
        select(Attendance).where(
            Attendance.employee_id == employee_id,
            Attendance.date == attendance_date
        )
    )
    records = result.scalars().all()

    if not records:
        raise HTTPException(
            status_code=404,
            detail=f"No attendance record found for employee {employee_id} on {attendance_date}"
        )

    if len(records) > 1:
        raise HTTPException(
            status_code=409,
            detail=f"Multiple attendance records found for employee {employee_id} on {attendance_date}. Please resolve duplicates manually."
        )

    attendance = records[0]

    await db.delete(attendance)
    await db.commit()

    # Log deletion
    await write_audit(
        db,
        entity_type="Attendance",
        entity_id=str(attendance.id),
        action="DELETE",
        performed_by="SYSTEM",
        comment=f"Attendance deleted for employee {employee_id} on {attendance_date}"
    )

    return {"message": f"Attendance deleted for {employee_id} on {attendance_date}"}

# ------------------ AUTO MARK ABSENT ------------------
async def auto_mark_absent(db: AsyncSession, grace_days: int = 1):
    """
    Automatically mark absent employees who neither marked attendance
    nor had approved leave for the target day.
    """
    today = date.today()
    target_date = today - timedelta(days=grace_days)

    employees_result = await db.execute(select(Employee))
    employees = employees_result.scalars().all()

    for emp in employees:
        # Check if attendance already exists
        attendance_result = await db.execute(
            select(Attendance).where(
                Attendance.employee_id == emp.id,
                Attendance.date == target_date
            )
        )
        existing_attendance = attendance_result.scalar_one_or_none()
        if existing_attendance:
            continue

        # Check if employee is on approved leave
        leave_result = await db.execute(
            select(Leave).where(
                Leave.employee_id == emp.id,
                Leave.start_date <= target_date,
                Leave.end_date >= target_date,
                Leave.status == "Approved"
            )
        )
        leave = leave_result.scalar_one_or_none()
        if leave:
            continue

        # Mark absent
        absent_record = Attendance(
            employee_id=emp.id,
            date=target_date,
            status="Absent",
            hours_worked=0,
            overtime_hours=0,
            time_in=None,
            time_out=None
        )
        db.add(absent_record)

    await db.commit()

async def export_attendance_service(db, start_date: str, end_date: str, employee_id: str = None,status: str = None,):
    # Create workbook and sheet
    wb = Workbook()
    ws = wb.active
    ws.title = "Attendance"

    # Add header row
    ws.append(["Employee ID", "Date", "Time In", "Time Out", "Status", "Approved By", "Review Comment"])
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()

    # Build query with filters
    query = select(Attendance).where(
        and_(
            Attendance.date >= start,
            Attendance.date <= end
        )
    )
    
    if status:
        query = query.where(Attendance.status == status)
    if employee_id:
        query = query.where(Attendance.employee_id == employee_id)

    result = await db.execute(query)
    attendances = result.scalars().all()
    print(attendances)
    print(result)
    # Append rows to Excel
    for record in attendances:
        ws.append([
            record.employee_id,
            record.date.strftime("%Y-%m-%d") if record.date else "",
            str(record.time_in) if record.time_in else "",
            str(record.time_out) if record.time_out else "",
            record.status,
            record.approved_by or "",
            record.review_comment or "",
        ])

    # Save workbook to memory buffer
    stream = BytesIO()
    wb.save(stream)
    stream.seek(0)

    # Return with correct MIME type and headers
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="attendance.xlsx"'
        }
    )

async def update_attendance_status(db: AsyncSession, attendance_id: int,review_comment:str, status: str, updated_by: str):
    # Fetch record
    result = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    attendance = result.scalar_one_or_none()

    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    # Update status
    attendance.status = status
    attendance.review_comment=review_comment
    attendance.updated_at = datetime.utcnow()

    # Add log entry
    await write_audit(
        db,
        entity_type="Attendance",
        entity_id=str(attendance.id),
        action=status,
        performed_by=updated_by,
        comment=f"Attendance Status for {attendance.employee_id} updated to  on {status}"
    )

    await db.commit()
    await db.refresh(attendance)
    return attendance

def _to_time(value):
    if isinstance(value, str):
        return datetime.strptime(value, "%H:%M:%S").time()
    else:
        return value
    

