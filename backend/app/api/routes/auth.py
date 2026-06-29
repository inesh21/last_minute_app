from uuid import uuid4

from fastapi import APIRouter, HTTPException
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.schemas.common import MessageResponse
from app.services.auth import build_google_auth_url, exchange_code_for_tokens, get_google_user_info

router = APIRouter()


@router.get("/google/url")
async def google_auth_url() -> dict[str, str]:
    if not settings.google_oauth_configured:
        raise HTTPException(
            status_code=503,
            detail="Google OAuth is not configured. Add your Google client ID and client secret to backend/.env.",
        )
    state = str(uuid4())
    return {"url": build_google_auth_url(state), "state": state}


@router.get("/google/callback")
async def google_callback(code: str, state: str):
    if not settings.google_oauth_configured:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    try:
        # Step 1: exchange code for tokens
        token_data = await exchange_code_for_tokens(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")  # only present first time

        # Step 2: get user info
        user_info = await get_google_user_info(access_token)
        email = user_info["email"]
        name = user_info.get("name", "")
        google_id = user_info["id"]

        # Step 3: redirect to frontend with tokens
        # In production you'd store these in DB and issue your own JWT
        # For hackathon demo, pass access token directly to frontend
        redirect_url = (
            f"{settings.frontend_url}/auth/callback"
            f"?access_token={access_token}"
            f"&email={email}"
            f"&name={name}"
        )
        return RedirectResponse(url=redirect_url)

    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")