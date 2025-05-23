-- name: CreateMessage :one
INSERT INTO messages (channel_id, user_id, content, username)
VALUES ($1, $2, $3, $4)
RETURNING id, channel_id, user_id, content, username, created_at;

-- name: ListMessagesByChannel :many
SELECT id, channel_id, user_id, content, username, created_at
FROM messages
WHERE channel_id = $1
ORDER BY created_at ASC
LIMIT $2 OFFSET $3;