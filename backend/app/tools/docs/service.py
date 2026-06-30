from app.services import google_api


class DocsTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        access_token = kwargs.get("access_token")
        if not access_token:
            return {"ok": False, "error": "No access token provided. User must authenticate with Google."}

        try:
            title = kwargs.get("title", "Untitled")
            doc = await google_api.docs_create(access_token, title=title)
            return {
                "ok": True,
                "document_id": doc.get("documentId", ""),
                "title": doc.get("title", title),
                "url": f"https://docs.google.com/document/d/{doc.get('documentId', '')}/edit",
            }
        except Exception as e:
            return {"ok": False, "error": str(e)}
