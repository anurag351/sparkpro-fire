# app/services/leave_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.leave import Leave
from app.services.audit_service import write_audit

async def request_leave(db: AsyncSession, payload, requester_id: int):
    rec = Leave(employee_id=payload.employee_id, start_date=payload.start_date, end_date=payload.end_date, reason=payload.reason)
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    await write_audit(db, "Leave", rec.id, "RequestLeave", requester_id, {"start": str(payload.start_date), "end": str(payload.end_date)})
    return rec

async def approve_leave(db: AsyncSession, leave_id: int, approver_id: int):
    from sqlalchemy.future import select
    res = await db.execute(select(Leave).where(Leave.id == leave_id))
    rec = res.scalars().first()
    if not rec:
        raise ValueError("Leave not found")
    rec.status = "Approved"
    rec.approved_by = approver_id
    db.add(rec)
    await db.commit()
    await write_audit(db, "Leave", rec.id, "ApproveLeave", approver_id)
    return rec
