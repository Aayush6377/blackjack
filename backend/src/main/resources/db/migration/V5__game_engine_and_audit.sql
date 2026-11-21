CREATE TABLE game_shoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    room_id UUID NOT NULL,
    decks_count INT NOT NULL,
    total_cards INT NOT NULL,
    shuffled_cards JSONB NOT NULL,
    next_card_index INT NOT NULL DEFAULT 0,
    reshuffle_threshold DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    shuffle_number INT NOT NULL DEFAULT 1,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_shuffled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shoe_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_shoe_room FOREIGN KEY (room_id) REFERENCES game_rooms(id) ON DELETE CASCADE
);
CREATE INDEX idx_game_shoes_user_room ON game_shoes(user_id, room_id);
CREATE UNIQUE INDEX uk_active_shoe_user_room ON game_shoes(user_id, room_id) WHERE status = 'ACTIVE';

CREATE TABLE game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    room_id UUID NOT NULL,
    game_shoe_id UUID NOT NULL,
    original_bet BIGINT NOT NULL,
    total_bet BIGINT NOT NULL,
    total_payout BIGINT NOT NULL DEFAULT 0,
    net_result BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    outcome VARCHAR(50),
    dealer_cards JSONB NOT NULL,
    dealer_total INT NOT NULL DEFAULT 0,
    insurance_bet BIGINT NOT NULL DEFAULT 0,
    insurance_status VARCHAR(50) DEFAULT 'NONE',
    insurance_payout BIGINT NOT NULL DEFAULT 0,
    rules_snapshot JSONB NOT NULL,
    state_version INT NOT NULL DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT fk_round_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_round_room FOREIGN KEY (room_id) REFERENCES game_rooms(id),
    CONSTRAINT fk_round_shoe FOREIGN KEY (game_shoe_id) REFERENCES game_shoes(id)
);
CREATE INDEX idx_game_rounds_user ON game_rounds(user_id);
CREATE UNIQUE INDEX uq_one_active_round_per_user ON game_rounds (user_id) WHERE status IN ('WAITING', 'IN_PROGRESS');

CREATE TABLE game_hands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_round_id UUID NOT NULL,
    hand_number INT NOT NULL DEFAULT 1,
    cards JSONB NOT NULL,
    bet_amount BIGINT NOT NULL,
    hand_value INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    outcome VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hand_round FOREIGN KEY (game_round_id) REFERENCES game_rounds(id) ON DELETE CASCADE
);
CREATE INDEX idx_game_hands_round ON game_hands(game_round_id);

CREATE TABLE game_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_round_id UUID NOT NULL,
    game_hand_id UUID,
    sequence_number INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    action_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_action_round FOREIGN KEY (game_round_id) REFERENCES game_rounds(id) ON DELETE CASCADE,
    CONSTRAINT fk_action_hand FOREIGN KEY (game_hand_id) REFERENCES game_hands(id) ON DELETE SET NULL,
    CONSTRAINT uk_round_sequence UNIQUE (game_round_id, sequence_number)
);
CREATE INDEX idx_game_actions_round ON game_actions(game_round_id);

CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id)
);
CREATE INDEX idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_entity ON admin_audit_logs(entity_type, entity_id);