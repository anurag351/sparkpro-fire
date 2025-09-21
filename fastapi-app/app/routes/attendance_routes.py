# app/routes/attendance_routes.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.attendance_schema import AttendanceIn
from app.services.attendance_service import time_in, time_out
from app.core.database import get_session
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/in")
async def time_in_endpoint(payload: AttendanceIn, db: AsyncSession = Depends(get_session)):
    rec = await time_in(db, payload.employee_id)
    return rec

@router.post("/out/{attendance_id}")
async def time_out_endpoint(attendance_id: int, db: AsyncSession = Depends(get_session)):
    try:
        rec = await time_out(db, attendance_id)
        return rec
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
