from uuid import uuid4

import httpx
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.database.session import get_db
from app.models.user import User
from app.services.auth import build_google_auth_url, exchange_code_for_tokens, get_google_user_info
from app.services.jwt import create_access_token

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
async def google_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    if not settings.google_oauth_configured:
        raise HTTPException(status_code=503, detail="Google OAuth is not configured.")

    try:
        token_data = await exchange_code_for_tokens(code)
        access_token = token_data["access_token"]
        refresh_token = token_data.get("refresh_token")

        user_info = await get_google_user_info(access_token)
        email = user_info["email"]
        name = user_info.get("name", "")
        google_id = user_info["id"]

        result = await db.execute(select(User).where(User.google_sub == google_id))
        user = result.scalar_one_or_none()

        if user:
            user.access_token = access_token
            if refresh_token:
                user.refresh_token = refresh_token
            user.name = name
        else:
            user = User(
                id=str(uuid4()),
                email=email,
                name=name,
                google_sub=google_id,
                access_token=access_token,
                refresh_token=refresh_token,
            )
            db.add(user)

        await db.commit()
        await db.refresh(user)

        jwt_token = create_access_token(user.id, user.email)

        redirect_url = (
            f"{settings.frontend_url}/auth/callback"
            f"?token={jwt_token}"
            f"&email={email}"
            f"&name={name}"
            f"&user_id={user.id}"
        )
        return RedirectResponse(url=redirect_url)

    except httpx.HTTPError as e:
        raise HTTPException(status_code=400, detail=f"Token exchange failed: {str(e)}")
