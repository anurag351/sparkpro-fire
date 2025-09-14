from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class ProjectAssignment(Base):
    __tablename__ = "project_assignments"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    employee_id = Column(String, ForeignKey("users.id"))
    assigned_by = Column(String, ForeignKey("users.id"))
    approved_by = Column(String, ForeignKey("users.id"), nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    project = relationship("Project", back_populates="assignments")
    employee = relationship("User", foreign_keys=[employee_id])
    manager = relationship("User", foreign_keys=[assigned_by])
    approver = relationship("User", foreign_keys=[approved_by])