from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services.risk import as_naive_utc, calculate_task_risk

router = APIRouter()


@router.post("", response_model=TaskRead)
async def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task_data = payload.model_dump()
    task_data["deadline_at"] = as_naive_utc(task_data.get("deadline_at"))
    task = Task(user_id=user.id, **task_data)
    task.risk_score, task.completion_probability = calculate_task_risk(task)
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("", response_model=list[TaskRead])
async def list_tasks(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Task]:
    result = await db.execute(select(Task).where(Task.user_id == user.id).order_by(Task.deadline_at))
    return list(result.scalars().all())


@router.patch("/{task_id}", response_model=TaskRead)
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = await db.get(Task, task_id)
    if not task or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Task not found.")

    updates = payload.model_dump(exclude_unset=True)
    if "deadline_at" in updates:
        updates["deadline_at"] = as_naive_utc(updates["deadline_at"])

    for key, value in updates.items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()
    task.risk_score, task.completion_probability = calculate_task_risk(task)

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    task = await db.get(Task, task_id)
    if not task or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Task not found.")
    await db.delete(task)
    await db.commit()
    return {"status": "deleted", "id": task_id}
