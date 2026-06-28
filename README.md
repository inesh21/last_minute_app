# Last Minute Lifesaver

A feature-oriented prototype for an AI-powered productivity companion.

This repo is organized as a monorepo-style project with separate frontend and backend apps, shared utilities, documentation, scripts, and agent assets.

## Repository Structure

- `frontend/` — Vite + React application for the user experience
- `backend/` — FastAPI backend, database, AI orchestration, and service integrations
- `shared/` — Shared contracts, types, or utilities for cross-cutting logic
- `docs/` — Project documentation and architecture notes
- `scripts/` — Automation scripts for local setup, linting, or deployment
- `.agents/` — Agent-specific instructions, prompts, and workflow assets

## What’s included

- `frontend/src/features/` — Feature-based frontend modules for screens like dashboard, tasks, calendar, AI chat, focus, panic, analytics, auth, and settings
- `frontend/src/services/` — API client and service utilities
- `frontend/src/store/` — Lightweight state management stores
- `backend/app/api/` — FastAPI routes and API wiring
- `backend/app/agents/` — Agent orchestration logic and sub-agents
- `backend/app/services/` — Service adapters for integrations like Gmail, Calendar, Docs, Slides, Drive, Maps, and notifications
- `backend/app/database/` — SQLAlchemy database configuration and session management
- `backend/app/prompts/` — Prompt templates and prompt engineering assets
- `backend/app/scheduler/` — Background job scheduling and cron-style workflows

## Quick Start

### Backend

1. Open a terminal and change into the backend folder:

```powershell
cd backend
```

2. Create and activate a virtual environment:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3. Install dependencies:

```powershell
pip install -e .
```

4. Start the backend:

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

5. Verify the backend is running:

```powershell
curl http://127.0.0.1:8000/health
```

### Frontend

1. Open a second terminal and change into the frontend folder:

```powershell
cd frontend
```

2. Install dependencies:

```powershell
npm install
```

3. Start the Vite dev server:

```powershell
npm run dev -- --host 127.0.0.1 --port 5173
```

4. Open the app in the browser:

```text
http://127.0.0.1:5173/
```

### Notes

- The frontend is configured to proxy `/api` and `/health` requests to the backend during development.
- Backend CORS is enabled for local frontend origins such as `http://localhost:3000` and `http://127.0.0.1:5173`.
- Copy `.env.example` files as needed and provide credentials for real Google / Gemini / OAuth integrations later.

## Development Notes

- Keep frontend screens and logic grouped by feature under `frontend/src/features/`.
- Keep backend service and integration code separate from agent orchestration.
- Use `shared/` for common types or conventions that should be reused between frontend and backend.

## Recommended Workflow

- Backend development: `python -m uvicorn app.main:app --reload`
- Frontend development: `npm run dev`
- Use `npm run build` in `frontend/` to verify production bundling

## Future direction

This repo is structured to grow beyond a hackathon prototype into a more scalable architecture:

- Add backend feature modules for auth, tasks, calendar, AI, and settings
- Move prompt templates into a dedicated `backend/app/prompts/` folder
- Add service wrappers for Google APIs and other external integrations
- Keep agent logic isolated in `backend/app/agents/`
- Use `shared/` for shared contracts and cross-service type safety

---

If you want, I can also add a `CONTRIBUTING.md` and `docs/architecture.md` next. 
