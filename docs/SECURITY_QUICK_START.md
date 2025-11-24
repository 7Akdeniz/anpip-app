# 🛡️ SECURITY QUICK START GUIDE

## Schnellstart für Security-Features in 5 Minuten

---

## 📦 INSTALLATION

### 1. Datenbank-Migration

```bash
cd /Users/alanbest/Anpip.com
supabase db push
```

### 2. Environment Variables

Füge in `.env` hinzu:

```bash
# Security Encryption
ENCRYPTION_KEY=$(openssl rand -hex 16)

# Optional: Webhook Security
CLOUDFLARE_WEBHOOK_SECRET=$(openssl rand -hex 32)
```

---

## 🚀 VERWENDUNG

### DDoS Protection

```typescript
// In API Route
import { ddosProtection } from '@/lib/security/ddos-protection';

export async function POST(request: Request) {
  // 1. DDoS Check
  const securityCheck = await ddosProtection.checkRequest(request);
  if (!securityCheck.allowed) {
    return new Response(securityCheck.reason, { status: 429 });
  }
  
  // 2. Deine Business Logic
  // ...
}
```

### Input Validation

```typescript
// Form Validation
import { InputValidator } from '@/lib/security/waf';

const usernameCheck = InputValidator.validateUsername(username);
if (!usernameCheck.valid) {
  return { error: usernameCheck.error };
}

const passwordCheck = InputValidator.validatePassword(password);
if (passwordCheck.strength < 60) {
  return { error: 'Password too weak' };
}
```

### WAF Protection

```typescript
// Request Validation
import { waf } from '@/lib/security/waf';

export async function POST(request: Request) {
  // 1. WAF Check
  const validation = waf.validateRequest(request);
  if (validation.blocked) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // 2. Body Validation
  const body = await request.json();
  const bodyCheck = await waf.validateBody(body);
  
  if (bodyCheck.blocked) {
    return new Response('Invalid input', { status: 400 });
  }
  
  // 3. Verwende sanitized data
  const safeData = bodyCheck.sanitized;
}
```

### 2FA Setup

```typescript
// 2FA für User aktivieren
import { twoFactorAuth } from '@/lib/security/two-factor-auth';

// 1. Setup initiieren
const setup = await twoFactorAuth.enable2FA(userId);

// 2. QR Code anzeigen
<Image source={{ uri: setup.qrCode }} />

// 3. Backup Codes sicher speichern
console.log('Backup Codes:', setup.backupCodes);

// 4. Verifizieren
const verified = await twoFactorAuth.verify2FASetup(userId, code);
```

### GDPR Compliance

```typescript
// Daten Export
import { gdprCompliance } from '@/lib/security/gdpr-compliance';

// User kann Daten anfordern
const { requestId } = await gdprCompliance.requestDataExport(
  userId,
  email
);

// Account Löschung
const { scheduledDate } = await gdprCompliance.requestAccountDeletion(
  userId,
  reason = 'User request'
);

// Consent Management
await gdprCompliance.recordConsent(
  userId,
  'marketing',
  granted = true,
  request
);
```

---

## 🔍 MONITORING

### Security Dashboard

```typescript
import { securityMonitoring } from '@/lib/security/security-monitoring';

// Metrics anzeigen
const metrics = await securityMonitoring.getSecurityMetrics();

console.log(`
  Total Requests: ${metrics.totalRequests}
  Blocked: ${metrics.blockedRequests}
  Failed Logins: ${metrics.failedLogins}
  Active Threats: ${metrics.activeThreats}
`);

// Alerts prüfen
const alerts = await securityMonitoring.getActiveAlerts('critical');

// Health Check
import { securityHealthCheck } from '@/lib/security/security-monitoring';
const health = await securityHealthCheck.performHealthCheck();

console.log(`Security Score: ${health.score}/100`);
console.log(`Status: ${health.status}`);
```

---

## 📋 CHECKLISTE

### Vor dem Go-Live

- [ ] **Migration**: `supabase db push` ausgeführt
- [ ] **Environment**: ENCRYPTION_KEY gesetzt
- [ ] **SSL**: HTTPS aktiviert
- [ ] **Headers**: Security Headers in vercel.json
- [ ] **Rate Limiting**: DDoS Protection getestet
- [ ] **2FA**: Für Admin-Accounts aktiviert
- [ ] **Monitoring**: Alert System aktiv
- [ ] **Backup**: Datenbank-Backup eingerichtet

### Nach dem Go-Live

- [ ] **Health Check**: Täglich ausführen
- [ ] **Alerts**: Überwachen
- [ ] **Logs**: Wöchentlich reviewen
- [ ] **Updates**: Monatlich prüfen

---

## 🆘 HÄUFIGE PROBLEME

### Problem: "ENCRYPTION_KEY not set"

**Lösung:**
```bash
# .env
ENCRYPTION_KEY=$(openssl rand -hex 16)
```

### Problem: "Migration failed"

**Lösung:**
```bash
# Supabase Dashboard → SQL Editor
# Führe die Migration manuell aus:
# supabase/migrations/20241124_security_infrastructure.sql
```

### Problem: "Too many requests"

**Lösung:**
```typescript
// Rate Limit wurde getriggert (normal)
// IP wird automatisch nach Blockdauer freigegeben
// Oder manuell:
await supabase.from('blocked_ips').delete().eq('ip_address', ip);
```

---

## 📞 SUPPORT

Bei Fragen:
1. Dokumentation: `docs/SECURITY_ARCHITECTURE.md`
2. GitHub Issues: https://github.com/7Akdeniz/anpip-app/issues
3. Email: security@anpip.com

---

**Alles klar? Dann bist du bereit! 🚀**
