# app/services/security.py
from passlib.context import CryptContext
from app.core.config import settings
import secrets, string
from datetime import datetime, timedelta

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(pw: str) -> str:
    return pwd.hash(pw)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd.verify(plain, hashed)

def generate_temp_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$%^&*()-_"
    return ''.join(secrets.choice(chars) for _ in range(length))

def temp_pw_expires(minutes: int) -> datetime:
    return datetime.utcnow() + timedelta(minutes=minutes)
