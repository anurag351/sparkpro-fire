from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Project, ProjectAssignment, User
from app.schemas import ProjectCreate, AssignmentRequest
from app.auth import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=dict)
def create_project(project: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role not in ["Manager", "APD", "PD", "MD"]:
        raise HTTPException(status_code=403, detail="Not authorized to create projects")

    new_project = Project(name=project.name, description=project.description)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return {"msg": "Project created", "project_id": new_project.id}


@router.post("/{project_id}/assign")
def assign_employee(project_id: int, req: AssignmentRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Check if employee is already assigned
    existing = db.query(ProjectAssignment).filter(ProjectAssignment.employee_id == req.employee_id, ProjectAssignment.is_active == True).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee already assigned to a project")

    # Role restrictions
    approved_by = None
    if current_user.role == "Manager":
        # Needs approval
        approved_by = None
    elif current_user.role in ["APD", "PD", "MD"]:
        approved_by = current_user.id

    assignment = ProjectAssignment(
        project_id=project.id,
        employee_id=req.employee_id,
        assigned_by=current_user.id,
        approved_by=approved_by,
        is_active=True
    )

    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"msg": "Employee assigned. Awaiting approval" if approved_by is None else "Employee assigned successfully"}
