CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT friendships_user_pair_order CHECK (user_id < friend_id),
    CONSTRAINT friendships_user_pair_unique UNIQUE (user_id, friend_id)
);

CREATE INDEX idx_friendships_user_id ON friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX idx_friendships_status ON friendships(status);

CREATE TABLE blocks (
    id SERIAL PRIMARY KEY,
    blocker_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT blocks_distinct_users CHECK (blocker_id <> blocked_id),
    CONSTRAINT blocks_blocker_blocked_unique UNIQUE (blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker_id ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked_id ON blocks(blocked_id);

CREATE TABLE dm_conversations (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE dm_conversation_participants (
    conversation_id INT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_dm_conversation_participants_user_id ON dm_conversation_participants(user_id);

CREATE TABLE dm_conversation_visibility (
    conversation_id INT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hidden_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_dm_conversation_visibility_user_id ON dm_conversation_visibility(user_id);

CREATE TABLE dm_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INT NOT NULL REFERENCES dm_conversations(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dm_messages_conversation_id ON dm_messages(conversation_id);
CREATE INDEX idx_dm_messages_created_at ON dm_messages(created_at);
