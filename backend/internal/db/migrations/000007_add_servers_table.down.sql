-- Drop server_id from channels
ALTER TABLE channels
DROP COLUMN server_id;

-- Drop server_members table
DROP TABLE server_members;

-- Drop servers table
DROP TABLE servers;