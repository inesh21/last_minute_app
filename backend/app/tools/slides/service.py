class SlidesTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        return {
            "ok": True,
            "presentation_id": "local-slides",
            "title": kwargs.get("title", "Untitled"),
        }

