-- name: CreateUser :exec
INSERT INTO users (username, password) VALUES ($1, $2);

-- name: GetUserByUsername :one
SELECT username, password FROM users WHERE username = $1;