# app/routes/user_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.user_schema import UserCreate, UserOut
from app.services.user_service import create_user

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/", response_model=UserOut)
async def create_user_endpoint(payload: UserCreate, db: AsyncSession = Depends(get_session)):
    u = await create_user(db, payload.username, payload.email, payload.password)
    return u
