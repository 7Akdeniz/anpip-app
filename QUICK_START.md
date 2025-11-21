# 🚀 QUICK START GUIDE - Anpip.com SEO 2025

## ⚡ SOFORT STARTEN

### 1️⃣ **App Layout aktualisieren**

Füge die Performance & SEO-Optimierungen zum Root Layout hinzu:

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { initAdvancedWebVitals, setupHoverPrefetch, addAdvancedResourceHints } from '@/lib/performance-2025';
import { registerServiceWorker, initPWAInstall } from '@/lib/pwa-install-2025';

export default function RootLayout() {
  // ... existing code ...

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Performance Monitoring
    initAdvancedWebVitals((metrics) => {
      console.log('📊 Web Vitals:', metrics);
      
      // Send to Analytics
      fetch('/api/analytics/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics),
      }).catch(console.error);
    });

    // Advanced Optimizations
    setupHoverPrefetch();
    addAdvancedResourceHints();

    // PWA Installation
    registerServiceWorker();
    const pwaManager = initPWAInstall({
      appName: 'Anpip',
      appIcon: '/assets/images/icon-192x192.png',
    });

    console.log('✅ SEO & Performance initialized');
  }, []);

  // ... rest of code ...
}
```

---

### 2️⃣ **SEO Head zu Seiten hinzufügen**

Für **JEDE wichtige Seite** SEOHead Component nutzen:

```tsx
// app/(tabs)/index.tsx
import SEOHead from '@/components/SEOHead';

export default function HomeScreen() {
  return (
    <>
      <SEOHead
        title="Anpip - Dein lokaler Marktplatz"
        description="Entdecke lokale Videos, Angebote und Dienstleistungen in deiner Stadt"
        canonical="https://anpip.com"
        keywords={["videos", "marktplatz", "lokal", "angebote"]}
        ogImage="https://anpip.com/og-image.jpg"
      />
      
      {/* Your content */}
    </>
  );
}
```

**Für Stadtseiten:**
```tsx
// app/[country]/[city]/index.tsx
import SEOHead from '@/components/SEOHead';
import { generateLocalizedContent } from '@/lib/geo-seo-2025';

export default function CityPage({ country, city }) {
  const content = generateLocalizedContent({ country, city });
  
  return (
    <>
      <SEOHead
        title={content.h1}
        description={content.description}
        keywords={content.keywords}
        geoPlacename={city}
        breadcrumbs={{
          itemListElement: [
            { position: 1, name: 'Start', item: 'https://anpip.com' },
            { position: 2, name: country, item: `https://anpip.com/${country}` },
            { position: 3, name: city },
          ]
        }}
      />
      
      {/* City content */}
    </>
  );
}
```

**Für Videos:**
```tsx
// app/video/[id].tsx
import SEOHead from '@/components/SEOHead';
import { formatDuration } from '@/lib/ai-seo-2025';

export default function VideoPage({ video }) {
  return (
    <>
      <SEOHead
        title={video.title}
        description={video.description}
        ogType="video.other"
        ogVideo={video.video_url}
        ogImage={video.thumbnail_url}
        video={{
          name: video.title,
          description: video.description,
          thumbnailUrl: video.thumbnail_url,
          contentUrl: video.video_url,
          uploadDate: video.created_at,
          duration: formatDuration(video.duration),
          interactionStatistic: [{
            '@type': 'InteractionCounter',
            interactionType: 'https://schema.org/WatchAction',
            userInteractionCount: video.view_count,
          }],
        }}
      />
      
      {/* Video player */}
    </>
  );
}
```

---

### 3️⃣ **Video Feed implementieren**

Für TikTok-Style Scroll:

```tsx
// app/(tabs)/feed.tsx
import { useVideoFeed } from '@/lib/video-feed-2025';
import { Video } from 'expo-av';

