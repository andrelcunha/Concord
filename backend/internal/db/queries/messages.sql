-- name: CreateMessage :one
INSERT INTO messages (channel_id, user_id, content)
VALUES ($1, $2, $3)
RETURNING id, channel_id, user_id, content, created_at;

-- name: ListMessagesByChannel :many
SELECT id, channel_id, user_id, content, created_at
FROM messages
WHERE channel_id = $1
ORDER BY created_at ASC
LIMIT $2 OFFSET $3;