ALTER TABLE chip_transactions
    ADD CONSTRAINT fk_txn_game_round
        FOREIGN KEY (game_round_id) REFERENCES game_rounds(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_txn_purchase
        FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE SET NULL,
    ADD CONSTRAINT fk_txn_daily_reward
        FOREIGN KEY (daily_reward_claim_id) REFERENCES daily_reward_claims(id) ON DELETE SET NULL,
    ADD CONSTRAINT uk_txn_purchase UNIQUE (purchase_id),
    ADD CONSTRAINT uk_txn_daily_reward UNIQUE (daily_reward_claim_id);

CREATE INDEX idx_chip_txn_game_round ON chip_transactions(game_round_id);