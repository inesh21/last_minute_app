import re
import httpx

from app.core.config import settings

TOOL_DECLARATIONS = [
    {
        "name": "read_calendar",
        "description": "Read the user's Google Calendar events for a given time window.",
        "parameters": {
            "type": "object",
            "properties": {
                "window": {
                    "type": "string",
                    "enum": ["today", "next_7_days", "next_14_days"],
                    "description": "Time window to read events for.",
                },
            },
            "required": ["window"],
        },
    },
    {
        "name": "create_calendar_event",
        "description": "Create a new event on the user's Google Calendar.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Event title/summary."},
                "start": {"type": "string", "description": "Start time in ISO 8601 format."},
                "end": {"type": "string", "description": "End time in ISO 8601 format."},
                "description": {"type": "string", "description": "Event description."},
            },
            "required": ["title", "start", "end"],
        },
    },
    {
        "name": "read_gmail",
        "description": "Read the user's recent Gmail messages. Use query to filter (e.g. 'newer_than:7d', 'is:unread', 'from:professor').",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Gmail search query."},
                "max_results": {"type": "integer", "description": "Maximum messages to return."},
            },
            "required": [],
        },
    },
    {
        "name": "draft_gmail",
        "description": "Create a Gmail draft email. Used for extension requests, follow-ups, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "to": {"type": "string", "description": "Recipient email address."},
                "subject": {"type": "string", "description": "Email subject line."},
                "body": {"type": "string", "description": "Full email body text."},
            },
            "required": ["to", "subject", "body"],
        },
    },
    {
        "name": "create_google_task",
        "description": "Create a task in Google Tasks.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Task title."},
                "notes": {"type": "string", "description": "Task notes/description."},
                "due": {"type": "string", "description": "Due date in ISO 8601 format."},
            },
            "required": ["title"],
        },
    },
    {
        "name": "create_google_doc",
        "description": "Create a new Google Docs document. Use for outlines, study plans, drafts, etc.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Document title."},
            },
            "required": ["title"],
        },
    },
    {
        "name": "create_google_slides",
        "description": "Create a new Google Slides presentation.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "Presentation title."},
            },
            "required": ["title"],
        },
    },
]

SYSTEM_INSTRUCTION = """You are the AI Chief of Staff for "Last Minute Lifesaver", an autonomous productivity companion.

Your responsibilities:
- Monitor deadlines and predict risks
- Create plans and break work into micro-tasks
- Execute actions through Google Workspace tools (Calendar, Gmail, Tasks, Docs, Slides)
- Help users finish work before deadlines

ALWAYS use the available tools to take concrete action. Never just describe what you could do — actually do it by calling tools.

When the user mentions:
- Deadlines or schedules → read their calendar, create/update events
- Emails or extension requests → draft emails via Gmail
- Presentations or slides → create Google Slides
- Documents, outlines, study plans → create Google Docs
- Tasks or to-dos → create Google Tasks
- "Help me" or "I can't finish" → read their calendar + gmail to assess the situation, then propose concrete actions

Be concise, actionable, and proactive. Always explain what you did after executing tools."""


def _gemini_error_response(error: httpx.HTTPStatusError) -> dict:
    status_code = error.response.status_code
    if status_code == 429:
        return {
            "text": "Gemini is rate limited right now. Please wait a moment and try again.",
            "tool_calls": [],
        }
    return {
        "text": f"Gemini request failed with status {status_code}. Please try again later.",
        "tool_calls": [],
    }


async def chat_with_gemini(
    message: str,
    history: list[dict] | None = None,
    access_token: str | None = None,
) -> dict:
    if not settings.gemini_configured:
        return {
            "text": "Gemini API key is not configured. Add GEMINI_API_KEY to backend/.env.",
            "tool_calls": [],
        }

    contents = []
    if history:
        for msg in history:
            contents.append({
                "role": msg.get("role", "user"),
                "parts": [{"text": msg.get("text", "")}],
            })
    contents.append({"role": "user", "parts": [{"text": message}]})

    request_body = {
        "contents": contents,
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
        "tools": [{"functionDeclarations": TOOL_DECLARATIONS}],
        "toolConfig": {"functionCallingConfig": {"mode": "AUTO"}},
    }

    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(api_url, json=request_body)
            resp.raise_for_status()
        except httpx.HTTPStatusError as error:
            return _gemini_error_response(error)
        result = resp.json()

    candidates = result.get("candidates", [])
    if not candidates:
        return {"text": "No response from Gemini.", "tool_calls": []}

    parts = candidates[0].get("content", {}).get("parts", [])

    text_parts = []
    tool_calls = []
    for part in parts:
        if "text" in part:
            text_parts.append(part["text"])
        elif "functionCall" in part:
            fc = part["functionCall"]
            tool_calls.append({
                "name": fc["name"],
                "arguments": fc.get("args", {}),
            })

    if tool_calls and access_token:
        from app.tools.registry import tool_registry

        tool_results = []
        for tc in tool_calls:
            result = await tool_registry.run(tc["name"], access_token=access_token, **tc["arguments"])
            tc["status"] = "completed" if result.get("ok") else "failed"
            tc["result"] = result
            tool_results.append({
                "functionResponse": {
                    "name": tc["name"],
                    "response": result,
                }
            })

        contents.append({
            "role": "model",
            "parts": [{"functionCall": {"name": tc["name"], "args": tc["arguments"]}} for tc in tool_calls],
        })
        contents.append({
            "role": "user",
            "parts": tool_results,
        })

        followup_body = {
            "contents": contents,
            "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
            "tools": [{"functionDeclarations": TOOL_DECLARATIONS}],
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            try:
                resp = await client.post(api_url, json=followup_body)
                resp.raise_for_status()
            except httpx.HTTPStatusError as error:
                error_result = _gemini_error_response(error)
                text_parts.append(error_result["text"])
                return {
                    "text": "\n".join(text_parts),
                    "tool_calls": tool_calls,
                }
            followup_result = resp.json()

        followup_candidates = followup_result.get("candidates", [])
        if followup_candidates:
            followup_parts = followup_candidates[0].get("content", {}).get("parts", [])
            for part in followup_parts:
                if "text" in part:
                    text_parts.append(part["text"])

    return {
        "text": "\n".join(text_parts) if text_parts else "Actions executed.",
        "tool_calls": tool_calls,
    }


async def generate_structured_response(prompt: str) -> list[str]:
    """Call Gemini without tools and parse the response into a list of strings."""
    if not settings.gemini_configured:
        return []

    request_body = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "systemInstruction": {"parts": [{"text": SYSTEM_INSTRUCTION}]},
    }

    api_url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/"
        f"{settings.gemini_model}:generateContent?key={settings.gemini_api_key}"
    )

    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            resp = await client.post(api_url, json=request_body)
            resp.raise_for_status()
        except httpx.HTTPStatusError:
            return []
        result = resp.json()

    candidates = result.get("candidates", [])
    if not candidates:
        return []

    parts = candidates[0].get("content", {}).get("parts", [])
    text = "\n".join(p["text"] for p in parts if "text" in p)

    # Parse numbered or bulleted lines into a clean list
    lines = re.findall(r"^\s*(?:\d+[\.\)]\s*|[-*]\s+)(.+)", text, re.MULTILINE)
    return lines if lines else [line.strip() for line in text.splitlines() if line.strip()]
