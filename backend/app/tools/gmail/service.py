from app.services import google_api


class GmailTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        access_token = kwargs.get("access_token")
        if not access_token:
            return {"ok": False, "error": "No access token provided. User must authenticate with Google."}

        try:
            if self.name == "read_gmail":
                query = kwargs.get("query", "")
                max_results = kwargs.get("max_results", 15)
                messages = await google_api.gmail_list_messages(access_token, query=query, max_results=max_results)
                return {"ok": True, "messages": messages, "count": len(messages), "query": query}

            if self.name == "draft_gmail":
                to = kwargs.get("to", "")
                subject = kwargs.get("subject", "")
                body = kwargs.get("body", "")
                draft = await google_api.gmail_create_draft(access_token, to=to, subject=subject, body=body)
                draft_id = draft.get("id", "")
                return {
                    "ok": True,
                    "draft_id": draft_id,
                    "message_id": draft.get("message", {}).get("id", ""),
                    "to": to,
                    "subject": subject,
                    "title": f"Draft: {subject}",
                    "url": f"https://mail.google.com/mail/u/0/#drafts/{draft_id}",
                }

            return {"ok": False, "error": f"Unsupported Gmail tool: {self.name}"}
        except Exception as e:
            return {"ok": False, "error": str(e)}
