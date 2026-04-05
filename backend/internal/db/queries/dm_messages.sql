-- name: CreateDmMessage :one
INSERT INTO dm_messages (conversation_id, user_id, content)
VALUES ($1, $2, $3)
RETURNING id, conversation_id, user_id, content, created_at;

-- name: ListDmMessagesByConversation :many
SELECT
    m.id,
    m.conversation_id,
    m.user_id,
    m.content,
    m.created_at,
    u.username AS username,
    u.avatar_url AS avatar_url,
    u.avatar_color AS avatar_color
FROM dm_messages m
LEFT JOIN users u ON m.user_id = u.id
WHERE m.conversation_id = $1
ORDER BY m.created_at ASC
LIMIT $2 OFFSET $3;
