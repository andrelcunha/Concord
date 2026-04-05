# AGENTS.md

This file is for coding agents and automation working in Concord. It summarizes the project-specific context that is easy to miss from a quick skim.

## Mission

Concord is a learning-oriented Discord-like chat app. Prefer pragmatic, incremental changes over broad rewrites. Keep the code easy to understand for a solo maintainer returning later.

## Repository Map

- `backend/`: Go API and realtime backend
- `frontend/web/`: Vue frontend  
- `postgres/`, `redis/`: local infrastructure configs
- `backend/internal/db/`: `sqlc`-generated DB layer and migrations (use `golang-migrate` to apply)

## What Is Canonical

- Backend route wiring starts in `backend/cmd/api/main.go`
- Database schema truth lives in `backend/internal/db/migrations/`
- SQL query truth lives in `backend/internal/db/queries/`
- Generated DB files in `backend/internal/db/*.sql.go` should not be edited manually unless there is a very specific reason

## Backend Conventions

- Public routes: `/register`, `/login`, `/refresh`
- Protected routes live under `/api`
- Auth middleware accepts bearer tokens and also `token` in the query string for WebSocket auth
- JWT claims include serialized user data; middleware unpacks that into `Ctx.Locals`
- Redis is used for two things:
  - refresh token storage
  - pub/sub fanout for chat messages

Backend module layout:

- `internal/auth`: auth and token lifecycle
- `internal/servers`: server CRUD-ish membership flow
- `internal/channels`: channels scoped to a server
- `internal/messages`: message history reads
- `internal/websocket`: live chat transport

## Frontend Conventions

- Vite + Vue 3 + Pinia
- API wrapper lives in `frontend/web/src/api/axios.js`
- Auth state lives in `frontend/web/src/stores/auth.js`
- Route protection happens in `frontend/web/src/router/index.js`
- The currently wired layout uses `ChannelsView.vue`

Important current mismatch:

- The backend requires `server_id` for channel listing and creation
- The active `ChannelsView.vue` does not yet provide it
- `ServerListView.vue` looks closer to the backend model, but it is not connected to the main layout today

If you are asked to fix channel or server UX, inspect both sidebar implementations before making assumptions.

## Environment Notes

Backend expects:

```env
SECRET_KEY=...
DATABASE_URL=...
REDIS_URL=...
PORT=3000
```

Backend config is centralized in `backend/config/config.go` through `LoadConfig()`. Prefer adding new env handling there instead of reading environment variables in feature packages.

Frontend expects:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

## Safe Change Strategy

When adding features:

1. Start from the route handler
2. Follow into the service
3. Confirm repository and SQL coverage
4. Regenerate `sqlc` if schema or query files change
5. Update the Bruno collection in `bruno/` for every new or changed HTTP API route
6. Update docs when behavior changes

When touching realtime behavior:

1. Check `ChatView.vue`
2. Check `internal/websocket/handler.go`
3. Check `internal/messages/repository.go`
4. Verify auth token handling for WebSocket connections

## Common Pitfalls

- The backend compose setup creates a default database `postgres`, but you need to manually create the `concord` database for the application
- There is untracked or in-progress UI work in this repo at times; do not delete it just because it is not wired yet  
- Some generated code may look hand-written at a glance; verify before editing

## Good Contributions

- Tightening local setup
- Wiring server selection through the active frontend
- Reducing config drift between env files and runtime expectations
- Improving tests around auth and realtime behavior
- Adding migration and codegen scripts

## Documentation Rule

If you discover a repo-specific behavior that would surprise the next agent, add it either here or to `docs/ARCHITECTURE.md`.
