# Contributing To Concord

Thanks for contributing. Concord is a learning project, so the goal is not just to add features, but to keep the codebase welcoming to future you and other collaborators.

## Principles

- Prefer small, focused changes
- Keep code readable over clever
- Preserve the current architecture unless there is a strong reason to reshape it
- Update docs when runtime behavior changes
- Call out gaps honestly when something is incomplete

## Project Structure

- `backend/`: Go API, auth, WebSocket handling, data access
- `frontend/web/`: Vue client
- `postgres/`, `redis/`: local infra helpers
- `docs/`: supporting project documentation

## Local Setup

1. Start dependencies with Docker
2. Configure backend and frontend env files
3. Apply database migrations
4. Run backend and frontend separately

See [README.md](/home/andre/src/tests_and_examples/golang/Concord/README.md) for the current commands and known caveats.

## Backend Workflow

- Add or update SQL in `backend/internal/db/queries/` when repository behavior changes
- Update migrations in `backend/internal/db/migrations/` for schema changes
- Regenerate `sqlc` outputs after changing queries or schema
- Run:

```bash
cd backend
go test ./...
```

## Frontend Workflow

- Keep network calls centralized through `src/api/axios.js` when possible
- Keep auth concerns in the Pinia auth store and router guards
- Run:

```bash
cd frontend/web
npm install
npm run lint
npm run test:unit
```

## Pull Request Checklist

- The change is scoped to one concern
- New behavior is reflected in docs if needed
- Generated files are regenerated if required
- Tests were run, or the PR clearly states what could not be verified
- Known follow-up work is documented instead of hidden

## Areas Where Contributions Help A Lot

- Server-aware frontend flows
- Better migration and bootstrap tooling
- Test coverage beyond auth service tests
- Better error handling and user feedback
- CI or local scripts for codegen and setup
