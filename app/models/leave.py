import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class LeaveStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)
    reason = Column(String, nullable=True)
    status = Column(Enum(LeaveStatusEnum), default=LeaveStatusEnum.PENDING)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    approver_l1 = Column(String, ForeignKey("employees.id"), nullable=True)
    approver_l2 = Column(String, ForeignKey("employees.id"), nullable=True)

    # relationships
    employee = relationship("Employee", back_populates="leaves", foreign_keys=[employee_id])
    approver1 = relationship("Employee", foreign_keys=[approver_l1], lazy="joined")
    approver2 = relationship("Employee", foreign_keys=[approver_l2], lazy="joined")
