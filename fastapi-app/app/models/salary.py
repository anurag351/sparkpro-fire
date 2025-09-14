# app/models/salary.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from ..core.database import Base

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    month = Column(String, nullable=False)  # YYYY-MM
    base_pay = Column(Float, default=0.0)
    overtime_pay = Column(Float, default=0.0)
    total_pay = Column(Float, default=0.0)
    approved_by = Column(String, ForeignKey("employees.id"), nullable=True)

    employee = relationship("Employee")
