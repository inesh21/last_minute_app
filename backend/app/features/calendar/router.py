from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_google_token
from app.database.session import get_db
from app.models.calendar import CalendarEvent
from app.models.user import User
from app.services import google_api

router = APIRouter()


class EventCreate(BaseModel):
    title: str
    description: str = ""
    start: str
    end: str
    timezone: str = "UTC"


class EventUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    start: str | None = None
    end: str | None = None
    timezone: str = "UTC"


@router.get("/events")
async def list_events(
    days: int = 7,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    now = datetime.now(timezone.utc)
    time_min = now.isoformat()
    time_max = (now + timedelta(days=days)).isoformat()

    events = await google_api.calendar_list_events(
        google_token, time_min=time_min, time_max=time_max,
    )
    return {"events": events, "count": len(events)}


@router.post("/events")
async def create_event(
    payload: EventCreate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    event_body = {
        "summary": payload.title,
        "description": payload.description,
        "start": {"dateTime": payload.start, "timeZone": payload.timezone},
        "end": {"dateTime": payload.end, "timeZone": payload.timezone},
    }
    event = await google_api.calendar_create_event(google_token, event_body)

    local = CalendarEvent(
        user_id=user.id,
        google_event_id=event.get("id"),
        title=payload.title,
        description=payload.description,
        start_at=datetime.fromisoformat(payload.start.replace("Z", "+00:00")),
        end_at=datetime.fromisoformat(payload.end.replace("Z", "+00:00")),
    )
    db.add(local)
    await db.commit()

    return {"event": event}


@router.patch("/events/{event_id}")
async def update_event(
    event_id: str,
    payload: EventUpdate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    updates: dict = {}
    if payload.title is not None:
        updates["summary"] = payload.title
    if payload.description is not None:
        updates["description"] = payload.description
    if payload.start is not None:
        updates["start"] = {"dateTime": payload.start, "timeZone": payload.timezone}
    if payload.end is not None:
        updates["end"] = {"dateTime": payload.end, "timeZone": payload.timezone}

    event = await google_api.calendar_update_event(google_token, event_id, updates)

    result = await db.execute(
        select(CalendarEvent).where(
            CalendarEvent.user_id == user.id,
            CalendarEvent.google_event_id == event_id,
        )
    )
    local = result.scalar_one_or_none()
    if local:
        if payload.title is not None:
            local.title = payload.title
        if payload.description is not None:
            local.description = payload.description
        if payload.start is not None:
            local.start_at = datetime.fromisoformat(payload.start.replace("Z", "+00:00"))
        if payload.end is not None:
            local.end_at = datetime.fromisoformat(payload.end.replace("Z", "+00:00"))
        await db.commit()

    return {"event": event}


@router.delete("/events/{event_id}")
async def delete_event(
    event_id: str,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    await google_api.calendar_delete_event(google_token, event_id)

    result = await db.execute(
        select(CalendarEvent).where(
            CalendarEvent.user_id == user.id,
            CalendarEvent.google_event_id == event_id,
        )
    )
    local = result.scalar_one_or_none()
    if local:
        await db.delete(local)
        await db.commit()

    return {"status": "deleted", "event_id": event_id}


@router.post("/sync")
async def sync_events(
    days: int = 14,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    time_min = now.isoformat()
    time_max = (now + timedelta(days=days)).isoformat()

    google_events = await google_api.calendar_list_events(
        google_token, time_min=time_min, time_max=time_max, max_results=200,
    )

    synced = 0
    for ge in google_events:
        gid = ge.get("id")
        if not gid:
            continue

        result = await db.execute(
            select(CalendarEvent).where(
                CalendarEvent.user_id == user.id,
                CalendarEvent.google_event_id == gid,
            )
        )
        existing = result.scalar_one_or_none()

        start_raw = ge.get("start", {}).get("dateTime") or ge.get("start", {}).get("date")
        end_raw = ge.get("end", {}).get("dateTime") or ge.get("end", {}).get("date")

        try:
            start_dt = datetime.fromisoformat(start_raw.replace("Z", "+00:00")) if start_raw else now
            end_dt = datetime.fromisoformat(end_raw.replace("Z", "+00:00")) if end_raw else start_dt + timedelta(hours=1)
        except (ValueError, AttributeError):
            start_dt = now
            end_dt = now + timedelta(hours=1)

        if existing:
            existing.title = ge.get("summary", "Untitled")
            existing.description = ge.get("description", "")
            existing.start_at = start_dt
            existing.end_at = end_dt
        else:
            db.add(CalendarEvent(
                user_id=user.id,
                google_event_id=gid,
                title=ge.get("summary", "Untitled"),
                description=ge.get("description", ""),
                start_at=start_dt,
                end_at=end_dt,
            ))
        synced += 1

    await db.commit()
    return {"synced": synced, "events": google_events}
