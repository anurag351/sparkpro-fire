# app/schemas/user_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    temp_password:bool

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    temp_password: bool
    class Config:
        from_attributes = True