export default function FeedScreen() {
  const videos = []; // Load from DB
  
  const { 
    containerRef, 
    registerVideo, 
    currentIndex,
    currentVideo,
  } = useVideoFeed({
    videos,
    onVideoChange: (video, index) => {
      console.log('Now playing:', video.id);
    },
    updateURL: true,
    autoPlay: true,
  });

  return (
    <div ref={containerRef} className="video-feed-container">
      {videos.map((video, index) => (
        <div key={video.id} className="video-feed-item">
          <video
            ref={(el) => registerVideo(video.id, el)}
            data-video-id={video.id}
            src={video.videoUrl}
            poster={video.thumbnailUrl}
            className="video-feed-video"
            loop
            playsInline
          />
          
          <div className="video-feed-info">
            <h2>{video.title}</h2>
            <p>{video.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

### 4️⃣ **SEO Footer hinzufügen**

```tsx
// app/_layout.tsx oder jede Seite
import SEOFooter from '@/components/SEOFooter';
import { supabase } from '@/lib/supabase';

export default function Layout() {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    // Load top categories
    supabase
      .from('categories')
      .select('id, name, slug')
      .limit(12)
      .then(({ data }) => setCategories(data || []));
  }, []);

  return (
    <>
      {/* Your content */}
      
      <SEOFooter 
        categories={categories}
        showLocations={true}
        showCategories={true}
      />
    </>
  );
}
```

---

### 5️⃣ **Deployment**

```bash
# Build für Production
npm run build:web

# Deploy zu Vercel
npm run deploy

# Oder direkt
vercel --prod
```

**Nach Deployment:**
1. ✅ Teste Sitemaps: `https://anpip.com/sitemap.xml`
2. ✅ Teste Robots.txt: `https://anpip.com/robots.txt`
3. ✅ Google Search Console: Sitemap submitten
4. ✅ Lighthouse Test durchführen

---

## 🔧 CONFIGURATION

### **Supabase Schema erweitern**

Stelle sicher, dass folgende Felder in deiner `videos` Tabelle existieren:

```sql
ALTER TABLE videos ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE videos ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE videos ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Index für Performance
CREATE INDEX IF NOT EXISTS idx_videos_location 
  ON videos(location_country, location_city);
CREATE INDEX IF NOT EXISTS idx_videos_category 
  ON videos(category);
```

### **Categories Tabelle**

```sql
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Beispiel-Kategorien
INSERT INTO categories (name, slug) VALUES
  ('Fahrzeuge', 'fahrzeuge'),
  ('Elektronik', 'elektronik'),
  ('Immobilien', 'immobilien'),
  ('Mode', 'mode'),
  ('Haushalt', 'haushalt');
```

---

## 📱 TESTING

### **Performance Test:**
```bash
# Lighthouse
npx lighthouse https://anpip.com --view

# Web Vitals
curl https://anpip.com
```

### **SEO Test:**
```bash
# Sitemap
curl https://anpip.com/sitemap.xml

# Robots.txt
curl https://anpip.com/robots.txt

# Structured Data
# Besuche: https://search.google.com/test/rich-results
```

### **PWA Test:**
```bash
# Chrome DevTools > Application > Service Workers
# Lighthouse > PWA Score
```

---

## 🎯 MONITORING

### **Analytics Setup**

Erstelle Analytics Endpoints:

```typescript
// app/api/analytics/vitals+api.ts
export async function POST(request: Request) {
  const metrics = await request.json();
  
  // Save to database or analytics service
  console.log('Web Vitals:', metrics);
  
  return new Response('OK', { status: 200 });
}

// app/api/analytics/pwa-install+api.ts
export async function POST(request: Request) {
  const data = await request.json();
  
  console.log('PWA Installed:', data);
  
  return new Response('OK', { status: 200 });
}
```

---

## ✅ CHECKLISTE

- [ ] `app/_layout.tsx` mit Performance-Init aktualisiert
- [ ] `SEOHead` zu allen wichtigen Seiten hinzugefügt
- [ ] `SEOFooter` im Layout integriert
- [ ] Video Feed implementiert (optional)
- [ ] Supabase Schema erweitert
- [ ] Categories angelegt
- [ ] Deployment durchgeführt
- [ ] Sitemaps getestet
- [ ] Google Search Console eingerichtet
- [ ] Performance gemessen

---

## 🆘 TROUBLESHOOTING

### **Sitemaps zeigen keine Daten:**
- Prüfe Supabase-Verbindung
- Schaue in Browser Console nach Fehlern
- Teste API direkt: `/api/sitemap-videos`

### **Service Worker lädt nicht:**
- Clear Cache
- Prüfe `vercel.json` Headers
- Schaue in DevTools > Application > Service Workers

### **PWA Install-Prompt erscheint nicht:**
- Mindestens 2x Seite besuchen
- HTTPS erforderlich
- Prüfe `manifest.webmanifest`

---

## 📚 WEITERE RESSOURCEN

- **Vollständige Dokumentation**: `SEO_IMPLEMENTATION_2025.md`
- **Vercel Docs**: https://vercel.com/docs
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Web Vitals**: https://web.dev/vitals/

---

**Viel Erfolg! 🚀**
