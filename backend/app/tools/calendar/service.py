from datetime import datetime, timedelta, timezone

from app.services import google_api


class CalendarTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        access_token = kwargs.get("access_token")
        if not access_token:
            return {"ok": False, "error": "No access token provided. User must authenticate with Google."}

        try:
            if self.name == "read_calendar":
                window = kwargs.get("window", "today")
                now = datetime.now(timezone.utc)
                if window == "today":
                    time_min = now.replace(hour=0, minute=0, second=0).isoformat()
                    time_max = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0).isoformat()
                elif window == "next_7_days":
                    time_min = now.isoformat()
                    time_max = (now + timedelta(days=7)).isoformat()
                elif window == "next_14_days":
                    time_min = now.isoformat()
                    time_max = (now + timedelta(days=14)).isoformat()
                else:
                    time_min = now.isoformat()
                    time_max = (now + timedelta(days=7)).isoformat()

                events = await google_api.calendar_list_events(
                    access_token, time_min=time_min, time_max=time_max,
                )
                return {"ok": True, "events": events, "window": window, "count": len(events)}

            if self.name == "create_calendar_event":
                event_body = {
                    "summary": kwargs.get("title", "Untitled Event"),
                    "description": kwargs.get("description", ""),
                    "start": {"dateTime": kwargs["start"], "timeZone": kwargs.get("timezone", "UTC")},
                    "end": {"dateTime": kwargs["end"], "timeZone": kwargs.get("timezone", "UTC")},
                }
                event = await google_api.calendar_create_event(access_token, event_body)
                return {"ok": True, "event_id": event["id"], "title": kwargs.get("title", "Event"), "url": event.get("htmlLink", "")}

            if self.name == "update_calendar":
                event_id = kwargs.get("event_id")
                if not event_id:
                    return {"ok": False, "error": "event_id is required"}
                updates = {}
                if "title" in kwargs:
                    updates["summary"] = kwargs["title"]
                if "description" in kwargs:
                    updates["description"] = kwargs["description"]
                if "start" in kwargs:
                    updates["start"] = {"dateTime": kwargs["start"], "timeZone": kwargs.get("timezone", "UTC")}
                if "end" in kwargs:
                    updates["end"] = {"dateTime": kwargs["end"], "timeZone": kwargs.get("timezone", "UTC")}
                event = await google_api.calendar_update_event(access_token, event_id, updates)
                return {"ok": True, "event_id": event["id"]}

            return {"ok": False, "error": f"Unsupported Calendar tool: {self.name}"}
        except Exception as e:
            return {"ok": False, "error": str(e)}
