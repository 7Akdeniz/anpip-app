-- Fix CORS settings for anpip.com domain
-- Run this in your Supabase SQL Editor

-- Note: CORS is typically configured in Supabase Dashboard under Settings > API
-- If you need to configure allowed origins, go to:
-- https://supabase.com/dashboard/project/fkmhucsjybyhjrgodwcx/settings/api

-- Ensure these origins are allowed:
-- - https://anpip.com
-- - https://www.anpip.com
-- - https://*.anpip.com
-- - http://localhost:8081 (for development)

-- This file is just a reminder. CORS configuration is done in Supabase Dashboard.
-- No SQL needed for CORS settings in Supabase.

-- If you're using RLS policies, ensure they allow public access for public videos:
ALTER TABLE IF EXISTS videos ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Public videos are viewable by everyone" ON videos;

-- Recreate policy for public access
CREATE POLICY "Public videos are viewable by everyone"
ON videos FOR SELECT
USING (visibility = 'public');

-- Ensure authenticated users can view their own videos
DROP POLICY IF EXISTS "Users can view their own videos" ON videos;

CREATE POLICY "Users can view their own videos"
ON videos FOR SELECT
USING (auth.uid() = user_id);

-- Ensure public access to profiles
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);
