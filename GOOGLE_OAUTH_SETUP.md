# 🔐 GOOGLE OAUTH INTEGRATION - ANPIP.COM

## 📋 ÜBERSICHT

Diese Implementierung bietet einen vollständigen Google OAuth-Login-Flow für Anpip.com mit:

- ✅ **Google Identity Services** (neuestes System, kein veraltetes gapi)
- ✅ **Web + Mobile Browser Support**
- ✅ **Automatische User-Registrierung**
- ✅ **Token-Validierung auf Backend**
- ✅ **Fehlerbehandlung für alle Fälle**
- ✅ **Rückleitung mit ?returnUrl=...**

---

## 🗂️ DATEISTRUKTUR

```
Anpip.com/
│
├── 📁 app/
│   ├── 📁 api/
│   │   └── 📁 auth/
│   │       ├── google+api.ts                    # POST /api/auth/google (ID-Token validieren)
│   │       └── 📁 google/
│   │           └── callback+api.ts              # POST /api/auth/google/callback (Code → Token)
│   │
│   └── 📁 auth/
│       ├── login.tsx                            # Login-Seite (mit Google-Button)
│       └── 📁 google/
│           └── callback.tsx                     # Callback-Seite (nach Google-Login)
│
├── 📁 lib/
│   └── google-login.ts                          # Google Login Service (Frontend)
│
├── 📁 components/
│   └── 📁 auth/
│       └── GoogleLoginButton.tsx                # Wiederverwendbarer Google-Button
│
└── .env.example                                 # Umgebungsvariablen-Vorlage
```

---

## 🚀 INSTALLATION (SCHRITT FÜR SCHRITT)

### **SCHRITT 1: Umgebungsvariablen konfigurieren**

#### 1.1. Google OAuth JSON-Datei öffnen

Du hast eine Datei: `client_secret_335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com.json`

Öffne diese Datei und finde folgende Werte:

```json
{
  "web": {
    "client_id": "335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com",
    "project_id": "anpip-app",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "client_secret": "DEIN_CLIENT_SECRET_HIER",
    "redirect_uris": [
      "https://www.anpip.com/auth/google/callback",
      "https://anpip.com/auth/google/callback"
    ],
    "javascript_origins": [
      "https://www.anpip.com",
      "https://anpip.com"
    ]
  }
}
```

#### 1.2. .env-Datei erstellen

Erstelle eine Datei `.env` im Projekt-Root:

```bash
cp .env.example .env
```

#### 1.3. Werte eintragen

Öffne `.env` und trage die Werte aus deiner JSON-Datei ein:

```env
# ========================================
# GOOGLE OAUTH
# ========================================

# Frontend (öffentlich)
EXPO_PUBLIC_GOOGLE_CLIENT_ID=335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com

# Backend (GEHEIM!)
GOOGLE_CLIENT_SECRET=DEIN_CLIENT_SECRET_AUS_JSON_DATEI
GOOGLE_PROJECT_ID=anpip-app
GOOGLE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
GOOGLE_TOKEN_URI=https://oauth2.googleapis.com/token

# App URL (wichtig für Redirects)
EXPO_PUBLIC_APP_URL=https://www.anpip.com
```

**⚠️ WICHTIG:** 
- `.env` NIEMALS in Git committen!
- `GOOGLE_CLIENT_SECRET` ist GEHEIM und darf NIEMALS ins Frontend!

---

### **SCHRITT 2: Supabase konfigurieren**

#### 2.1. Google Auth Provider aktivieren

