from app.services import google_api


class SlidesTool:
    def __init__(self, name: str) -> None:
        self.name = name

    async def run(self, **kwargs) -> dict:
        access_token = kwargs.get("access_token")
        if not access_token:
            return {"ok": False, "error": "No access token provided. User must authenticate with Google."}

        try:
            title = kwargs.get("title", "Untitled")
            pres = await google_api.slides_create(access_token, title=title)
            return {
                "ok": True,
                "presentation_id": pres.get("presentationId", ""),
                "title": pres.get("title", title),
                "url": f"https://docs.google.com/presentation/d/{pres.get('presentationId', '')}/edit",
            }
        except Exception as e:
            return {"ok": False, "error": str(e)}
