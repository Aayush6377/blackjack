CREATE TABLE reward_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_number INT NOT NULL UNIQUE,
    chips_reward BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE daily_reward_claims (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID NOT NULL,
     reward_config_id UUID NOT NULL,
     reward_date DATE NOT NULL,
     chips_credited BIGINT NOT NULL,
     claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT fk_claim_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
     CONSTRAINT fk_claim_config FOREIGN KEY (reward_config_id) REFERENCES reward_configs(id),
     CONSTRAINT uk_user_reward_date UNIQUE (user_id, reward_date)
);
CREATE INDEX idx_daily_claim_user ON daily_reward_claims(user_id);