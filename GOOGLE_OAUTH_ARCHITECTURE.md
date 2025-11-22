# 🔐 GOOGLE OAUTH - ORDNERSTRUKTUR & CODE-ÜBERSICHT

## 📂 ORDNERSTRUKTUR

```
Anpip.com/
│
├── 📁 app/
│   ├── 📁 api/auth/                          # Backend API Routes
│   │   ├── google+api.ts                     # ✅ POST /api/auth/google
│   │   │                                     #    → Validiert Google ID-Token
│   │   │                                     #    → Erstellt/loggt User ein
│   │   │                                     #    → Erstellt Supabase-Session
│   │   │
│   │   └── 📁 google/
│   │       └── callback+api.ts               # ✅ POST /api/auth/google/callback
│   │                                         #    → Tauscht Code gegen Token
│   │                                         #    → Holt User-Info von Google
│   │                                         #    → Erstellt User + Session
│   │
│   └── 📁 auth/                              # Frontend Auth-Seiten
│       ├── login.tsx                         # ✅ Login-Seite
│       │                                     #    → Enthält GoogleLoginButton
│       │                                     #    → Email/Password + Social Login
│       │
│       └── 📁 google/
│           └── callback.tsx                  # ✅ Callback-Seite
│                                             #    → Empfängt User nach Google-Login
│                                             #    → Zeigt Loading/Success/Error
│                                             #    → Leitet weiter zur App
│
├── 📁 lib/
│   └── google-login.ts                       # ✅ Google Login Service
│                                             #    → Initialisiert Google Identity Services
│                                             #    → Öffnet Login-Popup
│                                             #    → Validiert Token
│                                             #    → Kommuniziert mit Backend
│
├── 📁 components/auth/
│   └── GoogleLoginButton.tsx                 # ✅ Wiederverwendbarer Google-Button
│                                             #    → Custom Button oder Native Button
│                                             #    → Error Handling
│                                             #    → Loading States
│
├── .env.example                              # ✅ Environment-Variablen-Vorlage
│                                             #    → GOOGLE_CLIENT_ID
│                                             #    → GOOGLE_CLIENT_SECRET
│                                             #    → Redirect URIs
│
├── GOOGLE_OAUTH_SETUP.md                     # ✅ Vollständige Setup-Anleitung
└── GOOGLE_OAUTH_QUICKSTART.md                # ✅ Quick Start Guide
```

---

## 🔄 DATENFLUSS

### **1. Popup-Flow (Empfohlen für Web)**

```
┌─────────────┐
│   FRONTEND  │
│  (Browser)  │
└─────┬───────┘
      │
      │ 1. User klickt "Mit Google anmelden"
      ↓
┌─────────────────────────────────────┐
│  GoogleLoginButton.tsx              │
│  ↓                                  │
│  googleLoginService.loginWithPopup()│
└─────┬───────────────────────────────┘
      │
      │ 2. Öffnet Google Popup
      ↓
┌─────────────────────────┐
│   GOOGLE ACCOUNTS       │
│   accounts.google.com   │
│                         │
│  → User loggt sich ein  │
│  → Gibt ID-Token zurück │
└─────┬───────────────────┘
      │
      │ 3. ID-Token zurück ans Frontend
      ↓
┌─────────────────────────────────────┐
│  googleLoginService                 │
│  .authenticateWithBackend()         │
│                                     │
│  POST /api/auth/google              │
│  Body: { idToken: "..." }           │
└─────┬───────────────────────────────┘
      │
      │ 4. Token ans Backend
      ↓
┌─────────────────────────────────────┐
│   BACKEND                           │
│   app/api/auth/google+api.ts        │
│                                     │
│   1. Token bei Google validieren    │
│   2. User in DB suchen/erstellen    │
│   3. Supabase-Session erstellen     │
│   4. Session zurück ans Frontend    │
└─────┬───────────────────────────────┘
      │
      │ 5. Session + User-Info
      ↓
┌─────────────────────────────────────┐
│   FRONTEND                          │
│   ✅ Login erfolgreich!             │
│   → Weiterleitung zu /(tabs)        │
└─────────────────────────────────────┘
```

### **2. Redirect-Flow (Alternative)**

```
┌─────────────┐
│   FRONTEND  │
└─────┬───────┘
      │
      │ 1. Redirect zu Google
      ↓
┌─────────────────────────┐
│   GOOGLE ACCOUNTS       │
│   User loggt sich ein   │
└─────┬───────────────────┘
      │
      │ 2. Redirect zu /auth/google/callback?code=...
      ↓
┌─────────────────────────────────────┐
│   app/auth/google/callback.tsx      │
│   POST /api/auth/google/callback    │
└─────┬───────────────────────────────┘
      │
      │ 3. Code ans Backend
      ↓
┌─────────────────────────────────────┐
│   app/api/auth/google/callback+api  │
│   1. Code → Token (mit client_secret)│
│   2. Token → User-Info              │
│   3. User erstellen + Session       │
└─────┬───────────────────────────────┘
      │
      │ 4. Session zurück
      ↓
┌─────────────────────────────────────┐
│   ✅ Login erfolgreich!             │
│   → Weiterleitung zu /(tabs)        │
└─────────────────────────────────────┘
```

