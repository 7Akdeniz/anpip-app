# 🔐 ANPIP AUTH SYSTEM - Complete Documentation

## 📋 Übersicht

Das Anpip Authentication System ist ein modernes, sicheres und DSGVO-konformes Authentifizierungssystem auf Welt-Nr.-1-Niveau.

### ✨ Features

- ✅ **Multi-Provider Auth**: Email/Password, Google, Apple, Facebook, Microsoft, LinkedIn
- ✅ **2FA Support**: TOTP, SMS, Email (vorbereitet)
- ✅ **Session Management**: Geräteverwaltung, Remote-Logout
- ✅ **DSGVO-Compliance**: Consent Management, Datenexport, Account-Löschung
- ✅ **Security**: Rate-Limiting, Bot-Detection, Brute-Force-Protection
- ✅ **Modern UX**: Mobile-first, responsive, barrierefreies Design

---

## 🏗️ Architektur

### Tech Stack

```
Frontend:
- React Native / Expo (Mobile & Web)
- TypeScript
- React Context API (State Management)

Backend:
- Supabase Auth (OAuth, JWT, Session Management)
- PostgreSQL (User Profiles, Sessions, Audit Logs)
- Row Level Security (RLS)

Security:
- Rate Limiting (In-Memory + Database)
- CSRF Protection
- Bot Detection
- IP Blocking
```

### Komponenten

```
📁 Auth System Structure
├── contexts/
│   └── AuthContext.tsx          # Global Auth State
├── lib/
│   ├── auth-service.ts          # Business Logic
│   ├── supabase.ts              # Database Client
│   └── security-middleware.ts   # Rate Limiting & Security
├── components/
│   └── auth/
│       └── AuthGuard.tsx        # Protected Routes
├── app/
│   └── auth/
│       ├── login.tsx            # Login Screen
│       ├── register.tsx         # Registration Screen
│       └── forgot-password.tsx  # Password Reset
├── types/
│   └── auth.ts                  # TypeScript Types
└── supabase/
    └── migrations/
        └── 20251122_auth_system_complete.sql  # Database Schema
```

---

## 🚀 Setup & Installation

### 1. Supabase Setup

1. **Erstelle ein Supabase-Projekt**
   - Gehe zu [supabase.com](https://supabase.com)
   - Erstelle ein neues Projekt

2. **Führe die Migration aus**
   ```bash
   cd supabase
   npx supabase db push
   ```

3. **Konfiguriere Social Providers**

   **Google OAuth:**
   ```
   Dashboard → Authentication → Providers → Google
   - Enable Google provider
   - Add Client ID & Secret from Google Cloud Console
   - Authorized redirect URIs: https://[PROJECT-REF].supabase.co/auth/v1/callback
   ```

   **Apple Sign In:**
   ```
   Dashboard → Authentication → Providers → Apple
   - Enable Apple provider
   - Add Service ID & Key ID from Apple Developer
   ```

   **Facebook Login:**
   ```
   Dashboard → Authentication → Providers → Facebook
   - Enable Facebook provider
   - Add App ID & Secret from Meta Developers
   ```

   **Microsoft OAuth:**
   ```
   Dashboard → Authentication → Providers → Azure (Microsoft)
   - Enable Azure provider
   - Add Application ID & Secret from Azure Portal
   ```

   **LinkedIn OAuth:**
   ```
   Dashboard → Authentication → Providers → LinkedIn (OIDC)
   - Enable LinkedIn provider
   - Add Client ID & Secret from LinkedIn Developers
   ```

4. **E-Mail-Templates konfigurieren**
   ```
   Dashboard → Authentication → Email Templates
   - Customize: Confirm Signup, Reset Password, Magic Link
   - Add Anpip branding
   ```

### 2. Environment Variables

Erstelle `.env.local`:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App URL (für OAuth Redirects)
EXPO_PUBLIC_APP_URL=https://www.anpip.com

# Optional: reCAPTCHA (für Bot-Schutz)
EXPO_PUBLIC_RECAPTCHA_SITE_KEY=your-site-key
```

### 3. Integration in App

**Wrap App mit AuthProvider:**

```tsx
// app/_layout.tsx
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      {/* Rest of your app */}
    </AuthProvider>
  );
}
```

---

## 📖 Usage Guide

### Registration

```tsx
import { useAuth } from '@/contexts/AuthContext';

