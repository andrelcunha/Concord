-- name: CreateServer :one
INSERT INTO servers (name, creator_id, is_public)
VALUES ($1, $2, $3)
RETURNING id, name, creator_id, is_public, created_at;

-- name: ListUserServers :many
SELECT s.id, 
    s.name, 
    s.creator_id, 
    s.is_public, 
    s.created_at
FROM servers s
JOIN server_members sm ON s.id = sm.server_id
WHERE sm.user_id = $1
ORDER BY s.created_at ASC;

-- name: GetServer :one
SELECT id, name, creator_id, is_public, created_at
FROM servers
WHERE id = $1;

-- name: JoinServer :exec
INSERT INTO server_members (server_id, user_id)
VALUES ($1, $2)
ON CONFLICT DO NOTHING;

-- name: IsServerMember :one
SELECT EXISTS (
    SELECT 1
    FROM server_members
    WHERE server_id = $1 AND user_id = $2
);



