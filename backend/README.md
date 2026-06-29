# Last Minute Lifesaver Backend

FastAPI backend for the AI-powered productivity companion.

## Quick Start

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

The API should be available at http://127.0.0.1:8000 and the Swagger UI at http://127.0.0.1:8000/docs.

## Environment

Copy `.env.example` to `.env` and fill in real credentials when integrations are ready.

The backend boots with local defaults so the frontend can call MVP endpoints before Google/Gemini credentials are connected. For local OAuth testing, ensure the Google redirect URI points to the backend callback endpoint and that the frontend points at the local Vite server.

## Auth notes

- The Google auth callback endpoint redirects users back to the frontend callback route.
- The frontend callback page stores the returned access token in browser storage so the main app can resume the signed-in experience.
- If the sign-in flow stops redirecting correctly, confirm that the browser is reaching the frontend callback route and that the token is present in local storage.

