from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_session as get_db
from app.schemas.leave_schema import LeaveCreate, LeaveUpdate, LeaveResponse
from app.services import leave_service

router = APIRouter(prefix="/leaves", tags=["Leaves"])

@router.post("/", response_model=LeaveResponse)
async def apply_leave(payload: LeaveCreate, db: AsyncSession = Depends(get_db)):
    return await leave_service.create_leave_service(db, payload)

@router.put("/{leave_id}", response_model=LeaveResponse)
async def update_leave(leave_id: int, payload: LeaveUpdate, db: AsyncSession = Depends(get_db)):
    return await leave_service.update_leave_service(db, leave_id, payload)

@router.get("/by-date", response_model=List[LeaveResponse])
async def get_leaves_by_date(start_date: str, end_date: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.get_leaves_by_date(db, start_date, end_date)

@router.get("/by-employee/{employee_id}", response_model=List[LeaveResponse])
async def get_leaves_by_employee(employee_id: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.get_leaves_by_employee(db, employee_id)

@router.post("/{leave_id}/approve/{approver_id}", response_model=LeaveResponse)
async def approve_leave(leave_id: int, approver_id: str, db: AsyncSession = Depends(get_db)):
    return await leave_service.approve_leave_service(db, leave_id, approver_id)

@router.delete("/{leave_id}")
async def delete_leave(leave_id: int, db: AsyncSession = Depends(get_db)):
    return await leave_service.delete_leave_service(db, leave_id)
