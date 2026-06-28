class DocsTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        return {"ok": True, "document_id": "local-doc", "title": kwargs.get("title", "Untitled")}

