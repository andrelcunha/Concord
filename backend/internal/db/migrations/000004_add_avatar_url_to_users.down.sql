-- migrations/0004_add_avatar_url_to_users.down.sql
ALTER TABLE users DROP COLUMN avatar_url;
