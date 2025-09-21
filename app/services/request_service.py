from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException
from app.models.request import Request, RequestTypeEnum, RequestStatusEnum
from app.services.audit_service import log_audit

# --------------------
# Create new request
# --------------------
async def create_request_service(db: AsyncSession, payload, by_employee_id: str):
    new_req = Request(
        request_type=payload.request_type,
        assigned_to=payload.assigned_to,
        created_by=by_employee_id,
        comment=payload.comment,
    )
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)

    # Audit log
    await log_audit(
        db,
        entity_type="Request",
        entity_id=str(new_req.id),
        action="CREATE",
        performed_by=by_employee_id,
        comment=payload.comment,
    )

    return new_req


# --------------------
# Act on existing request (Approve / Reject / Reassign)
# --------------------
async def act_on_request_service(db: AsyncSession, request_id: int, payload):
    result = await db.execute(select(Request).where(Request.id == request_id))
    req = result.scalars().first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    action = payload.action.value.upper()

    # ✅ Approve
    if action == "APPROVE":
        # Optional comment allowed
        req.status = RequestStatusEnum.APPROVED
        req.comment = payload.comment

    # ❌ Reject
    elif action == "REJECT":
        if not payload.comment:
            raise HTTPException(status_code=400, detail="Comment is mandatory for rejection")
        req.status = RequestStatusEnum.REJECTED
        req.comment = payload.comment

    # 🔄 Reassign
    elif action == "REASSIGN":
        if not payload.comment:
            raise HTTPException(status_code=400, detail="Comment is mandatory for reassignment")
        if not payload.new_assigned_to:
            raise HTTPException(status_code=400, detail="New assigned_to is required for reassignment")

        req.status = RequestStatusEnum.PENDING
        req.assigned_to = payload.new_assigned_to
        req.comment = payload.comment

    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    await db.commit()
    await db.refresh(req)

    # Audit log
    await log_audit(
        db,
        entity_type="Request",
        entity_id=str(req.id),
        action=action,
        performed_by=payload.by_employee_id,
        comment=payload.comment,
    )

    return req


# --------------------
# Get request by ID
# --------------------
async def get_request_by_id_service(db: AsyncSession, request_id: int):
    result = await db.execute(select(Request).where(Request.id == request_id))
    return result.scalars().first()


# --------------------
# Get all requests (optional filter by assigned_to or status)
# --------------------
async def get_all_requests_service(db: AsyncSession, assigned_to: str = None, status: str = None):
    query = select(Request)
    if assigned_to:
        query = query.where(Request.assigned_to == assigned_to)
    if status:
        query = query.where(Request.status == status)

    result = await db.execute(query)
    return result.scalars().all()
