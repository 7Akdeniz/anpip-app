-- ============================================================================
-- FIX: VIDEO INSERT RLS POLICY
-- ============================================================================
-- Problem: Authenticated users können keine Videos erstellen (INSERT hängt)
-- Lösung: INSERT Policy für authenticated users hinzufügen
-- ============================================================================

-- 1. Lösche alte Policies falls vorhanden
DROP POLICY IF EXISTS "Users can insert own videos" ON videos;
DROP POLICY IF EXISTS "Authenticated users can create videos" ON videos;

-- 2. Erstelle INSERT Policy für authentifizierte User
CREATE POLICY "Authenticated users can create videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    -- User muss authenticated sein (automatisch durch TO authenticated)
    -- Zusätzliche Checks können hier hinzugefügt werden
    TRUE
  );

-- 3. UPDATE Policy für eigene Videos
DROP POLICY IF EXISTS "Users can update own videos" ON videos;
CREATE POLICY "Users can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 4. DELETE Policy für eigene Videos  
DROP POLICY IF EXISTS "Users can delete own videos" ON videos;
CREATE POLICY "Users can delete own videos"
  ON videos FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- KOMMENTAR
-- ============================================================================
COMMENT ON POLICY "Authenticated users can create videos" ON videos IS 
  'Erlaubt authentifizierten Usern, Videos zu erstellen. Video wird automatisch mit ihrer user_id verknüpft.';

COMMENT ON POLICY "Users can update own videos" ON videos IS 
  'User können nur ihre eigenen Videos bearbeiten';

COMMENT ON POLICY "Users can delete own videos" ON videos IS 
  'User können nur ihre eigenen Videos löschen';
