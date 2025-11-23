# 🧪 AUTH TESTING GUIDE

## ✅ App läuft auf http://localhost:8081

## 📋 Test-Schritte

### 1️⃣ E-Mail/Passwort-Registrierung testen

1. Öffne http://localhost:8081 im Browser
2. Navigiere zu Registrierung
3. Fülle folgende Testdaten ein:
   ```
   Vorname: Test
   Nachname: User
   E-Mail: test@example.com
   Passwort: Test123!@# (erfüllt alle Anforderungen)
   Land: DE
   Sprache: de
   ✓ AGB akzeptieren
   ✓ Datenschutz akzeptieren
   ```
4. Klicke auf "Registrieren"
5. **Erwartetes Ergebnis:**
   - ✅ Success-Alert: "Willkommen! 🎉"
   - ✅ Weiterleitung zu /(tabs)
   - ✅ In Console: "✅ Registrierung erfolgreich"

### 2️⃣ E-Mail/Passwort-Login testen

1. Gehe zurück zu Login
2. Login mit:
   ```
   E-Mail: test@example.com
   Passwort: Test123!@#
   ```
3. **Erwartetes Ergebnis:**
   - ✅ Erfolgreicher Login
   - ✅ Weiterleitung zu /(tabs)
   - ✅ In Console: "✅ Login erfolgreich"

### 3️⃣ Google Login testen

1. Gehe zu Login-Seite
2. Klicke auf "Mit Google anmelden"
3. **Erwartetes Ergebnis:**
   - ✅ Browser-Weiterleitung zu Google OAuth
   - ✅ In Console: "🔐 Google Login wird gestartet..."
   - ✅ In Console: "🔗 Weiterleitung zu Google OAuth..."
4. Wähle Google-Account aus
5. **Nach Bestätigung:**
   - ✅ Weiterleitung zu /auth/google/callback
   - ✅ In Console: "✅ Google Login erfolgreich"
   - ✅ Weiterleitung zu /(tabs)

### 4️⃣ Fehlerfall: Schwaches Passwort

1. Gehe zu Registrierung
2. Verwende Passwort: "123"
3. **Erwartetes Ergebnis:**
   - ❌ Fehlermeldung: "Passwort muss mindestens 8 Zeichen lang sein"
   - ❌ Registrierung wird blockiert

### 5️⃣ Fehlerfall: Existierende E-Mail

1. Versuche nochmal mit test@example.com zu registrieren
2. **Erwartetes Ergebnis:**
   - ❌ Fehlermeldung von Supabase: "E-Mail bereits registriert"
   - ❌ Alert-Dialog mit Fehlermeldung

### 6️⃣ Fehlerfall: Falsches Login

1. Login mit falschen Credentials
2. **Erwartetes Ergebnis:**
   - ❌ Fehlermeldung: "E-Mail oder Passwort ist falsch"
   - ❌ Alert-Dialog mit Fehlermeldung

## 🔍 Debugging

### Browser Console öffnen
1. Drücke F12
2. Gehe zu "Console" Tab
3. Beobachte Logs während Auth-Vorgängen

### Wichtige Console-Messages

**Registrierung:**
```
📝 Starte Registrierung...
[AuthService] Registration successful: test@example.com
✅ Registrierung erfolgreich
```

**Login:**
```
🔐 Starte Login...
[AuthService] Login successful
✅ Login erfolgreich
```

**Google Login:**
```
🔐 Google Login wird gestartet...
🔗 Weiterleitung zu Google OAuth...
   Redirect URI: http://localhost:8081/auth/google/callback
   Return URL: /(tabs)
```

**Google Callback:**
```
🔄 Tausche Authorization Code gegen Token...
   Redirect URI: http://localhost:8081/auth/google/callback
✅ Token erfolgreich erhalten
✅ User-Info erhalten: user@gmail.com
🔐 Erstelle Supabase Session...
✅ Session erfolgreich erstellt
✅ Google Login erfolgreich: {...}
```

## ⚠️ Bekannte Einschränkungen

1. **Google Login nur im Browser**
   - Funktioniert nicht in Expo Go App
   - Nur auf Web verfügbar

2. **E-Mail Verifizierung**
   - Supabase sendet Verifizierungs-E-Mails
   - Check Spam-Ordner
   - In Dev-Umgebung: Verifizierung optional

3. **Session Persistence**
   - Sessions werden in LocalStorage gespeichert
   - Bleiben nach Browser-Reload erhalten

## 🐛 Troubleshooting

### Problem: "EXPO_PUBLIC_GOOGLE_CLIENT_ID nicht konfiguriert"
**Lösung:**
```bash
cat .env | grep GOOGLE_CLIENT_ID
# Sollte ausgeben: EXPO_PUBLIC_GOOGLE_CLIENT_ID=335919974674-...
```

### Problem: Google Login öffnet sich nicht
**Checkliste:**
- [ ] Im Browser (nicht Expo Go)
- [ ] Console für Fehler checken
- [ ] .env Datei korrekt
- [ ] App neu gestartet

### Problem: "Failed to create session"
**Lösung:**
1. Gehe zu Supabase Dashboard
2. Authentication → Providers
3. Prüfe ob Google aktiviert ist
4. Prüfe Client ID und Secret

### Problem: Registrierung schlägt fehl
**Console-Log prüfen:**
```
❌ Registrierung fehlgeschlagen: {error}
```
Häufige Ursachen:
- Supabase URL/Key falsch
- Netzwerk-Problem
- Passwort erfüllt Anforderungen nicht

## ✅ Success Criteria

- [ ] E-Mail/Passwort-Registrierung funktioniert
- [ ] E-Mail/Passwort-Login funktioniert
- [ ] Google Login redirected zu Google
- [ ] Google Callback funktioniert
- [ ] Fehler werden klar angezeigt (Alert + Console)
- [ ] Navigation nach Login funktioniert

