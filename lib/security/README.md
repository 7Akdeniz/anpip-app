# 🛡️ ANPIP SECURITY MODULES

Militärisch sichere, hacker-resistente Sicherheitsarchitektur für weltweite Skalierung.

---

## 📦 MODULE

### 1. DDoS Protection (`ddos-protection.ts`)

**Features:**
- ✅ Multi-Layer Rate Limiting
- ✅ IP-basierte Blockierung
- ✅ Bot Detection & Filtering
- ✅ Distributed Attack Recognition
- ✅ Automatic IP Blacklisting
- ✅ Threat Level Scoring (0-100)

**Usage:**
```typescript
import { ddosProtection } from '@/lib/security/ddos-protection';

const check = await ddosProtection.checkRequest(request);
if (!check.allowed) {
  return new Response(check.reason, { status: 429 });
}
```

---

### 2. Web Application Firewall (`waf.ts`)

**Protection Against:**
- SQL Injection (15+ patterns)
- XSS (10+ patterns)
- Path Traversal
- Command Injection
- SSRF
- Header Injection

**Usage:**
```typescript
import { waf, InputValidator } from '@/lib/security/waf';

// Request validation
const validation = waf.validateRequest(request);

// Body sanitization
const bodyCheck = await waf.validateBody(body);
const safeData = bodyCheck.sanitized;

// Input validation
const check = InputValidator.validateUsername(username);
```

---

### 3. Token Security (`token-security.ts`)

**Features:**
- ✅ JWT Validation
- ✅ Token Rotation
- ✅ Refresh Token Management
- ✅ Session Management
- ✅ Device Fingerprinting
- ✅ Suspicious Login Detection
- ✅ Secure Cookie Handling

**Usage:**
```typescript
import { tokenSecurity, cookieSecurity } from '@/lib/security/token-security';

// Validate token
const valid = await tokenSecurity.validateAccessToken(token);

// Rotate tokens
const { tokens } = await tokenSecurity.rotateTokens(refreshToken);

// Set secure cookie
cookieSecurity.setSecureCookie(response, 'token', value, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});
```

---

### 4. Two-Factor Authentication (`two-factor-auth.ts`)

**Supported Methods:**
- TOTP (Google Authenticator, Authy)
- Backup Codes (10 codes)
- SMS (via Twilio/Supabase)
- Email Codes

**Usage:**
```typescript
import { twoFactorAuth, deviceManagement } from '@/lib/security/two-factor-auth';

// Enable 2FA
const { secret, qrCode, backupCodes } = await twoFactorAuth.enable2FA(userId);

// Verify setup
await twoFactorAuth.verify2FASetup(userId, code);

// Verify during login
await twoFactorAuth.verify2FA(userId, code);

// Manage devices
const devices = await deviceManagement.getUserDevices(userId);
await deviceManagement.removeDevice(userId, sessionId);
```

---

### 5. GDPR Compliance (`gdpr-compliance.ts`)

**GDPR Articles:**
- Article 15: Right to Access
- Article 16: Right to Rectification
- Article 17: Right to Erasure
- Article 20: Data Portability
- Article 30: Record of Processing

**Usage:**
```typescript
import { gdprCompliance, ccpaCompliance } from '@/lib/security/gdpr-compliance';

// Data export
await gdprCompliance.requestDataExport(userId, email);

// Account deletion
await gdprCompliance.requestAccountDeletion(userId, reason);

// Consent management
await gdprCompliance.recordConsent(userId, 'marketing', true, request);

// Audit logging
await gdprCompliance.logDataAccess({
  userId,
  action: 'profile_view',
  resourceType: 'user',
  ipAddress,
  timestamp: new Date()
});
```

---

### 6. Security Monitoring (`security-monitoring.ts`)

**Features:**
- ✅ Anomaly Detection
- ✅ Real-time Alerts
- ✅ Security Metrics
- ✅ Attack Pattern Recognition
- ✅ Auto-Response System
- ✅ Health Checks

**Usage:**
```typescript
import { securityMonitoring, securityHealthCheck } from '@/lib/security/security-monitoring';

// Detect anomalies
const anomaly = await securityMonitoring.detectAnomalies(userId, action);

// Get alerts
const alerts = await securityMonitoring.getActiveAlerts('critical');

// Get metrics
const metrics = await securityMonitoring.getSecurityMetrics();

// Health check
const health = await securityHealthCheck.performHealthCheck();
```

---

## 🗄️ DATABASE SCHEMA

**Migration:** `supabase/migrations/20241124_security_infrastructure.sql`

**Tables:**
- `blocked_ips` - IP Blacklist
- `security_events` - Event Logging
- `security_alerts` - Active Threats
- `audit_logs` - GDPR Audit Trail
- `consent_records` - Consent Management
- `data_export_requests` - Data Exports
- `data_deletion_requests` - Account Deletions
- `user_2fa` - 2FA Secrets
- `security_incidents` - Data Breaches

