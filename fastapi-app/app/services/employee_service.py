from app.models.employee import Employee
from sqlalchemy.orm import Session

def generate_employee_code(name: str, serial_no: int) -> str:
    prefix = name[:2].upper()
    return f"{prefix}{str(serial_no).zfill(6)}"


def create_employee(db: Session, employee_data):
    # First, insert dummy employee to get serial_no
    temp = Employee(
        id="TEMP",  # placeholder
        name=employee_data.name,
        email=employee_data.email,
        role=employee_data.role.value,
        manager_id=employee_data.manager_id,
        password_hash=employee_data.password
    )
    db.add(temp)
    db.commit()
    db.refresh(temp)

    # Generate actual id from serial_no
    emp_code = generate_employee_code(temp.name, temp.serial_no)
    temp.id = emp_code
    db.commit()
    db.refresh(temp)

    return temp