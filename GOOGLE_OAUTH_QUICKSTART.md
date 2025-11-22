# 🔐 GOOGLE OAUTH - QUICK START

## 📋 IN 3 SCHRITTEN ZUM GOOGLE-LOGIN

### **SCHRITT 1: .env konfigurieren**

```bash
# .env erstellen
cp .env.example .env
```

Trage ein (aus deiner Google JSON-Datei):

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=335919974674-re0o51a79f8mucna93qk54gp19cmhsi7.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<DEIN_CLIENT_SECRET>
EXPO_PUBLIC_APP_URL=https://www.anpip.com
```

---

### **SCHRITT 2: Supabase konfigurieren**

1. [Supabase Dashboard](https://app.supabase.com) öffnen
2. **Authentication → Providers → Google** aktivieren
3. Client ID + Secret eintragen
4. SQL ausführen:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
```

---

### **SCHRITT 3: Testen**

```bash
npm run web
```

Öffne: `http://localhost:3000/auth/login`

Klicke: **"Mit Google anmelden"** ✅

---

## 💻 CODE-BEISPIELE

### **Google-Button in deine Seite einfügen:**

```tsx
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';

export default function MyPage() {
  return (
    <GoogleLoginButton
      onSuccess={(user) => console.log('Erfolgreich:', user)}
      onError={(error) => console.error('Fehler:', error)}
      text="Mit Google anmelden"
    />
  );
}
```

---

## 🗂️ WICHTIGE DATEIEN

```
app/
├── api/auth/
│   ├── google+api.ts              # Backend: Token validieren
│   └── google/callback+api.ts     # Backend: Code → Token
├── auth/
│   ├── login.tsx                  # Login-Seite
│   └── google/callback.tsx        # Callback-Seite

lib/
└── google-login.ts                # Google Service

components/auth/
└── GoogleLoginButton.tsx          # Google-Button
```

---

## 🔧 TROUBLESHOOTING

| Problem | Lösung |
|---------|--------|
| "Google Login nur auf Web verfügbar" | Nur im Browser möglich (nicht native) |
| "Invalid token" | `EXPO_PUBLIC_GOOGLE_CLIENT_ID` prüfen |
| "redirect_uri_mismatch" | URIs in Google Console prüfen |
| User nicht in DB | Supabase RLS-Policies prüfen |

---

## 📖 VOLLSTÄNDIGE DOKUMENTATION

Siehe: [`GOOGLE_OAUTH_SETUP.md`](./GOOGLE_OAUTH_SETUP.md)

---

**Das wars! 🎉 Jetzt hast du Google-Login!**
