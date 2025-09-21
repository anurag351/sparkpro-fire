# app/models/attendance.py
from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(20), ForeignKey("employees.id"), nullable=False)
    date = Column(Date, nullable=False)
    time_in = Column(Time, nullable=False)
    time_out = Column(Time, nullable=False)
    hours_worked = Column(Integer, nullable=True)
    overtime_hours = Column(Integer, default=0)
    status = Column(String(20), default="Pending")  # Pending / Approved / Rejected
    approved_by = Column(String, ForeignKey("employees.id"), nullable=False)
    review_comment = Column(String(255), nullable=True) 
    employee = relationship("Employee", foreign_keys=[employee_id])
    approver = relationship("Employee", foreign_keys=[employee_id])