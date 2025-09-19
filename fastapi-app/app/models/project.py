# app/models/project.py
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from app.core.database import Base
from sqlalchemy.orm import relationship

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    description = Column(String(1000), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    status = Column(String(50), default="Not Started")

class ProjectAssignment(Base):
    __tablename__ = "project_assignments"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    employee_id = Column(String(20), ForeignKey("employees.id"), nullable=False)
    role_in_project = Column(String(80), nullable=True)
