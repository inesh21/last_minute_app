from pydantic import BaseModel

class DashboardResponse(BaseModel):
    threat_level: str
    completion_percent: float
    current_focus: dict | None
    upcoming_deadlines: list
    recommendations: list[str]
