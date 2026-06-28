from fastapi import APIRouter

from app.schemas.common import MessageResponse

router = APIRouter()


@router.post("/gmail", response_model=MessageResponse)
async def gmail_webhook() -> MessageResponse:
    return MessageResponse(message="Gmail webhook received. Screener job should be queued here.")


@router.post("/calendar", response_model=MessageResponse)
async def calendar_webhook() -> MessageResponse:
    return MessageResponse(message="Calendar webhook received. Triage job should be queued here.")

