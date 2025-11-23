-- ============================================================================
-- 🔓 E-MAIL-VERIFIZIERUNG DEAKTIVIEREN
-- ============================================================================
-- WICHTIG: Diese SQL-Query funktioniert NICHT direkt im SQL Editor,
-- da auth.users eine geschützte Tabelle ist!
-- 
-- STATTDESSEN: Nutze die Supabase Dashboard-Einstellungen (siehe unten)
-- ============================================================================

-- ❌ FUNKTIONIERT NICHT (keine Berechtigung):
-- ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT NOW();
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- ============================================================================
-- ✅ RICHTIGE LÖSUNG - Supabase Dashboard:
-- ============================================================================
-- 
-- 1. Gehe zu: https://app.supabase.com
-- 2. Wähle dein Projekt
-- 3. Authentication → Providers → Email
-- 4. Deaktiviere: "Confirm email"
-- 5. Save
-- 
-- 6. Authentication → Users
-- 7. Für jeden "Unconfirmed" User:
--    - Klicke auf ⋮ (drei Punkte)
--    - Wähle "Confirm user"
-- 
-- ============================================================================

-- Überprüfe User-Status (nur zur Ansicht):
SELECT 
  id,
  email,
  email_confirmed_at,
  CASE 
    WHEN email_confirmed_at IS NULL THEN 'Nicht bestätigt'
    ELSE 'Bestätigt'
  END as status,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;
