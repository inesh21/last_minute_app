from datetime import datetime

from pydantic import BaseModel, Field


class TaskBase(BaseModel):
    title: str
    description: str = ""
    priority: int = Field(default=3, ge=1, le=5)
    estimated_minutes: int = Field(default=30, ge=5)
    deadline_at: datetime | None = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    priority: int | None = Field(default=None, ge=1, le=5)
    estimated_minutes: int | None = Field(default=None, ge=5)
    progress: float | None = Field(default=None, ge=0.0, le=1.0)
    deadline_at: datetime | None = None


class TaskRead(TaskBase):
    id: str
    user_id: str
    status: str
    source: str
    progress: float
    risk_score: float
    completion_probability: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class MicroTask(BaseModel):
    title: str
    estimated_minutes: int = 15
    order: int

