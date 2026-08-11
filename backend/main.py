# File: backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routes import auth, scan, push, ws
from backend.core.config import settings
from backend.db.base import Base  # noqa: F401 — triggers model registration
from backend.db.session import engine

# 1. Create all database tables on startup
Base.metadata.create_all(bind=engine)

# 2. Initialize FastAPI app instance ONCE
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
)

# 3. CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_origin_regex=r"chrome-extension://.*|https?://.*",    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Register routers (auth and scan)
# Note: scan.py already contains /scan/url, /scan/email, /scan/message, and /scan/history
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(scan.router, prefix=settings.API_V1_STR)
app.include_router(push.router, prefix=settings.API_V1_STR)

from fastapi import WebSocket, WebSocketDisconnect
from backend.api.routes.ws import manager

@app.websocket(f"{settings.API_V1_STR}/ws/notifications")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": f"{settings.API_V1_STR}/docs",
    }