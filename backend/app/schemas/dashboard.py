from pydantic import BaseModel

from app.schemas.task import TaskRead


class DashboardSummary(BaseModel):
    threat_level: str
    completion_percent: float
    burnout_indicator: str
    current_focus: TaskRead | None
    upcoming_deadlines: list[TaskRead]
    recommendations: list[str]

