# app/routes/user_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.user_schema import UserCreate, UserOut
from app.services.user_service import create_user, get_user_by_username

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/createPassword/{performed_by}", response_model=UserOut)
async def create_user_endpoint(payload: UserCreate, db: AsyncSession = Depends(get_session),performed_by:str="System"):
    u = await create_user(db, payload.username, payload.password,performed_by,payload.temp_password)
    return u
@router.post("/login", response_model=UserOut)
async def login(payload: UserCreate, db: AsyncSession = Depends(get_session)):
    u = await get_user_by_username(db, payload.username, payload.password)
    return u