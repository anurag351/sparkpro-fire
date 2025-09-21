# app/models/request.py
from sqlalchemy import Column, String, Integer, Enum, ForeignKey, Text, DateTime, func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum

class RequestTypeEnum(str, enum.Enum):
    ATTENDANCE = "attendance"
    LEAVE = "leave"
    PROJECT = "project"
    SALARY = "salary"

class RequestStatusEnum(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REASSIGNED = "reassigned"

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    request_type = Column(Enum(RequestTypeEnum), nullable=False)
    employee_id = Column(String, ForeignKey("employees.id"), nullable=False)  # kisne request kiya
    assigned_to = Column(String, ForeignKey("employees.id"), nullable=True)   # kis role ko assign hai
    status = Column(Enum(RequestStatusEnum), default=RequestStatusEnum.PENDING, nullable=False)

    # Comments
    comment = Column(Text, nullable=True)

    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id], backref="requests")
    assigned_person = relationship("Employee", foreign_keys=[assigned_to])
