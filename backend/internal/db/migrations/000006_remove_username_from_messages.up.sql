-- migrations/000006_remove_username_from_messages.up.sql
ALTER TABLE messages DROP COLUMN username;