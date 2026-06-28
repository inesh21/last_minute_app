from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.core.config import settings
from app.schemas.common import MessageResponse
from app.services.auth import build_google_auth_url

router = APIRouter()


@router.get("/google/url")
async def google_auth_url() -> dict[str, str]:
    if not settings.google_oauth_configured:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")
    state = str(uuid4())
    return {"url": build_google_auth_url(state), "state": state}


@router.get("/google/callback", response_model=MessageResponse)
async def google_callback(code: str, state: str) -> MessageResponse:
    return MessageResponse(
        message=f"Received Google callback for state {state}. Token exchange is the next step."
    )

