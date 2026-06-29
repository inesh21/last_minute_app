from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.database.session import create_database
from app.scheduler.runner import scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_database()
    if settings.scheduler_enabled:
        scheduler.start()
    yield
    if settings.scheduler_enabled:
        scheduler.stop()


app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health_check() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name}

