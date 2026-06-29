# Last Minute Lifesaver — AI Handoff Document

This document is meant to help another developer or AI agent quickly understand the project, how it is structured, what has already been implemented, and what still needs to be finished for a strong hackathon submission.

## 1. Project summary

Last Minute Lifesaver is an AI-powered productivity companion designed to help users stay ahead of deadlines. Instead of acting like a simple reminder app, the product is intended to behave more like an AI chief of staff that can:

- detect deadlines and risk
- create actionable plans
- suggest or trigger follow-up actions
- help users recover from procrastination or overload
- surface a dashboard of priorities and threat levels

The current repository is an early but functional prototype with:

- a React + Vite frontend
- a FastAPI backend
- a lightweight task and dashboard layer
- agent orchestration logic
- basic integrations and API routes

## 2. Product goal for the hackathon

The hackathon version should demonstrate three things clearly:

1. The core idea is compelling and easy to understand.
2. The app can show real productivity intelligence, not just static UI.
3. The end-to-end experience feels complete enough to demo in a few minutes.

## 3. Current implementation status

### Completed / present

#### Frontend
- A polished dashboard-style UI exists in the React app.
- Core screens include:
  - login
  - dashboard
  - AI command
  - calendar
  - tasks
  - deadlines
  - panic mode
  - focus mode
  - workspace
  - analytics
- The app fetches backend data for dashboard, tasks, and AI actions.
- The UI is structured around feature folders under the frontend feature modules.

#### Backend
- A FastAPI app is running with a health endpoint.
- API routing is wired for:
  - auth
  - users
  - tasks
  - dashboard
  - AI agents
  - calendar
  - webhooks
- The backend has an orchestrator that routes user requests to agent behaviors.
- Basic task and dashboard services exist.
- Task risk calculation and dashboard threat summarization are implemented.
- A local SQLite-backed database setup exists.

#### Agent system
- The backend includes separate agent modules for:
  - screener
  - triage
  - executor
  - guardian
  - memory
- The orchestrator routes requests to these agents.
- There are starter implementations for executor and guardian behaviors.

#### Integrations
- The project includes integration folders for Google-related services such as:
  - Calendar
  - Gmail
  - Docs
  - Drive
  - Slides
  - Maps
  - OAuth
- The app is prepared for future connection to Google and Gemini services.

### Still incomplete / not fully wired

- Gemini integration is mostly scaffolded rather than fully production-ready.
- The app does not yet provide a fully polished real-world workflow for all integrations.
- A lot of the agent behavior is currently lightweight and should be better demonstrated in the demo.
- Some backend features are present but not fully validated through real user flows.
- The repository still needs a stronger finish for hackathon judging, especially around demo clarity and reliability.

### Auth status

- The Google OAuth callback path is now wired so the frontend receives the tokens and redirects the user back into the main app.
- The app now checks for a saved auth session on startup and restores the dashboard view automatically after callback completion.
- Local testing should verify that the browser lands on the main app after the callback instead of returning to the login screen.

## 4. Architecture overview

### Frontend structure

The frontend is centered around the app shell and feature modules.

Key files:
- [frontend/src/app/App.tsx](frontend/src/app/App.tsx)
- [frontend/src/app/router.tsx](frontend/src/app/router.tsx)
- [frontend/src/services/api.ts](frontend/src/services/api.ts)

How it works:
- The main app component contains the UI screens and navigation logic.
- The router is a thin wrapper around the app layout.
- The API service layer calls the FastAPI backend for dashboard data, tasks, and AI actions.
- Feature folders under the frontend organize UI by capability.

### Backend structure

The backend entrypoint is the FastAPI app, which wires all routes and middleware.

Key files:
- [backend/app/main.py](backend/app/main.py)
- [backend/app/api/router.py](backend/app/api/router.py)
- [backend/app/core/config.py](backend/app/core/config.py)

How it works:
- The main app initializes the database and optional scheduler.
- It includes the API router at the /api prefix.
- Configuration is pulled from environment variables and .env files.

### API routes

The route layer groups features into logical endpoints.

Key files:
- [backend/app/api/routes/agents.py](backend/app/api/routes/agents.py)
- [backend/app/api/routes/dashboard.py](backend/app/api/routes/dashboard.py)
- [backend/app/api/routes/tasks.py](backend/app/api/routes/tasks.py)

How it works:
- The AI routes expose chat, screener, panic, focus, and starter actions.
- The dashboard route calculates threat level and recommendation summaries.
- The tasks route supports creating, listing, and updating tasks.

