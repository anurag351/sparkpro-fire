# app/models/user.py
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(10), unique=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    temp_password = Column(Boolean ,default=True)
    # relationship to reset requests (requested_by)
    reset_requests = relationship("ResetRequest", back_populates="requester", foreign_keys="ResetRequest.requested_by")
