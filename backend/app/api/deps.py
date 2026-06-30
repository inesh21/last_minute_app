from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_db
from app.models.user import User
from app.services.google_api import refresh_access_token
from app.services.jwt import decode_access_token


async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = auth_header[7:]
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found.")

    return user


async def get_google_token(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> str:
    if not user.access_token:
        raise HTTPException(status_code=403, detail="Google account not connected.")

    try:
        import httpx
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://www.googleapis.com/oauth2/v1/tokeninfo",
                params={"access_token": user.access_token},
            )
            if resp.status_code == 200:
                return user.access_token
    except Exception:
        pass

    if not user.refresh_token:
        raise HTTPException(status_code=403, detail="Google token expired and no refresh token available. Please re-authenticate.")

    token_data = await refresh_access_token(user.refresh_token)
    user.access_token = token_data["access_token"]
    await db.commit()
    return user.access_token
