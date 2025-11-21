# 🚀 Deployment & Implementation Guide - Anpip.com Enterprise Features

## 📋 Schritt-für-Schritt Implementierung

### Phase 1: Datenbank-Setup (5-10 Minuten)

#### 1.1 Migrationen ausführen

```bash
# Supabase CLI installieren (falls nicht vorhanden)
npm install -g supabase

# Mit Supabase verbinden
export SUPABASE_ACCESS_TOKEN="dein_token"
export SUPABASE_PROJECT_ID="dein_projekt_id"

# Migrationen ausführen
cd /Users/alanbest/Anpip.com
supabase db push

# Oder manuell im Supabase Dashboard:
# 1. Gehe zu SQL Editor
# 2. Führe diese Dateien in Reihenfolge aus:
#    - supabase/migrations/20241121_recommendation_engine.sql
#    - supabase/migrations/20241121_background_jobs.sql
```

#### 1.2 Verifizierung

```sql
-- Im Supabase SQL Editor ausführen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_behaviors', 'user_preferences', 'video_stats', 'background_jobs');

-- Sollte 4 Tabellen zurückgeben
```

---

### Phase 2: Environment Variables (5 Minuten)

#### 2.1 Supabase Edge Functions

Erstelle `.env` für Edge Functions:

```bash
cd supabase/functions
cat > .env << EOF
OPENAI_API_KEY=sk-proj-...
SUPABASE_URL=https://dein-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
SUPABASE_ANON_KEY=dein-anon-key
EOF
```

#### 2.2 Client-Side (.env.local)

```bash
cd /Users/alanbest/Anpip.com
cat > .env.local << EOF
EXPO_PUBLIC_SUPABASE_URL=https://dein-projekt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dein-anon-key
OPENAI_API_KEY=sk-proj-...
SUPABASE_SERVICE_ROLE_KEY=dein-service-role-key
EOF
```

---

### Phase 3: Edge Functions Deployment (10 Minuten)

#### 3.1 AI Content Generator

```bash
cd /Users/alanbest/Anpip.com

# Function deployen
supabase functions deploy ai-content-generator

# Test
curl -X POST \
  "https://dein-projekt.supabase.co/functions/v1/ai-content-generator" \
  -H "Authorization: Bearer dein-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "test-video-id",
    "videoUrl": "https://example.com/video.mp4",
    "category": "travel",
    "location": "Berlin"
  }'
```

#### 3.2 Bestehende Functions aktualisieren

```bash
# Compress Video (bereits vorhanden)
supabase functions deploy compress-video

# Liste aller Functions
supabase functions list
```

---

### Phase 4: Background Workers starten (Option A: Lokal)

#### 4.1 Worker-Service erstellen

```typescript
// workers/index.ts
import { getBackgroundJobQueue } from '../lib/background-jobs';

const queue = getBackgroundJobQueue();

console.log('🚀 Starting background workers...');
queue.startProcessing();

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down workers...');
  queue.stopProcessing();
  process.exit(0);
});
```

#### 4.2 Worker starten

```bash
# Terminal 1: Worker
cd /Users/alanbest/Anpip.com
npx ts-node workers/index.ts

# Läuft permanent und verarbeitet Jobs
```

---

### Phase 4: Background Workers starten (Option B: Cloud)

#### 4.1 Docker Container (Empfohlen für Production)

```dockerfile
# workers/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

CMD ["node", "workers/index.js"]
```

#### 4.2 Deploy zu Railway/Render/Fly.io

```bash
# Railway
railway init
railway up

# Oder Render
render deploy

# Oder als Supabase Edge Function (Cron-basiert)
```

---

### Phase 5: Integration in Upload-Flow

#### 5.1 Upload-Component aktualisieren

```typescript
// components/upload/VideoUploader.tsx
import { ResilientUploadSystem } from '@/lib/resilient-upload';
import { getBackgroundJobQueue } from '@/lib/background-jobs';

export function VideoUploader() {
  const uploadSystem = new ResilientUploadSystem(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleUpload = async (file: File) => {
    try {
      // 1. Resilient Upload
      const videoUrl = await uploadSystem.uploadVideo(file, file.name, {
        onProgress: (progress) => {
          console.log(`Upload: ${progress.percentage}%`);
        },
        onComplete: async (result) => {
          // 2. Trigger Background Jobs
          const queue = getBackgroundJobQueue();
          
          // Video Processing
          await queue.addJob('video-processing', {
            videoId: result.videoId,
            videoUrl: result.videoUrl,
          }, { priority: 8 });
          
          // AI Content Generation
          await queue.addJob('ai-content-generation', {
            videoId: result.videoId,
            videoUrl: result.videoUrl,
            category: selectedCategory,
            location: detectedLocation,
          }, { priority: 9 });
          
          // Thumbnail Generation
          await queue.addJob('thumbnail-generation', {
            videoId: result.videoId,
            videoUrl: result.videoUrl,
          }, { priority: 7 });
        },
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <View>
      {/* Upload UI */}
    </View>
  );
}
```

