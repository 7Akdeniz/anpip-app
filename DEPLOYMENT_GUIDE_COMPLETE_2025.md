# 🚀 ANPIP.COM - DEPLOYMENT GUIDE 2025

## ⚡ QUICK START (5 Minuten)

### 1. **Datenbank-Setup**

```bash
# Supabase-Projekt erstellen auf https://supabase.com

# Migrationen ausführen
cd /Users/alanbest/Anpip.com
supabase db push

# Oder manuell in SQL-Editor kopieren:
# - supabase/migrations/20241121_live_streaming_system.sql
# - supabase/migrations/20241121_complete_system_2025.sql
```

### 2. **Edge Functions deployen**

```bash
# Supabase CLI installieren (falls nicht vorhanden)
brew install supabase/tap/supabase

# Login
supabase login

# Functions deployen
export SUPABASE_ACCESS_TOKEN=dein_access_token
supabase functions deploy initialize-upload --no-verify-jwt
supabase functions deploy get-chunk-upload-url --no-verify-jwt
supabase functions deploy finalize-upload --no-verify-jwt
supabase functions deploy process-video --no-verify-jwt
supabase functions deploy ai-content-generator --no-verify-jwt
supabase functions deploy compress-video --no-verify-jwt
```

### 3. **Environment Variables**

Erstelle `.env.local`:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key

# OpenAI (für KI-Features)
OPENAI_API_KEY=sk-...

# Weitere APIs
VIRUSТOTAL_API_KEY=...
IPAPI_KEY=...
```

### 4. **Dependencies installieren**

```bash
npm install

# Wichtige neue Packages
npm install @react-native-async-storage/async-storage
```

### 5. **App starten**

```bash
# Development
npm start

# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

---

## 🌐 PRODUCTION DEPLOYMENT

### **A. Web (Vercel)**

```bash
# Build
npm run build:pwa

# Deploy
vercel --prod

# Automatisches Deployment bei Git Push:
# - Vercel mit GitHub verbinden
# - Automatisches CI/CD
```

**Vercel-Config** (`vercel.json` bereits vorhanden):

```json
{
  "buildCommand": "npm run build:pwa",
  "outputDirectory": "dist",
  "framework": "expo",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000" }
      ]
    }
  ]
}
```

### **B. Mobile Apps**

#### **iOS (App Store)**

```bash
# Build für Production
eas build --platform ios --profile production

# Submit zu App Store
eas submit --platform ios
```

#### **Android (Play Store)**

```bash
# Build für Production
eas build --platform android --profile production

# Submit zu Play Store
eas submit --platform android
```

**EAS-Config** (`eas.json`):

```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "com.anpip.app"
      },
      "android": {
        "package": "com.anpip.app"
      }
    }
  }
}
```

### **C. Video-Worker (Docker)**

```bash
# Build Image
docker build -t anpip-video-worker -f docker/video-worker.Dockerfile .

# Run
docker run -d \
  --name video-worker \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_SERVICE_KEY=$SUPABASE_SERVICE_KEY \
  anpip-video-worker

# Oder mit Docker Compose
docker-compose up -d
```

### **D. Kubernetes (Enterprise)**

```bash
# Namespace erstellen
kubectl create namespace anpip

# Secrets setzen
kubectl create secret generic anpip-secrets \
  --from-literal=supabase-url=$SUPABASE_URL \
  --from-literal=supabase-key=$SUPABASE_SERVICE_KEY \
  --from-literal=openai-key=$OPENAI_API_KEY \
  -n anpip

# Deploy
kubectl apply -f kubernetes/ -n anpip

# Status prüfen
kubectl get pods -n anpip
kubectl get services -n anpip

# Logs
kubectl logs -f deployment/video-worker -n anpip
```

---

## 🔧 KONFIGURATION

### **1. CDN Setup (Cloudflare)**

```
1. Domain zu Cloudflare hinzufügen: anpip.com
2. SSL/TLS: Full (strict)
3. Cache:
   - Videos: Cache Everything (1 Monat)
   - HLS: Cache (10 Minuten)
   - API: No Cache
4. DDoS Protection: Aktivieren
5. Rate Limiting:
   - /api/*: 100 req/min
   - /upload/*: 10 req/min
```

### **2. Supabase Storage Buckets**

