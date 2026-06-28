from app.agents.executor.agent import ExecutorAgent
from app.agents.guardian.agent import GuardianAgent
from app.agents.screener.agent import ScreenerAgent
from app.agents.triage.agent import TriageAgent
from app.schemas.agent import AgentResponse, ChatRequest, ToolCall
from app.tools.registry import tool_registry


class AgentOrchestrator:
    def __init__(self) -> None:
        self.screener = ScreenerAgent()
        self.triage = TriageAgent()
        self.executor = ExecutorAgent()
        self.guardian = GuardianAgent()

    async def chat(self, request: ChatRequest) -> AgentResponse:
        message = request.message.lower()
        planned_calls: list[ToolCall] = []

        if "slide" in message:
            planned_calls.append(ToolCall(name="create_google_slides", arguments={"title": request.message}))
        elif "draft" in message or "email" in message or "extension" in message:
            planned_calls.append(
                ToolCall(
                    name="draft_gmail",
                    arguments={
                        "subject": "Deadline extension request",
                        "body": "Draft a concise, respectful extension request.",
                    },
                )
            )
        elif "study" in message or "assignment" in message or "finish" in message:
            planned_calls.append(ToolCall(name="create_google_doc", arguments={"title": request.message}))

        executed = []
        for call in planned_calls:
            result = await tool_registry.run(call.name, **call.arguments)
            executed.append(call.model_copy(update={"status": "completed", "result": result}))

        recommendations = await self.triage.recommend(user_id=request.user_id)
        return AgentResponse(
            message="I mapped the request into concrete actions.",
            tool_calls=executed,
            recommendations=recommendations,
        )


orchestrator = AgentOrchestrator()

