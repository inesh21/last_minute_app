# Contributing to Last Minute Lifesaver

Thanks for helping improve the project! This document explains the basic workflow, coding conventions, and how to submit changes.

- Fork or branch from `main` using a descriptive branch name: `feature/<short-desc>` or `fix/<short-desc>`.
- Keep PRs small and focused. Each PR should have a short description and link to any relevant issue.
- Commit messages should be concise and imperative, e.g. `Add tasks feature router`.

Development setup

- Backend (Windows PowerShell):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e .
python -m uvicorn app.main:app --reload
```

- Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Code style

- Python: Follow PEP8 and use the provided ruff configuration. Run `ruff .` before committing.
- TypeScript/React: Follow project ESLint/Prettier if present. Prefer small, composable components and keep hooks inside feature folders.

Tests

- Add unit tests for backend logic under `backend/tests` and for frontend components under `frontend/tests` as applicable.

Review

- Request review from at least one maintainer. Address review comments with follow-up commits and keep the PR tidy.

Security

- Do not commit secrets. Use `.env` files and store secrets in your environment or a secrets manager.

Thank you — contributions are welcome!"