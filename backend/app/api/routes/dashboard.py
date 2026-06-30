from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.dashboard import DashboardSummary
from app.services.risk import calculate_task_risk, threat_level_from_risk

router = APIRouter()


@router.get("", response_model=DashboardSummary)
async def dashboard(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardSummary:
    result = await db.execute(select(Task).where(Task.user_id == user.id).order_by(Task.deadline_at))
    tasks = list(result.scalars().all())

    for task in tasks:
        task.risk_score, task.completion_probability = calculate_task_risk(task)

    open_tasks = [task for task in tasks if task.status != "done"]
    max_risk = max([task.risk_score for task in open_tasks], default=0.0)
    completed = len([task for task in tasks if task.status == "done"])
    completion_percent = round((completed / len(tasks)) * 100, 1) if tasks else 0.0

    current_focus = sorted(open_tasks, key=lambda item: item.risk_score, reverse=True)[0] if open_tasks else None
    return DashboardSummary(
        threat_level=threat_level_from_risk(max_risk),
        completion_percent=completion_percent,
        burnout_indicator="normal",
        current_focus=current_focus,
        upcoming_deadlines=open_tasks[:5],
        recommendations=[
            "Start with the current focus task.",
            "Use Panic Mode when risk turns critical.",
        ],
    )
