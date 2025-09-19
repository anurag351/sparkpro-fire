import enum
from sqlalchemy import Column, Integer, String, ForeignKey, Enum
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

    # 👇 yeh back_populates Employee side ke saath match hona chahiye
    employee = relationship("Employee", back_populates="leaves")
