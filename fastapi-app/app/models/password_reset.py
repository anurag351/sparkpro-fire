from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class PasswordResetRequest(Base):
    __tablename__ = "password_reset_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"))
    requested_at = Column(DateTime, default=datetime.utcnow)
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    temporary_password = Column(String, nullable=True)
    is_approved = Column(Boolean, default=False)
    is_used = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="reset_requests")
    approver = relationship("User", foreign_keys=[approved_by])
