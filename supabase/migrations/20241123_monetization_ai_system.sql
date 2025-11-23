-- ============================================================================
-- ANPIP MONETIZATION & AI SYSTEM - DATABASE SETUP
-- ============================================================================
-- Run this in Supabase SQL Editor
-- https://app.supabase.com/project/_/sql/new
-- ============================================================================

-- ============================================================================
-- 1. USER COINS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_coins (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  coins INTEGER DEFAULT 0 CHECK (coins >= 0),
  total_spent INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index für schnelle Lookups
CREATE INDEX IF NOT EXISTS idx_user_coins_user_id ON user_coins(user_id);

-- ============================================================================
-- 2. COIN TRANSACTIONS (Purchase History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_intent_id TEXT UNIQUE,
  package_id TEXT,
  coins INTEGER,
  amount_usd DECIMAL(10, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_status ON coin_transactions(status);

-- ============================================================================
-- 3. CREATOR EARNINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS creator_earnings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  coins INTEGER DEFAULT 0,
  pending_payout DECIMAL(10, 2) DEFAULT 0,
  total_paid_out DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_creator_earnings_user_id ON creator_earnings(user_id);

-- ============================================================================
-- 4. GIFTS SENT (Transaction History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gifts_sent (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  gift_id TEXT,
  coins_spent INTEGER,
  creator_earnings INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_sent_from_user ON gifts_sent(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sent_to_user ON gifts_sent(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sent_video ON gifts_sent(video_id);

-- ============================================================================
-- 5. PAYOUTS (Cash-Out History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coins INTEGER,
  usd_amount DECIMAL(10, 2),
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

-- ============================================================================
-- 6. CREATOR PROFILES (Stripe Connect)
-- ============================================================================

CREATE TABLE IF NOT EXISTS creator_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  stripe_account_id TEXT UNIQUE,
  stripe_onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 7. VIDEO INTERACTIONS (AI Recommendation Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  action TEXT CHECK (action IN ('view', 'like', 'share', 'comment', 'skip')),
  duration_watched INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_video_interactions_user_id ON video_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_video_id ON video_interactions(video_id);
CREATE INDEX IF NOT EXISTS idx_video_interactions_created_at ON video_interactions(created_at DESC);

-- ============================================================================
-- 8. REFERRALS
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- ============================================================================
-- 9. SHARE LINKS (Virality Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS share_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_token TEXT REFERENCES share_links(token) ON DELETE CASCADE,
  clicked_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 10. CHALLENGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hashtag TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  prize_pool INTEGER DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS challenge_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_challenge_entries_challenge ON challenge_entries(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_entries_user ON challenge_entries(user_id);

-- ============================================================================
-- 11. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Add coins to user
CREATE OR REPLACE FUNCTION add_user_coins(p_user_id UUID, p_coins INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO user_coins (user_id, coins)
  VALUES (p_user_id, p_coins)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    coins = user_coins.coins + p_coins,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Deduct coins from user
CREATE OR REPLACE FUNCTION deduct_user_coins(p_user_id UUID, p_coins INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE user_coins
  SET 
    coins = coins - p_coins,
    total_spent = total_spent + p_coins,
    updated_at = NOW()
  WHERE user_id = p_user_id AND coins >= p_coins;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough coins';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Add creator earnings
CREATE OR REPLACE FUNCTION add_creator_earnings(p_user_id UUID, p_coins INTEGER)
RETURNS void AS $$
BEGIN
  INSERT INTO creator_earnings (user_id, coins)
  VALUES (p_user_id, p_coins)
  ON CONFLICT (user_id)
  DO UPDATE SET 
    coins = creator_earnings.coins + p_coins,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Process cash-out
CREATE OR REPLACE FUNCTION process_cash_out(
  p_user_id UUID,
  p_coins INTEGER,
  p_usd_amount DECIMAL
)
RETURNS void AS $$
BEGIN
  UPDATE creator_earnings
  SET 
    coins = coins - p_coins,
    total_paid_out = total_paid_out + p_usd_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id AND coins >= p_coins;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Not enough earnings';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- User Coins
ALTER TABLE user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own coins"
  ON user_coins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own coins"
  ON user_coins FOR UPDATE
  USING (auth.uid() = user_id);

-- Creator Earnings
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own earnings"
  ON creator_earnings FOR SELECT
  USING (auth.uid() = user_id);

-- Video Interactions
ALTER TABLE video_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interactions"
  ON video_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interactions"
  ON video_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gifts
ALTER TABLE gifts_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sent/received gifts"
  ON gifts_sent FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Give all existing users 100 welcome coins
INSERT INTO user_coins (user_id, coins)
SELECT id, 100
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- DONE!
-- ============================================================================

-- Verify tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'user_coins',
    'coin_transactions',
    'creator_earnings',
    'gifts_sent',
    'payouts',
    'creator_profiles',
    'video_interactions',
    'referral_codes',
    'referrals',
    'share_links',
    'challenges',
    'notifications'
  )
ORDER BY table_name;
