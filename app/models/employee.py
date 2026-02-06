# app/models/employee.py
import enum
from sqlalchemy import (
    Column,
    Integer,
    String,
    Enum,
    ForeignKey,
    Boolean,
    Float,
)
from sqlalchemy.orm import relationship
from app.core.database import Base


# ---------- ENUM FOR ROLES ----------
class RoleEnum(str, enum.Enum):
    Employee = "Employee"
    Manager = "Manager"
    APD = "APD"
    PD = "PD"
    MD = "MD"
    HR = "HR"
    CP = "CP"
    CAP = "CAP"

# ---------- EMPLOYEE MODEL ----------
class Employee(Base):
    __tablename__ = "employees"

    # Primary auto-increment key
    serial_no = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Unique employee ID (e.g., generated like "EM000123")
    id = Column(String, unique=True, nullable=False)

    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)
    contact = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # ---- Financial fields ----
    salary_per_month = Column(Float, nullable=True)
    overtime_charge_per_hour = Column(Float, nullable=True)
    deduct_per_hour = Column(Float, nullable=True)
    deduct_per_day = Column(Float, nullable=True)

    # ---- Optional details ----
    aadhaar_number = Column(String(12), nullable=True)
    passport_photo_filename = Column(String(255), nullable=True)

    # ---- Relationships ----
    manager = relationship(
        "Employee",
        remote_side=[id],
        backref="team_members",
        foreign_keys=[manager_id],
    )

    leaves = relationship(
        "Leave",
        back_populates="employee",
        cascade="all, delete-orphan",
        foreign_keys="Leave.employee_id",
    )

    salaries = relationship(
        "Salary",
        back_populates="employee",
        cascade="all, delete-orphan",
        foreign_keys="Salary.employee_id",
    )

    # ---- Representation for debugging ----
    def __repr__(self):
        return f"<Employee(id='{self.id}', name='{self.name}', role='{self.role}')>"
