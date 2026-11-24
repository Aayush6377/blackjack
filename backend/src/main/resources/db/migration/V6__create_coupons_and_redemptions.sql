CREATE TABLE coupons (
    id UUID PRIMARY KEY,
    code VARCHAR(60) NOT NULL UNIQUE,
    description VARCHAR(255),
    chip_reward BIGINT NOT NULL,
    max_uses_per_user INTEGER NOT NULL DEFAULT 1,
    max_total_uses INTEGER,
    times_redeemed BIGINT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_active_window ON coupons (active, starts_at, expires_at);

CREATE TABLE coupon_redemptions (
    id UUID PRIMARY KEY,
    coupon_id UUID,
    user_id UUID NOT NULL,
    coupon_code_snapshot VARCHAR(255) NOT NULL,
    chips_awarded BIGINT NOT NULL,
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_coupon_redemptions_coupon FOREIGN KEY (coupon_id) REFERENCES coupons (id) ON DELETE SET NULL,
    CONSTRAINT fk_coupon_redemptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_coupon_redemptions_coupon_user ON coupon_redemptions (coupon_id, user_id);
CREATE INDEX idx_coupon_redemptions_user ON coupon_redemptions (user_id);