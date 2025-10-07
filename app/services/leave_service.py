from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.models.leave import Leave, LeaveStatusEnum
from app.schemas.leave_schema import LeaveCreate, LeaveUpdate
from app.services.audit_service import log_audit as write_audit
from app.models.employee import Employee
from datetime import datetime
from fastapi.responses import StreamingResponse
from io import BytesIO
from openpyxl import Workbook
from datetime import datetime, date

# CREATE / APPLY
from sqlalchemy import select, and_, or_

async def create_leave_service(db: AsyncSession, payload: LeaveCreate, performed_by: str):
    """
    Create a leave entry with duplicate date check.
    Auto-approve if performed_by employee has role 'MD' or 'PD'.
    Log the action in audit log.
    """

    # Verify performer (creator)
    performer_result = await db.execute(select(Employee).where(Employee.id == performed_by))
    performer = performer_result.scalar_one_or_none()

    if not performer:
        raise HTTPException(status_code=404, detail=f"Performer employee {performed_by} not found")
    start = _to_date(payload.start_date)
    end = _to_date(payload.end_date)
    if start > end:
        raise HTTPException(
            status_code=400,
            detail="Invalid date range: 'Start Date' must be earlier than 'End Date'."
        )
    #  Duplicate/overlap check for the same employee
    overlap_query = await db.execute(
        select(Leave).where(
            and_(
                Leave.employee_id == payload.employee_id,
                or_(
                    and_(Leave.start_date <= payload.start_date, Leave.end_date >= payload.start_date),
                    and_(Leave.start_date <= payload.end_date, Leave.end_date >= payload.end_date),
                    and_(Leave.start_date >= payload.start_date, Leave.end_date <= payload.end_date),
                )
            )
        )
    )
    existing_leave = overlap_query.scalars().first()
    if existing_leave:
        raise HTTPException(
            status_code=400,
            detail="Duplicate or overlapping leave already exists for the given date range."
        )

    #  Prepare the leave object
    leave = Leave(
        employee_id=payload.employee_id,
        reason=payload.reason,
        start_date=payload.start_date,
        end_date=payload.end_date,
        approver_l1=payload.approver_l1,
        approver_l2=payload.approver_l2
    )
    performByDetail = f"{performer.name} ({performer.id})"

    # Auto approve if performed_by role is PD or MD
    if performer.role in ["PD", "MD"]:
        leave.status = LeaveStatusEnum.APPROVED
        leave.approver_l2 = performer.id
        leave.approver_l1 = None
    else:
        leave.status = LeaveStatusEnum.PENDING
        performer_managerresult = await db.execute(select(Employee).where(Employee.id == performer.manager_id))
        performerManager = performer_managerresult.scalar_one_or_none()
        if performerManager.role not in ["PD","MD"]:
            leave.approver_l1 = performer.manager_id
            leave.approver_l2 = performerManager.manager_id
        else:
            leave.approver_l2 = performer.manager_id
            leave.approver_l1 = None

    # 5️⃣ Save leave record
    db.add(leave)
    await db.commit()
    await db.refresh(leave)

    # 6️⃣ Write audit log
    await write_audit(
        db,
        entity_type="Leave",
        entity_id=payload.employee_id,
        action="CREATE",
        performed_by=performByDetail,
        comment=f"Leave created by {performed_by} for {payload.employee_id} with status '{leave.status}'"
    )

    return leave

# UPDATE (only before approval)
async def update_leave_service(db: AsyncSession, leave_id: int, payload: LeaveUpdate, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = res.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    if leave.status != LeaveStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail="Cannot update once approved/rejected")
    start = _to_date(payload.start_date)
    end = _to_date(payload.end_date)

    if start > end:
        raise HTTPException(
            status_code=400,
            detail="Invalid date range: 'Start Date' must be earlier than 'End Date'."
        )
    
    for field, value in payload.dict(exclude_unset=True).items():
        setattr(leave, field, value)

    await db.commit()
    await db.refresh(leave)
    await write_audit(db, "Leave", leave.employee_id, "UPDATE", performed_by, "Leave updated")
    return leave

# GET BY DATE RANGE
async def get_leaves_by_date(db: AsyncSession, start_date, end_date):
    res = await db.execute(
        select(Leave).where(and_(Leave.start_date >= start_date, Leave.end_date <= end_date))
    )
    return res.scalars().all()

