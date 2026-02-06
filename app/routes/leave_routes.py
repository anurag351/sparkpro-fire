from fastapi import APIRouter, Depends,Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_session as get_db
from app.schemas.leave_schema import LeaveCreate, LeaveUpdate, LeaveResponse,LeaveReject
from app.services import leave_service

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/applyLeave/{appliedBy}", response_model=LeaveResponse)
async def apply_leave(appliedBy:str, payload: LeaveCreate, db: AsyncSession = Depends(get_db)):
    return await leave_service.create_leave_service(db, payload,appliedBy)

@router.put("/updateLeaveByID/{leave_id}", response_model=LeaveResponse)
async def update_leave(leave_id: int, payload: LeaveUpdate, db: AsyncSession = Depends(get_db)):
    return await leave_service.update_leave_service(db, leave_id, payload)

@router.get("/getLeaveBy-date", response_model=List[LeaveResponse])
async def get_leaves_by_date(start_date: str, end_date: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.get_leaves_by_date(db, start_date, end_date)

@router.get("/getLeaveBy-employeeID/{employee_id}", response_model=List[LeaveResponse])
async def get_leaves_by_employee(employee_id: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.get_leaves_by_employee(db, employee_id)

@router.post("/approveLeavebyID/{leave_id}/approveBy/{approver_id}", response_model=LeaveResponse)
async def approve_leave(leave_id: int, approver_id: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.approve_leave_service(db, leave_id, approver_id)

@router.delete("/deleteLeavebyID/{leave_id}")
async def delete_leave(leave_id: int, db: AsyncSession = Depends(get_db)):
    return await leave_service.delete_leave_service(db, leave_id)

@router.get("/export")
async def export_leave(
    start_date: str = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: str = Query(..., description="End date (YYYY-MM-DD)"),
    employee_id: str | None = Query(None, description="Optional Employee ID"),
    status: str | None = Query(None, description="Optional Status"),
    db: AsyncSession = Depends(get_db),
):
    return await leave_service.export_leave_service(db, start_date, end_date, employee_id, status)

@router.put("/updateStatus/{leave_id}/by/{performed_by}")
async def update_leave_status(
    leave_id: int,
    performed_by: str,
    payload: LeaveReject,
    db: AsyncSession = Depends(get_db),
):
    """
    Approve or Reject Leave by ID.
    Example:
      PUT /leaves/updateStatus/5/by/MA000003
    """
    return await leave_service.update_leave_status_service(
        db, leave_id, payload.status, performed_by, payload.review_comment
    )