# app/models/attendance.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(20), ForeignKey("employees.id"), nullable=False)
    time_in = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    time_out = Column(DateTime(timezone=True), nullable=True)
    hours_worked = Column(Integer, nullable=True)
    overtime_hours = Column(Integer, default=0)
    status = Column(String(20), default="Pending")  # Pending / Approved / Rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    employee = relationship("Employee", foreign_keys=[employee_id])
