-- migrations/000006_remove_username_from_messages.down.sql
ALTER TABLE messages ADD COLUMN username VARCHAR(255);