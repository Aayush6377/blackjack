CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    difficulty VARCHAR(50) NOT NULL DEFAULT 'BEGINNER',
    background_url TEXT,
    background_public_id VARCHAR(255),
    thumbnail_url TEXT,
    thumbnail_public_id VARCHAR(255),
    min_wallet BIGINT NOT NULL DEFAULT 100,
    min_bet BIGINT NOT NULL DEFAULT 10,
    max_bet BIGINT NOT NULL DEFAULT 1000,
    decks_per_shoe INT NOT NULL DEFAULT 1,
    reshuffle_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    blackjack_payout VARCHAR(20) NOT NULL DEFAULT '3:2',
    dealer_hits_soft_17 BOOLEAN NOT NULL DEFAULT TRUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_game_rooms_slug ON game_rooms(slug);

CREATE TABLE room_unlock_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL,
    prerequisite_room_id UUID NOT NULL,
    required_rounds INT NOT NULL DEFAULT 0,
    required_wins INT NOT NULL DEFAULT 0,
    minimum_wallet BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_rule_room FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
    CONSTRAINT fk_rule_prereq FOREIGN KEY (prerequisite_room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
    CONSTRAINT uk_room_prereq UNIQUE (room_id, prerequisite_room_id)
);

CREATE TABLE room_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    room_id UUID NOT NULL,
    rounds_played INT NOT NULL DEFAULT 0,
    rounds_won INT NOT NULL DEFAULT 0,
    unlocked BOOLEAN NOT NULL DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_room FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_room UNIQUE (user_id, room_id)
);
CREATE INDEX idx_room_progress_user ON room_progress(user_id);