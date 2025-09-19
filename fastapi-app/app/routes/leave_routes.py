# app/routes/leave_routes.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..core.database import get_session
from ..models.leave import Leave, LeaveStatusEnum
from ..models.audit import AuditLog
from ..schemas.leave_schema import LeaveRequest,LeaveApproval,  LeaveOut

router = APIRouter(prefix="/leave", tags=["leave"])

def json_or_none(obj):
    import json
    if obj is None:
        return None
    return json.dumps(obj, default=str)

@router.post("/request", response_model=LeaveOut)
async def request_leave(payload: LeaveRequest, session: AsyncSession = Depends(get_session)):
    leave = Leave(**payload.dict())
    session.add(leave)
    await session.commit()
    await session.refresh(leave)
    audit = AuditLog(entity_type="leave", entity_id=str(leave.id), action="request", performed_by=payload.employee_id, new_data=json_or_none(payload.dict()))
    session.add(audit)
    await session.commit()
    return leave

@router.post("/{leave_id}/approve", response_model=LeaveOut)
async def approve_leave(leave_id: int, payload: LeaveApproval, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Leave).where(Leave.id == leave_id))
    leave = result.scalars().first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    old = {
        "status": str(leave.status),
        "approved_by": leave.approved_by
    }
    leave.status = LeaveStatusEnum.APPROVED if payload.approve else LeaveStatusEnum.REJECTED
    leave.approved_by = payload.approver_id
    await session.commit()
    await session.refresh(leave)
    audit = AuditLog(entity_type="leave", entity_id=str(leave.id), action="approve" if payload.approve else "reject", performed_by=payload.approver_id, old_data=json_or_none(old), new_data=json_or_none({
        "status": str(leave.status),
        "approved_by": leave.approved_by
    }), comments=payload.comments)
    session.add(audit)
    await session.commit()
    return leave

@router.get("/employee/{employee_id}", response_model=list[LeaveOut])
async def list_leaves(employee_id: int, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Leave).where(Leave.employee_id == employee_id))
    rows = result.scalars().all()
    return rows
