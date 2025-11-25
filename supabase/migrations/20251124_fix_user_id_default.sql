-- ============================================================================
-- EMERGENCY FIX: user_id DEFAULT
-- ============================================================================
-- Problem: INSERT hängt weil user_id fehlt, aber Code-Änderungen werden nicht geladen
-- Lösung: user_id automatisch setzen mit DEFAULT auth.uid()
-- ============================================================================

-- user_id Spalte auf DEFAULT setzen (statt NOT NULL ohne DEFAULT)
ALTER TABLE videos 
  ALTER COLUMN user_id SET DEFAULT auth.uid();

-- Jetzt kann INSERT auch ohne user_id funktionieren - wird automatisch gesetzt!
