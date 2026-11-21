CREATE TABLE chip_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    chips BIGINT NOT NULL,
    bonus_chips BIGINT NOT NULL DEFAULT 0,
    price_in_paise BIGINT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,

    sale_price_in_paise BIGINT,
    sale_name VARCHAR(100),
    sale_start_at TIMESTAMP WITH TIME ZONE,
    sale_end_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chip_wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    balance BIGINT NOT NULL DEFAULT 1000, -- Starting bonus chips
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE chip_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    game_round_id UUID,
    purchase_id UUID,
    daily_reward_claim_id UUID,
    type VARCHAR(50) NOT NULL,
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_key VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_txn_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chip_txn_user ON chip_transactions(user_id);
CREATE INDEX idx_chip_txn_ref ON chip_transactions(reference_key);

CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    plan_name VARCHAR(100) NOT NULL,
    chips_awarded BIGINT NOT NULL,
    amount_in_paise BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_purchase_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_purchase_plan FOREIGN KEY (plan_id) REFERENCES chip_plans(id)
);
CREATE INDEX idx_purchases_user ON purchases(user_id);

CREATE TABLE payment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id UUID NOT NULL,
    razorpay_order_id VARCHAR(255) NOT NULL UNIQUE,
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(255),
    amount_in_paise BIGINT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_purchase FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE
);
CREATE INDEX idx_payment_order_id ON payment_attempts(razorpay_order_id);

CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    payload TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_webhook_event_id ON webhook_events(event_id);