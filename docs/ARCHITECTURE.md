# Concord Architecture

This document explains how the current codebase fits together so contributors and agents can orient themselves quickly.

## High-Level Shape

Concord is a classic split app:

- a Go backend serving JSON and WebSocket endpoints
- a Vue frontend consuming those endpoints
- PostgreSQL for durable state
- Redis for ephemeral token/session and realtime fanout concerns

## Backend Request Flow

Entry point: `backend/cmd/api/main.go`

Startup order:

1. Load typed config from `.env` and process env
2. Connect Postgres
3. Connect Redis
4. Register auth routes
5. Create protected `/api` group with JWT middleware
6. Register servers, channels, websocket, and message routes

The backend uses a centralized config loader in `backend/config/config.go`. The rest of the app should consume the typed config struct rather than reading env vars directly.

### Auth

Public endpoints:

- `POST /register`
- `POST /login`
- `POST /refresh`

Behavior:

- Passwords are hashed with bcrypt
- Access tokens are JWTs signed with the configured secret
- Refresh tokens are opaque random strings stored in Redis
- Refresh uses token rotation and deletes the old token key first

Middleware:

- `internal/middleware/auth.go`
- Accepts a bearer token or `?token=` query param
- Extracts `userID`, `username`, `avatar_url`, and `avatar_color` into Fiber locals

### Protected REST Routes

Mounted under `/api`.

Servers:

- `POST /api/servers`
- `GET /api/servers`
- `POST /api/servers/:id/join`

Channels:

- `POST /api/channels`
- `GET /api/channels`

Messages:

- `GET /api/channels/:id/messages`

WebSocket:

- `GET /api/ws?channel_id=<id>&token=<jwt>`

## Realtime Message Flow

The realtime path spans three backend modules:

1. `internal/websocket/handler.go` accepts the WebSocket connection
2. Incoming messages are persisted through `internal/messages` repository methods
3. The serialized message is published to Redis on `channel:<channelID>`
4. Subscribers for that channel broadcast the payload to connected clients

This means Redis is part of the happy path for live chat, not just optional infrastructure.

## Data Model

Core tables:

- `users`
- `servers`
- `server_members`
- `channels`
- `messages`

Relationships:

- a user can belong to many servers through `server_members`
- a server has many channels
- a channel has many messages
- a message belongs to a user and a channel

Relevant migrations live in `backend/internal/db/migrations/`.

## SQL And Repositories

Hand-written SQL lives in:

- `backend/internal/db/queries/user.sql`
- `backend/internal/db/queries/servers.sql`
- `backend/internal/db/queries/channels.sql`
- `backend/internal/db/queries/messages.sql`

Generated Go access code is emitted into `backend/internal/db/` through `sqlc`.

Repository pattern by feature:

- handler validates/parses HTTP
- service applies business rules
- repository calls generated SQL layer

This pattern is consistent enough that new features should usually follow it.

## Frontend Flow

Entry point: `frontend/web/src/main.js`

Main pieces:

- `src/router/index.js`: protected routes and login redirect
- `src/stores/auth.js`: login, register, refresh, logout
- `src/api/axios.js`: axios instance and token refresh handling
- `src/views/ChatView.vue`: loads history and opens WebSocket
- `src/views/ChannelsView.vue`: active sidebar in the current layout

## Current Design Tension

The backend now models channels inside servers, but the active frontend still behaves more like a flat channel list.

Concretely:

- the backend requires `server_id` for listing and creating channels
- the active `ChannelsView.vue` does not pass it
- `ServerListView.vue` looks like an in-progress or alternate implementation that better matches the backend

If you are extending navigation or chat UX, treat server selection as an existing domain concept that is only partially surfaced in the client.

## Practical Extension Points

Good places to add capability:

- add new protected API resources by following the existing handler/service/repository layout
- expand message retrieval with pagination filters in `messages.sql`
- improve auth persistence and hydration in the Pinia store
- wire the server-aware sidebar into the main layout
- add scripts for migrations and `sqlc` generation

## Known Drift

These mismatches are worth knowing before debugging:

- checked-in Postgres compose defaults to database `postgres`, while backend env points at `concord`
- the README previously mentioned Quasar, but the current frontend is standard Vue + Vite
