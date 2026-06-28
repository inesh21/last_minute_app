class GmailTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        if self.name == "read_gmail":
            return {"ok": True, "messages": [], "query": kwargs.get("query", "")}
        if self.name == "draft_gmail":
            return {
                "ok": True,
                "draft_id": "local-draft",
                "to": kwargs.get("to", ""),
                "subject": kwargs.get("subject", "Deadline extension request"),
            }
        return {"ok": False, "error": f"Unsupported Gmail tool: {self.name}"}