function RegisterComponent() {
  const { signUp } = useAuth();

  const handleRegister = async () => {
    const result = await signUp({
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@beispiel.de',
      password: 'SecurePassword123!',
      country: 'DE',
      preferredLanguage: 'de',
      acceptTerms: true,
      acceptPrivacy: true,
      acceptDataProcessing: true,
    });

    if (result.success) {
      if (result.data?.requiresVerification) {
        // Show verification notice
      } else {
        // Navigate to app
      }
    } else {
      // Show error
      console.error(result.error);
    }
  };
}
```

### Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function LoginComponent() {
  const { signIn } = useAuth();

  const handleLogin = async () => {
    const result = await signIn({
      email: 'max@beispiel.de',
      password: 'SecurePassword123!',
      rememberMe: true,
    });

    if (result.success) {
      // Navigate to app
    } else {
      // Show error
      console.error(result.error);
    }
  };
}
```

### Social Login

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SocialLoginComponent() {
  const { signInWithProvider } = useAuth();

  const handleGoogleLogin = async () => {
    const result = await signInWithProvider({ 
      provider: 'google' 
    });

    if (result.success && result.data?.url) {
      // Redirect to OAuth URL
      window.location.href = result.data.url;
    }
  };
}
```

### Password Reset

```tsx
import { useAuth } from '@/contexts/AuthContext';

function PasswordResetComponent() {
  const { requestPasswordReset } = useAuth();

  const handleReset = async () => {
    const result = await requestPasswordReset({ 
      email: 'max@beispiel.de' 
    });

    if (result.success) {
      // Show success message
    }
  };
}
```

### Protected Routes

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProtectedScreen() {
  return (
    <AuthGuard>
      {/* Your protected content */}
    </AuthGuard>
  );
}
```

### Check Auth Status

```tsx
import { useAuth, useIsAuthenticated, useUser } from '@/contexts/AuthContext';

function MyComponent() {
  const { state } = useAuth();
  const isAuthenticated = useIsAuthenticated();
  const user = useUser();

  if (state.loading) return <Loading />;
  if (!isAuthenticated) return <Login />;

  return <div>Welcome, {user?.displayName}!</div>;
}
```

---

## 🔒 Security Features

### Rate Limiting

```tsx
import { securityMiddleware } from '@/lib/security-middleware';

// Check rate limit before login attempt
const clientId = securityMiddleware.getClientIP();
const rateLimit = await securityMiddleware.checkRateLimit(clientId);

if (!rateLimit.allowed) {
  // Show "too many attempts" error
  return;
}

// Proceed with login
const result = await signIn(credentials);

if (result.success) {
  // Reset rate limit on success
  securityMiddleware.resetRateLimit(clientId);
}
```

### Bot Detection

```tsx
import { securityMiddleware } from '@/lib/security-middleware';

const userAgent = navigator.userAgent;
const isBot = securityMiddleware.detectBot(userAgent);

if (isBot) {
  // Show CAPTCHA or block request
}
```

### CSRF Protection

```tsx
import { securityMiddleware } from '@/lib/security-middleware';

// Generate token
const csrfToken = securityMiddleware.generateCSRFToken();

// Store in session
sessionStorage.setItem('csrf_token', csrfToken);

// Validate on form submit
const isValid = securityMiddleware.validateCSRFToken(
  formToken, 
  sessionToken
);
```

---

## 🛡️ DSGVO Compliance

### Consent Management

Bei Registrierung:
- ✅ AGB akzeptieren (Pflicht)
- ✅ Datenschutzerklärung akzeptieren (Pflicht)
- ✅ Datenverarbeitung zustimmen (Pflicht)
- ☐ Marketing-E-Mails (Optional)

```tsx
{
  acceptTerms: true,
  acceptPrivacy: true,
  acceptDataProcessing: true,
  marketingConsent: false, // Optional
}
```

### Datenexport

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { exportData } = useAuth();

const handleExport = async () => {
  const result = await exportData({
    format: 'json',
    includeVideos: true,
    includeComments: true,
    includeLikes: true,
  });

  if (result.success && result.data) {
    // Download from result.data.downloadUrl
    window.location.href = result.data.downloadUrl;
  }
};
```

### Account-Löschung

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { deleteAccount } = useAuth();

const handleDelete = async () => {
  const result = await deleteAccount({
    password: currentPassword,
    reason: 'privacy_concerns',
    feedback: 'Optional feedback',
  });

  if (result.success) {
    // Account marked for deletion (30-day grace period)
  }
};
```

---

## 📊 Database Schema

### Tables

