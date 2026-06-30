from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends

from app.api.deps import get_current_user, get_google_token
from app.models.user import User
from app.services import google_api

router = APIRouter()


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
    title: str,
    start: str,
    end: str,
    description: str = "",
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    event_body = {
        "summary": title,
        "description": description,
        "start": {"dateTime": start, "timeZone": "UTC"},
        "end": {"dateTime": end, "timeZone": "UTC"},
    }
    event = await google_api.calendar_create_event(google_token, event_body)
    return {"event": event}
