# app/main.py
from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.core.database import init_db
from app.routes import register_routes
from app.routes import *
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()   # startup par DB tables create
    yield
    # shutdown cleanup agar chahiye
origins = [
    "http://localhost:3000",   # React local
    "http://127.0.0.1:3000",   # React/Vite alternative
    "http://localhost:4200",   # Angular local
    "http://127.0.0.1:4200",
    "*"  # 👈 agar sab allow karna hai (production me avoid karo)
]

app = FastAPI(title="SparkPro Fire Controls API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # List of origins
    allow_credentials=True,
    allow_methods=["*"],     # ["GET", "POST", "PUT", "DELETE"] bhi de sakte ho
    allow_headers=["*"],     # All headers allow
)
app.include_router(employee_routes.router)
app.include_router(user_routes.router)
register_routes(app)
UPLOAD_DIR = "uploads/passports"

os.makedirs(UPLOAD_DIR, exist_ok=True)

# serve files from /static/passports/<filename>
app.mount("/static/passports", StaticFiles(directory=UPLOAD_DIR), name="passports")
# Path to frontend build
frontend_dir = Path(__file__).resolve().parent.parent / "frontend" / "build"
# Serve static files (js/css/images)
app.mount("/static", StaticFiles(directory=frontend_dir / "static"), name="static")
@app.get("/api")
async def root():
    return {"msg": "SparkPro prototype API running"}
@app.get("/{full_path:path}")
# Catch-all route for React Router
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    return FileResponse(frontend_dir / "index.html")
