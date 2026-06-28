from fastapi import APIRouter

from app.api.routes import agents, auth, dashboard, tasks, users, webhooks

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(agents.router, prefix="/ai", tags=["ai"])
api_router.include_router(webhooks.router, prefix="/webhooks", tags=["webhooks"])
