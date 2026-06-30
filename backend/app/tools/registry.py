from app.tools.calendar.service import CalendarTool
from app.tools.docs.service import DocsTool
from app.tools.gmail.service import GmailTool
from app.tools.maps.service import MapsTool
from app.tools.slides.service import SlidesTool
from app.tools.tasks.service import TasksTool


class ToolRegistry:
    def __init__(self) -> None:
        self._tools = {
            "read_gmail": GmailTool("read_gmail"),
            "draft_gmail": GmailTool("draft_gmail"),
            "read_calendar": CalendarTool("read_calendar"),
            "create_calendar_event": CalendarTool("create_calendar_event"),
            "update_calendar": CalendarTool("update_calendar"),
            "create_google_task": TasksTool("create_google_task"),
            "list_google_tasks": TasksTool("list_google_tasks"),
            "create_google_doc": DocsTool("create_google_doc"),
            "create_google_slides": SlidesTool("create_google_slides"),
            "get_maps_traffic": MapsTool("get_maps_traffic"),
        }

    def list_names(self) -> list[str]:
        return sorted(self._tools)

    async def run(self, name: str, **kwargs) -> dict:
        tool = self._tools.get(name)
        if not tool:
            return {"ok": False, "error": f"Unknown tool: {name}"}
        return await tool.run(**kwargs)


tool_registry = ToolRegistry()
