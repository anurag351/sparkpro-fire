# app/models/attendance.py
import enum
from sqlalchemy import Column, Integer, Date,String, Time, Float, Enum, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base
from .employee import RoleEnum

class AttendanceStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, autoincrement=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    time_in = Column(Time, nullable=True)
    time_out = Column(Time, nullable=True)
    overtime_hours = Column(Float, default=0.0)
    status = Column(Enum(AttendanceStatusEnum), default=AttendanceStatusEnum.PENDING)
    approved_by = Column(String, ForeignKey("employees.id"), nullable=True)

    employee = relationship("Employee", foreign_keys=[employee_id])
