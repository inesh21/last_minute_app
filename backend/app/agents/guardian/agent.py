class GuardianAgent:
    async def panic_plan(self, task_title: str) -> list[str]:
        return [
            f"Open required materials for {task_title}.",
            "Start a 25-minute focus timer.",
            "Create the smallest submittable draft.",
            "Defer low-priority tasks until after the deadline.",
        ]

