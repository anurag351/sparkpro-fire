from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from calendar import month_name
from app.models.employee import Employee, RoleEnum
from app.models.salary import Salary
from app.schemas.salary_schema import SalaryRequest
from app.services.pdf_generator import generate_salary_slip_pdf
from sqlalchemy import select, extract
from app.models.attendance import Attendance
from datetime import date, timedelta
from app.services.audit_service import log_audit as write_audit
def count_absent_days(attendance_dates_set, month, year):
    absents = 0
    
    # First day of month
    current = date(year, month, 1)

    # last day of month
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)

    # loop all days in month
    while current < next_month:
        
        # Skip Sundays
        if current.weekday() == 6:  # Sunday = 6
            current += timedelta(days=1)
            continue

        # If date not in attendance record set → marked absent
        if current not in attendance_dates_set:
            absents += 1

        current += timedelta(days=1)

    return absents

async def calculate_and_update_salary(performed_by: str,payload:SalaryRequest, db: AsyncSession):
    employee_id = payload.employee_id
    year = payload.year
    month = payload.month
    advance_salary_input = payload.advance_salary
    # Validate employee exists
    emp_result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = emp_result.scalar_one_or_none()

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Fetch attendance for given month/year
    attendance_result = await db.execute(
        select(Attendance)
        .where(Attendance.employee_id == employee_id)
        .where(extract("month", Attendance.date) == month)
        .where(extract("year", Attendance.date) == year)
       # .where(Attendance.status == "Approved")  # only approved count
    )

    attendance_records = attendance_result.scalars().all()

    if not attendance_records:
        raise HTTPException(
            status_code=404,
            detail=f"No approved attendance found for {month_name[month]} {year}"
        )

    # Calculate totals
    total_hours_worked = sum(a.hours_worked or 0 for a in attendance_records)
    total_overtime_hours = sum(a.overtime_hours or 0 for a in attendance_records)

    # Salary Components
    basic_salary = employee.salary_per_month or 0
    allowances = 0  # if you want dynamic allowances, add field
    overtime_rate = employee.overtime_charge_per_hour or 0
    overtime_amount = total_overtime_hours * overtime_rate
    attendance_dates = {att.date for att in attendance_records}
    absent_days = count_absent_days(attendance_dates, month, year)
    deductions = absent_days * (employee.deduct_per_day or 0)
    advance_salary = advance_salary_input or 0
    # Net salary
    net_salary = basic_salary + allowances + overtime_amount - deductions

    # Check if salary for month already exists
    salary_query = await db.execute(
        select(Salary).where(
            Salary.employee_id == employee_id,
            Salary.month == month,
            Salary.year == year
        )
    )
    existing_salary = salary_query.scalar_one_or_none()

    if existing_salary:
        # Update existing salary
        existing_salary.basic_salary = basic_salary
        existing_salary.advance_salary = advance_salary+existing_salary.advance_salary
        existing_salary.allowances = allowances
        existing_salary.overtime_hours = total_overtime_hours
        existing_salary.overtime_rate = overtime_rate
        existing_salary.deductions = deductions
        existing_salary.net_salary = net_salary

        await db.commit()
        await db.refresh(existing_salary)
        return existing_salary

    # Else create new salary entry
    new_salary = Salary(
        employee_id=employee_id,
        month=month,
        year=year,
        basic_salary=basic_salary,
        advance_salary=advance_salary,
        allowances=allowances,
        overtime_hours=total_overtime_hours,
        overtime_rate=overtime_rate,
        deductions=deductions,
        net_salary=net_salary,
    )

    db.add(new_salary)
    await db.commit()
    await db.refresh(new_salary)
    await write_audit(
            db=db,
            entity_type="SALARY",
            entity_id=payload.employee_id,
            action="UPDATE",
            performed_by=performed_by,
            comment=f"Salary of {employee.name} is updated successfully by {performed_by}"
        )
    return new_salary


async def create_salary_slip(employee_id: str, year: int, month: int, db: AsyncSession):
    # Validate month
    if not (1 <= month <= 12):
        raise HTTPException(status_code=400, detail="month must be an integer between 1 and 12")

    # Fetch employee
    result = await db.execute(select(Employee).where(Employee.id == employee_id))
    employee = result.scalar_one_or_none()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Fetch salary for this month + year
    result = await db.execute(
        select(Salary).where(
            Salary.employee_id == employee_id,
            Salary.year == year,
            Salary.month == month,
        )
    )
    salary = result.scalar_one_or_none()
    if not salary:
        raise HTTPException(
            status_code=404,
            detail=f"No salary record found for {month_name[month]} {year}"
        )
    manager_name = "N/A"
    if getattr(employee, "manager_id", None):
        result2 = await db.execute(
            select(Employee.name).where(Employee.id == employee.manager_id)
        )
        manager_name = result2.scalar_one_or_none() or "N/A"

    emp_data = {
        "id": employee.id,
        "name": employee.name,
        "role": employee.role.value if hasattr(employee.role, "value") else employee.role,
        "department": getattr(employee, "department", "N/A"),
        "date_of_joining": str(getattr(employee, "date_of_joining", "")),
        "manager_name": manager_name,
    }

    # Prepare salary dict
    sal_data = {
        "basic_salary": salary.basic_salary or 0,
        "allowances": salary.allowances or 0,
        "overtime_hours": salary.overtime_hours or 0,
        "overtime_rate": salary.overtime_rate or 0,
        "deductions": salary.deductions or 0,
        "net_salary": salary.net_salary or 0,
        "salary_month": f"{month_name[month]} {year}",
        "advance_salary": salary.advance_salary or 0,
    }

    # Generate PDF
    pdf_buffer = generate_salary_slip_pdf(
        company_name="SparkPro Pvt. Ltd.",
        month_title=sal_data["salary_month"],
        employee=emp_data,
        salary=sal_data,
    )

    return pdf_buffer
