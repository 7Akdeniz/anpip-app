-- ================================================
-- ANPIP AUTOPILOT SYSTEM - DATABASE SCHEMA
-- ================================================
-- Erstellt: 2025-11-21
-- Zweck: Datenbank-Schema für KI-Autopilot-System
-- ================================================

-- ================================================
-- 1. AUTOPILOT LOGS TABLE
-- ================================================
-- Speichert alle Autopilot-Job-Ergebnisse

CREATE TABLE IF NOT EXISTS autopilot_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    job_id TEXT NOT NULL,
    job_name TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT false,
    duration INTEGER NOT NULL, -- in milliseconds
    actions_count INTEGER NOT NULL DEFAULT 0,
    metrics JSONB DEFAULT '{}',
    errors TEXT[],
    warnings TEXT[],
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Indexes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_autopilot_logs_job_id ON autopilot_logs(job_id);
CREATE INDEX idx_autopilot_logs_timestamp ON autopilot_logs(timestamp DESC);
CREATE INDEX idx_autopilot_logs_success ON autopilot_logs(success);

-- ================================================
-- 2. SEO TABLES
-- ================================================

-- City Pages (für GEO-SEO)
CREATE TABLE IF NOT EXISTS city_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    seo_text TEXT,
    content TEXT,
    video_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(city, country)
);

CREATE INDEX idx_city_pages_country ON city_pages(country);
CREATE INDEX idx_city_pages_video_count ON city_pages(video_count DESC);

-- Landing Pages (für Auto-SEO)
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    keyword TEXT NOT NULL,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_keyword ON landing_pages(keyword);
CREATE INDEX idx_landing_pages_views ON landing_pages(views_count DESC);

-- SEO Rankings (für Monitoring)
CREATE TABLE IF NOT EXISTS seo_rankings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    position DECIMAL(4,1),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(keyword, date)
);

CREATE INDEX idx_seo_rankings_keyword ON seo_rankings(keyword);
CREATE INDEX idx_seo_rankings_date ON seo_rankings(date DESC);

-- ================================================
-- 3. GEO TABLES
-- ================================================

-- Regional Trends
CREATE TABLE IF NOT EXISTS regional_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    country TEXT NOT NULL,
    city TEXT,
    category TEXT,
    video_count INTEGER DEFAULT 0,
    engagement_score DECIMAL(10,2) DEFAULT 0,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(country, city, category, date)
);

CREATE INDEX idx_regional_trends_country ON regional_trends(country);
CREATE INDEX idx_regional_trends_date ON regional_trends(date DESC);
CREATE INDEX idx_regional_trends_engagement ON regional_trends(engagement_score DESC);

-- ================================================
-- 4. SECURITY TABLES
-- ================================================

-- Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL UNIQUE,
    reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    permanent BOOLEAN DEFAULT false
);

CREATE INDEX idx_blocked_ips_ip ON blocked_ips(ip_address);
CREATE INDEX idx_blocked_ips_expires ON blocked_ips(expires_at) WHERE expires_at IS NOT NULL;

-- User Flags (Security)
CREATE TABLE IF NOT EXISTS user_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    severity TEXT DEFAULT 'medium', -- low, medium, high, critical
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    action_taken TEXT
);

CREATE INDEX idx_user_flags_user_id ON user_flags(user_id);
CREATE INDEX idx_user_flags_reviewed ON user_flags(reviewed);
CREATE INDEX idx_user_flags_severity ON user_flags(severity);

-- Content Flags (Security)
CREATE TABLE IF NOT EXISTS content_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    flag_count INTEGER DEFAULT 1,
    flagged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    auto_action TEXT -- remove, keep, review
);

CREATE INDEX idx_content_flags_video_id ON content_flags(video_id);
CREATE INDEX idx_content_flags_reviewed ON content_flags(reviewed);

-- ================================================
-- 5. CONTENT QUALITY TABLES
-- ================================================

-- Duplicate Content Detection
CREATE TABLE IF NOT EXISTS duplicate_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id_1 UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    video_id_2 UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    similarity_score DECIMAL(3,2) NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved BOOLEAN DEFAULT false,
    resolution TEXT
);

CREATE INDEX idx_duplicate_content_video1 ON duplicate_content(video_id_1);
CREATE INDEX idx_duplicate_content_video2 ON duplicate_content(video_id_2);
CREATE INDEX idx_duplicate_content_resolved ON duplicate_content(resolved);

-- ================================================
-- 6. EXTEND EXISTING TABLES
-- ================================================

-- Add SEO fields to videos table
ALTER TABLE videos 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT[],
ADD COLUMN IF NOT EXISTS seo_optimized_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS structured_data JSONB,
ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS quality_checked BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS auto_categorized BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS suggested_category TEXT,
ADD COLUMN IF NOT EXISTS has_subtitles BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subtitle_generation_attempted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trending_detected_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS malware_scanned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS malware_safe BOOLEAN DEFAULT true;

