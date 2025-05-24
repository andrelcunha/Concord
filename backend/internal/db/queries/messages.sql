-- name: CreateMessage :one
INSERT INTO messages (channel_id, user_id, content, username)
VALUES ($1, $2, $3, $4)
RETURNING id, channel_id, user_id, content, username, created_at;

-- name: ListMessagesByChannel :many
SELECT 
    m.id, 
    m.channel_id, 
    m.user_id, 
    m.content, 
    m.username, 
    m.created_at,
    COALESCE(u.avatar_url, 'https://example.com/default-avatar.png') AS avatar_url
FROM messages m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.channel_id = $1
ORDER BY m.created_at ASC
LIMIT $2 OFFSET $3;