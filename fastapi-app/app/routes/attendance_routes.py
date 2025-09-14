# app/routes/attendance_routes.py
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, time
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import update
from ..core.database import get_session
from ..models.attendance import Attendance
from ..models.audit import AuditLog
from ..schemas.attendance_schema import TimeInRequest, TimeOutRequest, AttendanceOut
from typing import List

router = APIRouter(prefix="/attendance", tags=["attendance"])

async def log_audit(session: AsyncSession, entity_type: str, entity_id: str, action: str, performed_by: int, old: dict = None, new: dict = None, comments: str = None):
    a = AuditLog(
        entity_type=entity_type,
        entity_id=str(entity_id),
        action=action,
        performed_by=performed_by,
        comments=comments,
        old_data=json_or_none(old),
        new_data=json_or_none(new),
    )
    session.add(a)
    # don't commit here; caller will commit

def json_or_none(obj):
    import json
    if obj is None:
        return None
    return json.dumps(obj, default=str)

@router.post("/timein", response_model=AttendanceOut)
async def time_in(payload: TimeInRequest, session: AsyncSession = Depends(get_session)):
    # create attendance row (time_in set to now)
    now = datetime.utcnow().time()
    att = Attendance(employee_id=payload.employee_id, date=payload.date, time_in=now)
    session.add(att)
    await session.commit()
    await session.refresh(att)
    # audit
    audit = AuditLog(entity_type="attendance", entity_id=str(att.id), action="time_in", performed_by=payload.employee_id, new_data=json_or_none({
        "time_in": str(now),
        "date": str(payload.date)
    }))
    session.add(audit)
    await session.commit()
    return att

@router.post("/timeout", response_model=AttendanceOut)
async def time_out(payload: TimeOutRequest, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Attendance).where(Attendance.employee_id == payload.employee_id, Attendance.date == payload.date))
    att = result.scalars().first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance not found for employee/date")
    if att.time_out is not None:
        raise HTTPException(status_code=400, detail="Time-out already recorded")
    to = payload.time_out or datetime.utcnow().time()
    att.time_out = to

    # compute overtime (simple example: >8 hours)
    if att.time_in:
        dt_in = datetime.combine(payload.date, att.time_in)
        dt_out = datetime.combine(payload.date, to)
        diff = (dt_out - dt_in).total_seconds() / 3600.0
        att.overtime_hours = max(0.0, diff - 8.0)

    await session.commit()
    await session.refresh(att)
    # audit
    audit = AuditLog(entity_type="attendance", entity_id=str(att.id), action="time_out", performed_by=payload.employee_id, new_data=json_or_none({
        "time_out": str(to),
        "overtime_hours": att.overtime_hours
    }))
    session.add(audit)
    await session.commit()
    return att

@router.get("/employee/{employee_id}", response_model=List[AttendanceOut])
async def get_attendance_for_employee(employee_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Attendance).where(Attendance.employee_id == employee_id))
    rows = result.scalars().all()
    return rows
