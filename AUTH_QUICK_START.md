# 🚀 AUTH SYSTEM - QUICK START GUIDE

Dieses Guide hilft dir, das Anpip Auth-System in 10 Minuten einzurichten.

---

## ⚡ 5-Minuten Setup (Minimal)

### 1. Supabase Projekt erstellen

```bash
# Gehe zu https://supabase.com
# Erstelle ein neues Projekt
# Warte ~2 Minuten bis DB bereit ist
```

### 2. Environment Variables

```bash
# Kopiere Example-File
cp .env.example .env.local

# Öffne .env.local und füge ein:
EXPO_PUBLIC_SUPABASE_URL=https://[dein-projekt].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
EXPO_PUBLIC_APP_URL=http://localhost:8081
```

Finde deine Keys: Supabase Dashboard → Settings → API

### 3. Database Migration

```bash
# Mit Supabase CLI
npx supabase db push

# Oder manuell in Supabase SQL Editor:
# Kopiere Inhalt von: supabase/migrations/20251122_auth_system_complete.sql
```

### 4. Start App

```bash
npm install
npx expo start
```

**Fertig! 🎉**  
Login ist jetzt verfügbar unter: `http://localhost:8081/auth/login`

---

## 🔧 10-Minuten Setup (Mit Social Login)

### Google OAuth

1. **Google Cloud Console**
   ```
   1. Gehe zu: https://console.cloud.google.com
   2. Erstelle neues Projekt: "Anpip"
   3. APIs & Services → OAuth consent screen
   4. User Type: External
   5. App name: Anpip
   6. Support email: deine-email@beispiel.de
   7. Authorized domains: anpip.com
   ```

2. **OAuth Credentials**
   ```
   1. APIs & Services → Credentials
   2. Create Credentials → OAuth 2.0 Client ID
   3. Application type: Web application
   4. Name: Anpip Web
   5. Authorized redirect URIs:
      - http://localhost:8081/auth/callback
      - https://[projekt-ref].supabase.co/auth/v1/callback
   6. Save Client ID & Secret
   ```

3. **Supabase Config**
   ```
   1. Supabase Dashboard → Authentication → Providers
   2. Enable "Google"
   3. Paste Client ID & Secret
   4. Save
   ```

4. **Test**
   ```bash
   npx expo start
   # Öffne App → Login → "Mit Google anmelden"
   ```

### Apple Sign In (für iOS)

1. **Apple Developer**
   ```
   1. developer.apple.com → Certificates, IDs & Profiles
   2. Identifiers → + Button
   3. Services IDs → Continue
   4. Description: Anpip
   5. Identifier: com.anpip.signin
   6. Enable "Sign In with Apple"
   7. Configure:
      - Primary App ID: com.anpip.app
      - Domains: anpip.com
      - Return URLs: https://[projekt-ref].supabase.co/auth/v1/callback
   ```

2. **Supabase Config**
   ```
   1. Supabase → Authentication → Providers
   2. Enable "Apple"
   3. Service ID: com.anpip.signin
   4. Secret Key: (Generate in Apple Developer)
   5. Save
   ```

### Facebook Login

1. **Meta Developers**
   ```
   1. developers.facebook.com → My Apps → Create App
   2. App Type: Consumer
   3. App Name: Anpip
   4. Add Product: Facebook Login
   5. Settings:
      - Valid OAuth Redirect URIs:
        https://[projekt-ref].supabase.co/auth/v1/callback
   ```

2. **Supabase Config**
   ```
   1. Supabase → Authentication → Providers
   2. Enable "Facebook"
   3. App ID: [from Facebook]
   4. App Secret: [from Facebook]
   5. Save
   ```

---

## 📱 Mobile Deep Linking (Optional)

Für Native Apps (iOS/Android):

### iOS

