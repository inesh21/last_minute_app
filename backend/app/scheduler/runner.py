import asyncio
from collections.abc import Awaitable, Callable


class SchedulerRunner:
    def __init__(self) -> None:
        self._tasks: list[asyncio.Task] = []
        self._running = False

    def start(self) -> None:
        self._running = True

    def stop(self) -> None:
        self._running = False
        for task in self._tasks:
            task.cancel()

    def every(self, seconds: int, job: Callable[[], Awaitable[None]]) -> None:
        async def loop() -> None:
            while self._running:
                await job()
                await asyncio.sleep(seconds)

        if self._running:
            self._tasks.append(asyncio.create_task(loop()))


scheduler = SchedulerRunner()

