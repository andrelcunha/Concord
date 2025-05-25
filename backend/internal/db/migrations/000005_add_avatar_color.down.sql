-- migrations/0005_add_avatar_color.down.sql
ALTER TABLE users DROP COLUMN avatar_color;
