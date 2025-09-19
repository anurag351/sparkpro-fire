# app/services/attendance_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.attendance import Attendance
from app.services.audit_service import write_audit

async def time_in(db: AsyncSession, employee_id: str):
    rec = Attendance(employee_id=employee_id)
    db.add(rec)
    await db.commit()
    await db.refresh(rec)
    await write_audit(db, "Attendance", rec.id, "TimeIn", None, {"employee_id": employee_id})
    return rec

async def time_out(db: AsyncSession, attendance_id: int):
    res = await db.execute(select(Attendance).where(Attendance.id == attendance_id))
    rec = res.scalars().first()
    if not rec:
        raise ValueError("Attendance not found")
    # set time_out and calculate hours (simple)
    from datetime import datetime
    rec.time_out = datetime.utcnow()
    # naive hours calculation (demo)
    if rec.time_in:
        delta = rec.time_out - rec.time_in
        rec.hours_worked = int(delta.total_seconds() // 3600)
        rec.overtime_hours = max(0, rec.hours_worked - 8)
    db.add(rec)
    await db.commit()
    await write_audit(db, "Attendance", rec.id, "TimeOut", None, {"hours": rec.hours_worked})
    return rec
