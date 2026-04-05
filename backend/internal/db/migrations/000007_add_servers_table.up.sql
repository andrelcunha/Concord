-- migrations/000007_add_servers_table.up.sql
-- Add servers table
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id INT REFERENCES users(id),
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE server_members (
    server_id INT REFERENCES servers(id),
    user_id INT REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (server_id, user_id)
);

-- Add server_id to channels
ALTER TABLE channels
ADD COLUMN server_id INT REFERENCES servers(id);

-- Create a default server for existing channels
INSERT INTO servers (name, creator_id, is_public)
VALUES ('Default Server', 1, TRUE);

-- Assign existing channels to the default server
UPDATE channels
SET server_id = (SELECT id FROM servers WHERE name = 'Default Server')
WHERE server_id IS NULL;

-- Make server_id NOT NULL
ALTER TABLE channels
ALTER COLUMN server_id SET NOT NULL;
