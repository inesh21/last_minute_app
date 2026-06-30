from app.services.gemini import generate_structured_response


class TriageAgent:
    async def recommend(self, user_id: str) -> list[str]:
        prompt = (
            "Generate 3-5 concise, actionable productivity recommendations for a user "
            "who needs to triage their workload right now. "
            "Return a numbered list. Each item should be one short, concrete tip."
        )
        items = await generate_structured_response(prompt)
        if items:
            return items
        # Fallback when Gemini is not configured
        return [
            "Work on the highest risk deadline first.",
            "Break large tasks into 15-minute blocks.",
            "Protect at least one uninterrupted focus session today.",
        ]

