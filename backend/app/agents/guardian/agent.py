from app.services.gemini import generate_structured_response


class GuardianAgent:
    async def panic_plan(self, task_title: str) -> list[str]:
        prompt = (
            f"Generate a concise panic plan (4-6 actionable steps) for a user who is "
            f"running out of time on: \"{task_title}\". "
            f"Return a numbered list. Each item should be one short, concrete action."
        )
        items = await generate_structured_response(prompt)
        if items:
            return items
        # Fallback when Gemini is not configured
        return [
            f"Open required materials for {task_title}.",
            "Start a 25-minute focus timer.",
            "Create the smallest submittable draft.",
            "Defer low-priority tasks until after the deadline.",
        ]

