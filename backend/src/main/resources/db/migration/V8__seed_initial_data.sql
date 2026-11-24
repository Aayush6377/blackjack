WITH inserted_admin AS (
INSERT INTO users (
    id, name, email, password_hash, role, token_version, email_verified, enabled
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Platform Admin',
    'admin@blackjack.com',
    '$2y$10$E/Qaay/8upXkzOQivswrx.i9qy/DkCljpmBCfZZpLIDCo.SZnNybO',
    'ADMIN',
    0,
    TRUE,
    TRUE
    )
ON CONFLICT (email) DO NOTHING RETURNING id)


INSERT INTO chip_wallets (user_id, balance)
SELECT id, 1000000
FROM inserted_admin
ON CONFLICT (user_id) DO NOTHING;


INSERT INTO chip_plans (
    id, name, description, chips, bonus_chips, price_in_paise,
    sale_price_in_paise, sale_name, sale_start_at, sale_end_at, active
) VALUES
      (
          '22222222-2222-2222-2222-222222222201',
          'Starter Stack',
          'Perfect for warming up at the beginner tables.',
          1000,
          100,
          9900, -- ₹99.00
          NULL,
          NULL,
          NULL,
          NULL,
          TRUE
      ),
      (
          '22222222-2222-2222-2222-222222222202',
          'Pro Player Bundle',
          'Enough chips to climb into the Royal Lounge.',
          5000,
          1000,
          39900, -- ₹399.00
          29900, -- ₹299.00 Sale Price
          'Launch Week Promo',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP + INTERVAL '30 days',
          TRUE
      ),
      (
          '22222222-2222-2222-2222-222222222203',
          'High Roller Vault',
          'Massive chip stack built for VIP high-stakes tables.',
          25000,
          7500,
          149900, -- ₹1,499.00
          119900, -- ₹1,199.00 Sale Price
          'VIP Bonus Event',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP + INTERVAL '30 days',
          TRUE
      )
ON CONFLICT (id) DO NOTHING;

INSERT INTO game_rooms (
    id, name, slug, description, difficulty,
    min_wallet, min_bet, max_bet, decks_per_shoe, reshuffle_threshold,
    blackjack_payout, dealer_hits_soft_17, active, display_order, thumbnail_url
) VALUES
      (
          '33333333-3333-3333-3333-333333333301',
          'Beginner''s Lounge',
          'beginners-lounge',
          'Single-deck casual table with low stakes. Ideal for learning basic strategy.',
          'BEGINNER',
          100,
          10,
          500,
          1,
          0.75,
          '3:2',
          TRUE,
          TRUE,
          1,
          'https://shazamcasino.com/blog_pages/double-deck-blackjack/Image4.jpg'
      ),
      (
          '33333333-3333-3333-3333-333333333302',
          'Royal Casino',
          'royal-casino',
          '4-deck shoe with higher stakes. Prove your consistency in the Beginner''s Lounge to enter.',
          'INTERMEDIATE',
          1000,
          100,
          2500,
          4,
          0.75,
          '3:2',
          TRUE,
          TRUE,
          2,
          'https://a.storyblok.com/f/161938/1200x675/cae334e271/guide-to-using-blackjack-charts.jpg'
      ),
      (
          '33333333-3333-3333-3333-333333333303',
          'VIP High Roller Suite',
          'vip-high-roller',
          '6-deck Vegas-style shoe with massive limits for seasoned card sharks.',
          'HIGH_ROLLER',
          10000,
          1000,
          25000,
          6,
          0.75,
          '3:2',
          FALSE,
          TRUE,
          3,
          'https://top-comparatif.com/wp-content/uploads/2023/01/casino-black-jack-table-1.jpg'
      )
ON CONFLICT (slug) DO NOTHING;

INSERT INTO room_unlock_rules (
    id, room_id, prerequisite_room_id, required_rounds, required_wins, minimum_wallet
) VALUES
      (
          '44444444-4444-4444-4444-444444444401',
          '33333333-3333-3333-3333-333333333302', -- Unlocks Royal Casino
          '33333333-3333-3333-3333-333333333301', -- Requires Beginner's Lounge
          10,   -- Play at least 10 rounds
          3,    -- Win at least 3 rounds
          1000  -- Hold at least 1,000 chips
      ),
      (
          '44444444-4444-4444-4444-444444444402',
          '33333333-3333-3333-3333-333333333303', -- Unlocks VIP High Roller Suite
          '33333333-3333-3333-3333-333333333302', -- Requires Royal Casino
          25,   -- Play at least 25 rounds
          10,   -- Win at least 10 rounds
          10000 -- Hold at least 10,000 chips
      )
ON CONFLICT (room_id, prerequisite_room_id) DO NOTHING;


-- 5. Seed 7-Day Daily Login Reward Configs
INSERT INTO reward_configs (id, day_number, chips_reward, active) VALUES
    ('55555555-5555-5555-5555-555555555501', 1, 250, TRUE),
    ('55555555-5555-5555-5555-555555555502', 2, 350, TRUE),
    ('55555555-5555-5555-5555-555555555503', 3, 500, TRUE),
    ('55555555-5555-5555-5555-555555555504', 4, 750, TRUE),
    ('55555555-5555-5555-5555-555555555505', 5, 1000, TRUE),
    ('55555555-5555-5555-5555-555555555506', 6, 1500, TRUE),
    ('55555555-5555-5555-5555-555555555507', 7, 2500, TRUE)
ON CONFLICT (day_number) DO NOTHING;