---

## 📄 CODE-DATEIEN IM DETAIL

### **1. Backend: `app/api/auth/google+api.ts`**

**Zweck:** Validiert Google ID-Token und erstellt User/Session

**Endpoints:** `POST /api/auth/google`

**Input:**
```json
{
  "idToken": "eyJhbGc...",
  "returnUrl": "/(tabs)"
}
```

**Output:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@gmail.com",
    "name": "Max Mustermann",
    "avatar": "https://..."
  },
  "session": { ... }
}
```

**Flow:**
1. Token bei Google validieren (`tokeninfo` endpoint)
2. Email & Verifizierung prüfen
3. User in DB suchen (`SELECT FROM users WHERE email = ...`)
4. Falls nicht vorhanden → User erstellen
5. Supabase-Session erstellen
6. Session zurückgeben

---

### **2. Backend: `app/api/auth/google/callback+api.ts`**

**Zweck:** Tauscht Authorization Code gegen Token

**Endpoints:** `POST /api/auth/google/callback`

**Input:**
```json
{
  "code": "4/0AdLIrYe...",
  "state": "/(tabs)"
}
```

**Output:**
```json
{
  "success": true,
  "user": { ... },
  "session": { ... }
}
```

**Flow:**
1. Code → Token (POST zu `oauth2.googleapis.com/token`)
2. Access Token → User-Info (`googleapis.com/oauth2/v2/userinfo`)
3. User in DB suchen/erstellen
4. Session erstellen
5. Zurückgeben

---

### **3. Frontend: `lib/google-login.ts`**

**Zweck:** Google Identity Services Wrapper

**Methoden:**

```typescript
// Initialisieren (einmal beim App-Start)
await googleLoginService.initialize();

// Login-Popup öffnen
const result = await googleLoginService.loginWithPopup();

// Token ans Backend senden
const auth = await googleLoginService.authenticateWithBackend(token);

// Google One-Tap zeigen
googleLoginService.showOneTap(onSuccess, onError);

// Nativen Google-Button rendern
googleLoginService.renderButton(elementId, onSuccess, onError);
```

---

### **4. Frontend: `components/auth/GoogleLoginButton.tsx`**

**Zweck:** Wiederverwendbarer Google-Login-Button

**Props:**

```typescript
interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
  text?: string;
  style?: any;
  useNativeButton?: boolean;  // Google's eigener Button
}
```

**Verwendung:**

```tsx
<GoogleLoginButton
  onSuccess={(user) => console.log('Erfolgreich:', user)}
  onError={(error) => alert(error)}
  text="Mit Google anmelden"
/>
```

---

### **5. Frontend: `app/auth/google/callback.tsx`**

**Zweck:** Empfängt User nach Google-Redirect

**URL:** `/auth/google/callback?code=...&state=...`

**Flow:**
1. Code aus URL-Params extrahieren
2. POST zu `/api/auth/google/callback`
3. Loading-Spinner zeigen
4. Bei Erfolg → Weiterleitung
5. Bei Fehler → Fehlermeldung + Zurück zu Login

---

## 🔒 SICHERHEIT

### **Was ist GEHEIM (nur Backend)?**

- ✅ `GOOGLE_CLIENT_SECRET` (in `.env`, NICHT in Git!)
- ✅ Access Tokens (werden nur auf Server verwendet)
- ✅ Refresh Tokens (werden nicht ans Frontend gesendet)

### **Was ist ÖFFENTLICH (Frontend)?**

- ✅ `EXPO_PUBLIC_GOOGLE_CLIENT_ID`
- ✅ Redirect URIs
- ✅ ID-Token (temporär, nur zur Validierung)

### **Validierungen:**

- ✅ Token-Signatur (bei Google)
- ✅ Token-Audience (muss unsere Client-ID sein)
- ✅ Email-Verifizierung (`verified_email: true`)
- ✅ Token-Expiry

---

## 🛠️ DEPLOYMENT

### **Production .env:**

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<PROD_SECRET>
EXPO_PUBLIC_APP_URL=https://www.anpip.com
```

### **Vercel:**

Environment Variables in Vercel Dashboard hinzufügen:
- `GOOGLE_CLIENT_SECRET` ← **GEHEIM!**
- `EXPO_PUBLIC_APP_URL=https://www.anpip.com`

### **Supabase:**

1. Production-Projekt öffnen
2. **Authentication → Providers → Google** aktivieren
3. Client ID + Secret eintragen
4. Redirect URL: `https://www.anpip.com/auth/google/callback`

---

## ✅ CHECKLISTE

- [ ] `.env` mit echten Werten
- [ ] `GOOGLE_CLIENT_SECRET` NICHT in Git
- [ ] Redirect URIs in Google Console
- [ ] Supabase Google-Provider aktiviert
- [ ] `users.google_id` Spalte existiert
- [ ] Lokal getestet
- [ ] Production-URLs konfiguriert
- [ ] Error Handling getestet

---

**Vollständige Dokumentation:** [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md)
