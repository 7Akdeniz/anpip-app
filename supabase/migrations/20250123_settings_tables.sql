-- ============================================================================
-- 🗄️ SETTINGS TABLES MIGRATION - Anpip.com
-- ============================================================================
-- Diese Migration erstellt alle benötigten Tabellen für das Einstellungsmenü
-- ============================================================================

-- Notification Settings Table
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  comments BOOLEAN DEFAULT true,
  followers BOOLEAN DEFAULT true,
  likes BOOLEAN DEFAULT true,
  messages BOOLEAN DEFAULT true,
  mentions BOOLEAN DEFAULT true,
  group_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Privacy Settings Table
CREATE TABLE IF NOT EXISTS privacy_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_private BOOLEAN DEFAULT false,
  who_can_find_me VARCHAR(20) DEFAULT 'everyone' CHECK (who_can_find_me IN ('everyone', 'nobody', 'verified')),
  who_can_follow VARCHAR(20) DEFAULT 'everyone' CHECK (who_can_follow IN ('everyone', 'nobody', 'verified')),
  who_can_see_videos VARCHAR(20) DEFAULT 'everyone' CHECK (who_can_see_videos IN ('everyone', 'followers', 'nobody')),
  show_in_suggestions BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Location Settings Table
CREATE TABLE IF NOT EXISTS location_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_detect BOOLEAN DEFAULT true,
  country VARCHAR(100),
  city VARCHAR(100),
  suggest_for_market BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Media Settings Table
CREATE TABLE IF NOT EXISTS media_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  autoplay BOOLEAN DEFAULT true,
  autoplay_wifi_only BOOLEAN DEFAULT false,
  default_sound BOOLEAN DEFAULT true,
  always_show_captions BOOLEAN DEFAULT false,
  video_quality VARCHAR(10) DEFAULT 'auto' CHECK (video_quality IN ('auto', 'low', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Payment Methods Table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('card', 'paypal', 'apple_pay', 'google_pay')),
  last_four VARCHAR(4),
  is_default BOOLEAN DEFAULT false,
  expiry VARCHAR(7), -- Format: MM/YYYY
  stripe_payment_method_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  next_billing_date TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocked Users Table
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id),
  CHECK (user_id != blocked_user_id)
);

-- Login History Table
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device VARCHAR(255),
  location VARCHAR(255),
  ip_address INET,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  user_agent TEXT
);

-- User Sessions Table (Active Devices)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  location VARCHAR(255),
  ip_address INET,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_current BOOLEAN DEFAULT false,
  session_token VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_user_id ON privacy_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_location_settings_user_id ON location_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_media_settings_user_id ON media_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_user_id ON blocked_users(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Notification Settings RLS
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY notification_settings_select_own ON notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY notification_settings_insert_own ON notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY notification_settings_update_own ON notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Privacy Settings RLS
ALTER TABLE privacy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY privacy_settings_select_own ON privacy_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY privacy_settings_insert_own ON privacy_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY privacy_settings_update_own ON privacy_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Location Settings RLS
ALTER TABLE location_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY location_settings_select_own ON location_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY location_settings_insert_own ON location_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY location_settings_update_own ON location_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Media Settings RLS
ALTER TABLE media_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY media_settings_select_own ON media_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY media_settings_insert_own ON media_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY media_settings_update_own ON media_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Payment Methods RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_methods_select_own ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payment_methods_insert_own ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY payment_methods_update_own ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY payment_methods_delete_own ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_own ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY subscriptions_insert_own ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY subscriptions_update_own ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Blocked Users RLS
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY blocked_users_select_own ON blocked_users
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY blocked_users_insert_own ON blocked_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY blocked_users_delete_own ON blocked_users
  FOR DELETE USING (auth.uid() = user_id);

-- Login History RLS
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY login_history_select_own ON login_history
  FOR SELECT USING (auth.uid() = user_id);

-- User Sessions RLS
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_sessions_select_own ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_sessions_insert_own ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_sessions_delete_own ON user_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_location_settings_updated_at
  BEFORE UPDATE ON location_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_settings_updated_at
  BEFORE UPDATE ON media_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT SETTINGS FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default notification settings
  INSERT INTO notification_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default privacy settings
  INSERT INTO privacy_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default location settings
  INSERT INTO location_settings (user_id)
  VALUES (NEW.id);
  
  -- Create default media settings
  INSERT INTO media_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default settings on user signup
CREATE TRIGGER on_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's full settings
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'notifications', (SELECT row_to_json(n.*) FROM notification_settings n WHERE n.user_id = p_user_id),
    'privacy', (SELECT row_to_json(p.*) FROM privacy_settings p WHERE p.user_id = p_user_id),
    'location', (SELECT row_to_json(l.*) FROM location_settings l WHERE l.user_id = p_user_id),
    'media', (SELECT row_to_json(m.*) FROM media_settings m WHERE m.user_id = p_user_id)
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notification_settings IS 'User notification preferences';
COMMENT ON TABLE privacy_settings IS 'User privacy and visibility settings';
COMMENT ON TABLE location_settings IS 'User location preferences';
COMMENT ON TABLE media_settings IS 'User media playback preferences';
COMMENT ON TABLE payment_methods IS 'User payment methods for subscriptions';
COMMENT ON TABLE subscriptions IS 'User premium subscriptions';
COMMENT ON TABLE blocked_users IS 'List of blocked users per user';
COMMENT ON TABLE login_history IS 'Login attempt history for security';
COMMENT ON TABLE user_sessions IS 'Active user sessions across devices';
