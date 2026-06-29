# Last Minute Lifesaver

Last Minute Lifesaver is an AI-powered productivity companion designed to help users stay ahead of deadlines with a mix of dashboard intelligence, task planning, and AI-assisted action. The current repository is a working prototype with a React/Vite frontend and a FastAPI backend, and it already includes the core app shell, task/dashboard APIs, and Google OAuth entry points.

## What the project includes

- A React + Vite frontend with screens for dashboard, tasks, calendar, AI command, focus, panic, analytics, and auth.
- A FastAPI backend with SQLAlchemy, Pydantic, API routing, and agent orchestration.
- AI-oriented workflows for screening tasks, triaging priorities, and preparing action suggestions.
- Google OAuth integration entry points for sign-in and callback handling.

## Repository structure

```text
.
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── api/
│   │   ├── database/
│   │   ├── features/
│   │   ├── integrations/
│   │   ├── models/
│   │   ├── prompts/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── tools/
│   ├── pyproject.toml
│   └── README.md
├── docs/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   └── types/
│   ├── package.json
│   └── README.md
├── scripts/
├── shared/
└── README.md
```

## Tech stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- MUI
- Zustand
- React Router

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- Pydantic
- Uvicorn
- SQLite for local development

## Getting started

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API should be available at http://127.0.0.1:8000 and the FastAPI docs at http://127.0.0.1:8000/docs.

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```

Then open http://127.0.0.1:5173/.

## Authentication flow

The app now supports a Google OAuth sign-in flow:

1. The frontend calls the backend Google auth URL endpoint.
2. The backend builds the Google consent URL and redirects the user there.
3. Google redirects back to the callback endpoint.
4. The callback route stores the returned auth data in browser storage and redirects the user back to the main home/dashboard experience.

For local development, the frontend expects the backend to run on http://127.0.0.1:8000 and the Vite app to run on http://127.0.0.1:5173.

## Environment notes

- The backend environment file contains local defaults and the Google OAuth/Gemini placeholders.
- The frontend environment file points the app at the local backend proxy target.
- Fill in the required credentials before enabling real integrations.

## Development notes

- Keep feature-specific UI code under the frontend feature folders.
- Keep API routes and backend wiring in the backend app modules.
- Keep agent logic isolated in the backend agent package so it can evolve independently from the UI.
- When testing auth locally, verify that the callback lands back in the app and that the browser stores the access token for subsequent API requests.

## Hackathon status

This repository is now at a strong prototype stage with a working local app shell, backend API, and Google sign-in flow. The main remaining work is polishing the demo experience, strengthening the agent behavior, and connecting more real-world integrations.

### Recent updates

- The frontend now restores the main dashboard experience when a saved auth session is detected.
- The auth callback flow now persists the returned token and redirects users back into the app without dropping them on the login screen.
