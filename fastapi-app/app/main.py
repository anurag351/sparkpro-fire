# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.routes import register_routes
from app.routes import employee_routes
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()   # startup par DB tables create
    yield
    # shutdown cleanup agar chahiye

app = FastAPI(title="SparkPro Fire Controls API", lifespan=lifespan)
app.include_router(employee_routes.router)
register_routes(app)

@app.get("/")
async def root():
    return {"msg": "SparkPro prototype API running"}
