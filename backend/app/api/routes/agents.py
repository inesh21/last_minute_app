from fastapi import APIRouter

from app.agents.orchestrator import orchestrator
from app.schemas.agent import (
    AgentResponse,
    ChatRequest,
    ReversePlanRequest,
    ReversePlanResponse,
    ScreenerRequest,
    ToolCall,
)
from app.services.planning import create_micro_tasks

router = APIRouter()


@router.post("/chat", response_model=AgentResponse)
async def chat(payload: ChatRequest) -> AgentResponse:
    return await orchestrator.chat(payload)


@router.post("/screener/run", response_model=AgentResponse)
async def run_screener(payload: ScreenerRequest) -> AgentResponse:
    return await orchestrator.screener.run(payload.user_id, payload.gmail_query)


@router.post("/reverse-plan", response_model=ReversePlanResponse)
async def reverse_plan(payload: ReversePlanRequest) -> ReversePlanResponse:
    micro_tasks = create_micro_tasks(payload.title, payload.estimated_minutes)
    return ReversePlanResponse(
        title=payload.title,
        micro_tasks=micro_tasks,
        tool_calls=[
            ToolCall(
                name="update_calendar",
                arguments={
                    "title": payload.title,
                    "deadline_iso": payload.deadline_iso,
                    "micro_task_count": len(micro_tasks),
                },
            )
        ],
    )


@router.post("/panic", response_model=AgentResponse)
async def panic_mode(user_id: str, task_title: str) -> AgentResponse:
    plan = await orchestrator.guardian.panic_plan(task_title)
    return AgentResponse(
        message="Panic Mode plan created.",
        recommendations=plan,
        tool_calls=[
            ToolCall(
                name="draft_gmail",
                arguments={"subject": f"Extension request for {task_title}"},
                status="planned",
            )
        ],
    )


@router.post("/focus", response_model=AgentResponse)
async def focus_mode(user_id: str, task_title: str, minutes: int = 25) -> AgentResponse:
    return AgentResponse(
        message="Focus Mode started.",
        recommendations=[
            f"Work only on {task_title} for {minutes} minutes.",
            "Keep the checklist visible and update progress after the timer.",
        ],
        tool_calls=[
            ToolCall(
                name="start_focus_mode",
                arguments={"user_id": user_id, "task_title": task_title, "minutes": minutes},
                status="completed",
                result={"ok": True, "mode": "local_focus"},
            )
        ],
    )


@router.post("/one-click-starter")
async def one_click_starter(user_id: str, title: str, output: str = "doc") -> dict:
    return await orchestrator.executor.one_click_starter(user_id=user_id, title=title, output=output)
