from fastapi import APIRouter
from app.services.audit_service import log_audit
from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.password_reset import PasswordResetRequest
from app.models.user import User
from app.core.database import get_session as get_db
from app.services.auth_service import generate_temp_password, hash_password
from app.schemas.user_schema import PasswordResetRequestOut
from app.schemas.user_schema import PasswordResetRequestCreate

router = APIRouter()

@router.post("/users/reset-password-request", response_model=PasswordResetRequestOut)
def request_password_reset(req: PasswordResetRequestCreate, db: Session = Depends(get_db)):
    reset_request = PasswordResetRequest(user_id=req.user_id)
    db.add(reset_request)
    db.commit()
    db.refresh(reset_request)

    # 🔹 Log audit
    log_audit(
        db,
        entity_type="PasswordReset",
        entity_id=reset_request.id,
        action="REQUESTED",
        performed_by=req.user_id,
        comments="Password reset requested by employee."
    )

    return reset_request

from app.services.role_service import ensure_approver_role

@router.post("/users/reset-password-approve/{request_id}")
def approve_password_reset(request_id: int, approver_id: int, db: Session = Depends(get_db)):
    reset_request = db.query(PasswordResetRequest).filter(PasswordResetRequest.id == request_id).first()
    if not reset_request:
        raise HTTPException(status_code=404, detail="Reset request not found")

    approver = db.query(User).filter(User.id == approver_id).first()
    if not approver:
        raise HTTPException(status_code=404, detail="Approver not found")

    # 🔹 Enforce RBAC
    ensure_approver_role(approver.role)

    # Prevent self-approval
    if reset_request.user_id == approver_id:
        raise HTTPException(status_code=403, detail="Users cannot approve their own password reset request")

    temp_password = generate_temp_password()
    reset_request.temporary_password = hash_password(temp_password)
    reset_request.is_approved = True
    reset_request.approved_by = approver_id
    db.commit()
    db.refresh(reset_request)

    # 🔹 Log audit
    log_audit(
        db,
        entity_type="PasswordReset",
        entity_id=reset_request.id,
        action="APPROVED",
        performed_by=approver_id,
        comments=f"Password reset approved for user {reset_request.user_id}",
        new_data="Temporary password issued"
    )

    return {"temporary_password": temp_password, "message": "Employee must reset password on next login."}


@router.post("/users/reset-password/{user_id}")
def reset_password(user_id: int, temp_password: str, new_password: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    reset_request = db.query(PasswordResetRequest).filter(
        PasswordResetRequest.user_id == user_id,
        PasswordResetRequest.is_approved == True,
        PasswordResetRequest.is_used == False
    ).first()

    if not reset_request:
        raise HTTPException(status_code=400, detail="No active reset request")

    from app.services.auth_service import verify_password
    if not verify_password(temp_password, reset_request.temporary_password):
        raise HTTPException(status_code=400, detail="Invalid temporary password")

    # Save old password hash for audit
    old_password = user.hashed_password

    # Update new password
    user.hashed_password = hash_password(new_password)
    user.is_temp_password = False
    reset_request.is_used = True
    db.commit()

    # 🔹 Log audit
    log_audit(
        db,
        entity_type="PasswordReset",
        entity_id=reset_request.id,
        action="RESET",
        performed_by=user_id,
        comments="Employee reset password successfully.",
        old_data=old_password,
        new_data=user.hashed_password
    )

    return {"message": "Password successfully reset."}
