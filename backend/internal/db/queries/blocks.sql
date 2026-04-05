-- name: CreateBlock :one
INSERT INTO blocks (blocker_id, blocked_id)
VALUES ($1, $2)
RETURNING id, blocker_id, blocked_id, created_at;

-- name: DeleteBlock :exec
DELETE FROM blocks
WHERE blocker_id = $1 AND blocked_id = $2;

-- name: GetBlock :one
SELECT id, blocker_id, blocked_id, created_at
FROM blocks
WHERE blocker_id = $1 AND blocked_id = $2;

-- name: ListBlockedUsers :many
SELECT
    b.id,
    b.blocker_id,
    b.blocked_id,
    b.created_at,
    u.username,
    u.avatar_url,
    u.avatar_color
FROM blocks b
JOIN users u ON u.id = b.blocked_id
WHERE b.blocker_id = $1
ORDER BY b.created_at DESC;
