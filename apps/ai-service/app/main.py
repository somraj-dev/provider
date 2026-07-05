"""
AxioVital AI Service
FastAPI application for AI/ML healthcare services.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes.health import router as health_router

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AxioVital AI Service — Healthcare AI/ML endpoints",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health_router, prefix="/api/v1")


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    pass  # TODO: Initialize connections, load models


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    pass  # TODO: Cleanup connections
