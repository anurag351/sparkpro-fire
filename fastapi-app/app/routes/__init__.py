# app/routes/__init__.py
from fastapi import FastAPI
from .user_routes import router as user_router
from .employee_routes import router as emp_router
from .reset_routes import router as reset_router
from .attendance_routes import router as att_router
from .leave_routes import router as leave_router

def register_routes(app: FastAPI):
    app.include_router(user_router)
    app.include_router(emp_router)
    app.include_router(reset_router)
    app.include_router(att_router)
    app.include_router(leave_router)
