-- Beispiel-Abfrage zur Übersicht aller Videos eines Users
SELECT 
  id,
  title,
  status,
  duration,
  view_count,
  created_at
FROM public.videos
WHERE user_id = auth.uid()
ORDER BY created_at DESC;

-- Feed-Videos laden (paginiert)
SELECT 
  id,
  cloudflare_uid,
  title,
  description,
  playback_url,
  thumbnail_url,
  duration,
  view_count,
  like_count,
  comment_count,
  location_name,
  tags,
  created_at
FROM public.videos
WHERE status = 'ready'
  AND is_public = true
  AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 20
OFFSET 0;

-- View Count erhöhen (für API-Endpunkt)
UPDATE public.videos
SET view_count = view_count + 1
WHERE id = 'video-uuid-hier';
