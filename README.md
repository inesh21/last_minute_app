# Last Minute Lifesaver

Last Minute Lifesaver is an AI-powered productivity companion for students and deadline-heavy teams. It combines a dashboard, task planning, Google OAuth, and AI-assisted actions so a user can see what is at risk and get help turning deadlines into concrete next steps.

The repository is currently a working prototype with a React/Vite frontend and a FastAPI backend. It includes the main app shell, authenticated API calls, local task/dashboard persistence, Google Workspace integration scaffolding, and Gemini-powered tool-calling hooks.

## What is included

- React + Vite frontend with React Router navigation across dashboard, tasks, calendar, AI command, focus, panic, workspace, analytics, and auth pages.
- Each screen lives in its own page component under `frontend/src/pages/`.
- Shared layout (sidebar, topbar, auth guard) in `frontend/src/layouts/AuthenticatedLayout.tsx`.
- URL-based routing: `/`, `/tasks`, `/calendar`, `/ai-command`, `/deadlines`, `/panic`, `/focus`, `/workspace`, `/analytics`, `/login`.
- FastAPI backend with SQLAlchemy models, Pydantic schemas, API routing, JWT auth, and local SQLite persistence.
- Google OAuth sign-in flow that creates or updates users, stores Google tokens server-side, and returns a JWT to the frontend.
- Gemini service with function declarations for Calendar, Gmail, Google Tasks, Docs, and Slides actions.
- Tool registry and service wrappers for Google Workspace actions.
- Vite proxy setup for local frontend-to-backend API requests.

## Repository structure

```text
.
|-- backend/
|   |-- app/
|   |   |-- agents/
|   |   |-- api/
|   |   |-- core/
|   |   |-- database/
|   |   |-- features/
|   |   |-- integrations/
|   |   |-- models/
|   |   |-- schemas/
|   |   |-- services/
|   |   `-- tools/
|   |-- pyproject.toml
|   `-- requirements.txt
|-- docs/
|-- frontend/
|   |-- src/
|   |   |-- app/
|   |   |   |-- routes/          # Thin route wrappers connecting outlet context to pages
|   |   |   `-- router.tsx       # React Router BrowserRouter, route definitions
|   |   |-- components/
|   |   |   `-- shared.tsx       # Shared UI primitives (Card, Badge, ProgressBar, Btn)
|   |   |-- features/
|   |   |-- hooks/
|   |   |   `-- useAppContext.ts # Typed hook for React Router outlet context
|   |   |-- layouts/
|   |   |   `-- AuthenticatedLayout.tsx  # Sidebar, topbar, auth guard, data loading
|   |   |-- lib/
|   |   |   `-- helpers.ts       # Types, constants, formatting utils shared across pages
|   |   |-- pages/               # One file per screen (self-contained page components)
|   |   |-- services/
|   |   |-- store/
|   |   |-- styles/
|   |   `-- types/
|   |-- package.json
|   `-- vite.config.ts
|-- scripts/
|-- shared/
|-- AI_HANDOFF.md
`-- README.md
```

## Tech stack

Frontend:
- React 18
- Vite
- TypeScript
- Tailwind CSS
- MUI
- Zustand
- React Router

Backend:
- Python 3.11+
- FastAPI
- SQLAlchemy async
- Pydantic
- Uvicorn
- SQLite for local development
- PyJWT
- httpx

## Getting started

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API runs at http://127.0.0.1:8000 and the FastAPI docs are available at http://127.0.0.1:8000/docs.

### Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Open http://127.0.0.1:5173/.

## Environment

Create `backend/.env` for local secrets and integration settings:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
FRONTEND_URL=http://127.0.0.1:5173
GEMINI_API_KEY=
JWT_SECRET=change-me-in-production
```

The frontend reads `frontend/.env` or `frontend/.env.local` values. `frontend/.env.example` points the Vite proxy at the local backend:

```env
VITE_API_BASE_URL=
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
```

Leaving `VITE_API_BASE_URL` empty lets the browser call `/api/...` and `/health` through the Vite proxy.

## Authentication flow

1. The frontend requests `/api/auth/google/url`.
2. The backend returns a Google OAuth consent URL.
3. Google redirects to `/api/auth/google/callback`.
4. The backend exchanges the code, stores or updates the user, saves Google access/refresh tokens, creates a JWT, and redirects to the frontend callback page.
5. The frontend stores `jwt_token` and uses it for authenticated API calls.

Protected backend routes expect `Authorization: Bearer <jwt>`. If the frontend receives a `401`, it clears the saved session and returns to the auth screen.

## AI and tools

The `/api/ai/*` routes require a signed-in user. The chat path calls the orchestrator, which can use Gemini when `GEMINI_API_KEY` is configured. Gemini receives tool declarations for:

- reading and creating calendar events
- reading Gmail and drafting emails
- creating Google Tasks
- creating Google Docs
- creating Google Slides

When Gemini returns function calls and the user has a valid Google token, the backend executes those actions through `backend/app/tools/registry.py`.

## Current status

This is a strong prototype rather than a finished production product. The core app shell, auth callback, API contracts, local task/dashboard behavior, and AI tool scaffolding are in place. The next milestone is a polished demo journey: sign in, load meaningful tasks/dashboard data, run one useful AI action, and show one real Google Workspace action completing successfully.
