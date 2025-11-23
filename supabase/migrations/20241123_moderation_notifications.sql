-- ============================================================================
-- MODERATION & NOTIFICATIONS TABLES
-- ============================================================================
-- Erstelle Tabellen für Content-Moderation und Push-Notifications
-- ============================================================================

-- 1. MODERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS moderation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('APPROVED', 'FLAGGED', 'BLOCKED', 'REVIEWING')),
  confidence FLOAT DEFAULT 0,
  labels TEXT[] DEFAULT '{}',
  reason TEXT,
  review_required BOOLEAN DEFAULT false,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. REPORTS TABLE (User-Reports)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follower', 'reply', 'mention', 'duet', 'gift', 'live')),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  comment_id UUID,
  gift_id UUID,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. USER INTERACTION TRACKING (für Recommendation Algorithm)
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watch_time INT DEFAULT 0, -- Sekunden
  completion_rate FLOAT DEFAULT 0, -- 0-1
  liked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  saved BOOLEAN DEFAULT false,
  reported BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, video_id, created_at)
);

-- ============================================================================
-- INDICES
-- ============================================================================

-- Moderation Logs
CREATE INDEX IF NOT EXISTS idx_moderation_logs_video_id ON moderation_logs(video_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_status ON moderation_logs(status);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_created_at ON moderation_logs(created_at DESC);

-- Reports
CREATE INDEX IF NOT EXISTS idx_reports_video_id ON reports(video_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- User Interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_video_id ON user_interactions(video_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_liked ON user_interactions(liked) WHERE liked = true;

-- ============================================================================
-- ADD COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Videos: Add moderation fields
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'APPROVED' CHECK (moderation_status IN ('APPROVED', 'FLAGGED', 'BLOCKED', 'REVIEWING')),
ADD COLUMN IF NOT EXISTS block_reason TEXT;

-- Users: Add notification fields
ALTER TABLE users
ADD COLUMN IF NOT EXISTS push_token TEXT,
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_likes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_comments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_followers BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_mentions BOOLEAN DEFAULT true;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Moderation Logs: Nur Admins können sehen
ALTER TABLE moderation_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view moderation logs" ON moderation_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin')
  );

-- Reports: User kann eigene Reports sehen
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (reporter_id = auth.uid());

-- Notifications: User kann nur eigene sehen
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- User Interactions: User kann nur eigene sehen
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own interactions" ON user_interactions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own interactions" ON user_interactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Funktion: Ungelesene Notifications zählen
CREATE OR REPLACE FUNCTION get_unread_count(user_uuid UUID)
RETURNS INT AS $$
  SELECT COUNT(*)::INT FROM notifications 
  WHERE user_id = user_uuid AND read = false;
$$ LANGUAGE SQL;

-- Funktion: Auto-Flag bei 5+ Reports
CREATE OR REPLACE FUNCTION check_report_threshold()
RETURNS TRIGGER AS $$
BEGIN
  -- Zähle Reports für dieses Video
  IF (SELECT COUNT(*) FROM reports WHERE video_id = NEW.video_id) >= 5 THEN
    -- Setze Video auf REVIEWING
    UPDATE videos 
    SET moderation_status = 'REVIEWING', visibility = 'private'
    WHERE id = NEW.video_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_reports
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION check_report_threshold();

-- ============================================================================
-- DONE
-- ============================================================================

-- Prüfe ob alles erstellt wurde
SELECT 
  'Tables created:' as status,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('moderation_logs', 'reports', 'notifications', 'user_interactions');

SELECT 'Migration completed successfully!' as status;
