-- name: CreateMessage :one
INSERT INTO messages (channel_id, user_id, content)
VALUES ($1, $2, $3)
RETURNING id, channel_id, user_id, content, created_at;

-- name: ListMessagesByChannel :many
SELECT 
    m.id, 
    m.channel_id, 
    m.user_id, 
    m.content, 
    u.username AS username, 
    m.created_at,
    u.avatar_url AS avatar_url,
    u.avatar_color AS avatar_color
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.channel_id = $1
ORDER BY m.created_at ASC
LIMIT $2 OFFSET $3;