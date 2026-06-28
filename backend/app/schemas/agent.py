from pydantic import BaseModel

from app.schemas.task import MicroTask


class ToolCall(BaseModel):
    name: str
    arguments: dict
    status: str = "planned"
    result: dict | None = None


class AgentResponse(BaseModel):
    message: str
    tool_calls: list[ToolCall] = []
    recommendations: list[str] = []


class ChatRequest(BaseModel):
    user_id: str
    message: str
    context: dict = {}


class ScreenerRequest(BaseModel):
    user_id: str
    gmail_query: str = "newer_than:7d"


class ReversePlanRequest(BaseModel):
    user_id: str
    title: str
    deadline_iso: str
    estimated_minutes: int = 120


class ReversePlanResponse(BaseModel):
    title: str
    micro_tasks: list[MicroTask]
    tool_calls: list[ToolCall] = []

