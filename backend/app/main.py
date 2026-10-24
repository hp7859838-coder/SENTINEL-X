"""
SENTINEL-X: AI Agent Security Guardian
Main FastAPI Application Entrypoint.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from app.database import engine, Base, SessionLocal
from app.services.scanner import init_default_rules
from app.api.dashboard import router as dashboard_router
from app.api.scanner import router as scanner_router
from app.api.firewall import router as firewall_router
from app.api.approvals import router as approvals_router
from app.api.simulation import router as simulation_router
from app.api.rules import router as rules_router
from app.api.events import router as events_router
from app.api.reports import router as reports_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed default detection rules
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        init_default_rules(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="SENTINEL-X AI Agent Security Guardian",
    description=(
        "Defensive cybersecurity platform demonstrating real-time prompt injection detection, "
        "policy-enforced agent action firewalls, human approval gates, and immutable audit trails."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)


# Global Exception Handler to prevent stack trace or secret exposure to end users
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    from starlette.exceptions import HTTPException as StarletteHTTPException
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Sentinel-X gateway prevented traceback exposure."},
    )

# CORS Middleware for Frontend Development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(dashboard_router)
app.include_router(scanner_router)
app.include_router(firewall_router)
app.include_router(approvals_router)
app.include_router(simulation_router)
app.include_router(rules_router)
app.include_router(events_router)
app.include_router(reports_router)


@app.get("/api/health", tags=["Health"])
def health_check():
    """Health check endpoint for container probes and platform monitoring."""
    return {
        "status": "healthy",
        "service": "SENTINEL-X Guardian",
        "version": "1.0.0",
        "mode": "local_demo_gateway",
        "policy_gateway": "active",
        "scanner_engine": "active",
    }


# Mount compiled frontend dist when available for single-port convenience
import os
from fastapi.staticfiles import StaticFiles

dist_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.isdir(dist_path):
    app.mount("/", StaticFiles(directory=dist_path, html=True), name="frontend")

