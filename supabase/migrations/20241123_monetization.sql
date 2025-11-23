-- ============================================================================
-- IN-APP PURCHASES & MONETIZATION TABLES
-- ============================================================================

-- 1. COIN TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'gift_sent', 'gift_received', 'refund', 'bonus')),
  coins INT NOT NULL,
  amount FLOAT DEFAULT 0, -- Preis in EUR
  currency TEXT DEFAULT 'EUR',
  package_id TEXT,
  gift_id TEXT,
  sender_id UUID REFERENCES auth.users(id),
  recipient_id UUID REFERENCES auth.users(id),
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. GIFTS TABLE
CREATE TABLE IF NOT EXISTS gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  gift_id TEXT NOT NULL,
  coins INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. WITHDRAWALS TABLE (Auszahlungen)
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount FLOAT NOT NULL,
  method TEXT CHECK (method IN ('bank', 'paypal')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  bank_account TEXT,
  paypal_email TEXT,
  processed_at TIMESTAMP,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ADD COLUMNS TO USERS
-- ============================================================================

ALTER TABLE users
ADD COLUMN IF NOT EXISTS coins INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_earnings FLOAT DEFAULT 0;

-- ============================================================================
-- INDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gifts_from_user ON gifts(from_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_to_user ON gifts(to_user_id);
CREATE INDEX IF NOT EXISTS idx_gifts_video_id ON gifts(video_id);
CREATE INDEX IF NOT EXISTS idx_gifts_created_at ON gifts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON coin_transactions
  FOR SELECT USING (user_id = auth.uid());

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view gifts they sent or received" ON gifts
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());
CREATE POLICY "Users can send gifts" ON gifts
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own withdrawals" ON withdrawals
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Funktion: Hole Gesamtzahl Gifts für ein Video
CREATE OR REPLACE FUNCTION get_video_gift_count(video_uuid UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM gifts WHERE video_id = video_uuid;
$$ LANGUAGE SQL;

-- Funktion: Hole Gesamtwert aller Gifts für ein Video
CREATE OR REPLACE FUNCTION get_video_gift_value(video_uuid UUID)
RETURNS INT AS $$
  SELECT COALESCE(SUM(coins), 0)::INT FROM gifts WHERE video_id = video_uuid;
$$ LANGUAGE SQL;

-- Funktion: Top Gifters für einen Creator
CREATE OR REPLACE FUNCTION get_top_gifters(creator_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  total_coins INT,
  gift_count INT
) AS $$
  SELECT 
    from_user_id as user_id,
    SUM(coins)::INT as total_coins,
    COUNT(*)::INT as gift_count
  FROM gifts
  WHERE to_user_id = creator_uuid
  GROUP BY from_user_id
  ORDER BY total_coins DESC
  LIMIT limit_count;
$$ LANGUAGE SQL;

-- ============================================================================
-- DONE
-- ============================================================================

SELECT 'Monetization tables created successfully!' as status;
