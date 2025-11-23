-- ==================================================
-- FIX: Lösche den fehlerhaften Auth-Trigger
-- ==================================================
-- Dieser Trigger verursacht "Database error saving new user"
-- weil die handle_new_user() Funktion fehlschlägt

-- Lösche den Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Bestätige dass er gelöscht wurde
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM 
    information_schema.triggers
WHERE 
    trigger_schema = 'auth'
ORDER BY 
    trigger_name;

-- Wenn die Abfrage 0 Zeilen zurückgibt, wurde der Trigger erfolgreich gelöscht!