1. Gehe zu [Supabase Dashboard](https://app.supabase.com)
2. Öffne dein Projekt
3. Gehe zu **Authentication → Providers**
4. Aktiviere **Google**
5. Trage ein:
   - **Client ID**: `335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com`
   - **Client Secret**: (aus deiner JSON-Datei)
   - **Redirect URL**: `https://www.anpip.com/auth/google/callback`

#### 2.2. Users-Tabelle erweitern (falls nötig)

Führe folgende SQL-Migration in Supabase aus:

```sql
-- Füge Google-ID-Spalte hinzu (falls nicht vorhanden)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Index für schnellere Suche
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
```

---

### **SCHRITT 3: Google Cloud Console konfigurieren**

Die Redirect-URIs und JavaScript-Origins sollten bereits konfiguriert sein, aber überprüfe sie:

1. Gehe zu [Google Cloud Console](https://console.cloud.google.com)
2. Wähle dein Projekt: **anpip-app**
3. Gehe zu **APIs & Services → Credentials**
4. Klicke auf deine OAuth 2.0 Client ID
5. Überprüfe:

#### Autorisierte JavaScript-Ursprünge:
```
https://www.anpip.com
https://anpip.com
http://localhost:3000
http://localhost:5173
```

#### Autorisierte Weiterleitungs-URIs:
```
https://www.anpip.com/auth/google/callback
https://anpip.com/auth/google/callback
http://localhost:3000/auth/google/callback
http://localhost:5173/auth/google/callback
```

---

### **SCHRITT 4: Dependencies installieren**

Die benötigten Packages sollten bereits installiert sein, aber zur Sicherheit:

```bash
npm install @supabase/supabase-js expo-router
```

---

### **SCHRITT 5: App testen**

#### 5.1. Development Server starten

```bash
npm run web
```

#### 5.2. Login-Seite öffnen

Gehe zu: `http://localhost:3000/auth/login`

#### 5.3. Google-Button klicken

1. Klicke auf "Mit Google anmelden"
2. Google-Popup sollte sich öffnen
3. Wähle deinen Google-Account
4. Nach erfolgreichem Login → Weiterleitung zur App

---

## 📖 VERWENDUNG

### **Variante 1: GoogleLoginButton-Komponente verwenden**

```tsx
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function MyScreen() {
  return (
    <GoogleLoginButton
      onSuccess={(user) => {
        console.log('Erfolgreich eingeloggt:', user);
      }}
      onError={(error) => {
        console.error('Fehler:', error);
      }}
      returnUrl="/(tabs)"
      text="Mit Google anmelden"
    />
  );
}
```

### **Variante 2: Google Service direkt verwenden**

```tsx
import { googleLoginService } from '@/lib/google-login';

const handleLogin = async () => {
  // 1. Initialisieren
  await googleLoginService.initialize();

  // 2. Login-Popup öffnen
  const result = await googleLoginService.loginWithPopup();

  if (result.success && result.credential) {
    // 3. Token an Backend senden
    const authResult = await googleLoginService.authenticateWithBackend(
      result.credential,
      '/(tabs)'
    );

    if (authResult.success) {
      console.log('Erfolgreich:', authResult.user);
    }
  }
};
```

### **Variante 3: Google One-Tap verwenden**

```tsx
import { googleLoginService } from '@/lib/google-login';

useEffect(() => {
  googleLoginService.showOneTap(
    async (credential) => {
      const result = await googleLoginService.authenticateWithBackend(credential);
      if (result.success) {
        console.log('One-Tap erfolgreich:', result.user);
      }
    },
    (error) => {
      console.error('One-Tap Fehler:', error);
    }
  );
}, []);
```

---

## 🔄 ABLAUF (TECHNISCH)

### **Flow 1: Popup-Flow (empfohlen)**

```
1. User klickt "Mit Google anmelden"
   ↓
2. Frontend: googleLoginService.loginWithPopup()
   ↓
3. Google öffnet Popup → User loggt sich ein
   ↓
4. Google gibt ID-Token zurück
   ↓
5. Frontend sendet Token an: POST /api/auth/google
   ↓
6. Backend:
   - Validiert Token bei Google
   - Sucht/erstellt User in DB
   - Erstellt Supabase-Session
   ↓
7. Frontend empfängt Session
   ↓
8. Weiterleitung zur App
```

### **Flow 2: Redirect-Flow (Alternative)**

```
1. User klickt "Mit Google anmelden"
   ↓
2. Redirect zu: https://accounts.google.com/o/oauth2/auth?...
   ↓
3. User loggt sich ein
   ↓
4. Redirect zu: https://anpip.com/auth/google/callback?code=...
   ↓
5. Frontend sendet Code an: POST /api/auth/google/callback
   ↓
6. Backend:
   - Tauscht Code gegen Token (mit client_secret)
   - Holt User-Info von Google
   - Erstellt User + Session
   ↓
7. Weiterleitung zur App
```

---

## 🛡️ SICHERHEIT

### **Was wird NICHT ins Frontend übertragen:**

- ❌ `GOOGLE_CLIENT_SECRET` (bleibt auf dem Server!)
- ❌ Access Tokens (werden nur auf Server verwendet)
- ❌ Refresh Tokens

### **Was wird validiert:**

- ✅ ID-Token bei Google (via tokeninfo endpoint)
- ✅ Token-Audience (muss für unsere Client-ID sein)
- ✅ Email-Verifizierung (verified_email muss true sein)
- ✅ Token-Ablaufdatum

### **Fehlerbehandlung:**

- ✅ User bricht Login ab → Fehlermeldung + Zurück zum Login
- ✅ Ungültiger Token → Fehlermeldung
- ✅ Keine Email von Google → Fehlermeldung
- ✅ Backend-Fehler → Benutzerfreundliche Meldung

---

## 🐛 TROUBLESHOOTING

### **Problem: "Google Login nur auf Web verfügbar"**

**Lösung:** 
- Google Identity Services funktioniert nur im Browser
- Für native Mobile Apps musst du zusätzlich `expo-auth-session` verwenden

### **Problem: "Failed to load Google Script"**

**Lösung:**
- Überprüfe Internet-Verbindung
- Stelle sicher, dass keine Ad-Blocker aktiv sind
- CSP-Header prüfen (sollte `https://accounts.google.com` erlauben)

### **Problem: "Invalid Google token"**

**Lösung:**
- Überprüfe `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `.env`
- Token könnte abgelaufen sein → Nochmal einloggen
- Prüfe, ob Token für richtige Client-ID ist

### **Problem: "redirect_uri_mismatch"**

**Lösung:**
- Überprüfe Redirect-URIs in Google Cloud Console
- Muss EXAKT mit `EXPO_PUBLIC_APP_URL/auth/google/callback` übereinstimmen
- Achte auf `http` vs `https`
- Achte auf Trailing Slashes

### **Problem: User wird nicht in DB erstellt**

**Lösung:**
- Überprüfe Supabase-Logs
- Stelle sicher, dass `users`-Tabelle existiert
- Prüfe RLS-Policies (Row Level Security)
- Überprüfe, ob `google_id`-Spalte existiert

---

## 📊 MONITORING & LOGS

### **Frontend-Logs:**

```javascript
// In Browser-Console
localStorage.setItem('DEBUG', 'google-login');

// Dann werden alle Google-Login-Events geloggt
```

### **Backend-Logs:**

```typescript
// app/api/auth/google+api.ts
console.log('✅ Google Login erfolgreich:', user);
console.error('❌ Token verification failed:', error);
```

### **Supabase-Logs:**

1. Gehe zu Supabase Dashboard
2. **Logs → Auth Logs**
3. Filtere nach: `google` oder `oauth`

---

## 🎨 CUSTOMIZATION

### **Button-Styling anpassen:**

```tsx
<GoogleLoginButton
  text="Login mit Google"
  style={{
    backgroundColor: '#EA4335',
    borderRadius: 12,
    paddingVertical: 16,
  }}
/>
```

### **Native Google-Button verwenden:**

```tsx
<GoogleLoginButton
  useNativeButton={true}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

---

## 📝 CHECKLISTE

Vor dem Deployment:

- [ ] `.env` mit echten Werten ausgefüllt
- [ ] `GOOGLE_CLIENT_SECRET` NICHT in Git committed
- [ ] Redirect-URIs in Google Console konfiguriert
- [ ] Supabase Google-Provider aktiviert
- [ ] `users`-Tabelle hat `google_id`-Spalte
- [ ] Production-URLs in `.env` eingetragen
- [ ] Lokal getestet
- [ ] Error-Handling getestet (Login abbrechen, ungültiger Token, etc.)

---

## 🆘 SUPPORT

Bei Fragen oder Problemen:

1. **Dokumentation lesen:** Diese Datei
2. **Logs prüfen:** Browser Console + Supabase Logs
3. **Google Docs:** [Google Identity Services](https://developers.google.com/identity/gsi/web)
4. **Supabase Docs:** [Supabase Auth](https://supabase.com/docs/guides/auth)

---

## 📦 DATEIEN-ÜBERSICHT

| Datei | Zweck |
|-------|-------|
| `lib/google-login.ts` | Google Identity Services Wrapper |
| `components/auth/GoogleLoginButton.tsx` | Wiederverwendbarer Button |
| `app/api/auth/google+api.ts` | Backend: ID-Token validieren |
| `app/api/auth/google/callback+api.ts` | Backend: Code → Token |
| `app/auth/google/callback.tsx` | Frontend: Callback-Seite |
| `app/auth/login.tsx` | Login-Seite (mit Google-Button) |
| `.env.example` | Environment-Variablen-Vorlage |

---

## ✅ FERTIG!

Du hast jetzt einen vollständig funktionierenden Google OAuth-Login-Flow für Anpip.com! 🎉

**Nächste Schritte:**

1. `.env` ausfüllen mit deinen echten Werten
2. `npm run web` starten
3. Auf `/auth/login` gehen
4. Google-Button klicken
5. Testen! 🚀
