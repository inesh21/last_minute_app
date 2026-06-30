import logging

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import get_current_user, get_google_token
from app.models.user import User
from app.services import google_api

logger = logging.getLogger(__name__)

router = APIRouter()


class GmailDraftCreate(BaseModel):
    to: str
    subject: str
    body: str


class DocCreate(BaseModel):
    title: str


class SlidesCreate(BaseModel):
    title: str


@router.get("/gmail/messages")
async def list_gmail(
    query: str = "",
    max_results: int = 15,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    messages = await google_api.gmail_list_messages(
        google_token, query=query, max_results=max_results,
    )
    return {"messages": messages, "count": len(messages)}


@router.get("/gmail/messages/{message_id}")
async def get_gmail_message(
    message_id: str,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    message = await google_api.gmail_get_message(google_token, message_id)
    return {"message": message}


@router.post("/gmail/drafts")
async def create_gmail_draft(
    payload: GmailDraftCreate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    draft = await google_api.gmail_create_draft(
        google_token,
        to=payload.to,
        subject=payload.subject,
        body=payload.body,
    )
    draft_id = draft.get("id", "")
    return {
        "draft_id": draft_id,
        "message_id": draft.get("message", {}).get("id", ""),
        "url": f"https://mail.google.com/mail/u/0/#drafts/{draft_id}",
    }


@router.post("/docs/create")
async def create_doc(
    payload: DocCreate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    doc = await google_api.docs_create(google_token, title=payload.title)
    doc_id = doc.get("documentId", "")
    return {
        "document_id": doc_id,
        "title": doc.get("title", payload.title),
        "url": f"https://docs.google.com/document/d/{doc_id}/edit",
    }


@router.post("/slides/create")
async def create_slides(
    payload: SlidesCreate,
    user: User = Depends(get_current_user),
    google_token: str = Depends(get_google_token),
):
    pres = await google_api.slides_create(google_token, title=payload.title)
    pres_id = pres.get("presentationId", "")
    return {
        "presentation_id": pres_id,
        "title": pres.get("title", payload.title),
        "url": f"https://docs.google.com/presentation/d/{pres_id}/edit",
    }
