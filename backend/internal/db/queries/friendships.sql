-- name: CreateFriendship :one
INSERT INTO friendships (user_id, friend_id, requester_id, status)
VALUES ($1, $2, $3, $4)
RETURNING id, user_id, friend_id, requester_id, status, created_at;

-- name: GetFriendshipByUsers :one
SELECT id, user_id, friend_id, requester_id, status, created_at
FROM friendships
WHERE user_id = $1 AND friend_id = $2;

-- name: GetFriendshipByID :one
SELECT id, user_id, friend_id, requester_id, status, created_at
FROM friendships
WHERE id = $1;

-- name: UpdateFriendshipStatus :one
UPDATE friendships
SET status = $3
WHERE user_id = $1 AND friend_id = $2
RETURNING id, user_id, friend_id, requester_id, status, created_at;

-- name: DeleteFriendship :exec
DELETE FROM friendships
WHERE user_id = $1 AND friend_id = $2;

-- name: ListAcceptedFriends :many
SELECT
    u.id,
    u.username,
    u.avatar_url,
    u.avatar_color,
    f.created_at AS friended_at
FROM friendships f
JOIN users u
    ON u.id = CASE
        WHEN f.user_id = $1 THEN f.friend_id
        ELSE f.user_id
    END
WHERE (f.user_id = $1 OR f.friend_id = $1)
  AND f.status = 'accepted'
ORDER BY f.created_at ASC;

-- name: ListIncomingFriendRequests :many
SELECT
    f.id,
    f.user_id,
    f.friend_id,
    f.requester_id,
    f.status,
    f.created_at,
    u.username,
    u.avatar_url,
    u.avatar_color
FROM friendships f
JOIN users u ON u.id = f.user_id
WHERE f.friend_id = $1
  AND f.status = 'pending'
ORDER BY f.created_at ASC;

-- name: ListOutgoingFriendRequests :many
SELECT
    f.id,
    f.user_id,
    f.friend_id,
    f.requester_id,
    f.status,
    f.created_at,
    u.username,
    u.avatar_url,
    u.avatar_color
FROM friendships f
JOIN users u ON u.id = f.friend_id
WHERE f.user_id = $1
  AND f.status = 'pending'
ORDER BY f.created_at ASC;