**profiles**
- Erweiterte User-Profile
- DSGVO Consent-Tracking
- 2FA Settings
- Account Status

**social_connections**
- Verknüpfte Social-Logins
- Provider-spezifische Daten

**user_sessions**
- Aktive Sessions pro User
- Geräteinformationen
- IP & Location

**security_events**
- Audit-Log aller Security-Events
- Login-Versuche, Passwort-Änderungen, etc.

**login_attempts**
- Rate-Limiting-Tracking
- Failed Login-Versuche

**blocked_ips**
- Geblockte IP-Adressen
- Temporäre & permanente Blocks

**data_export_requests**
- DSGVO Datenexport-Requests
- Download-URLs

**account_deletion_requests**
- DSGVO Account-Lösch-Requests
- 30-Tage Karenzzeit

---

## 🧪 Testing

### Manual Testing Checklist

**Registration:**
- [ ] Email/Password Registration
- [ ] Google Sign Up
- [ ] Apple Sign Up (iOS)
- [ ] Facebook Sign Up
- [ ] Form Validation
- [ ] Email Verification

**Login:**
- [ ] Email/Password Login
- [ ] Social Login (alle Provider)
- [ ] Remember Me
- [ ] Wrong Password
- [ ] Unverified Email
- [ ] Rate Limiting

**Password Reset:**
- [ ] Request Reset Link
- [ ] Email erhalten
- [ ] Reset Password
- [ ] Link Expiration

**Profile:**
- [ ] Update Profile
- [ ] Upload Avatar
- [ ] Change Password
- [ ] Link Social Account
- [ ] Unlink Social Account

**Sessions:**
- [ ] View Active Sessions
- [ ] Revoke Single Session
- [ ] Revoke All Sessions

**Security:**
- [ ] Rate Limiting (5 failed attempts)
- [ ] IP Blocking
- [ ] Bot Detection
- [ ] CSRF Protection

**DSGVO:**
- [ ] Consent Management
- [ ] Data Export
- [ ] Account Deletion

### Automated Tests

```bash
# Run all tests
npm test

# Run auth tests only
npm test -- auth
```

---

## 🚨 Troubleshooting

### "Invalid login credentials"
- Überprüfe Email & Passwort
- Email noch nicht verifiziert?
- Account gesperrt?

### Social Login funktioniert nicht
- Überprüfe OAuth-Konfiguration in Supabase
- Redirect URIs korrekt?
- Client ID & Secret korrekt?

### Email-Verifizierung kommt nicht an
- Spam-Ordner überprüfen
- Email-Template konfiguriert?
- SMTP-Settings in Supabase korrekt?

### Rate Limiting zu aggressiv
- Config in `security-middleware.ts` anpassen:
  ```ts
  const config = {
    maxAttempts: 10, // Statt 5
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  };
  ```

---

## 📈 Performance Optimierung

### Caching
- Session wird in Memory gecacht
- User-Profile in React Context

### Lazy Loading
- Auth-Screens on-demand laden
- Social-Provider-SDKs lazy laden

### Database Optimization
- Indexes auf allen wichtigen Feldern
- RLS Policies optimiert
- Connection Pooling

---

## 🔮 Roadmap / TODO

### Kurzfristig (MVP)
- [x] Email/Password Auth
- [x] Social Login (Google, Apple, Facebook, Microsoft, LinkedIn)
- [x] Password Reset
- [x] Rate Limiting
- [x] DSGVO Compliance
- [ ] Email Verification Flow komplett
- [ ] reCAPTCHA Integration
- [ ] 2FA (TOTP)

### Mittelfristig
- [ ] SMS-Verifizierung
- [ ] Biometrische Auth (Face ID, Touch ID)
- [ ] WebAuthn / Passkeys
- [ ] Session Management UI
- [ ] Security Dashboard

### Langfristig
- [ ] Magic Links (Passwordless)
- [ ] Social Login: Twitter/X, TikTok
- [ ] Enterprise SSO (SAML, LDAP)
- [ ] Advanced Fraud Detection (ML)

---

## 👥 Support & Contribution

Bei Fragen oder Problemen:
- 📧 Email: support@anpip.com
- 📖 Docs: docs.anpip.com/auth
- 💬 Discord: discord.gg/anpip

---

## 📄 License

MIT License - © 2025 Anpip.com

---

**Erstellt mit ❤️ für eine sichere und benutzerfreundliche Authentifizierung auf Welt-Nr.-1-Niveau.**
