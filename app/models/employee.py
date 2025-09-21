# app/models/employee.py
import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    Employee = "Employee"
    Manager = "Manager"
    APD = "APD"
    PD = "PD"
    MD = "MD"

class Employee(Base):
    __tablename__ = "employees"

    serial_no = Column(Integer, primary_key=True, autoincrement=True)
    id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)
    contact = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # new financial fields
    salary_per_month = Column(Float, nullable=True)
    overtime_charge_per_hour = Column(Float, nullable=True)
    deduct_per_hour = Column(Float, nullable=True)
    deduct_per_day = Column(Float, nullable=True)

    aadhaar_number = Column(String(12), nullable=True)
    passport_photo_filename = Column(String(255), nullable=True)

    manager = relationship("Employee", remote_side=[id], backref="team_members")

    leaves = relationship("Leave", back_populates="employee", cascade="all, delete-orphan")
    salaries = relationship("Salary", back_populates="employee", cascade="all, delete-orphan")