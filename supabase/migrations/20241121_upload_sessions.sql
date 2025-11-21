-- =====================================================
-- UPLOAD SESSIONS TABLE
-- =====================================================
-- Speichert Upload-Sessions für Resumable Uploads
-- =====================================================

CREATE TABLE IF NOT EXISTS upload_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  upload_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  upload_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'initializing',
  chunks_total INTEGER NOT NULL,
  chunks_uploaded INTEGER DEFAULT 0,
  uploaded_chunks INTEGER[] DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Index für schnelle Abfragen
CREATE INDEX idx_upload_sessions_upload_id ON upload_sessions(upload_id);
CREATE INDEX idx_upload_sessions_user_id ON upload_sessions(user_id);
CREATE INDEX idx_upload_sessions_status ON upload_sessions(status);
CREATE INDEX idx_upload_sessions_expires_at ON upload_sessions(expires_at);

-- RLS Policies
ALTER TABLE upload_sessions ENABLE ROW LEVEL SECURITY;

-- User kann nur eigene Sessions sehen
CREATE POLICY "Users can view own upload sessions"
  ON upload_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- User kann eigene Sessions updaten
CREATE POLICY "Users can update own upload sessions"
  ON upload_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-Update updated_at
CREATE OR REPLACE FUNCTION update_upload_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER upload_sessions_updated_at
  BEFORE UPDATE ON upload_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_upload_sessions_updated_at();

-- Cleanup abgelaufener Sessions (täglich via Cron)
CREATE OR REPLACE FUNCTION cleanup_expired_upload_sessions()
RETURNS void AS $$
BEGIN
  -- Lösche abgelaufene Sessions
  DELETE FROM upload_sessions
  WHERE expires_at < NOW()
    AND status IN ('initializing', 'uploading', 'error');
    
  -- Lösche zugehörige temporäre Dateien aus Storage
  -- (wird von separatem Worker erledigt)
END;
$$ LANGUAGE plpgsql;

-- Kommentare
COMMENT ON TABLE upload_sessions IS 'Tracks chunked upload sessions for resume capability';
COMMENT ON COLUMN upload_sessions.upload_id IS 'Client-generated unique upload identifier';
COMMENT ON COLUMN upload_sessions.uploaded_chunks IS 'Array of successfully uploaded chunk indices';
COMMENT ON COLUMN upload_sessions.expires_at IS 'Session expiration time (7 days default)';
