import httpx

from app.core.config import settings


async def refresh_access_token(refresh_token: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )
        resp.raise_for_status()
        return resp.json()


def _headers(access_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {access_token}"}


# ── Calendar ───────────────────────────────────────────────────────────────

async def calendar_list_events(
    access_token: str,
    time_min: str | None = None,
    time_max: str | None = None,
    max_results: int = 50,
) -> list[dict]:
    params: dict = {
        "maxResults": max_results,
        "singleEvents": "true",
        "orderBy": "startTime",
    }
    if time_min:
        params["timeMin"] = time_min
    if time_max:
        params["timeMax"] = time_max

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers=_headers(access_token),
            params=params,
        )
        resp.raise_for_status()
        return resp.json().get("items", [])


async def calendar_create_event(access_token: str, event_body: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://www.googleapis.com/calendar/v3/calendars/primary/events",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json=event_body,
        )
        resp.raise_for_status()
        return resp.json()


async def calendar_update_event(access_token: str, event_id: str, event_body: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.patch(
            f"https://www.googleapis.com/calendar/v3/calendars/primary/events/{event_id}",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json=event_body,
        )
        resp.raise_for_status()
        return resp.json()


# ── Gmail ──────────────────────────────────────────────────────────────────

async def gmail_list_messages(
    access_token: str,
    query: str = "",
    max_results: int = 20,
) -> list[dict]:
    params: dict = {"maxResults": max_results}
    if query:
        params["q"] = query

    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages",
            headers=_headers(access_token),
            params=params,
        )
        resp.raise_for_status()
        message_stubs = resp.json().get("messages", [])

    messages = []
    async with httpx.AsyncClient() as client:
        for stub in message_stubs[:max_results]:
            resp = await client.get(
                f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{stub['id']}",
                headers=_headers(access_token),
                params={"format": "metadata", "metadataHeaders": ["Subject", "From", "Date"]},
            )
            if resp.status_code == 200:
                data = resp.json()
                headers_list = data.get("payload", {}).get("headers", [])
                header_map = {h["name"]: h["value"] for h in headers_list}
                messages.append({
                    "id": data["id"],
                    "threadId": data.get("threadId"),
                    "snippet": data.get("snippet", ""),
                    "subject": header_map.get("Subject", ""),
                    "from": header_map.get("From", ""),
                    "date": header_map.get("Date", ""),
                    "labelIds": data.get("labelIds", []),
                })
    return messages


async def gmail_get_message(access_token: str, message_id: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://gmail.googleapis.com/gmail/v1/users/me/messages/{message_id}",
            headers=_headers(access_token),
            params={"format": "full"},
        )
        resp.raise_for_status()
        return resp.json()


async def gmail_create_draft(
    access_token: str,
    to: str,
    subject: str,
    body: str,
) -> dict:
    import base64
    from email.mime.text import MIMEText

    msg = MIMEText(body)
    msg["to"] = to
    msg["subject"] = subject
    raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://gmail.googleapis.com/gmail/v1/users/me/drafts",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json={"message": {"raw": raw}},
        )
        resp.raise_for_status()
        return resp.json()


# ── Google Tasks ───────────────────────────────────────────────────────────

async def tasks_list(access_token: str, tasklist: str = "@default") -> list[dict]:
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks",
            headers=_headers(access_token),
            params={"maxResults": 100, "showCompleted": "true"},
        )
        resp.raise_for_status()
        return resp.json().get("items", [])


async def tasks_create(
    access_token: str,
    title: str,
    notes: str = "",
    due: str | None = None,
    tasklist: str = "@default",
) -> dict:
    body: dict = {"title": title}
    if notes:
        body["notes"] = notes
    if due:
        body["due"] = due

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://tasks.googleapis.com/tasks/v1/lists/{tasklist}/tasks",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json=body,
        )
        resp.raise_for_status()
        return resp.json()


# ── Google Docs ────────────────────────────────────────────────────────────

async def docs_create(access_token: str, title: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://docs.googleapis.com/v1/documents",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json={"title": title},
        )
        resp.raise_for_status()
        return resp.json()


# ── Google Slides ──────────────────────────────────────────────────────────

async def slides_create(access_token: str, title: str) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://slides.googleapis.com/v1/presentations",
            headers={**_headers(access_token), "Content-Type": "application/json"},
            json={"title": title},
        )
        resp.raise_for_status()
        return resp.json()
