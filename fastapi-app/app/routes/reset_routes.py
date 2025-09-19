# app/routes/reset_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.schemas.reset_schema import ResetRequestCreate, ResetRequestOut, ResetApproveIn
from app.services.reset_service import create_reset_request, list_pending_requests, approve_request

router = APIRouter(prefix="/password-reset", tags=["password-reset"])

@router.post("/", response_model=ResetRequestOut)
async def request_reset(payload: ResetRequestCreate, db: AsyncSession = Depends(get_session)):
    req = await create_reset_request(db, payload.user_email, payload.reason)
    return req

@router.get("/pending")
async def pending_list(db: AsyncSession = Depends(get_session)):
    return await list_pending_requests(db)

@router.post("/{request_id}/approve")
async def approve(request_id: int, payload: ResetApproveIn, db: AsyncSession = Depends(get_session)):
    try:
        res = await approve_request(db, request_id, payload.approver_id, payload.expires_in_minutes)
        # For demo we return temp password; in prod send via secure channel
        return {"message": "Approved", "temp_password": res["temp_password"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
