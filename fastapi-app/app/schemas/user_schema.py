from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class PasswordResetRequestCreate(BaseModel):
    user_id: int

class PasswordResetRequestOut(BaseModel):
    id: int
    user_id: int
    requested_at: datetime
    approved_by: Optional[int]
    is_approved: bool
    is_used: bool

    class Config:
        orm_mode = True