### Agent orchestration

The orchestrator coordinates the agent stack.

Key file:
- [backend/app/agents/orchestrator.py](backend/app/agents/orchestrator.py)

How it works:
- It creates the screener, triage, executor, and guardian agents.
- It maps simple user requests into tool-like actions.
- It returns a response containing tool calls and recommendations.

### Data model and persistence

The backend uses SQLAlchemy models and schemas.

Key files:
- [backend/app/models/task.py](backend/app/models/task.py)
- [backend/app/schemas/task.py](backend/app/schemas/task.py)
- [backend/app/database/session.py](backend/app/database/session.py)

How it works:
- Tasks are stored in the local database.
- The dashboard API reads tasks and calculates risk and completion metrics.
- The app is structured to support more entities later, such as sessions, notifications, habits, and workspace connections.

## 5. File-to-file relationships

This section explains how the app pieces connect.

### User flow: dashboard load
1. The frontend calls the API service in [frontend/src/services/api.ts](frontend/src/services/api.ts).
2. The request hits the dashboard endpoint in [backend/app/api/routes/dashboard.py](backend/app/api/routes/dashboard.py).
3. The dashboard route reads tasks from the database via [backend/app/database/session.py](backend/app/database/session.py).
4. The route uses risk logic from [backend/app/services/risk.py](backend/app/services/risk.py).
5. The frontend renders the resulting dashboard summary.

### User flow: create a task
1. The UI triggers a task creation action from the frontend service layer.
2. The request hits [backend/app/api/routes/tasks.py](backend/app/api/routes/tasks.py).
3. The route creates a Task entity and stores it in the database.
4. The task gets risk calculation and is returned to the UI.

### User flow: AI chat or assistant action
1. The frontend calls the AI endpoint from [frontend/src/services/api.ts](frontend/src/services/api.ts).
2. The request reaches [backend/app/api/routes/agents.py](backend/app/api/routes/agents.py).
3. The agent route calls the orchestrator in [backend/app/agents/orchestrator.py](backend/app/agents/orchestrator.py).
4. The orchestrator routes work to the appropriate agent logic and tool registry.
5. The response is returned to the UI and displayed as agent recommendations or tool calls.

### App shell and navigation
1. [frontend/src/app/router.tsx](frontend/src/app/router.tsx) wraps the app in the shared layout.
2. [frontend/src/app/App.tsx](frontend/src/app/App.tsx) contains the full UI and screen state.
3. The app uses the API service layer to connect the UI to the backend.

## 6. What still needs to be done for a complete hackathon submission

### High priority
- Make the demo flow feel smooth and intentional.
- Ensure the frontend and backend start reliably together.
- Add a short, polished onboarding flow so judges understand the product quickly.
- Make the AI assistant responses feel more meaningful and less placeholder-like.
- Connect at least one real external integration convincingly, such as Google Calendar or Gmail.

### Medium priority
- Finish the auth flow so users can log in and see their own data.
- Improve the agent prompts and tool logic so the assistant makes more specific plans.
- Add a stronger “panic mode” experience with visible recovery actions.
- Add better task lifecycle behavior, such as progress updates and completion states.
- Polish the dashboard and analytics visuals for presentation.

### Nice-to-have for judging
- Add a short intro or demo script in the README.
- Add screenshots or GIFs to the repository.
- Add a concise architecture summary for judges.
- Ensure the app can be launched locally with clear commands.
- Add a short “how to demo” section to the docs.

## 7. Recommended hackathon finish line

If the goal is to submit a strong project, the best version of this app should be able to demonstrate:

- a login or demo-user experience
- a dashboard showing deadlines and risk
- at least one AI-assisted action
- a clear task or focus workflow
- one believable integration with Google or another external service
- a polished presentation and demo story

## 8. Suggested next steps

1. Tighten the demo narrative.
2. Make the AI assistant responses concrete and useful.
3. Connect at least one real integration.
4. Make task creation and dashboard updates feel immediate and reliable.
5. Add polished copy, visuals, and a short demo script.
6. Run the app locally and test the full flow end to end.

## 9. Quick implementation notes for the next agent

When continuing this project, focus on:
- reliability over scope
- a clear demo path over extra features
- visible AI behavior over hidden backend complexity
- one polished workflow instead of many half-finished ones

The best hackathon strategy is to make the core loop feel impressive and easy to explain:

user has deadlines -> app sees risk -> app proposes a plan -> app helps the user act.
