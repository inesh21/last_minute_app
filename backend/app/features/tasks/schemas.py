from pydantic import BaseModel

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: int | None = 3
    estimated_minutes: int | None = 30

class TaskResponse(BaseModel):
    id: str
    title: str
    description: str | None
    priority: int
    estimated_minutes: int
    status: str
    created_at: str