**app.json:**
```json
{
  "expo": {
    "scheme": "anpip",
    "ios": {
      "bundleIdentifier": "com.anpip.app",
      "associatedDomains": [
        "applinks:anpip.com",
        "applinks:*.anpip.com"
      ]
    }
  }
}
```

### Android

**app.json:**
```json
{
  "expo": {
    "android": {
      "package": "com.anpip.app",
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "anpip.com",
              "pathPrefix": "/auth"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

---

## ✅ Test Checklist

Nach dem Setup, teste diese Flows:

### Basic Auth
- [ ] Registrierung mit Email/Passwort
- [ ] Login mit Email/Passwort
- [ ] Passwort vergessen → Reset Email
- [ ] Logout

### Social Login
- [ ] Google Login (Web)
- [ ] Apple Login (iOS)
- [ ] Facebook Login

### Security
- [ ] Schwaches Passwort wird abgelehnt
- [ ] Doppelte E-Mail wird abgelehnt
- [ ] Rate Limiting nach 5 falschen Logins

### Profile
- [ ] Profil bearbeiten
- [ ] Passwort ändern

---

## 🐛 Troubleshooting

### "Invalid login credentials"
```bash
# Check:
1. Email & Passwort korrekt?
2. Email verifiziert?
3. Supabase Auth aktiviert?

# Fix:
- Supabase Dashboard → Authentication → Users
- Manuell User bestätigen
```

### Social Login redirect fehlt
```bash
# Check Redirect URIs in:
1. Google Cloud Console
2. Apple Developer
3. Meta Developers
4. Supabase Dashboard

# Must match exactly:
https://[projekt-ref].supabase.co/auth/v1/callback
```

### Email-Verifizierung kommt nicht
```bash
# Check:
1. Supabase → Settings → Auth → Email Settings
2. SMTP konfiguriert?
3. Spam-Ordner?

# Test Email:
- Supabase Dashboard → Auth → Email Templates
- Send Test Email
```

### Rate Limiting zu streng
```typescript
// lib/security-middleware.ts
const DEFAULT_CONFIG = {
  maxAttempts: 10, // Erhöhe von 5 auf 10
  windowMs: 15 * 60 * 1000,
  blockDurationMs: 30 * 60 * 1000,
};
```

---

## 📚 Nächste Schritte

Nach erfolgreichem Setup:

1. **Customize UI**
   - Farben anpassen: `constants/Theme.ts`
   - Texte übersetzen: `i18n/translations/`

2. **Add 2FA**
   - Implementiere TOTP (siehe Roadmap)
   - SMS-Verifizierung (Twilio)

3. **Analytics**
   - Track Login-Events
   - Monitor Security Events

4. **Production**
   - Eigene Domain konfigurieren
   - SSL-Zertifikate
   - Rate Limits anpassen
   - Monitoring einrichten

---

## 💡 Pro Tips

### Development
```bash
# Auto-reload bei Änderungen
npx expo start --clear

# iOS Simulator
i

# Android Emulator
a

# Web Browser
w
```

### Testing
```bash
# Run all tests
npm test

# Run auth tests only
npm test -- auth

# Watch mode
npm test -- --watch
```

### Security
```bash
# Rotate Supabase Keys regelmäßig
# Dashboard → Settings → API → Reset keys

# Aktiviere Email-Bestätigung
# Dashboard → Auth → Email auth → Confirm email

# Aktiviere Rate-Limiting
# Dashboard → Auth → Rate limits
```

---

## 🆘 Support

Bei Problemen:

1. **Logs checken**
   ```bash
   # Expo Logs
   npx expo start
   
   # Supabase Logs
   # Dashboard → Logs → Auth logs
   ```

2. **Dokumentation**
   - `AUTH_SYSTEM_DOCUMENTATION.md`
   - [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

3. **Community**
   - Discord: discord.gg/anpip
   - GitHub Issues

---

**Viel Erfolg! 🚀**

Bei Fragen: support@anpip.com
