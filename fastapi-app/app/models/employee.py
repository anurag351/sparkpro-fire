# app/models/employee.py
import enum
from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    APD = "assistant_project_director"
    PD = "project_director"
    MD = "managing_director"

class Employee(Base):
    __tablename__ = "employees"

    serial_no = Column(Integer, unique=True, autoincrement=True)
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)
    contact = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    manager = relationship("Employee", remote_side=[id], backref="team_members")

    # 👇 yeh tumne miss kiya hai (yehi error ka reason hai)
    leaves = relationship("Leave", back_populates="employee", cascade="all, delete-orphan")
    salaries = relationship("Salary", back_populates="employee", cascade="all, delete-orphan")
    
