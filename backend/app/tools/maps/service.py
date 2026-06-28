class MapsTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        return {
            "ok": True,
            "origin": kwargs.get("origin", ""),
            "destination": kwargs.get("destination", ""),
            "traffic_minutes": None,
            "message": "Maps integration is not connected yet.",
        }

