# app/routes/attendance_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_session as get_db
from app.schemas.attendance_schema import AttendanceCreate, AttendanceResponse
from app.services import attendance_service

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceResponse)
def create_attendance(attendance: AttendanceCreate, db: Session = Depends(get_db)):
    return attendance_service.add_attendance(db, attendance)


@router.get("/employee/{employee_id}", response_model=List[AttendanceResponse])
def get_attendance_employee(employee_id: str, db: Session = Depends(get_db)):
    result = attendance_service.get_attendance_by_employee(db, employee_id)
    if not result:
        raise HTTPException(status_code=404, detail="No attendance found for this employee")
    return result


@router.get("/employee/{employee_id}/month/{year}/{month}", response_model=List[AttendanceResponse])
def get_attendance_employee_month(employee_id: str, year: int, month: int, db: Session = Depends(get_db)):
    result = attendance_service.get_attendance_by_month(db, employee_id, year, month)
    if not result:
        raise HTTPException(status_code=404, detail="No attendance found for this employee in given month")
    return result

@router.get("/approver/{approver_id}/status/{status}", response_model=List[AttendanceResponse])
def get_attendance_by_status_and_approver(approver_id: int, status: str, db: Session = Depends(get_db)):
    result = attendance_service.getAttendance_by_status_by_approver(db, approver_id, status)
    if not result:
        raise HTTPException(status_code=404, detail=f"No {status} attendance found for this approver")
    return result


@router.get("/employee/{employee_id}/status/{status}", response_model=List[AttendanceResponse])
def get_attendance_by_status_and_employee(employee_id: str, status: str, db: Session = Depends(get_db)):
    result = attendance_service.getAttandance_by_status_by_employee(db, employee_id, status)
    if not result:
        raise HTTPException(status_code=404, detail=f"No {status} attendance found for this employee")
    return result

# Additional routes for updating and deleting attendance can be added here