---

### Phase 6: Feed-Integration

#### 6.1 Personalisierter Feed

```typescript
// app/(tabs)/feed.tsx
import { useEffect, useState } from 'react';
import { getRecommendationEngine } from '@/lib/recommendation-engine';
import { supabase } from '@/lib/supabase';

export default function FeedScreen() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const engine = getRecommendationEngine();

  useEffect(() => {
    loadPersonalizedFeed();
  }, []);

  async function loadPersonalizedFeed() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Personalisierter Feed mit <100ms
      const scoredVideos = await engine.getPersonalizedFeed(user.id, 20);
      
      // Video-Details laden
      const videoIds = scoredVideos.map(v => v.videoId);
      const { data: videoDetails } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);

      setVideos(videoDetails || []);
    } catch (error) {
      console.error('Feed loading failed:', error);
    } finally {
      setLoading(false);
    }
  }

  // ... Rest der Component
}
```

#### 6.2 Behavior Tracking

```typescript
// components/feed/VideoPlayer.tsx
import { getRecommendationEngine } from '@/lib/recommendation-engine';

export function VideoPlayer({ video }) {
  const engine = getRecommendationEngine();
  const [watchTime, setWatchTime] = useState(0);

  const handleVideoProgress = async (currentTime: number, duration: number) => {
    const percentage = (currentTime / duration) * 100;
    
    // Track alle 5 Sekunden
    if (Math.floor(currentTime) % 5 === 0) {
      await engine.trackBehavior({
        userId: user.id,
        videoId: video.id,
        action: 'view',
        watchTime: currentTime,
        watchPercentage: percentage,
        timestamp: new Date(),
        location: video.location,
        category: video.category,
      });
    }
    
    // Watch Complete
    if (percentage > 90) {
      await engine.trackBehavior({
        userId: user.id,
        videoId: video.id,
        action: 'watch_complete',
        watchTime: currentTime,
        watchPercentage: 100,
        timestamp: new Date(),
      });
    }
  };

  // ... Rest der Component
}
```

---

### Phase 7: Analytics Dashboard

#### 7.1 Analytics Component

```typescript
// app/(tabs)/analytics.tsx
import { AnalyticsEngine } from '@/lib/analytics-engine';

export default function AnalyticsScreen() {
  const [analytics, setAnalytics] = useState<any>(null);
  const engine = new AnalyticsEngine(
    process.env.EXPO_PUBLIC_SUPABASE_URL!,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    const videoId = 'your-video-id';
    const data = await engine.getVideoAnalytics(videoId);
    setAnalytics(data);
  }

  return (
    <ScrollView>
      <Text>Views: {analytics?.views}</Text>
      <Text>Avg Watch Time: {analytics?.avgWatchTime}s</Text>
      <Text>Engagement Rate: {analytics?.engagementRate}%</Text>
      
      {/* Retention Curve */}
      <RetentionCurveChart data={analytics?.retentionCurve} />
      
      {/* Drop-off Points */}
      <Text>Critical Drop-offs at: {analytics?.dropOffPoints.join(', ')}s</Text>
      
      {/* Predictions */}
      <Text>Expected Views (24h): {analytics?.predictions.expectedViews24h}</Text>
      <Text>Virality Score: {analytics?.predictions.viralityScore}</Text>
    </ScrollView>
  );
}
```

---

### Phase 8: Testing

#### 8.1 Upload-Test

```bash
# Test mit kleinem Video (< 10MB)
# 1. App öffnen
# 2. Video hochladen
# 3. Progress beobachten
# 4. Jobs in Datenbank prüfen:

# SQL:
SELECT * FROM background_jobs 
WHERE payload->>'videoId' = 'dein-video-id'
ORDER BY created_at DESC;
```

#### 8.2 Recommendation-Test

```bash
# SQL: Behavior einfügen
INSERT INTO user_behaviors (user_id, video_id, action, watch_time, watch_percentage, category)
VALUES 
  ('user-id', 'video-1', 'like', 30, 80, 'travel'),
  ('user-id', 'video-2', 'watch_complete', 60, 100, 'travel'),
  ('user-id', 'video-3', 'share', 45, 90, 'food');

# Preferences aktualisieren
SELECT refresh_user_preferences('user-id');

# Feed testen
# -> App öffnen -> Feed sollte travel/food bevorzugen
```

