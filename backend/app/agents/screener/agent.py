from app.schemas.agent import AgentResponse, ToolCall
from app.tools.registry import tool_registry


class ScreenerAgent:
    async def run(
        self, user_id: str, gmail_query: str = "newer_than:7d", access_token: str | None = None,
    ) -> AgentResponse:
        gmail_result = await tool_registry.run(
            "read_gmail", query=gmail_query, user_id=user_id, access_token=access_token,
        )
        calendar_result = await tool_registry.run(
            "read_calendar", window="next_14_days", user_id=user_id, access_token=access_token,
        )
        return AgentResponse(
            message="Screener completed scan of your Gmail and Calendar.",
            tool_calls=[
                ToolCall(
                    name="read_gmail",
                    arguments={"query": gmail_query},
                    status="completed",
                    result=gmail_result,
                ),
                ToolCall(
                    name="read_calendar",
                    arguments={"window": "next_14_days"},
                    status="completed",
                    result=calendar_result,
                ),
            ],
            recommendations=[
                f"Found {gmail_result.get('count', 0)} emails matching '{gmail_query}'.",
                f"Found {calendar_result.get('count', 0)} upcoming calendar events.",
            ],
        )
