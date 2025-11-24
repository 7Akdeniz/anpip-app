-- ============================================================================
-- SECURITY INFRASTRUCTURE - DATABASE SCHEMA
-- ============================================================================
-- Vollständige Datenbank-Struktur für militärische Sicherheit
-- 
-- Tabellen:
-- - blocked_ips: IP-Blacklist
-- - security_events: Alle Sicherheitsereignisse
-- - security_alerts: Active Security Alerts
-- - audit_logs: GDPR Compliance Audit Trail
-- - consent_records: GDPR Consent Management
-- - data_export_requests: GDPR Data Export
-- - data_deletion_requests: GDPR Right to Erasure
-- - user_2fa: Two-Factor Authentication
-- - security_incidents: Data Breach Log
-- ============================================================================

-- ============================================================================
-- 1. BLOCKED IPS (DDoS Protection)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  reason TEXT,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  auto_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip ON public.blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_until ON public.blocked_ips(blocked_until);

-- ============================================================================
-- 2. SECURITY EVENTS (Monitoring)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON public.security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_timestamp ON public.security_events(timestamp DESC);

-- ============================================================================
-- 3. SECURITY ALERTS (Active Threats)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_security_alerts_resolved ON public.security_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_security_alerts_timestamp ON public.security_alerts(timestamp DESC);

-- ============================================================================
-- 4. AUDIT LOGS (GDPR Compliance)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- ============================================================================
-- 5. CONSENT RECORDS (GDPR)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consent_records_user ON public.consent_records(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_records_type ON public.consent_records(consent_type);

-- ============================================================================
-- 6. DATA EXPORT REQUESTS (GDPR Article 15)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  download_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_data_export_user ON public.data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_export_status ON public.data_export_requests(status);

-- ============================================================================
-- 7. DATA DELETION REQUESTS (GDPR Article 17)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scheduled_deletion TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'processing', 'completed')),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_user ON public.data_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_deletion_status ON public.data_deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_data_deletion_scheduled ON public.data_deletion_requests(scheduled_deletion);

-- ============================================================================
-- 8. TWO-FACTOR AUTHENTICATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_2fa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_2fa_user ON public.user_2fa(user_id);
CREATE INDEX IF NOT EXISTS idx_user_2fa_enabled ON public.user_2fa(enabled);

-- ============================================================================
-- 9. SECURITY INCIDENTS (Data Breaches)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  affected_users UUID[] DEFAULT '{}',
  details JSONB NOT NULL,
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT
);

CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON public.security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_reported ON public.security_incidents(reported_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Blocked IPs: Admin only
ALTER TABLE public.blocked_ips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage blocked IPs"
  ON public.blocked_ips
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Security Events: Admin + own events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security events"
  ON public.security_events
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all security events"
  ON public.security_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Security Alerts: Admin only
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security alerts"
  ON public.security_alerts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Audit Logs: Users can view own
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Consent Records: Users can view/insert own
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consent records"
  ON public.consent_records
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own consent records"
  ON public.consent_records
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Data Export Requests: Users can manage own
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own export requests"
  ON public.data_export_requests
  FOR ALL
  USING (user_id = auth.uid());

-- Data Deletion Requests: Users can manage own
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own deletion requests"
  ON public.data_deletion_requests
  FOR ALL
  USING (user_id = auth.uid());

-- 2FA: Users can manage own
ALTER TABLE public.user_2fa ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own 2FA"
  ON public.user_2fa
  FOR ALL
  USING (user_id = auth.uid());

-- Security Incidents: Admin only
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage security incidents"
  ON public.security_incidents
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Auto-cleanup old security events (keep 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_security_events()
RETURNS void AS $$
BEGIN
  DELETE FROM public.security_events
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;

-- Auto-cleanup expired IP blocks
CREATE OR REPLACE FUNCTION cleanup_expired_ip_blocks()
RETURNS void AS $$
BEGIN
  DELETE FROM public.blocked_ips
  WHERE blocked_until < NOW();
END;
$$ LANGUAGE plpgsql;

-- Log security event helper
CREATE OR REPLACE FUNCTION log_security_event(
  p_event_type TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_path TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.security_events (event_type, ip_address, user_id, path, details)
  VALUES (p_event_type, p_ip_address, p_user_id, p_path, p_details)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Log auth events
CREATE OR REPLACE FUNCTION log_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_security_event('user_created', NULL, NEW.id, NULL, NULL);
  ELSIF TG_OP = 'UPDATE' AND OLD.last_sign_in_at <> NEW.last_sign_in_at THEN
    PERFORM log_security_event('user_login', NULL, NEW.id, NULL, NULL);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_event
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION log_auth_event();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE public.blocked_ips IS 'IP addresses blocked due to security violations';
COMMENT ON TABLE public.security_events IS 'Log of all security-related events';
COMMENT ON TABLE public.security_alerts IS 'Active security alerts requiring attention';
COMMENT ON TABLE public.audit_logs IS 'GDPR-compliant audit trail of all data access';
COMMENT ON TABLE public.consent_records IS 'GDPR consent management records';
COMMENT ON TABLE public.data_export_requests IS 'GDPR data export requests (Article 15)';
COMMENT ON TABLE public.data_deletion_requests IS 'GDPR data deletion requests (Article 17)';
COMMENT ON TABLE public.user_2fa IS 'Two-factor authentication secrets and backup codes';
COMMENT ON TABLE public.security_incidents IS 'Major security incidents including data breaches';
