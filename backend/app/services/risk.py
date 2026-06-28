from datetime import datetime

from app.models.task import Task


def calculate_task_risk(task: Task, now: datetime | None = None) -> tuple[float, float]:
    current_time = now or datetime.utcnow()
    if not task.deadline_at:
        return 0.15, 0.85

    minutes_remaining = max((task.deadline_at - current_time).total_seconds() / 60, 1)
    work_remaining = task.estimated_minutes * (1 - task.progress)
    pressure = work_remaining / minutes_remaining
    risk = min(max(pressure, 0.0), 1.0)
    probability = max(1.0 - risk, 0.05)
    return round(risk, 2), round(probability, 2)


def threat_level_from_risk(max_risk: float) -> str:
    if max_risk >= 0.95:
        return "impossible"
    if max_risk >= 0.75:
        return "critical"
    if max_risk >= 0.55:
        return "high_risk"
    if max_risk >= 0.3:
        return "busy"
    return "safe"

