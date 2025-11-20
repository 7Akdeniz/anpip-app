-- Fix RLS Policy für videos-raw Bucket
-- Problem: Die alte Policy verlangt User-Ordner-Struktur, aber App lädt direkt hoch

-- 1. Alte Policies löschen
DROP POLICY IF EXISTS "Users can upload own videos to raw bucket" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own raw videos" ON storage.objects;
DROP POLICY IF EXISTS "Service role can delete raw videos" ON storage.objects;

-- 2. Neue einfache Policies erstellen
-- Jeder authentifizierte User kann zu videos-raw hochladen
CREATE POLICY "Authenticated users can upload to videos-raw"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos-raw');

-- Jeder authentifizierte User kann videos-raw Videos lesen
CREATE POLICY "Users can read videos-raw"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos-raw');

-- Service Role kann videos-raw Videos löschen (für Cleanup nach Komprimierung)
CREATE POLICY "Service role can delete from videos-raw"
ON storage.objects FOR DELETE
TO service_role
USING (bucket_id = 'videos-raw');

-- Fertig! Jetzt sollte Upload funktionieren.