**All tables have Row Level Security (RLS) enabled!**

---

## 🚀 QUICK START

### Installation

```bash
# 1. Run migration
supabase db push

# 2. Setup environment
./scripts/setup-security.sh

# 3. Test locally
npm run start
```

### Basic Integration

```typescript
// In your API route
import { ddosProtection } from '@/lib/security/ddos-protection';
import { waf } from '@/lib/security/waf';

export async function POST(request: Request) {
  // 1. DDoS protection
  const ddosCheck = await ddosProtection.checkRequest(request);
  if (!ddosCheck.allowed) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // 2. WAF validation
  const wafCheck = waf.validateRequest(request);
  if (wafCheck.blocked) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // 3. Body validation
  const body = await request.json();
  const bodyCheck = await waf.validateBody(body);
  
  if (bodyCheck.blocked) {
    return new Response('Invalid input', { status: 400 });
  }
  
  // 4. Use sanitized data
  const safeData = bodyCheck.sanitized;
  
  // Your business logic...
}
```

---

## 📊 MONITORING

### Dashboard Metrics

```typescript
const metrics = await securityMonitoring.getSecurityMetrics();

console.log(`
  Total Requests: ${metrics.totalRequests}
  Blocked Requests: ${metrics.blockedRequests}
  Failed Logins: ${metrics.failedLogins}
  Suspicious Activities: ${metrics.suspiciousActivities}
  Active Threats: ${metrics.activeThreats}
`);
```

### Security Report

```typescript
const report = await securityMonitoring.generateSecurityReport();

console.log(`
  Period: ${report.period.start} - ${report.period.end}
  Critical Alerts: ${report.alerts.critical}
  High Alerts: ${report.alerts.high}
  
  Top Threats:
  ${report.topThreats.map(t => `- ${t.message}`).join('\n')}
  
  Recommendations:
  ${report.recommendations.map(r => `- ${r}`).join('\n')}
`);
```

---

## 🔒 BEST PRACTICES

### 1. Always Validate Input

```typescript
// ✅ GOOD
const check = InputValidator.validateUsername(username);
if (!check.valid) {
  return { error: check.error };
}

// ❌ BAD
const username = request.body.username; // No validation!
```

### 2. Use Parameterized Queries

```typescript
// ✅ GOOD
const { data } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId);

// ❌ BAD
const query = `SELECT * FROM users WHERE id = ${userId}`;
```

### 3. Enable 2FA for Admins

```typescript
// Required for all admin accounts
if (user.role === 'admin') {
  const has2FA = await twoFactorAuth.is2FAEnabled(user.id);
  if (!has2FA) {
    return { error: 'Admins must enable 2FA' };
  }
}
```

### 4. Log Security Events

```typescript
// Always log security-relevant actions
await gdprCompliance.logDataAccess({
  userId,
  action: 'sensitive_data_access',
  resourceType: 'user_profile',
  resourceId: targetUserId,
  ipAddress,
  userAgent,
  timestamp: new Date()
});
```

### 5. Regular Health Checks

```typescript
// Run daily
const health = await securityHealthCheck.performHealthCheck();

if (health.status === 'critical') {
  // Alert security team
  await notifySecurityTeam(health);
}
```

---

## 🚨 INCIDENT RESPONSE

### Auto-Response Actions

```typescript
// Automatically triggered:

// 1. IP Block (> 5 failed logins in 15 min)
// 2. Session Revocation (suspicious activity)
// 3. Alert Creation (critical threats)
// 4. Security Team Notification (critical alerts)
```

### Manual Response

```typescript
// Block IP manually
await ddosProtection.blockIP(ipAddress, 24 * 60 * 60 * 1000);

// Revoke all user sessions
await tokenSecurity.revokeAllTokens(userId);

// Resolve alert
await securityMonitoring.resolveAlert(alertId, adminId, 'False positive');
```

---

## 📚 DOCUMENTATION

- **Full Guide:** [docs/SECURITY_ARCHITECTURE.md](../docs/SECURITY_ARCHITECTURE.md)
- **Quick Start:** [docs/SECURITY_QUICK_START.md](../docs/SECURITY_QUICK_START.md)
- **Setup Script:** [scripts/setup-security.sh](../scripts/setup-security.sh)

---

## 🔗 RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GDPR Guide](https://gdpr.eu/)
- [Supabase Security](https://supabase.com/docs/guides/platform/security)
- [Cloudflare Security](https://www.cloudflare.com/security/)

---

## 📞 SUPPORT

**Security Issues:**
- Email: security@anpip.com
- Emergency: security-emergency@anpip.com

**GDPR Requests:**
- Email: gdpr@anpip.com
- Data Protection Officer: dpo@anpip.com

---

**Security Level:** 🛡️ Militärisch  
**Last Updated:** 24. November 2025  
**Version:** 1.0.0
