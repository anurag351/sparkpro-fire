# app/models/employee.py
import enum
from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class RoleEnum(str, enum.Enum):
    EMPLOYEE = "employee"
    MANAGER = "manager"
    APD = "assistant_project_director"
    PD = "project_director"
    MD = "managing_director"

class Employee(Base):
    __tablename__ = "employees"
    serial_no = Column(Integer,unique=True, autoincrement=True)
    id = Column(String, primary_key=True, unique=True, index=True) 
    name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.EMPLOYEE)
    manager_id = Column(String, ForeignKey("employees.id"), nullable=True)
    contact = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    manager = relationship("Employee", remote_side=[id], backref="team_members")