-- Add SEO fields to market_categories
ALTER TABLE market_categories
ADD COLUMN IF NOT EXISTS seo_text TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS seo_updated_at TIMESTAMP WITH TIME ZONE;

-- Add security fields to users
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_required BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS security_score INTEGER DEFAULT 100;

-- Indexes for new video fields
CREATE INDEX IF NOT EXISTS idx_videos_seo_optimized ON videos(seo_optimized_at DESC NULLS FIRST);
CREATE INDEX IF NOT EXISTS idx_videos_quality_score ON videos(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_videos_trending ON videos(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_videos_malware_scanned ON videos(malware_scanned) WHERE malware_scanned = false;

-- ================================================
-- 7. DATABASE FUNCTIONS
-- ================================================

-- Function: Get Top Cities
CREATE OR REPLACE FUNCTION get_top_cities(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    city TEXT,
    country TEXT,
    video_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.location_city as city,
        v.location_country as country,
        COUNT(*)::BIGINT as video_count
    FROM videos v
    WHERE v.location_city IS NOT NULL
      AND v.location_country IS NOT NULL
    GROUP BY v.location_city, v.location_country
    ORDER BY video_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Regional Trends
CREATE OR REPLACE FUNCTION get_regional_trends(days INTEGER DEFAULT 7)
RETURNS TABLE (
    country TEXT,
    city TEXT,
    category TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.location_country as country,
        v.location_city as city,
        mc.name_en as category,
        COUNT(*)::BIGINT as count
    FROM videos v
    LEFT JOIN market_categories mc ON v.market_id = mc.id
    WHERE v.created_at >= NOW() - (days || ' days')::INTERVAL
      AND v.location_country IS NOT NULL
    GROUP BY v.location_country, v.location_city, mc.name_en
    HAVING COUNT(*) > 5
    ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Trending Videos
CREATE OR REPLACE FUNCTION get_trending_videos(
    hours INTEGER DEFAULT 24,
    min_views INTEGER DEFAULT 100
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    views_count INTEGER,
    engagement_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        v.id,
        v.title,
        v.views_count,
        CASE 
            WHEN v.views_count > 0 
            THEN (v.likes_count::DECIMAL / v.views_count::DECIMAL)
            ELSE 0
        END as engagement_rate
    FROM videos v
    WHERE v.created_at >= NOW() - (hours || ' hours')::INTERVAL
      AND v.views_count >= min_views
    ORDER BY 
        (v.views_count::DECIMAL / EXTRACT(EPOCH FROM (NOW() - v.created_at))) DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on new tables
ALTER TABLE autopilot_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_content ENABLE ROW LEVEL SECURITY;

-- Public read access to SEO pages
CREATE POLICY "Public read access to city pages"
    ON city_pages FOR SELECT
    USING (true);

CREATE POLICY "Public read access to landing pages"
    ON landing_pages FOR SELECT
    USING (true);

-- Admin-only access to autopilot logs
CREATE POLICY "Admin access to autopilot logs"
    ON autopilot_logs
    USING (auth.jwt() ->> 'role' = 'admin');

-- Service role full access to all tables
CREATE POLICY "Service role full access to autopilot_logs"
    ON autopilot_logs
    USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role full access to blocked_ips"
    ON blocked_ips
    USING (auth.jwt() ->> 'role' = 'service_role');

-- ================================================
-- 9. TRIGGERS
-- ================================================

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_city_pages_updated_at
    BEFORE UPDATE ON city_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at
    BEFORE UPDATE ON landing_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 10. INITIAL DATA
-- ================================================

-- Insert initial autopilot configuration
CREATE TABLE IF NOT EXISTS autopilot_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    enabled BOOLEAN DEFAULT true,
    debug BOOLEAN DEFAULT false,
    dry_run BOOLEAN DEFAULT false,
    services JSONB DEFAULT '{
        "seo": true,
        "geo": true,
        "performance": true,
        "security": true,
        "content": true,
        "healing": true,
        "trends": true,
        "business": true,
        "planning": true
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO autopilot_config (enabled) 
VALUES (true)
ON CONFLICT DO NOTHING;

-- ================================================
-- MIGRATION COMPLETE
-- ================================================

COMMENT ON TABLE autopilot_logs IS 'Logs von allen Autopilot-Jobs';
COMMENT ON TABLE city_pages IS 'SEO-optimierte Stadt-Seiten';
COMMENT ON TABLE landing_pages IS 'Automatisch generierte Landing Pages';
COMMENT ON TABLE seo_rankings IS 'SEO Ranking Monitoring';
COMMENT ON TABLE regional_trends IS 'Regionale Trend-Daten';
COMMENT ON TABLE blocked_ips IS 'Blockierte IP-Adressen (DDoS/Security)';
COMMENT ON TABLE user_flags IS 'Verdächtige User (Security)';
COMMENT ON TABLE content_flags IS 'Gemeldeter/Verdächtiger Content';
COMMENT ON TABLE duplicate_content IS 'Duplicate Content Detection';
