-- Prüfe ob auth.users existiert und zeige die Struktur
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'auth' 
AND table_name = 'users';
