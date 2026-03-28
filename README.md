# Concord

Concord is a Discord-inspired real-time chat project built as a learning sandbox. The current codebase already includes authentication, protected API routes, channel and server data models, historical message loading, and live message fanout over WebSockets.

This repository is split into a Go backend and a Vue 3 frontend:

- `backend/`: Fiber API, PostgreSQL persistence via `sqlc`, Redis-backed refresh tokens, and Redis pub/sub for chat broadcast
- `frontend/web/`: Vite + Vue 3 + Pinia client for login, channel navigation, and live chat
- `postgres/` and `redis/`: local infrastructure compose files

## Current Status

Implemented today:

- User registration and login
- JWT access tokens plus rotating refresh tokens stored in Redis
- Protected `/api` routes
- Servers and server membership in the backend
- Channels scoped to a server
- Message history via REST
- Real-time message delivery via WebSockets and Redis pub/sub

Still rough or incomplete:

- The current main UI does not fully expose server selection yet
- Some docs and config values were stale before this refresh
- Migrations exist, but this repo does not yet include a single canonical migration runner command

## Architecture At A Glance

### Backend

Entry point: `backend/cmd/api/main.go`

Startup flow:

1. Load config from `.env` and environment variables
2. Connect to PostgreSQL
3. Connect to Redis with retry
4. Register public auth routes
5. Register protected `/api` routes for servers, channels, messages, and WebSockets

Important packages:

- `internal/auth`: registration, login, refresh-token rotation
- `internal/servers`: server creation, membership, and listing
- `internal/channels`: channel creation and listing
- `internal/messages`: message history queries
- `internal/websocket`: live chat connections and Redis pub/sub broadcast
- `internal/middleware`: auth and CORS
- `internal/db`: generated `sqlc` access layer plus migrations

### Frontend

Entry point: `frontend/web/src/main.js`

Important pieces:

- `src/components/Login.vue`: register/login screen
- `src/stores/auth.js`: auth token lifecycle
- `src/views/ChannelsView.vue`: current sidebar for channel listing
- `src/views/ChatView.vue`: message history + WebSocket chat
- `src/router/index.js`: route protection

## Local Development

### Prerequisites

- Go `1.24.x`
- Node.js `18+`
- Docker and Docker Compose
- PostgreSQL and Redis, either via Docker or your own local services

### 1. Start infrastructure

From the repo root:

```bash
docker compose up -d
```

That includes the backend compose file, which in turn includes PostgreSQL and Redis.

### 2. Configure the backend

Create or update `backend/.env` with the values expected by the code:

```env
SECRET_KEY=change-me
DATABASE_URL=postgresql://postgres:root@localhost:5432/concord
REDIS_URL=redis://localhost:6379/0
PORT=3000
```

### 3. Apply database migrations

SQL migrations live in `backend/internal/db/migrations/`.

The project uses [golang-migrate](https://github.com/golang-migrate/migrate) for database migrations. Install it first:

```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

Then apply the migrations:

```bash
cd backend
migrate -path internal/db/migrations -database "postgresql://postgres:root@localhost:5432/concord?sslmode=disable" up
```

Note: Make sure to create the `concord` database first if it doesn't exist:

```bash
PGPASSWORD=root psql -h localhost -U postgres -d postgres -c "CREATE DATABASE concord;"
```

The backend config loader is fail-soft:

- `.env` is optional
- real environment variables override `.env`
- missing values fall back to defaults
- invalid typed values such as a bad `PORT` fall back to safe defaults

### 4. Run the backend

```bash
cd backend
go mod tidy
go run cmd/api/main.go
```

You can also use:

```bash
make run
```

### 5. Run the frontend

Create `frontend/web/.env`:

```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

Then start the client:

```bash
cd frontend/web
npm install
npm run dev
```

## Testing

Backend:

```bash
cd backend
go test ./...
```

Frontend:

```bash
cd frontend/web
npm install
npm run test:unit
npm run lint
```

E2E support is scaffolded with Cypress:

```bash
cd frontend/web
npm run test:e2e
```

## Generated Code

`backend/internal/db/*.sql.go` and related model files are generated from:

- `backend/internal/db/queries/*.sql`
- `backend/internal/db/migrations/*.sql`
- `backend/sqlc.yaml`

If you change queries or schemas, regenerate the `sqlc` output before opening a PR.

### Migration Commands

Common migration operations:

```bash
# Apply all pending migrations
migrate -path internal/db/migrations -database "postgresql://postgres:root@localhost:5432/concord?sslmode=disable" up

# Rollback the last migration
migrate -path internal/db/migrations -database "postgresql://postgres:root@localhost:5432/concord?sslmode=disable" down 1

# Check current migration version
migrate -path internal/db/migrations -database "postgresql://postgres:root@localhost:5432/concord?sslmode=disable" version

# Create a new migration
migrate create -ext sql -dir internal/db/migrations -seq your_migration_name
```

## Known Caveats

- `postgres/docker-compose.yaml` creates the default database `postgres`, while the backend configuration expects `concord` (you'll need to create this database manually)
- `frontend/web/src/views/ChannelsView.vue` currently calls `/api/channels` without `server_id`, but the backend requires `server_id`
- `frontend/web/src/views/ServerListView.vue` appears to be a newer server-aware sidebar, but it is not wired into the main layout yet

These are useful areas to improve if you want to continue productizing the app.

## Repo Docs

- [AGENTS.md](/home/andre/src/tests_and_examples/golang/Concord/AGENTS.md)
- [CONTRIBUTING.md](/home/andre/src/tests_and_examples/golang/Concord/CONTRIBUTING.md)
- [docs/ARCHITECTURE.md](/home/andre/src/tests_and_examples/golang/Concord/docs/ARCHITECTURE.md)
- [docs/product_vision.md](/home/andre/src/tests_and_examples/golang/Concord/docs/product_vision.md)
- [docs/roadmap.md](/home/andre/src/tests_and_examples/golang/Concord/docs/roadmap.md)
- [docs/frontend_architecture.md](/home/andre/src/tests_and_examples/golang/Concord/docs/frontend_architecture.md)
- [docs/frontend_design_direction.md](/home/andre/src/tests_and_examples/golang/Concord/docs/frontend_design_direction.md)
- [docs/implementation_plan.md](/home/andre/src/tests_and_examples/golang/Concord/docs/implementation_plan.md)
