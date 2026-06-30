import logging
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_google_token
from app.database.session import get_db
from app.models.task import Task
from app.models.user import User
from app.schemas.task import TaskCreate, TaskRead, TaskUpdate
from app.services import google_api
from app.services.risk import calculate_task_risk

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=TaskRead)
async def create_task(
    payload: TaskCreate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = Task(user_id=user.id, **payload.model_dump())
    task.risk_score, task.completion_probability = calculate_task_risk(task)

    try:
        due_iso = task.deadline_at.strftime("%Y-%m-%dT%H:%M:%S.000Z") if task.deadline_at else None
        g_task = await google_api.tasks_create(
            google_token,
            title=task.title,
            notes=task.description or "",
            due=due_iso,
        )
        task.google_task_id = g_task.get("id")
    except Exception as e:
        logger.warning("Google Tasks create failed (task saved locally): %s", e)

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
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
) -> Task:
    task = await db.get(Task, task_id)
    if not task or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Task not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(task, key, value)
    task.updated_at = datetime.utcnow()
    task.risk_score, task.completion_probability = calculate_task_risk(task)

    if task.google_task_id:
        try:
            g_status = None
            if payload.status == "done":
                g_status = "completed"
            elif payload.status is not None and payload.status != "done":
                g_status = "needsAction"

            due_iso = task.deadline_at.strftime("%Y-%m-%dT%H:%M:%S.000Z") if task.deadline_at else None
            await google_api.tasks_update(
                google_token,
                task_id=task.google_task_id,
                title=payload.title,
                notes=payload.description,
                due=due_iso if payload.deadline_at is not None else None,
                status=g_status,
            )
        except Exception as e:
            logger.warning("Google Tasks update failed: %s", e)

    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    task = await db.get(Task, task_id)
    if not task or task.user_id != user.id:
        raise HTTPException(status_code=404, detail="Task not found.")

    if task.google_task_id:
        try:
            await google_api.tasks_delete(google_token, task_id=task.google_task_id)
        except Exception as e:
            logger.warning("Google Tasks delete failed: %s", e)

    await db.delete(task)
    await db.commit()
    return {"status": "deleted", "id": task_id}


@router.post("/sync")
async def sync_tasks(
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    google_tasks = await google_api.tasks_list(google_token)

    result = await db.execute(select(Task).where(Task.user_id == user.id))
    local_tasks = {t.google_task_id: t for t in result.scalars().all() if t.google_task_id}

    synced = 0
    for gt in google_tasks:
        gid = gt.get("id")
        if not gid:
            continue

        title = gt.get("title", "").strip()
        if not title:
            continue

        g_status = gt.get("status", "needsAction")
        local_status = "done" if g_status == "completed" else "todo"

        if gid in local_tasks:
            local = local_tasks[gid]
            local.title = title
            local.description = gt.get("notes", "")
            local.status = local_status
            if local_status == "done":
                local.progress = 1.0
        else:
            deadline = None
            if gt.get("due"):
                try:
                    deadline = datetime.fromisoformat(gt["due"].replace("Z", "+00:00"))
                except (ValueError, AttributeError):
                    pass

            new_task = Task(
                user_id=user.id,
                title=title,
                description=gt.get("notes", ""),
                status=local_status,
                source="google_tasks",
                google_task_id=gid,
                deadline_at=deadline,
                progress=1.0 if local_status == "done" else 0.0,
            )
            new_task.risk_score, new_task.completion_probability = calculate_task_risk(new_task)
            db.add(new_task)
        synced += 1

    await db.commit()

    result = await db.execute(select(Task).where(Task.user_id == user.id).order_by(Task.deadline_at))
    all_tasks = list(result.scalars().all())

    return {"synced": synced, "total": len(all_tasks)}
