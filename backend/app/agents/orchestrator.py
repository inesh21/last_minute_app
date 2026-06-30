from app.agents.executor.agent import ExecutorAgent
from app.agents.guardian.agent import GuardianAgent
from app.agents.screener.agent import ScreenerAgent
from app.agents.triage.agent import TriageAgent
from app.schemas.agent import AgentResponse, ChatRequest, ToolCall
from app.services.gemini import chat_with_gemini
from app.tools.registry import tool_registry


class AgentOrchestrator:
    def __init__(self) -> None:
        self.screener = ScreenerAgent()
        self.triage = TriageAgent()
        self.executor = ExecutorAgent()
        self.guardian = GuardianAgent()

    async def chat(self, request: ChatRequest, access_token: str | None = None) -> AgentResponse:
        result = await chat_with_gemini(
            message=request.message,
            access_token=access_token,
        )

        executed = []
        for tc in result.get("tool_calls", []):
            executed.append(ToolCall(
                name=tc["name"],
                arguments=tc.get("arguments", {}),
                status=tc.get("status", "completed"),
                result=tc.get("result"),
            ))

        recommendations = await self.triage.recommend(user_id=request.user_id)
        return AgentResponse(
            message=result.get("text", ""),
            tool_calls=executed,
            recommendations=recommendations,
        )


orchestrator = AgentOrchestrator()
