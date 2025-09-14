from sqlalchemy import Column, Enum, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.employee import RoleEnum

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False, default=RoleEnum.EMPLOYEE)   # Employee, Manager, APD, PD, MD
    is_active = Column(Boolean, default=True)
    is_temp_password = Column(Boolean, default=False)  # Flag for forced reset

    # Relationships
    reset_requests = relationship("PasswordResetRequest", back_populates="user")
