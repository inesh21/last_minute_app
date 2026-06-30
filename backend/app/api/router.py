from fastapi import APIRouter

from app.api.routes import agents, auth, dashboard, tasks, users, webhooks, workspace
from app.features.calendar.router import router as calendar_router

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(agents.router, prefix="/ai", tags=["ai"])
api_router.include_router(calendar_router, prefix="/calendar", tags=["calendar"])
api_router.include_router(workspace.router, prefix="/workspace", tags=["workspace"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
