from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    entity_type = Column(String, nullable=False)  # e.g. "PasswordReset"
    entity_id = Column(String, nullable=False)   # reference to request or user
    action = Column(String, nullable=False)       # "REQUESTED", "APPROVED", "RESET"
    performed_by = Column(String, nullable=False)  # user_id of actor
    timestamp = Column(DateTime, default=datetime.utcnow)
    comments = Column(Text, nullable=True)
    old_data = Column(Text, nullable=True)
    new_data = Column(Text, nullable=True)
