-- name: CreateUser :one
INSERT INTO users (username, password, avatar_color) 
VALUES ($1, $2, $3)
RETURNING  id, username, avatar_url, avatar_color;

-- name: GetUserByUsername :one
SELECT id, username, password FROM users WHERE username = $1;

-- name: GetUserByID :one
SELECT id, username, avatar_url, avatar_color 
FROM users 
WHERE id = $1;