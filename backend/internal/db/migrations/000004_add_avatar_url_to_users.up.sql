-- migrations/0004_add_avatar_url_to_users.up.sql
ALTER TABLE users ADD COLUMN avatar_url TEXT;
