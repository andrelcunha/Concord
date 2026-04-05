-- name: CreateDmConversation :one
INSERT INTO dm_conversations DEFAULT VALUES
RETURNING id, created_at;

-- name: AddDmConversationParticipant :one
INSERT INTO dm_conversation_participants (conversation_id, user_id)
VALUES ($1, $2)
RETURNING conversation_id, user_id, joined_at;

-- name: GetDmConversationByUserPair :one
SELECT
    c.id,
    c.created_at
FROM dm_conversations c
JOIN dm_conversation_participants p1 ON p1.conversation_id = c.id
JOIN dm_conversation_participants p2 ON p2.conversation_id = c.id
WHERE p1.user_id = $1
  AND p2.user_id = $2
LIMIT 1;

-- name: ListVisibleDmConversationsForUser :many
SELECT
    c.id,
    c.created_at,
    other_user.id AS other_user_id,
    other_user.username AS other_username,
    other_user.avatar_url AS other_avatar_url,
    other_user.avatar_color AS other_avatar_color,
    COALESCE(last_message.content, '') AS last_message_content,
    last_message.created_at AS last_message_created_at
FROM dm_conversations c
JOIN dm_conversation_participants self_participant
    ON self_participant.conversation_id = c.id
JOIN dm_conversation_participants other_participant
    ON other_participant.conversation_id = c.id
   AND other_participant.user_id <> self_participant.user_id
JOIN users other_user ON other_user.id = other_participant.user_id
LEFT JOIN dm_conversation_visibility visibility
    ON visibility.conversation_id = c.id
   AND visibility.user_id = self_participant.user_id
LEFT JOIN LATERAL (
    SELECT content, created_at
    FROM dm_messages
    WHERE conversation_id = c.id
    ORDER BY created_at DESC
    LIMIT 1
) last_message ON TRUE
WHERE self_participant.user_id = $1
  AND visibility.hidden_at IS NULL
ORDER BY COALESCE(last_message.created_at, c.created_at) DESC;

-- name: HideDmConversationForUser :one
INSERT INTO dm_conversation_visibility (conversation_id, user_id, hidden_at)
VALUES ($1, $2, CURRENT_TIMESTAMP)
ON CONFLICT (conversation_id, user_id)
DO UPDATE SET hidden_at = EXCLUDED.hidden_at
RETURNING conversation_id, user_id, hidden_at;

-- name: UnhideDmConversationForUser :one
INSERT INTO dm_conversation_visibility (conversation_id, user_id, hidden_at)
VALUES ($1, $2, NULL)
ON CONFLICT (conversation_id, user_id)
DO UPDATE SET hidden_at = NULL
RETURNING conversation_id, user_id, hidden_at;

-- name: GetDmConversationVisibility :one
SELECT conversation_id, user_id, hidden_at
FROM dm_conversation_visibility
WHERE conversation_id = $1 AND user_id = $2;
