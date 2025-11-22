# 🚀 AUTH SYSTEM - DEPLOYMENT CHECKLIST

Nutze diese Checkliste, um das Auth-System sicher in Production zu deployen.

---

## ⚠️ Pre-Deployment

### 1. Environment Variables

- [ ] `.env.local` existiert und ist ausgefüllt
- [ ] `.env.local` ist in `.gitignore`
- [ ] Production-Keys unterschiedlich von Development
- [ ] Alle `EXPO_PUBLIC_*` Variablen gesetzt:
  - [ ] `EXPO_PUBLIC_SUPABASE_URL`
  - [ ] `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `EXPO_PUBLIC_APP_URL` (Production-Domain)

### 2. Supabase Setup

- [ ] Production-Projekt erstellt (separiert von Dev)
- [ ] Database Migration ausgeführt:
  ```bash
  npx supabase db push
  ```
- [ ] RLS Policies aktiviert (alle Tabellen)
- [ ] Email-Templates customized:
  - [ ] Confirm Signup
  - [ ] Reset Password
  - [ ] Magic Link
  - [ ] Invite User
- [ ] SMTP konfiguriert (oder Supabase-Standard)
- [ ] Rate Limits aktiviert:
  - [ ] Dashboard → Auth → Rate limits
  - [ ] Max. 60 Requests/Minute pro IP

### 3. Social OAuth Setup

#### Google
- [ ] Google Cloud Console: Production Credentials
- [ ] Authorized redirect URIs:
  - [ ] `https://[projekt-ref].supabase.co/auth/v1/callback`
  - [ ] `https://www.anpip.com/auth/callback`
- [ ] Supabase: Client ID & Secret eingetragen

#### Apple
- [ ] Apple Developer: Services ID erstellt
- [ ] Return URLs konfiguriert
- [ ] Supabase: Service ID & Secret Key

#### Facebook
- [ ] Meta Developers: Production App
- [ ] OAuth Redirect URIs konfiguriert
- [ ] App Review abgeschlossen (falls public)

#### Microsoft
- [ ] Azure Portal: App Registration
- [ ] Redirect URIs konfiguriert
- [ ] API Permissions granted

#### LinkedIn
- [ ] LinkedIn Developers: App erstellt
- [ ] Authorized redirect URLs
- [ ] Verified domain

### 4. Security

- [ ] HTTPS erzwungen (HTTP → HTTPS Redirect)
- [ ] CORS korrekt konfiguriert
- [ ] CSP Headers gesetzt
- [ ] Rate Limiting aktiv (Code + Supabase)
- [ ] Bot Detection aktiv
- [ ] reCAPTCHA konfiguriert (optional)
- [ ] Supabase API Keys rotiert (nicht Dev-Keys verwenden!)

### 5. DSGVO

- [ ] AGB-Seite erstellt & verlinkt
- [ ] Datenschutzerklärung erstellt & verlinkt
- [ ] Cookie-Banner (falls nötig)
- [ ] Impressum
- [ ] Datenexport-Funktion getestet
- [ ] Account-Löschung funktioniert

---

## 🧪 Testing (Production-Like)

### Manual Testing

- [ ] **Registration:**
  - [ ] Email/Password funktioniert
  - [ ] Google Sign Up
  - [ ] Apple Sign Up (iOS)
  - [ ] Facebook Sign Up
  - [ ] Email-Verifizierung kommt an
  - [ ] Form-Validierung korrekt

- [ ] **Login:**
  - [ ] Email/Password funktioniert
  - [ ] Social Login (alle Provider)
  - [ ] Remember Me funktioniert
  - [ ] Fehlerbehandlung (falsches PW, nicht verifiziert)

- [ ] **Password Reset:**
  - [ ] Email kommt an
  - [ ] Link funktioniert
  - [ ] Neues Passwort wird akzeptiert
  - [ ] Login mit neuem Passwort klappt

- [ ] **Security:**
  - [ ] Rate Limiting: Nach 5 falschen Logins gesperrt?
  - [ ] IP-Blocking funktioniert?
  - [ ] Bot-Detection aktiv?

### Automated Tests

```bash
# Run all tests
npm test

# Run only auth tests
npm test -- auth

# Check coverage
npm test -- --coverage
```

- [ ] Alle Tests grün ✅
- [ ] Code Coverage > 80%

---

## 📊 Monitoring Setup

### Supabase Dashboard

- [ ] Enable Email Notifications:
  - [ ] Failed logins (threshold)
  - [ ] API errors
  - [ ] Database issues

- [ ] Setup Alerts:
  - [ ] Dashboard → Settings → Alerts
  - [ ] CPU > 80%
  - [ ] Memory > 80%
  - [ ] Disk > 80%

### Application Monitoring

- [ ] Error Tracking (z.B. Sentry):
  ```bash
  npm install @sentry/react-native
  ```

- [ ] Analytics (z.B. Google Analytics):
  - [ ] Track: Login Success
  - [ ] Track: Registration
  - [ ] Track: Password Reset
  - [ ] Track: Failed Logins

