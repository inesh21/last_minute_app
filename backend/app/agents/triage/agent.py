class TriageAgent:
    async def recommend(self, user_id: str) -> list[str]:
        return [
            "Work on the highest risk deadline first.",
            "Break large tasks into 15-minute blocks.",
            "Protect at least one uninterrupted focus session today.",
        ]

