# 🛡️ ANPIP SECURITY ARCHITECTURE
## Militärisch sichere, hacker-resistente Plattform für weltweite Skalierung

---

## 📋 INHALTSVERZEICHNIS

1. [Sicherheitsübersicht](#sicherheitsübersicht)
2. [Server & API Schutz](#server--api-schutz)
3. [Anwendungssicherheit](#anwendungssicherheit)
4. [Code-Sicherheit](#code-sicherheit)
5. [Benutzerschutz](#benutzerschutz)
6. [DSGVO & Compliance](#dsgvo--compliance)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Deployment Guide](#deployment-guide)
9. [Incident Response](#incident-response)
10. [Security Checklist](#security-checklist)

---

## 🎯 SICHERHEITSÜBERSICHT

### Implementierte Sicherheitsebenen

```
┌─────────────────────────────────────────────────┐
│           LAYER 7: Compliance & Legal           │
│  DSGVO, CCPA, LGPD, Audit Logs, Data Export    │
├─────────────────────────────────────────────────┤
│         LAYER 6: Monitoring & Detection         │
│   Real-time Alerts, Anomaly Detection, SIEM    │
├─────────────────────────────────────────────────┤
│          LAYER 5: Application Security          │
│    JWT, 2FA, Session Management, CSRF Token    │
├─────────────────────────────────────────────────┤
│           LAYER 4: Code Security                │
│  Input Validation, SQL Injection, XSS, SSRF    │
├─────────────────────────────────────────────────┤
│          LAYER 3: WAF & Rate Limiting           │
│  Web Application Firewall, Bot Protection      │
├─────────────────────────────────────────────────┤
│         LAYER 2: DDoS Protection                │
│  Cloudflare, IP Reputation, Geo-Blocking       │
├─────────────────────────────────────────────────┤
│        LAYER 1: Network & Infrastructure        │
│    SSL/TLS, Security Headers, HSTS, CSP        │
└─────────────────────────────────────────────────┘
```

### Schutz vor folgenden Angriffen

✅ **DDoS-Attacken** - Verteilte Überlastungsangriffe  
✅ **SQL Injection** - Datenbank-Manipulationen  
✅ **XSS** (Cross-Site Scripting) - JavaScript-Injektionen  
✅ **CSRF** (Cross-Site Request Forgery) - Ungewollte Aktionen  
✅ **SSRF** (Server-Side Request Forgery) - Server-Manipulation  
✅ **RCE** (Remote Code Execution) - Code-Ausführung  
✅ **Brute Force** - Login-Attacken  
✅ **Session Hijacking** - Token-Diebstahl  
✅ **Path Traversal** - Datei-Zugriff  
✅ **Command Injection** - System-Befehle  
✅ **Data Exfiltration** - Daten-Diebstahl  
✅ **Man-in-the-Middle** - Abhör-Angriffe  

---

## 🚀 SERVER & API SCHUTZ

### 1. DDoS Protection

**Implementierung:** `lib/security/ddos-protection.ts`

```typescript
import { ddosProtection } from '@/lib/security/ddos-protection';

// In API Route oder Middleware
const result = await ddosProtection.checkRequest(request);

if (!result.allowed) {
  return new Response(result.reason, { status: 429 });
}
```

**Features:**
- ✅ Rate Limiting pro Endpoint
- ✅ IP-basierte Blockierung
- ✅ Bot-Erkennung
- ✅ Distributed Attack Detection
- ✅ Automatische IP-Blacklisting
- ✅ Threat Level Scoring

**Rate Limits:**

| Endpoint | Max Requests | Window | Block Duration |
|----------|-------------|--------|----------------|
| `/api/auth/login` | 5 | 15 min | 1 hour |
| `/api/auth/signup` | 3 | 1 hour | 24 hours |
| `/api/videos/create-upload` | 10 | 1 hour | 1 hour |
| `/api/comments` | 30 | 1 hour | 30 min |
| `/api/videos` | 100 | 1 hour | 15 min |

### 2. Web Application Firewall (WAF)

**Implementierung:** `lib/security/waf.ts`

```typescript
import { waf } from '@/lib/security/waf';

// Request validieren
const validation = waf.validateRequest(request);

if (validation.blocked) {
  // Log security event
  await logSecurityEvent({
    type: validation.severity,
    reasons: validation.reasons
  });
  
  return new Response('Forbidden', { status: 403 });
}

// Body validieren und sanitizen
const bodyValidation = await waf.validateBody(requestBody);
const sanitizedData = bodyValidation.sanitized;
```

**Geschützte Angriffsvektoren:**
- SQL Injection (15+ Patterns)
- XSS (10+ Patterns)
- Path Traversal
- Command Injection
- SSRF
- Header Injection

### 3. Cloudflare Integration

**Konfiguration:** `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**Security Headers:**
- ✅ HSTS (HTTP Strict Transport Security)
- ✅ CSP (Content Security Policy)
- ✅ X-Frame-Options (Clickjacking Protection)
- ✅ X-Content-Type-Options (MIME Sniffing)
- ✅ Referrer-Policy
- ✅ Permissions-Policy

---

## 🔐 ANWENDUNGSSICHERHEIT

### 1. JWT & Token Security

**Implementierung:** `lib/security/token-security.ts`

```typescript
import { tokenSecurity } from '@/lib/security/token-security';

// Token validieren
const validation = await tokenSecurity.validateAccessToken(token);

if (!validation.valid) {
  return { error: 'Invalid token' };
}

// Token rotieren
const { tokens } = await tokenSecurity.rotateTokens(refreshToken);

// Session erstellen
const session = await tokenSecurity.createSession(userId, request);

// Verdächtige Logins erkennen
const isSuspicious = await tokenSecurity.detectSuspiciousLogin(
  userId, 
  request
);
```

**Features:**
- ✅ Access Token (15 min Lifetime)
- ✅ Refresh Token (30 Tage)
- ✅ Automatische Token-Rotation
- ✅ Session Management
- ✅ Device Fingerprinting
- ✅ Suspicious Login Detection

### 2. Secure Cookies

```typescript
import { cookieSecurity } from '@/lib/security/token-security';

// Sicheres Cookie setzen
const response = cookieSecurity.setSecureCookie(
  response,
  'session_token',
  token,
  {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    sameSite: 'strict',
    secure: true,
    httpOnly: true
  }
);
```

**Cookie-Attribute:**
- ✅ `HttpOnly` - Kein JavaScript-Zugriff
- ✅ `Secure` - Nur HTTPS
- ✅ `SameSite=Strict` - CSRF-Schutz
- ✅ `Max-Age` - Expiration
- ✅ `Path` - Scope-Limitierung

### 3. Two-Factor Authentication (2FA)

**Implementierung:** `lib/security/two-factor-auth.ts`

```typescript
import { twoFactorAuth } from '@/lib/security/two-factor-auth';

// 2FA aktivieren
const setup = await twoFactorAuth.enable2FA(userId);
// Returns: { secret, qrCode, backupCodes }

// Setup verifizieren
const verified = await twoFactorAuth.verify2FASetup(userId, code);

// Bei Login verifizieren
const valid = await twoFactorAuth.verify2FA(userId, code);

// 2FA deaktivieren
const disabled = await twoFactorAuth.disable2FA(userId, password);
```

**Unterstützte Methoden:**
- ✅ TOTP (Google Authenticator, Authy)
- ✅ Backup Codes (10 Codes)
- ✅ SMS (via Twilio/Supabase)
- ✅ Email Codes

### 4. Device Management

```typescript
import { deviceManagement } from '@/lib/security/two-factor-auth';

// Alle Geräte anzeigen
const devices = await deviceManagement.getUserDevices(userId);

// Gerät entfernen
await deviceManagement.removeDevice(userId, sessionId);

// Alle Geräte außer aktuellem entfernen
await deviceManagement.removeAllDevicesExceptCurrent(
  userId, 
  currentSessionId
);
```

---

## 🔒 CODE-SICHERHEIT

### 1. Input Validation

**Implementierung:** `lib/security/waf.ts`

```typescript
import { InputValidator } from '@/lib/security/waf';

// Username validieren
const usernameCheck = InputValidator.validateUsername(username);
if (!usernameCheck.valid) {
  return { error: usernameCheck.error };
}

// Password Strength
const passwordCheck = InputValidator.validatePassword(password);
if (!passwordCheck.valid) {
  return { error: passwordCheck.error };
}
// Returns: { valid, strength: 0-100 }

// Video Title
const titleCheck = InputValidator.validateVideoTitle(title);

// Description
const descCheck = InputValidator.validateDescription(description);

// Tags
const tagsCheck = InputValidator.validateTags(tags);
```

**Validierungsregeln:**

| Feld | Min | Max | Regex | Spam Check |
|------|-----|-----|-------|------------|
| Username | 3 | 30 | `[a-zA-Z0-9_.-]` | ✅ |
| Password | 8 | - | Upper+Lower+Num+Special | ✅ |
| Title | 1 | 200 | - | ✅ |
| Description | 0 | 5000 | Max 5 URLs | ✅ |
| Tag | 1 | 50 | `[a-zA-Z0-9_-]` | ✅ |

### 2. SQL Injection Prevention

**Automatisch geschützt durch:**
- ✅ Supabase Client (Parameterized Queries)
- ✅ WAF Pattern Detection
- ✅ Input Sanitization

```typescript
// ❌ NIEMALS SO:
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ✅ IMMER SO:
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);
```

### 3. XSS Prevention

```typescript
// Automatische Sanitization
const sanitized = waf.sanitizeString(userInput);
// Escaped: < > " ' /

// In React automatisch geschützt:
<div>{userInput}</div> // Auto-escaped

// Für innerHTML:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
```

### 4. CSRF Protection

```typescript
// CSRF Token generieren
const csrfToken = securityMiddleware.generateCSRFToken();

// In Form einfügen
<input type="hidden" name="csrf_token" value={csrfToken} />

// Bei Submit validieren
const isValid = securityMiddleware.validateCSRFToken(
  submittedToken,
  sessionToken
);
```

---

## 👥 BENUTZERSCHUTZ

### 1. Brute Force Protection

**Automatisch aktiv:**
- ✅ 5 Versuche / 15 Minuten
- ✅ IP + Account kombiniert
- ✅ Exponential Backoff
- ✅ CAPTCHA nach 3 Fehlversuchen

```typescript
// Automatisch in ddos-protection.ts
// Rate Limiting für /api/auth/login
```

### 2. Session Management

```typescript
// Aktive Sessions anzeigen
const sessions = await tokenSecurity.getActiveSessions(userId);

// Session beenden
await tokenSecurity.revokeSession(sessionId);

// Alle Sessions beenden
await tokenSecurity.revokeAllTokens(userId);
```

**Session-Features:**
- ✅ Device Info (Browser, OS, Platform)
- ✅ IP-Adresse
- ✅ Last Active Timestamp
- ✅ Geo-Location (optional)
- ✅ Session Timeout (30 Tage)

### 3. Login Monitoring

**Automatisch geloggt:**
- ✅ Erfolgreiche Logins
- ✅ Fehlgeschlagene Logins
- ✅ IP-Adressen
- ✅ Device Changes
- ✅ Suspicious Activity

```typescript
// In security_events Tabelle
// Typ: 'user_login', 'failed_login', 'suspicious_login'
```

---

## ⚖️ DSGVO & COMPLIANCE

### 1. DSGVO (EU GDPR)

**Implementierung:** `lib/security/gdpr-compliance.ts`

```typescript
import { gdprCompliance } from '@/lib/security/gdpr-compliance';

// Article 15: Right to Access
const requestId = await gdprCompliance.requestDataExport(
  userId, 
  email
);

// Article 17: Right to Erasure
const deletion = await gdprCompliance.requestAccountDeletion(
  userId,
  reason,
  immediate = false // 30 Tage Wartezeit
);

// Article 7: Consent Management
await gdprCompliance.recordConsent(
  userId,
  'marketing',
  granted = true,
  request
);

// Article 20: Data Portability
const data = await gdprCompliance.exportDataInStructuredFormat(
  userId,
  format = 'json' // or 'csv', 'xml'
);

// Article 30: Audit Logging
await gdprCompliance.logDataAccess({
  userId,
  action: 'profile_view',
  resourceType: 'user',
  resourceId: viewedUserId,
  ipAddress,
  userAgent,
  timestamp: new Date()
});
```

**DSGVO-Features:**
- ✅ Datenexport (JSON/CSV/XML)
- ✅ Account-Löschung (30 Tage Wartezeit)
- ✅ Consent Management
- ✅ Data Portability
- ✅ Audit Logs (90 Tage)
- ✅ Data Breach Notification

### 2. CCPA (California)

```typescript
import { ccpaCompliance } from '@/lib/security/gdpr-compliance';

// Do Not Sell My Personal Information
await ccpaCompliance.optOutOfDataSale(userId);

// Kategorien anzeigen
const categories = ccpaCompliance.getPersonalInformationCategories();

// Daten abrufen
const data = await ccpaCompliance.getCollectedInformation(userId);
```

### 3. Audit Logs

**Automatisch geloggt:**
- ✅ Profil-Zugriffe
- ✅ Daten-Änderungen
- ✅ Login-Aktivitäten
- ✅ Export-Requests
- ✅ Lösch-Anfragen
- ✅ Consent-Änderungen

**Speicherdauer:** 90 Tage (Auto-Cleanup)

---

## 📊 MONITORING & ALERTS

### 1. Security Monitoring

**Implementierung:** `lib/security/security-monitoring.ts`

```typescript
import { securityMonitoring } from '@/lib/security/security-monitoring';

// Anomalien erkennen
const anomaly = await securityMonitoring.detectAnomalies(
  userId,
  action
);

// Failed Logins überwachen
await securityMonitoring.monitorFailedLogins(identifier, ipAddress);

// API-Missbrauch erkennen
await securityMonitoring.monitorAPIUsage(userId, endpoint);

// SQL Injection Versuche
await securityMonitoring.detectSQLInjection(input, source);

// XSS Versuche
await securityMonitoring.detectXSS(input, source);
```

### 2. Security Alerts

```typescript
// Aktive Alerts abrufen
const alerts = await securityMonitoring.getActiveAlerts('critical');

// Alert auflösen
await securityMonitoring.resolveAlert(
  alertId,
  resolvedBy,
  notes
);

// Security Metrics
const metrics = await securityMonitoring.getSecurityMetrics();
```

**Alert Levels:**
- 🟢 **Low** - Informational
- 🟡 **Medium** - Warnung
- 🟠 **High** - Dringend
- 🔴 **Critical** - Sofort handeln

### 3. Health Check

```typescript
import { securityHealthCheck } from '@/lib/security/security-monitoring';

const health = await securityHealthCheck.performHealthCheck();
// Returns: { status, checks, score }
```

**Geprüfte Bereiche:**
- ✅ SSL/TLS Certificate
- ✅ Security Headers
- ✅ Rate Limiting
- ✅ Authentication System
- ✅ Row Level Security (RLS)
- ✅ Active Threats

**Health Score:** 0-100
- 80-100: ✅ Healthy
- 60-79: ⚠️ Warning
- 0-59: 🔴 Critical

---

## 🚀 DEPLOYMENT GUIDE

### 1. Datenbank-Migration

```bash
# Migration ausführen
cd /Users/alanbest/Anpip.com
supabase db push

# Oder manuell im Supabase Dashboard:
# SQL Editor → Neue Query → 
# supabase/migrations/20241124_security_infrastructure.sql
```

### 2. Environment Variables

```bash
# .env
# Security
ENCRYPTION_KEY=your-32-char-encryption-key-here
CLOUDFLARE_WEBHOOK_SECRET=your-webhook-secret

# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: IP Reputation Service
IPQUALITYSCORE_API_KEY=your-api-key
```

### 3. Cloudflare Setup

**Schritt 1: WAF Rules aktivieren**
```
Dashboard → Security → WAF → Custom Rules
```

**Schritt 2: Rate Limiting konfigurieren**
```
Dashboard → Security → Rate Limiting Rules
```

**Schritt 3: Bot Protection**
```
Dashboard → Security → Bots → Configure
```

### 4. Vercel Deployment

```bash
# Build & Deploy
npm run build:pwa
vercel --prod

# Security Headers werden automatisch gesetzt via vercel.json
```

---

## 🚨 INCIDENT RESPONSE PLAN

### Phase 1: Detection (0-15 min)

**Automatische Erkennung:**
- Security Monitoring System
- Alert System (Email/Slack/PagerDuty)
- Anomaly Detection

**Manuelle Checks:**
```bash
# Active Alerts prüfen
SELECT * FROM security_alerts WHERE resolved = false;

# Security Metrics
SELECT * FROM security_events 
WHERE timestamp > NOW() - INTERVAL '1 hour';
```

### Phase 2: Containment (15-60 min)

**Sofortmaßnahmen:**

```typescript
// 1. IP blockieren
await ddosProtection.blockIP(ipAddress, 24 * 60 * 60 * 1000);

// 2. User sperren
await tokenSecurity.revokeAllTokens(userId);

// 3. Alert erstellen
await securityMonitoring.createAlert({
  severity: 'critical',
  type: 'security_breach',
  message: 'Unauthorized access detected'
});
```

### Phase 3: Investigation (1-4 hours)

**Analyse:**
```typescript
// Audit Logs prüfen
const logs = await gdprCompliance.getAuditLogs(userId, 1000);

// Security Events filtern
const events = await securityMonitoring.getSecurityEvents({
  userId,
  timeRange: 24 * 60 * 60 * 1000
});

// Betroffene User identifizieren
const affectedUsers = await identifyAffectedUsers(incident);
```

### Phase 4: Eradication (4-24 hours)

**Cleanup:**
1. Malicious Code entfernen
2. Sicherheitslücken patchen
3. Credentials rotieren
4. Database Recovery (falls nötig)

### Phase 5: Recovery (24-72 hours)

**Wiederherstellung:**
1. Services wieder online
2. Monitoring verstärken
3. Benutzer informieren

### Phase 6: Lessons Learned (3-7 days)

**Dokumentation:**
1. Incident Report erstellen
2. Security Maßnahmen anpassen
3. Team Training
4. Prozesse verbessern

---

## ✅ SECURITY CHECKLIST

### Pre-Deployment

- [ ] Datenbank-Migration durchgeführt
- [ ] Environment Variables gesetzt
- [ ] SSL/TLS Zertifikat konfiguriert
- [ ] Security Headers aktiviert
- [ ] Rate Limiting getestet
- [ ] WAF Rules konfiguriert
- [ ] Backup-System eingerichtet

### Post-Deployment

- [ ] Security Health Check durchgeführt
- [ ] Monitoring aktiv
- [ ] Alert System getestet
- [ ] Incident Response Plan reviewed
- [ ] Team geschult
- [ ] Dokumentation vollständig

### Monatlich

- [ ] Security Audit
- [ ] Logs reviewed
- [ ] Alerts analyzed
- [ ] Blocked IPs reviewed
- [ ] 2FA Adoption prüfen
- [ ] Dependencies updaten

### Vierteljährlich

- [ ] Penetration Test
- [ ] Security Training
- [ ] Incident Response Drill
- [ ] GDPR Compliance Review
- [ ] Security Policies Update

---

## 📞 KONTAKT & SUPPORT

**Security Team:**
- Email: security@anpip.com
- Emergency: +49-XXX-XXXXXXX
- Slack: #security-alerts

**Data Protection Officer:**
- Email: dpo@anpip.com
- GDPR Requests: gdpr@anpip.com

---

## 📚 ZUSÄTZLICHE RESSOURCEN

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Guide](https://gdpr.eu/)
- [CCPA Overview](https://oag.ca.gov/privacy/ccpa)
- [Cloudflare Security](https://www.cloudflare.com/security/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)

---

**Status:** ✅ Production Ready  
**Last Updated:** 24. November 2025  
**Version:** 1.0.0  
**Security Level:** 🛡️ Militärisch

