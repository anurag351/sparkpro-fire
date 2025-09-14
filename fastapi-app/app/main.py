# main.py
import asyncio
from fastapi import FastAPI
from app.core.database import engine, Base
from app.routes import attendance_routes, leave_routes, salary_routes, audit_routes, employee_routes, user_routes
import uvicorn

app = FastAPI(title="SparkPro Internal Prototype API")

# include routers
app.include_router(employee_routes.router)
app.include_router(attendance_routes.router)
app.include_router(leave_routes.router)
app.include_router(salary_routes.router)
app.include_router(audit_routes.router)
app.include_router(user_routes.router)

@app.on_event("startup")
async def startup():
    # create tables (for prototype only; use Alembic for production)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {"msg": "SparkPro prototype API running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