```sql
-- In Supabase Dashboard → Storage

-- 1. Videos Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true);

-- 2. Thumbnails Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('thumbnails', 'thumbnails', true);

-- 3. Avatars Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- 4. HLS Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('hls', 'hls', true);
```

### **3. Realtime aktivieren**

```sql
-- In Supabase SQL-Editor

ALTER PUBLICATION supabase_realtime ADD TABLE live_streams;
ALTER PUBLICATION supabase_realtime ADD TABLE live_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE video_views;
```

---

## 📊 MONITORING & ANALYTICS

### **1. Supabase Dashboard**

- Database → Tables
- Storage → Buckets
- Edge Functions → Logs
- Realtime → Subscriptions

### **2. Vercel Analytics**

```bash
npm install @vercel/analytics

# In App einbinden
import { Analytics } from '@vercel/analytics/react';
<Analytics />
```

### **3. Custom Monitoring**

```typescript
// lib/monitoring.ts
export async function trackEvent(event: string, data?: any) {
  await supabase.from('analytics_events').insert({
    event,
    data,
    timestamp: new Date().toISOString(),
  });
}
```

---

## 🐛 DEBUGGING

### **1. Logs prüfen**

```bash
# Supabase Edge Functions
supabase functions logs initialize-upload

# Docker
docker logs video-worker

# Kubernetes
kubectl logs -f deployment/video-worker -n anpip
```

### **2. Database Queries testen**

```sql
-- Feed-Performance testen
EXPLAIN ANALYZE
SELECT * FROM get_personalized_feed(
  'user-id',
  ARRAY[]::UUID[],
  ARRAY['news', 'sports'],
  ARRAY['trending'],
  ARRAY[]::UUID[],
  NULL, 'de', NULL, NULL, false, 20
);
```

### **3. Network Inspector**

```bash
# Web: Chrome DevTools → Network
# Mobile: React Native Debugger
```

---

## 🔄 UPDATE-PROZESS

### **1. Database Migrations**

```bash
# Neue Migration erstellen
supabase migration new feature_name

# Migrations ausführen
supabase db push
```

### **2. Edge Functions aktualisieren**

```bash
supabase functions deploy function-name --no-verify-jwt
```

### **3. App aktualisieren**

```bash
# Web (automatisch via Vercel)
git push origin main

# Mobile (OTA-Update via EAS)
eas update --branch production
```

---

## 🚨 ROLLBACK

```bash
# Database
supabase db reset

# Edge Function
supabase functions deploy function-name@previous-version

# Web
vercel rollback

# Mobile
eas update --branch production --message "Rollback"
```

---

## ✅ CHECKLISTE VOR GO-LIVE

- [ ] Alle Migrationen ausgeführt
- [ ] Edge Functions deployed
- [ ] Environment Variables gesetzt
- [ ] Storage Buckets konfiguriert
- [ ] CDN aktiviert
- [ ] SSL-Zertifikat aktiv
- [ ] DDoS-Schutz aktiviert
- [ ] Rate Limiting konfiguriert
- [ ] Monitoring aktiv
- [ ] Backup-Strategie definiert
- [ ] Load-Tests durchgeführt
- [ ] Security-Audit durchgeführt
- [ ] Legal: Datenschutz, AGB, Impressum

---

## 🎯 PERFORMANCE-OPTIMIERUNG

### **1. Database Indexes**

```sql
-- Wichtigste Indexes (bereits in Migrations)
CREATE INDEX idx_videos_category ON videos(category);
CREATE INDEX idx_videos_language ON videos(language);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
```

### **2. Edge Caching**

```javascript
// In Vercel: edge-config.json
{
  "cache": {
    "/api/feed": 60,
    "/api/video/*": 3600
  }
}
```

### **3. Image Optimization**

```typescript
// Thumbnails optimieren
import sharp from 'sharp';

await sharp(input)
  .resize(1280, 720)
  .webp({ quality: 85 })
  .toFile(output);
```

---

## 🆘 SUPPORT

- **Dokumentation**: `/ENTERPRISE_ARCHITECTURE_COMPLETE_2025.md`
- **GitHub Issues**: https://github.com/7Akdeniz/anpip-app/issues
- **Email**: support@anpip.com

---

**Viel Erfolg mit Anpip.com! 🚀**
