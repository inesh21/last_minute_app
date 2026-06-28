from typing import Protocol


class Tool(Protocol):
    name: str

    async def run(self, **kwargs) -> dict:
        ...

