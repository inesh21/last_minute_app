# Last Minute Lifesaver - AI Handoff

This document is for Enol and any future developer or AI agent continuing the project. It captures the current state of the app, the files that matter most, and the shortest path to a convincing demo.

## 1. Product Summary

Last Minute Lifesaver is an AI productivity companion for people who are close to missing deadlines. The intended product loop is:

user has deadlines -> app detects risk -> app creates a plan -> app helps the user act

The app should feel less like a reminder list and more like an AI chief of staff that can inspect work signals, identify what is urgent, and trigger concrete Google Workspace actions.

## 2. Current State

The repository is a working prototype with:

- a React/Vite frontend app shell
- a FastAPI backend
- local SQLite persistence
- task and dashboard APIs
- Google OAuth sign-in
- JWT-protected backend routes
- server-side Google token storage
- Gemini service scaffolding with tool declarations
- Google Workspace tool wrappers for Calendar, Gmail, Tasks, Docs, and Slides

The strongest current story is: sign in with Google, keep a frontend session via JWT, call protected APIs, and route AI requests through backend agent/tool infrastructure.

## 3. Frontend Notes

The frontend was refactored from a single monolithic `App.tsx` to a React Router architecture. Each screen is now its own page component with URL-based routing.

### Architecture

- [frontend/src/app/router.tsx](frontend/src/app/router.tsx) - BrowserRouter with all route definitions
- [frontend/src/layouts/AuthenticatedLayout.tsx](frontend/src/layouts/AuthenticatedLayout.tsx) - sidebar, topbar, auth guard, data loading; wraps all authenticated routes via React Router `<Outlet>`
- [frontend/src/hooks/useAppContext.ts](frontend/src/hooks/useAppContext.ts) - typed hook for accessing shared app state (user, dashboard, tasks) from outlet context
- [frontend/src/components/shared.tsx](frontend/src/components/shared.tsx) - shared UI primitives (Card, Badge, ProgressBar, Btn)
- [frontend/src/lib/helpers.ts](frontend/src/lib/helpers.ts) - types, constants, and formatting utilities shared across pages

### Page components (one per screen)

- [frontend/src/pages/LoginPage.tsx](frontend/src/pages/LoginPage.tsx) - `/login`
- [frontend/src/pages/DashboardPage.tsx](frontend/src/pages/DashboardPage.tsx) - `/` (index)
- [frontend/src/pages/AICommandPage.tsx](frontend/src/pages/AICommandPage.tsx) - `/ai-command`
- [frontend/src/pages/CalendarPage.tsx](frontend/src/pages/CalendarPage.tsx) - `/calendar`
- [frontend/src/pages/TasksPage.tsx](frontend/src/pages/TasksPage.tsx) - `/tasks`
- [frontend/src/pages/DeadlineCenterPage.tsx](frontend/src/pages/DeadlineCenterPage.tsx) - `/deadlines`
- [frontend/src/pages/PanicModePage.tsx](frontend/src/pages/PanicModePage.tsx) - `/panic`
- [frontend/src/pages/FocusModePage.tsx](frontend/src/pages/FocusModePage.tsx) - `/focus`
- [frontend/src/pages/WorkspacePage.tsx](frontend/src/pages/WorkspacePage.tsx) - `/workspace`
- [frontend/src/pages/AnalyticsPage.tsx](frontend/src/pages/AnalyticsPage.tsx) - `/analytics`

### Route wrappers

Thin components in [frontend/src/app/routes/](frontend/src/app/routes/) connect React Router outlet context to page component props. Pages that need shared state (dashboard data, tasks, user) receive it through these wrappers via `useAppContext()`.

### Other important files

- [frontend/src/features/auth/AuthCallback.tsx](frontend/src/features/auth/AuthCallback.tsx) - stores callback token/session details after OAuth, at `/auth/callback`
- [frontend/src/services/api.ts](frontend/src/services/api.ts) - API client, auth headers, and `401` session cleanup
- [frontend/src/services/config.ts](frontend/src/services/config.ts) - frontend API base URL config
- [frontend/vite.config.ts](frontend/vite.config.ts) - local proxy for `/api` and `/health`
- [frontend/.env.example](frontend/.env.example) - local frontend environment template

### Deprecated files (no longer imported)

- `frontend/src/app/App.tsx` - the old monolithic component; all screens have been extracted to `src/pages/`
- `frontend/src/app/layout.tsx` - the old `AppLayout` wrapper; replaced by `AuthenticatedLayout`

### Navigation

Every sidebar item navigates to its own URL route using React Router's `useNavigate()`. Cross-page links (e.g. "View all" on the dashboard tasks card navigating to `/tasks`, or "Activate Panic Mode" on the deadline center navigating to `/panic`) also use `useNavigate()`. The `AuthenticatedLayout` checks for a JWT on mount and redirects to `/login` if none is found.

Implemented frontend capabilities:

- URL-based routing with React Router v7 (`BrowserRouter`)
- screens for dashboard, tasks, calendar, AI command, focus, panic, workspace, analytics, and auth
- Google sign-in entry point
- auth callback handling
- saved JWT session restoration
- authenticated API calls using `Authorization: Bearer <jwt_token>`
- redirect back to the login page when the backend returns `401`
- sidebar navigation highlights the active route

## 4. Backend Notes

Important files:

