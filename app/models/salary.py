# app/models/salary.py
from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship

class Salary(Base):
    __tablename__ = "salaries"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    employee_id = Column(String(20), ForeignKey("employees.id"), nullable=False)
    month = Column(String(7), nullable=False)  # YYYY-MM
    base_salary = Column(Float, nullable=False)
    overtime_pay = Column(Float, default=0.0)
    total_salary = Column(Float, nullable=False)
    employee = relationship("Employee", back_populates="salaries", foreign_keys=[employee_id])
 