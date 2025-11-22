-- ============================================================================
-- 🔐 COMPLETE AUTH SYSTEM - Database Migration
-- ============================================================================
-- This migration sets up a world-class authentication system with:
-- - User profiles with GDPR compliance
-- - Social login support (Google, Apple, Facebook, Microsoft, LinkedIn)
-- - 2FA support preparation
-- - Session management
-- - Rate limiting & security
-- - Account deletion & data export tracking
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USER PROFILES (erweitert Supabase auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company_name TEXT,
  
  -- Location & Language
  country TEXT,
  preferred_language TEXT DEFAULT 'de',
  
  -- Verification Status
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- 2FA
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_method TEXT CHECK (two_factor_method IN ('totp', 'sms', 'email')),
  two_factor_secret TEXT, -- Encrypted TOTP secret
  backup_codes TEXT[], -- Encrypted backup codes
  
  -- GDPR Consent
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMPTZ,
  data_processing_consent BOOLEAN DEFAULT FALSE,
  marketing_consent BOOLEAN DEFAULT FALSE,
  
  -- Account Status
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'pending_deletion', 'deleted')),
  account_deletion_requested BOOLEAN DEFAULT FALSE,
  account_deletion_date TIMESTAMPTZ,
  account_deletion_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON public.profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON public.profiles(last_login_at DESC);

-- ============================================================================
-- SOCIAL LOGIN CONNECTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'apple', 'facebook', 'microsoft', 'linkedin', 'github')),
  provider_user_id TEXT NOT NULL,
  provider_email TEXT,
  provider_data JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  is_primary BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  
  UNIQUE(provider, provider_user_id),
  UNIQUE(user_id, provider) -- One connection per provider per user
);

CREATE INDEX IF NOT EXISTS idx_social_connections_user_id ON public.social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_provider ON public.social_connections(provider);

-- ============================================================================
-- USER SESSIONS (for session management)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Session Info
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT,
  
  -- Device Info
  device_name TEXT,
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  browser TEXT,
  os TEXT,
  
  -- Location
  ip_address TEXT,
  country TEXT,
  city TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  -- User Agent
  user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- ============================================================================
-- SECURITY: BLOCKED IPs & RATE LIMITING
-- ============================================================================

-- Blocked IPs (already exists, ensure it has correct structure)
CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  blocked_by UUID REFERENCES auth.users(id),
  blocked_until TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_address ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_until ON public.blocked_ips(blocked_until);

-- Login Attempts (for rate limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  identifier TEXT NOT NULL, -- Email or IP
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT FALSE,
  failure_reason TEXT,
  attempted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier ON public.login_attempts(identifier);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON public.login_attempts(attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON public.login_attempts(ip_address);

-- ============================================================================
-- SECURITY EVENTS LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'login_success',
    'login_failed',
    'logout',
    'password_reset_requested',
    'password_reset_completed',
    'password_changed',
    '2fa_enabled',
    '2fa_disabled',
    '2fa_verified',
    'email_verified',
    'phone_verified',
    'profile_updated',
    'social_connected',
    'social_disconnected',
    'session_revoked',
    'account_deletion_requested',
    'suspicious_activity'
  )),
  ip_address TEXT,
  user_agent TEXT,
  location JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at DESC);

-- ============================================================================
-- DATA EXPORT REQUESTS (GDPR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('json', 'csv')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Options
  include_videos BOOLEAN DEFAULT TRUE,
  include_comments BOOLEAN DEFAULT TRUE,
  include_likes BOOLEAN DEFAULT TRUE,
  
  -- Result
  download_url TEXT,
  file_size BIGINT,
  
  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  downloaded_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_data_export_requests_user_id ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_requests_status ON public.data_export_requests(status);

-- ============================================================================
-- ACCOUNT DELETION REQUESTS (GDPR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  feedback TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  
  -- Scheduled deletion (30 days grace period)
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_user_id ON public.account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_status ON public.account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_account_deletion_requests_scheduled ON public.account_deletion_requests(scheduled_for);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, display_name, avatar_url, country, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.raw_user_meta_data->>'display_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'country',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'de')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Public profiles (for creators)
CREATE POLICY profiles_select_public ON public.profiles
  FOR SELECT
  USING (metadata->>'public' = 'true');

-- Social Connections
ALTER TABLE public.social_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY social_connections_own ON public.social_connections
  FOR ALL
  USING (auth.uid() = user_id);

-- User Sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY user_sessions_own ON public.user_sessions
  FOR ALL
  USING (auth.uid() = user_id);

-- Security Events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY security_events_own ON public.security_events
  FOR SELECT
  USING (auth.uid() = user_id);

-- Data Export Requests
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY data_export_requests_own ON public.data_export_requests
  FOR ALL
  USING (auth.uid() = user_id);

-- Account Deletion Requests
ALTER TABLE public.account_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY account_deletion_requests_own ON public.account_deletion_requests
  FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get user's active sessions
CREATE OR REPLACE FUNCTION get_user_sessions(user_uuid UUID)
RETURNS TABLE (
  id UUID,
  device_name TEXT,
  browser TEXT,
  os TEXT,
  ip_address TEXT,
  location TEXT,
  is_current BOOLEAN,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.device_name,
    s.browser,
    s.os,
    s.ip_address,
    CONCAT_WS(', ', s.city, s.country) as location,
    s.session_token = current_setting('request.jwt.claim.session_token', true) as is_current,
    s.last_active_at,
    s.created_at
  FROM public.user_sessions s
  WHERE s.user_id = user_uuid
    AND s.is_active = TRUE
    AND s.expires_at > NOW()
  ORDER BY s.last_active_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke session
CREATE OR REPLACE FUNCTION revoke_session(session_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  affected_rows INT;
BEGIN
  UPDATE public.user_sessions
  SET is_active = FALSE
  WHERE id = session_uuid
    AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke all sessions except current
CREATE OR REPLACE FUNCTION revoke_all_sessions_except_current()
RETURNS INT AS $$
DECLARE
  affected_rows INT;
  current_session_token TEXT;
BEGIN
  current_session_token := current_setting('request.jwt.claim.session_token', true);
  
  UPDATE public.user_sessions
  SET is_active = FALSE
  WHERE user_id = auth.uid()
    AND session_token != current_session_token;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up expired sessions (to be run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INT AS $$
DECLARE
  affected_rows INT;
BEGIN
  DELETE FROM public.user_sessions
  WHERE expires_at < NOW()
    OR (is_active = FALSE AND last_active_at < NOW() - INTERVAL '30 days');
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'Extended user profiles with GDPR compliance';
COMMENT ON TABLE public.social_connections IS 'Social login provider connections';
COMMENT ON TABLE public.user_sessions IS 'Active user sessions for session management';
COMMENT ON TABLE public.security_events IS 'Security audit log';
COMMENT ON TABLE public.data_export_requests IS 'GDPR data export requests';
COMMENT ON TABLE public.account_deletion_requests IS 'GDPR account deletion requests';

-- ============================================================================
-- COMPLETE
-- ============================================================================

-- Notify
DO $$ 
BEGIN
  RAISE NOTICE '✅ Auth System Migration Complete!';
  RAISE NOTICE '📊 Tables created: profiles, social_connections, user_sessions, security_events, data_export_requests, account_deletion_requests';
  RAISE NOTICE '🛡️ RLS Policies enabled on all tables';
  RAISE NOTICE '⚡ Triggers configured for auto-profile creation and timestamps';
  RAISE NOTICE '🔧 Helper functions available: get_user_sessions, revoke_session, revoke_all_sessions_except_current, cleanup_expired_sessions';
END $$;
