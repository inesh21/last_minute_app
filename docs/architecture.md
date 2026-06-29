# Architecture Overview

This document gives a high-level view of the repository layout and how the main components interact.

## High-level layout

- [frontend](../frontend) — Vite + React app with feature-based screens under the feature folders.
- [backend](../backend) — FastAPI app with routing, schemas, services, models, and agent logic.
- [shared](../shared) — Shared utilities and contracts for cross-cutting logic.
- [docs](.) — Product and implementation documentation.

## Frontend structure

The frontend is organized around feature modules and a small app shell:

- [frontend/src/app](../frontend/src/app) — app shell, routing, and shared layout.
- [frontend/src/features](../frontend/src/features) — feature-based pages such as auth, dashboard, tasks, calendar, and analytics.
- [frontend/src/services](../frontend/src/services) — API client and auth helpers.

## Backend structure

The backend is organized around the FastAPI app entrypoint and feature-oriented modules:

- [backend/app/main.py](../backend/app/main.py) — app startup and router mounting.
- [backend/app/api](../backend/app/api) — route layer for auth, users, tasks, dashboard, agents, and webhooks.
- [backend/app/agents](../backend/app/agents) — orchestrator and agent implementations.
- [backend/app/services](../backend/app/services) — domain logic such as planning and risk.
- [backend/app/models](../backend/app/models) — database models.
- [backend/app/schemas](../backend/app/schemas) — request and response models.

## Authentication flow

The current auth flow is:

1. The frontend requests a Google auth URL from the backend.
2. The backend returns a Google OAuth consent URL.
3. The user authenticates with Google.
4. Google redirects back to the callback route.
5. The callback page stores the auth data and returns the user to the app home page.

## Data flow

A typical user journey looks like this:

1. The frontend sends a request to the backend API.
2. The backend routes the request to the relevant feature or agent.
3. The agent or service performs the necessary computation or dataset access.
4. The backend returns structured data to the frontend.
5. The UI renders the updated state for the user.

## Development notes

- Keep UI code grouped by feature.
- Keep API route logic separate from business logic.
- Keep agent orchestration isolated from the UI.
- Use the docs folder to capture implementation decisions and future product changes.
