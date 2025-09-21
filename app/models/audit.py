# app/models/audit.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True,autoincrement=True)
    entity_type = Column(String, nullable=False)  # e.g. "Employee", "Request"
    entity_id = Column(String, nullable=False)    # e.g. EmployeeID ya RequestID
    action = Column(String, nullable=False)       # e.g. CREATE, UPDATE, DELETE, APPROVE, REJECT
    performed_by = Column(String, ForeignKey("employees.id"), nullable=False)
    comment = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    performed_by_user = relationship("Employee")