- [backend/app/main.py](backend/app/main.py) - FastAPI app entrypoint
- [backend/app/api/router.py](backend/app/api/router.py) - route composition under `/api`
- [backend/app/api/deps.py](backend/app/api/deps.py) - current-user JWT dependency and Google token refresh helper
- [backend/app/api/routes/auth.py](backend/app/api/routes/auth.py) - Google OAuth URL and callback endpoints
- [backend/app/api/routes/users.py](backend/app/api/routes/users.py) - current-user endpoint
- [backend/app/api/routes/tasks.py](backend/app/api/routes/tasks.py) - task CRUD endpoints
- [backend/app/api/routes/dashboard.py](backend/app/api/routes/dashboard.py) - dashboard summary endpoint
- [backend/app/api/routes/agents.py](backend/app/api/routes/agents.py) - AI chat, screener, panic, focus, and starter endpoints
- [backend/app/core/config.py](backend/app/core/config.py) - local config, `.env` loading, Google/Gemini/JWT settings
- [backend/app/database/session.py](backend/app/database/session.py) - async SQLAlchemy engine/session setup
- [backend/app/services/jwt.py](backend/app/services/jwt.py) - JWT create/decode helpers
- [backend/app/services/google_api.py](backend/app/services/google_api.py) - direct Google API wrappers
- [backend/app/services/gemini.py](backend/app/services/gemini.py) - Gemini chat, tool declarations, and tool-call execution loop
- [backend/app/tools/registry.py](backend/app/tools/registry.py) - maps tool names to backend tool implementations

Implemented backend capabilities:

- `/health`
- `/api/auth/google/url`
- `/api/auth/google/callback`
- `/api/users/me`
- `/api/tasks`
- `/api/dashboard`
- `/api/ai/chat`
- `/api/ai/screener/run`
- `/api/ai/reverse-plan`
- `/api/ai/panic`
- `/api/ai/focus`
- `/api/ai/one-click-starter`
- `/api/calendar/events`

Most useful backend behavior:

- Google OAuth callback creates or updates a `User`.
- Google access and refresh tokens are stored on the user record.
- The backend creates a JWT and redirects to the frontend callback route.
- Protected routes use `get_current_user`.
- AI routes can require a valid Google token through `get_google_token`.
- If a Google access token is expired and a refresh token exists, the backend attempts refresh.

## 5. AI And Tool Flow

The intended flow is:

1. Frontend sends a request to `/api/ai/chat`.
2. Backend resolves the signed-in user from the JWT.
3. Backend resolves or refreshes the user's Google token.
4. The orchestrator handles the chat request.
5. Gemini receives tool declarations when configured.
6. If Gemini emits function calls, `backend/app/tools/registry.py` executes the matching Google Workspace actions.
7. The backend returns a message, recommendations, and tool call results to the UI.

Current declared tools include:

- `read_calendar`
- `create_calendar_event`
- `read_gmail`
- `draft_gmail`
- `create_google_task`
- `create_google_doc`
- `create_google_slides`

The non-Gemini fallback path still exists through the agent scaffolding, but the more compelling demo path is Gemini plus a real Google tool call.

## 6. Local Development

Backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Frontend:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev -- --host 127.0.0.1 --port 5173
```

Expected local URLs:

- frontend: http://127.0.0.1:5173
- backend: http://127.0.0.1:8000
- backend docs: http://127.0.0.1:8000/docs

Backend `.env` values needed for the full demo:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/api/auth/google/callback
FRONTEND_URL=http://127.0.0.1:5173
GEMINI_API_KEY=
JWT_SECRET=change-me-in-production
```

## 7. Known Gaps

The project is not production-complete yet. The main gaps are:

- The full browser login -> callback -> dashboard flow still needs repeated manual verification.
- Google OAuth scopes and consent-screen settings must match the Workspace actions used in the demo.
- Gemini/tool execution needs real credential testing against Calendar, Gmail, Tasks, Docs, and Slides.
- Error states for missing Google credentials, expired sessions, failed tool calls, and empty data are still basic.
- The frontend AI screens need to make completed tool actions more visible and satisfying.
- Panic/focus flows are useful scaffolds, but they should feel more action-oriented in the UI.
- Tests are limited; critical auth, task, dashboard, and AI paths need coverage before production use.

## 8. Recommended Next Milestone

Build one polished demo path instead of widening scope:

1. Start frontend and backend locally.
2. Sign in with Google.
3. Confirm the frontend stores `jwt_token`.
4. Confirm `/api/users/me`, `/api/tasks`, and `/api/dashboard` work with the JWT.
5. Create or load a task with a visible deadline.
6. Ask the AI assistant for help.
7. Have Gemini execute one concrete Google action, preferably creating a calendar event, Google Task, Doc, Slide deck, or Gmail draft.
8. Show the returned action result clearly in the UI.

This is the highest-value finish line for a hackathon or product demo.

## 9. Priorities

Highest priority:

- verify Google OAuth end to end
- verify JWT-protected frontend API calls after callback
- configure Gemini and prove one real tool call works
- polish the AI response display so tool actions are obvious
- make dashboard/tasks data feel coherent during the demo

Medium priority:

- improve empty/error states
- make panic and focus modes visibly actionable
- add a short demo script or screenshots
- add focused tests for auth dependencies and task/dashboard routes

Nice to have:

- richer onboarding
- more realistic analytics
- stronger persistence model for sessions, notifications, habits, and workspace state

## 10. Final Guidance

The app already has enough structure. The next developer should resist adding broad new surfaces until the core journey is reliable.

Make the product do one impressive thing all the way through: understand a risky deadline, produce a concrete plan, and take one real action for the user.
