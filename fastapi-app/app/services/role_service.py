from fastapi import HTTPException, status

ALLOWED_APPROVERS = ["MANAGER", "APD", "PD", "MD"]

def ensure_approver_role(user_role: str):
    if user_role not in ALLOWED_APPROVERS:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to approve password reset requests"
        )