# GET BY EMPLOYEE
async def get_leaves_by_employee(db: AsyncSession, employee_id: str):
    res = await db.execute(select(Leave).where(Leave.employee_id == employee_id))
    return res.scalars().all()

# APPROVE
async def approve_leave_service(db: AsyncSession, leave_id: int, approver_id: str, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = res.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    # If approver is PD or MD -> direct approve
    if approver_id.startswith("PD") or approver_id.startswith("MD"):
        leave.status = LeaveStatusEnum.APPROVED
    else:
        leave.approver_l2 = approver_id

    await db.commit()
    await db.refresh(leave)
    await write_audit(db, "Leave", leave.id, "APPROVE", performed_by, f"Leave approved by {approver_id}")
    return leave

# DELETE
async def delete_leave_service(db: AsyncSession, leave_id: int, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = res.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    employeeID = leave.employee_id
    await db.delete(leave)
    await db.commit()
    await write_audit(db, "Leave", employeeID, "DELETE", performed_by, "Leave deleted")
    return {"msg": f"Leave {leave_id} deleted"}

async def export_leave_service(
    db,
    start_date: str,
    end_date: str,
    employee_id: str = None,
    status: str = None
):
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").date()
        end = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    if start > end:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date")

    filters = [Leave.start_date >= start, Leave.end_date <= end]
    if employee_id:
        filters.append(Leave.employee_id == employee_id)
    if status:
        filters.append(Leave.status == status)

    result = await db.execute(select(Leave).where(and_(*filters)))
    leave_records = result.scalars().all()

    if not leave_records:
        raise HTTPException(status_code=404, detail="No leave records found in given range")

    wb = Workbook()
    ws = wb.active
    ws.title = "Leave Records"

    ws.append(["ID", "Employee ID", "Reason", "Start Date", "End Date", "Status", "Approver L1", "Approver L2"])
    for leave in leave_records:
        ws.append([
            leave.id,
            leave.employee_id,
            leave.reason,
            leave.start_date.strftime("%Y-%m-%d"),
            leave.end_date.strftime("%Y-%m-%d"),
            leave.status,
            leave.approver_l1 or "",
            leave.approver_l2 or "",
        ])

    output = BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f"attachment; filename=leave_export_{start_date}_to_{end_date}.xlsx"
        },
    )

def _to_date(value):
    if isinstance(value, date):
        return value
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {value}. Expected YYYY-MM-DD.")

async def update_leave_status_service(
    db, leave_id: int, new_status: str, performed_by: str, comment: str = None
):
    """
    Approve or Reject a leave request.
    Updates the leave status and logs the action in audit logs.
    """

    # 🔹 Validate the performer
    performer_result = await db.execute(select(Employee).where(Employee.id == performed_by))
    performer = performer_result.scalar_one_or_none()
    if not performer:
        raise HTTPException(status_code=404, detail=f"Performer employee {performed_by} not found")

    # 🔹 Fetch the leave
    leave_result = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = leave_result.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail=f"Leave with ID {leave_id} not found")

    # 🔹 Check if already approved or rejected
    if leave.status in [LeaveStatusEnum.APPROVED, LeaveStatusEnum.REJECTED]:
        raise HTTPException(status_code=400, detail=f"Leave already {leave.status}")

    # 🔹 Update status
    if new_status not in ["Approved", "Rejected"]:
        raise HTTPException(status_code=400, detail="Invalid status — must be 'Approved' or 'Rejected'")

    leave.status = new_status
    leave.review_comment = comment or f"Leave {new_status.lower()} by {performed_by}"
    leave.approver_l1 = performed_by  # mark who took the action

    await db.commit()
    await db.refresh(leave)

    # 🔹 Write to audit log
    performByDetail = f"{performer.name} ({performer.id})"
    await write_audit(
        db,
        entity_type="Leave",
        entity_id=leave.employee_id,
        action=new_status.upper(),
        performed_by=performByDetail,
        comment=f"Leave {new_status} by {performByDetail} for {leave.employee_id}",
    )

    return {"message": f"Leave {new_status} successfully", "leave_id": leave.id, "status": leave.status}