- [ ] Performance Monitoring:
  - [ ] Login-Zeit < 2s
  - [ ] Registration < 3s
  - [ ] API Response < 500ms

---

## 🚀 Deployment

### 1. Build

```bash
# Web
npx expo build:web

# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

### 2. Environment Check

```bash
# Verify env vars are set
printenv | grep EXPO_PUBLIC

# Should show:
# EXPO_PUBLIC_SUPABASE_URL=https://...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...
# EXPO_PUBLIC_APP_URL=https://www.anpip.com
```

### 3. Deploy

#### Vercel (Web)
```bash
vercel --prod

# Set environment variables in Vercel Dashboard
```

#### Mobile App Stores
```bash
# iOS: App Store Connect
eas submit --platform ios

# Android: Google Play Console
eas submit --platform android
```

---

## ✅ Post-Deployment

### Immediate Checks (First 5 Minutes)

- [ ] Website erreichbar: `https://www.anpip.com`
- [ ] Login-Seite lädt: `/auth/login`
- [ ] Registrierung lädt: `/auth/register`
- [ ] Test-Login funktioniert
- [ ] Social-Login-Buttons sichtbar
- [ ] Keine Console-Errors
- [ ] Mobile-Ansicht korrekt

### First Hour

- [ ] 10 Test-Registrierungen durchführen
- [ ] Email-Verifizierung testen
- [ ] Password-Reset testen
- [ ] Alle Social-Logins testen
- [ ] Rate-Limiting testen
- [ ] Error-Logs überprüfen

### First Day

- [ ] Analytics-Dashboard checken
- [ ] User-Registrierungen überwachen
- [ ] Failed-Login-Rate < 5%
- [ ] Email-Deliverability > 95%
- [ ] Keine kritischen Errors

### First Week

- [ ] Performance-Metriken analysieren
- [ ] User-Feedback sammeln
- [ ] Security-Events reviewen
- [ ] Optimierungen identifizieren

---

## 🔄 Maintenance

### Daily

- [ ] Error-Logs überprüfen (Dashboard)
- [ ] Critical Alerts beantworten
- [ ] User-Support-Tickets (Auth-bezogen)

### Weekly

- [ ] Security-Events reviewen
- [ ] Rate-Limiting-Stats analysieren
- [ ] Failed-Login-Patterns identifizieren
- [ ] Database-Performance checken

### Monthly

- [ ] API-Keys rotieren (Best Practice)
- [ ] Social-OAuth-Tokens erneuern (falls nötig)
- [ ] Security-Audit durchführen
- [ ] Dependency-Updates (npm outdated)
- [ ] Backup-Strategie testen

---

## 🚨 Rollback Plan

Falls etwas schiefgeht:

### Schneller Rollback (< 5 Minuten)

```bash
# Vercel: Zu vorheriger Deployment
vercel rollback

# Oder: Re-deploy letzten stabilen Commit
git revert HEAD
git push
vercel --prod
```

### Database Rollback

```bash
# Supabase: Migration zurückrollen
npx supabase db reset
npx supabase db push --migrations-only
```

### Notfall-Kontakte

```
Supabase Support: support@supabase.com
Vercel Support: support@vercel.com
Team Lead: [email]
DevOps: [email]
```

---

## 📈 Success Metrics

Nach Deployment sollten folgende Metriken erreicht werden:

| Metrik | Ziel | Aktuell |
|--------|------|---------|
| Registration Success Rate | > 95% | ___ % |
| Login Success Rate | > 98% | ___ % |
| Email Verification Rate | > 80% | ___ % |
| Social Login Adoption | > 40% | ___ % |
| Avg. Registration Time | < 3s | ___ s |
| Avg. Login Time | < 2s | ___ s |
| Failed Login Rate | < 5% | ___ % |
| Security Incidents | 0 | ___ |
| User Satisfaction (Auth) | > 4.5/5 | ___ /5 |

---

## 🎯 Definition of Done

Das Deployment ist erfolgreich, wenn:

- ✅ Alle Checklist-Punkte abgehakt
- ✅ Alle Tests grün
- ✅ Keine kritischen Errors in Production
- ✅ Registration/Login funktionieren flawlessly
- ✅ Social-Logins aktiv
- ✅ Email-Verifizierung funktioniert
- ✅ Security-Features aktiv (Rate Limiting, Bot Detection)
- ✅ Monitoring läuft
- ✅ Dokumentation aktuell
- ✅ Team informiert

---

## 📞 Support

Bei Problemen während Deployment:

1. **Logs checken:**
   ```bash
   # Vercel Logs
   vercel logs
   
   # Supabase Logs
   # Dashboard → Logs → Auth logs
   ```

2. **Rollback erwägen** (siehe oben)

3. **Team informieren:**
   - Slack: #deployment
   - Email: dev-team@anpip.com

4. **Incident-Report erstellen**

---

**Viel Erfolg beim Deployment! 🚀**

_Checklist erstellt: 22. November 2025_  
_Letzte Aktualisierung: 22. November 2025_  
_Nächstes Review: 22. Dezember 2025_
