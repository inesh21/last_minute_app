from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.risk import calculate_task_risk

router = APIRouter()


@router.post("", response_model=TaskRead)
async def create_task(payload: TaskCreate, user_id: str, db: AsyncSession = Depends(get_db)) -> Task:
    task = Task(user_id=user_id, **payload.model_dump())
    task.risk_score, task.completion_probability = calculate_task_risk(task)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("", response_model=list[TaskRead])
async def list_tasks(user_id: str, db: AsyncSession = Depends(get_db)) -> list[Task]:
    result = await db.execute(select(Task).where(Task.user_id == user_id).order_by(Task.deadline_at))
    return list(result.scalars().all())


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()
    task.risk_score, task.completion_probability = calculate_task_risk(task)

    await db.commit()
    await db.refresh(task)
    return task

