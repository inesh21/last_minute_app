from app.services import google_api


class TasksTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        access_token = kwargs.get("access_token")
        if not access_token:
            return {"ok": False, "error": "No access token provided. User must authenticate with Google."}

        try:
            if self.name == "create_google_task":
                title = kwargs.get("title", "")
                notes = kwargs.get("notes", "")
                due = kwargs.get("due")
                task = await google_api.tasks_create(access_token, title=title, notes=notes, due=due)
                return {"ok": True, "task_id": task.get("id", ""), "title": title}

            if self.name == "list_google_tasks":
                tasks = await google_api.tasks_list(access_token)
                return {"ok": True, "tasks": tasks, "count": len(tasks)}

            return {"ok": False, "error": f"Unsupported Tasks tool: {self.name}"}
        except Exception as e:
            return {"ok": False, "error": str(e)}
