from datetime import datetime, timezone

from app.models.task import Task


def as_naive_utc(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value
    return value.astimezone(timezone.utc).replace(tzinfo=None)


def calculate_task_risk(task: Task, now: datetime | None = None) -> tuple[float, float]:
    current_time = as_naive_utc(now) or datetime.utcnow()
    deadline_at = as_naive_utc(task.deadline_at)
    if not deadline_at:
        return 0.15, 0.85

    minutes_remaining = max((deadline_at - current_time).total_seconds() / 60, 1)
    estimated_minutes = task.estimated_minutes or 0
    progress = task.progress or 0.0
    work_remaining = estimated_minutes * (1 - progress)
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
