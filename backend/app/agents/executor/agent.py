from app.tools.registry import tool_registry


class ExecutorAgent:
    async def one_click_starter(self, user_id: str, title: str, output: str = "doc") -> dict:
        tool_name = "create_google_slides" if output == "slides" else "create_google_doc"
        return await tool_registry.run(tool_name, user_id=user_id, title=title)

    async def ghostwrite_extension(self, user_id: str, recipient: str, task_title: str) -> dict:
        return await tool_registry.run(
            "draft_gmail",
            user_id=user_id,
            to=recipient,
            subject=f"Extension request for {task_title}",
            body=f"Draft a respectful extension request for {task_title}.",
        )

