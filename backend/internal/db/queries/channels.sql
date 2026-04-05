-- name: CreateChannel :one
INSERT INTO channels (name, created_by, server_id)
VALUES ($1, $2, $3)
RETURNING id, name, created_by, server_id, created_at;

-- name: ListChannels :many
SELECT id, name, created_by, server_id, created_at
FROM channels
WHERE server_id = $1
ORDER BY created_at ASC;

-- name: GetChannel :one
SELECT id, name, created_by, server_id, created_at
FROM channels
WHERE id = $1;