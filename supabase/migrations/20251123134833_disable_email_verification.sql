-- ============================================================================
-- E-MAIL-VERIFIZIERUNG DEAKTIVIEREN
-- ============================================================================
-- Diese Migration bestätigt alle bestehenden User automatisch
-- ============================================================================

-- Bestätige alle nicht-bestätigten User
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email_confirmed_at IS NULL;

-- Füge Kommentar hinzu für Dokumentation
COMMENT ON TABLE auth.users IS 'E-Mail-Verifizierung deaktiviert - alle User automatisch bestätigt';
