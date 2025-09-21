from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from fastapi import HTTPException
from app.models.leave import Leave, LeaveStatusEnum
from app.schemas.leave_schema import LeaveCreate, LeaveUpdate
from app.services.audit_service import log_audit as write_audit

# CREATE / APPLY
async def create_leave_service(db: AsyncSession, payload: LeaveCreate, performed_by: str = "SYSTEM"):
    leave = Leave(
        employee_id=payload.employee_id,
        reason=payload.reason,
        start_date=payload.start_date,
        end_date=payload.end_date,
        approver_l1=payload.approver_l1
    )

    # Auto approve if approver_l1 is PD or MD
    if payload.approver_l1.startswith("PD") or payload.approver_l1.startswith("MD"):
        leave.status = LeaveStatusEnum.APPROVED

    db.add(leave)
    await db.commit()
    await db.refresh(leave)

    await write_audit(db, "Leave", leave.id, "CREATE", performed_by, f"Leave created by {payload.employee_id}")
    return leave

# UPDATE (only before approval)
async def update_leave_service(db: AsyncSession, leave_id: int, payload: LeaveUpdate, performed_by: str = "SYSTEM"):
    res = await db.execute(select(Leave).where(Leave.id == leave_id))
    leave = res.scalar_one_or_none()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    if leave.status != LeaveStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail="Cannot update once approved/rejected")

    for field, value in payload.dict(exclude_unset=True).items():
        setattr(leave, field, value)

    await db.commit()
    await db.refresh(leave)
    await write_audit(db, "Leave", leave.id, "UPDATE", performed_by, "Leave updated")
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

    await db.delete(leave)
    await db.commit()
    await write_audit(db, "Leave", leave_id, "DELETE", performed_by, "Leave deleted")
    return {"msg": f"Leave {leave_id} deleted"}
