# app/services/attendance_service.py
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.attendance import Attendance
from app.schemas.attendance_schema import AttendanceCreate
from sqlalchemy import extract

def calculate_hours(time_in, time_out):
    """Calculate total hours worked"""
    delta = datetime.combine(datetime.today(), time_out) - datetime.combine(datetime.today(), time_in)
    hours = delta.seconds // 3600
    return hours

def add_attendance(db: Session, attendance_data: AttendanceCreate):
    hours_worked = calculate_hours(attendance_data.time_in, attendance_data.time_out)

    db_attendance = Attendance(
        employee_id=attendance_data.employee_id,
        date=attendance_data.date,
        time_in=attendance_data.time_in,
        time_out=attendance_data.time_out,
        hours_worked=hours_worked,
        overtime_hours=max(0, hours_worked - 8),  # Example: >8 hrs = overtime
        status="Pending"
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance


def get_attendance_by_employee(db: Session, employee_id: str):
    return db.query(Attendance).filter(Attendance.employee_id == employee_id).all()


def get_attendance_by_month(db: Session, employee_id: str, year: int, month: int):
    return db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        extract("year", Attendance.date) == year,
        extract("month", Attendance.date) == month
    ).all()
def getAttendance_by_status_by_approver(db: Session, approver_id: str,status:str):
    return db.query(Attendance).filter(
        Attendance.approved_by == approver_id,
        Attendance.status == status
    ).all()

def getAttandance_by_status_by_employee(db: Session, employee_id: str,status:str):
    return db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.status == status
    ).all()
def auto_mark_absent(db: Session, grace_days: int = 1):
    today = date.today()
    target_date = today - timedelta(days=grace_days)  # Mark for past day(s)

    employees = db.query(Employee).all()

    for emp in employees:
        # Check if attendance already exists
        existing_attendance = db.query(Attendance).filter(
            Attendance.employee_id == emp.id,
            Attendance.date == target_date
        ).first()

        if existing_attendance:
            continue  # Already present or marked

        # Check if on leave
        leave = db.query(Leave).filter(
            Leave.employee_id == emp.id,
            Leave.start_date <= target_date,
            Leave.end_date >= target_date,
            Leave.status == "Approved"
        ).first()

        if leave:
            continue  # Skip marking absent if on leave

        # Insert absent record
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

    db.commit()

