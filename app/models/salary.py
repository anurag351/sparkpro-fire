from sqlalchemy import Column, Integer, Float, String, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship


class Salary(Base):
    __tablename__ = "salaries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Employee reference
    employee_id = Column(String(20), ForeignKey("employees.id"), nullable=False)

    # Month + Year (Option 2)
    month = Column(Integer, nullable=False)   # 1–12
    year = Column(Integer, nullable=False)    # e.g., 2025

    # Salary Components
    basic_salary = Column(Float, nullable=False)          # base salary
    allowances = Column(Float, default=0.0)               # extra allowances
    advance_salary = Column(Float, default=0.0)
    overtime_hours = Column(Float, default=0.0)
    overtime_rate = Column(Float, default=0.0)            # per hour
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, nullable=False)            # final computed salary

    # Relationship back to employee
    employee = relationship(
        "Employee",
        back_populates="salaries",
        foreign_keys=[employee_id]
    )
