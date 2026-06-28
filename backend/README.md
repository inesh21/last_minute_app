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

## Environment

Copy `.env.example` to `.env` and fill in real credentials when integrations are ready.

The backend boots with local defaults so the frontend can call MVP endpoints before Google/Gemini credentials are connected.

