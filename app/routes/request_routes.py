# app/routes/request_routes.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.request_schema import RequestCreate, RequestOut, RequestAction
from app.services.request_service import create_request_service, act_on_request_service, get_requests_by_status
from app.models.request import RequestStatusEnum

router = APIRouter(prefix="/requests", tags=["requests"])

@router.post("/", response_model=RequestOut)
async def create_request(payload: RequestCreate, db: AsyncSession = Depends(get_session)):
    return await create_request_service(db, payload)

@router.post("/act", response_model=RequestOut)
async def act_on_request(payload: RequestAction, db: AsyncSession = Depends(get_session)):
    return await act_on_request_service(db, payload)

@router.get("/pending", response_model=list[RequestOut])
async def get_pending_requests(db: AsyncSession = Depends(get_session)):
    return await get_requests_by_status(db, RequestStatusEnum.PENDING)

@router.get("/approved", response_model=list[RequestOut])
async def get_approved_requests(db: AsyncSession = Depends(get_session)):
    return await get_requests_by_status(db, RequestStatusEnum.APPROVED)