#### 8.3 Performance-Test

```typescript
// Test Response Time
const start = performance.now();
const feed = await engine.getPersonalizedFeed(userId, 20);
const elapsed = performance.now() - start;
console.log(`Feed generated in ${elapsed}ms`); // Sollte <100ms sein
```

---

### Phase 9: Monitoring & Logging

#### 9.1 Supabase Logs

```bash
# Edge Function Logs
supabase functions logs ai-content-generator

# Database Logs
# Im Supabase Dashboard -> Logs
```

#### 9.2 Background Job Monitoring

```sql
-- Job Status Overview
SELECT 
  status, 
  type,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at))) as avg_duration_seconds
FROM background_jobs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY status, type
ORDER BY status, count DESC;

-- Failed Jobs
SELECT * FROM background_jobs 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;
```

#### 9.3 Performance Monitoring

```sql
-- Feed Performance
SELECT 
  AVG(response_time_ms) as avg_response,
  MAX(response_time_ms) as max_response,
  COUNT(*) as requests
FROM feed_performance_logs
WHERE created_at > NOW() - INTERVAL '1 hour';
```

---

### Phase 10: Optimierungen

#### 10.1 Caching Layer (Optional - Redis)

```typescript
// lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedFeed(userId: string) {
  const cached = await redis.get(`feed:${userId}`);
  if (cached) return JSON.parse(cached);
  return null;
}

export async function setCachedFeed(userId: string, feed: any) {
  await redis.setex(`feed:${userId}`, 60, JSON.stringify(feed)); // 60s TTL
}
```

#### 10.2 CDN für Videos (Cloudflare)

```typescript
// lib/cdn.ts
export function getCDNUrl(videoUrl: string): string {
  const url = new URL(videoUrl);
  return `https://cdn.anpip.com${url.pathname}`;
}
```

---

## ✅ Deployment Checklist

- [ ] Datenbank-Migrationen ausgeführt
- [ ] Environment Variables gesetzt
- [ ] Edge Functions deployed
- [ ] Background Workers gestartet
- [ ] Upload-Flow getestet (klein + groß)
- [ ] Recommendation Engine getestet
- [ ] Analytics funktioniert
- [ ] Job-Queue läuft
- [ ] Monitoring aktiv
- [ ] Error Logging aktiv
- [ ] Performance < 100ms für Feed
- [ ] Upload Success Rate > 99%

---

## 🚨 Troubleshooting

### Problem: Feed zu langsam (>100ms)

**Lösung:**
```sql
-- Indizes prüfen
SELECT schemaname, tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('user_behaviors', 'video_stats', 'user_preferences');

-- Fehlende Indizes erstellen
CREATE INDEX IF NOT EXISTS idx_user_behaviors_composite 
ON user_behaviors(user_id, timestamp DESC, action);
```

### Problem: Background Jobs stecken fest

**Lösung:**
```sql
-- Stuck Jobs zurücksetzen
UPDATE background_jobs 
SET status = 'retry', retry_count = 0 
WHERE status = 'processing' 
AND started_at < NOW() - INTERVAL '30 minutes';
```

### Problem: Upload bricht ab

**Lösung:**
- Chunk-Size reduzieren (von 5MB auf 2MB)
- Timeout erhöhen (von 5min auf 10min)
- Retry-Count erhöhen (von 5 auf 10)

---

## 📈 Success Metrics

**Nach 1 Woche:**
- [ ] 100+ Videos hochgeladen
- [ ] 1000+ User Behaviors getrackt
- [ ] Feed Response Time konstant <100ms
- [ ] 0 Upload-Fehler
- [ ] 500+ KI-generierte Titel/Beschreibungen

**Nach 1 Monat:**
- [ ] 10.000+ Videos
- [ ] 100.000+ Behaviors
- [ ] Personalisierung zeigt Wirkung (höhere Watchtime)
- [ ] Analytics zeigt klare Trends

---

## 🎯 Nächste Features (Roadmap)

1. **Live Streaming** (Q1 2025)
2. **Push Notifications** (Q1 2025)
3. **Social Sharing Optimization** (Q2 2025)
4. **AI Video Editing** (Q2 2025)
5. **Monetization** (Q3 2025)

---

## 💬 Support

Bei Fragen oder Problemen:
1. Logs prüfen (`supabase functions logs`)
2. Datenbank-Status prüfen (SQL Queries oben)
3. GitHub Issues erstellen
4. Community Forum

**Viel Erfolg! 🚀**
