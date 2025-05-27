-- name: CreateChannel :one
INSERT INTO channels (name, created_by)
VALUES ($1, $2)
RETURNING id, name, created_by, created_at;

-- name: ListChannels :many
SELECT id, name, created_by, created_at
FROM channels
ORDER BY created_at ASC;