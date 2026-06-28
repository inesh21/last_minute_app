class TasksTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        return {"ok": True, "task_id": "local-google-task", "title": kwargs.get("title", "")}

