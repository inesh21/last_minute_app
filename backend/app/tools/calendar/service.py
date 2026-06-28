class CalendarTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        if self.name == "read_calendar":
            return {"ok": True, "events": [], "window": kwargs.get("window", "today")}
        if self.name == "update_calendar":
            return {"ok": True, "event_id": kwargs.get("event_id", "local-event")}
        return {"ok": False, "error": f"Unsupported Calendar tool: {self.name}"}

