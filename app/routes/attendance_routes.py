# app/routes/attendance_routes.py
from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from datetime import date
from app.core.database import get_session as get_db
from app.schemas.attendance_schema import AttendanceCreate, AttendanceResponse,AttendanceUpdate
from app.services import attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])


# ------------------ CREATE ------------------
@router.post("/createdby/{createdby}", response_model=AttendanceResponse)
async def create_attendance(createdby: str,attendance: AttendanceCreate, db: AsyncSession = Depends(get_db)):
    return await attendance_service.add_attendance(db, attendance,createdby)


# ------------------ READ ------------------
@router.get("/getAttendanceByID/{employee_id}", response_model=List[AttendanceResponse])
async def get_attendance_employee(employee_id: str, db: AsyncSession = Depends(get_db)):
    result = await attendance_service.get_attendance_by_employee(db, employee_id)
    if not result:
        raise HTTPException(status_code=404, detail="No attendance found for this employee")
    return result


@router.get("/getAttendancebyMonth/{employee_id}/month/{year}/{month}", response_model=List[AttendanceResponse])
async def get_attendance_employee_month(employee_id: str, year: int, month: int, db: AsyncSession = Depends(get_db)):
    result = await attendance_service.get_attendance_by_month(db, employee_id, year, month)
    if not result:
        raise HTTPException(status_code=404, detail="No attendance found for this employee in given month")
    return result


@router.get("/getAttendancebyApprover/approver/{approver_id}/status/{status}", response_model=List[AttendanceResponse])
async def get_attendance_by_status_and_approver(approver_id: str, status: str, db: AsyncSession = Depends(get_db)):
    result = await attendance_service.get_attendance_by_status_by_approver(db, approver_id, status)
    if not result:
        raise HTTPException(status_code=404, detail=f"No {status} attendance found for this approver")
    return result


@router.get("/getAttendancebyEmployeeID/employee/{employee_id}/status/{status}", response_model=List[AttendanceResponse])
async def get_attendance_by_status_and_employee(employee_id: str, status: str, db: AsyncSession = Depends(get_db)):
    result = await attendance_service.get_attendance_by_status_by_employee(db, employee_id, status)
    if not result:
        raise HTTPException(status_code=404, detail=f"No {status} attendance found for this employee")
    return result


# ------------------ UPDATE ------------------
@router.put("/updateAttendance/updatedBy/{employee_id}/date/{attendance_date}", response_model=AttendanceResponse)
async def update_attendance(
    employee_id: str,
    attendance_date: date,
    new_data: AttendanceUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Update attendance record of a particular employee for a specific date.
    """
    return await attendance_service.update_attendance(db, employee_id, attendance_date, new_data)


# ------------------ DELETE ------------------
@router.delete("/deleteAttendance/employee/{employee_id}/date/{attendance_date}")
async def delete_attendance(
    employee_id: str,
    attendance_date: date,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete attendance record of a particular employee for a specific date.
    """
    return await attendance_service.delete_attendance(db, employee_id, attendance_date)

@router.get("/export")
async def export_attendance(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    employee_id: str | None = Query(None, description="Optional Employee ID"),
    status: str | None = Query(None, description="Optional Status"),
    db: AsyncSession = Depends(get_db),
):
    return await attendance_service.export_attendance_service(db, start_date, end_date, employee_id, status)

@router.post("/{attendance_id}/approve/{user}", response_model=AttendanceResponse)
async def approve_attendance(attendance_id: int, db: AsyncSession = Depends(get_db), user: str = "system"):
    """
    Approve an attendance record
    """
    return await attendance_service.update_attendance_status(db, attendance_id, "Approved", user)


@router.post("/{attendance_id}/reject/{user}", response_model=AttendanceResponse)
async def reject_attendance(attendance_id: int, db: AsyncSession = Depends(get_db), user: str = "system"):
    """
    Reject an attendance record
    """
    return await attendance_service.update_attendance_status(db, attendance_id, "Rejected", user)