# 🎵 MIXKIT MUSIC INTEGRATION

**Vollständige Integration von Mixkit.co Musik in Anpip.com**

Mixkit bietet kostenlose, kommerziell erlaubte Musik ohne API. Die Integration hostet alle Tracks auf eigenem Storage (Supabase/Cloudflare R2) für maximale Performance und Kontrolle.

---

## 📋 ÜBERSICHT

### Was ist Mixkit?
- **Quelle**: [Mixkit.co](https://mixkit.co/free-stock-music/)
- **Lizenz**: Mixkit License - Kostenlos für kommerzielle Nutzung
- **Attribution**: NICHT erforderlich
- **Qualität**: Professionelle Musik in hoher Qualität
- **Genres**: Electronic, Cinematic, Hip-Hop, Ambient, Rock, etc.

### Features der Integration
✅ Vollständige Musik-Bibliothek auf eigenem Storage  
✅ Schneller Streaming-Player mit Audio Controls  
✅ Suche & Filter (Genre, Mood, BPM, Tags)  
✅ Favoriten-Management pro User  
✅ Video-Editor Integration  
✅ Analytics & Tracking  
✅ Performance-Optimierung (Caching, Preload)  
✅ Mobile & Web Support  

---

## 🏗️ ARCHITEKTUR

### Komponenten

```
┌─────────────────────────────────────────────┐
│           FRONTEND (React Native)           │
├─────────────────────────────────────────────┤
│  • MixkitBrowser.tsx - Hauptkomponente      │
│  • MixkitPlayer.tsx - Audio Player          │
│  • MixkitTrackItem.tsx - Track-Liste        │
│  • MixkitFilters.tsx - Genre/Mood Filter    │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│      SERVICES & CONTEXT (TypeScript)        │
├─────────────────────────────────────────────┤
│  • mixkit-service.ts - Business Logic       │
│  • UnifiedMusicContext - FMA+Pixabay+Mixkit │
│  • mixkit-music.ts - TypeScript Types       │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│         API ROUTES (Next.js/Expo)           │
├─────────────────────────────────────────────┤
│  • GET /api/music/mixkit/list               │
│  • GET /api/music/mixkit/search             │
│  • GET /api/music/mixkit/[id]               │
│  • GET /api/music/mixkit/categories         │
│  • GET/POST/DELETE /api/music/mixkit/fav    │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│         DATABASE (Supabase)                 │
├─────────────────────────────────────────────┤
│  • mixkit_tracks - Track-Metadaten          │
│  • user_mixkit_favorites - User Favorites   │
│  • mixkit_track_analytics - Analytics       │
└─────────────────────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────┐
│      STORAGE (Supabase/Cloudflare R2)       │
├─────────────────────────────────────────────┤
│  Bucket: mixkit-music                       │
│  Files: tracks/*.mp3                        │
└─────────────────────────────────────────────┘
```

---

## 🚀 QUICK START

### 1. Datenbank-Migration ausführen

```bash
# Supabase Migration anwenden
supabase db push

# Oder direkt im Supabase Dashboard:
# SQL Editor → Neue Query → Inhalt von supabase/migrations/20241124_mixkit_integration.sql einfügen → Ausführen
```

### 2. Storage Bucket erstellen

**Automatisch** (beim ersten Script-Run):
```bash
npx ts-node scripts/mixkit-downloader.ts
```

**Manuell** (Supabase Dashboard):
1. Storage → New Bucket
2. Name: `mixkit-music`
3. Public: ✅ Enabled
4. File size limit: 50 MB
5. Allowed MIME types: `audio/mpeg`, `audio/mp3`

### 3. Musik-Tracks hinzufügen

#### Option A: Mit Download-Script (empfohlen)

```bash
# Dependencies installieren
npm install axios music-metadata

# Script ausführen
npx ts-node scripts/mixkit-downloader.ts
```

Das Script:
- Lädt Tracks von Mixkit herunter
- Extrahiert Metadaten (BPM, Dauer, Bitrate)
- Uploaded zu Supabase Storage
- Trägt in Datenbank ein
- Retry-Logik bei Fehlern

#### Option B: Manuelle Track-Liste erweitern

1. `scripts/mixkit-downloader.ts` öffnen
2. `MIXKIT_TRACKS` Array erweitern:

```typescript
const MIXKIT_TRACKS: MixkitTrackData[] = [
  {
    mixkit_id: 'mixkit-example-123',
    title: 'Track Title',
    description: 'Track Description',
    genre: 'electronic',
    mood: 'energetic',
    tags: ['upbeat', 'modern'],
    bpm: 128,
    download_url: 'https://assets.mixkit.co/music/download/mixkit-example-123.mp3',
    original_url: 'https://mixkit.co/free-stock-music/example-123/',
  },
  // Weitere Tracks...
]
```

3. Script erneut ausführen

### 4. App-Integration aktivieren

**Route hinzufügen** (bereits erstellt):
- Screen: `app/mixkit-music.tsx`
- URL: `/mixkit-music`

**Navigation erweitern** (z.B. in Settings):

```typescript
import { router } from 'expo-router'

<TouchableOpacity onPress={() => router.push('/mixkit-music')}>
  <Text>🎵 Mixkit Musik</Text>
</TouchableOpacity>
```

---

## 📖 VERWENDUNG

### Frontend-Komponenten

#### 1. MixkitBrowser

```tsx
import { MixkitBrowser } from '@/components/music/MixkitBrowser'

// Browse-Modus (mit Player)
<MixkitBrowser showPlayer={true} mode="browse" />

// Select-Modus (für Video-Editor)
<MixkitBrowser 
  mode="select" 
  onSelectTrack={(track) => {
    console.log('Selected:', track.title)
  }} 
/>
```

#### 2. UnifiedMusicContext verwenden

```tsx
import { useUnifiedMusic } from '@/contexts/UnifiedMusicContext'

function MyComponent() {
  const {
    activeSource,
    setActiveSource,
    mixkitFavorites,
    addMixkitFavorite,
    removeMixkitFavorite,
    isMixkitFavorite,
    selectedTrack,
    selectTrack,
  } = useUnifiedMusic()

  // Source wechseln
  setActiveSource('mixkit')

  // Track favorisieren
  await addMixkitFavorite(track)

  // Track für Video auswählen
  selectTrack(normalizedTrack, 'mixkit')
}
```

### Backend-Services

#### mixkitService verwenden

```typescript
import { mixkitService } from '@/lib/mixkit-service'

// Suche
const results = await mixkitService.searchTracks({
  query: 'electronic',
  genre: 'electronic',
  mood: 'energetic',
  minBpm: 120,
  maxBpm: 140,
  limit: 20,
})

// Track abrufen
const track = await mixkitService.getTrackById(trackId)

// Genres & Moods
const genres = await mixkitService.getGenres()
const moods = await mixkitService.getMoods()

// Popular Tracks
const popular = await mixkitService.getPopularTracks(20, 30)

// Analytics tracken
await mixkitService.trackAction(trackId, 'play')
```

---

## 🎯 API ENDPOINTS

### GET /api/music/mixkit/list

**Query Params:**
- `genre`: Filter by genre
- `mood`: Filter by mood
- `limit`: Results per page (default: 50)
- `offset`: Pagination offset
- `sort`: `popular` | `recent` | `title`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "mixkit_id": "mixkit-tech-house-vibes-130",
      "title": "Tech House Vibes",
      "genre": "electronic",
      "mood": "energetic",
      "bpm": 128,
      "duration_seconds": 180,
      "storage_url": "https://...",
      "license": "Mixkit License"
    }
  ],
  "meta": {
    "total": 50,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### GET /api/music/mixkit/search

**Query Params:**
- `q`: Search query
- `genre`: Filter by genre
- `mood`: Filter by mood
- `tags`: Comma-separated tags
- `minBpm`: Minimum BPM
- `maxBpm`: Maximum BPM
- `limit`: Results per page
- `offset`: Pagination

### GET /api/music/mixkit/[id]

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Track Title",
    "artist": "Mixkit",
    "duration_seconds": 180,
    "storage_url": "https://...",
    "cdn_url": "https://...",
    "license": "Mixkit License",
    "license_url": "https://mixkit.co/license/#sfxFree"
  }
}
```

### GET /api/music/mixkit/categories

**Response:**
```json
{
  "success": true,
  "data": {
    "genres": [
      { "id": "electronic", "name": "Electronic", "slug": "electronic", "count": 42 }
    ],
    "moods": [
      { "id": "energetic", "name": "Energetic", "slug": "energetic", "count": 28 }
    ]
  }
}
```

### POST /api/music/mixkit/favorites

**Body:**
```json
{
  "trackId": "uuid"
}
```

### DELETE /api/music/mixkit/favorites

**Query:**
```
?trackId=uuid
```

---

## 💾 DATENBANK-SCHEMA

### mixkit_tracks

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| mixkit_id | TEXT | Original Mixkit ID (unique) |
| title | TEXT | Track Title |
| description | TEXT | Track Description |
| duration_seconds | INTEGER | Duration in seconds |
| bpm | INTEGER | Beats per minute |
| genre | TEXT | Genre (electronic, cinematic, etc.) |
| mood | TEXT | Mood (energetic, calm, etc.) |
| tags | TEXT[] | Search tags |
| storage_url | TEXT | Supabase/R2 storage URL |
| cdn_url | TEXT | Optional CDN URL |
| file_size_bytes | BIGINT | File size |
| license | TEXT | Mixkit License |
| commercial_use_allowed | BOOLEAN | Always true |
| play_count | INTEGER | Total plays |
| favorite_count | INTEGER | Total favorites |
| status | TEXT | active/inactive/deleted |

### user_mixkit_favorites

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| user_id | UUID | FK to auth.users |
| track_id | UUID | FK to mixkit_tracks |
| created_at | TIMESTAMPTZ | Timestamp |

### mixkit_track_analytics

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary Key |
| track_id | UUID | FK to mixkit_tracks |
| user_id | UUID | FK to auth.users (nullable) |
| action | TEXT | play/download/favorite/etc. |
| duration_seconds | INTEGER | Play duration |
| source | TEXT | app/web/api |
| created_at | TIMESTAMPTZ | Timestamp |

---

## 🔒 LIZENZ & RECHTLICHES

### Mixkit License

**Erlaubt:**
✅ Kommerzielle Nutzung  
✅ Bearbeitung & Remixing  
✅ Verwendung in Videos/Podcasts  
✅ Monetarisierung auf YouTube/TikTok  
✅ Keine Attribution erforderlich  

**Nicht erlaubt:**
❌ Weiterverkauf der Musik als eigenständiges Produkt  
❌ Wiederveröffentlichung in anderen Musik-Bibliotheken  

**Offizielle Lizenz:**  
https://mixkit.co/license/#sfxFree

### Attribution in App

Die App zeigt automatisch die Lizenz-Information an:

```tsx
<View style={styles.license}>
  <Text>Mixkit License - Kostenlos für kommerzielle Nutzung</Text>
  <Link href="https://mixkit.co/license/#sfxFree">Mehr erfahren</Link>
</View>
```

---

## 🎨 UI/UX

### Design-Prinzipien

1. **Konsistenz**: Gleicher Look wie FMA und Pixabay Integration
2. **Performance**: Lazy Loading, Virtualized Lists
3. **Accessibility**: Screen Reader Support, Labels
4. **Mobile First**: Touch-optimiert, Gesten-Support

### Screenshots

```
┌────────────────────────────────┐
│  🔍 Musik suchen...            │
├────────────────────────────────┤
│  Genres (8)     ▼              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│  │All│ │Elec│ │Hip│ │Cin│    │
│  └──┘ └──┘ └──┘ └──┘          │
├────────────────────────────────┤
│  🎵 Tech House Vibes           │
│     Mixkit • Electronic • 128  │
│     [energetic]         3:00 ♡ │
├────────────────────────────────┤
│  🎵 Dreaming Big               │
│     Mixkit • Cinematic • 80    │
│     [inspiring]         4:15 ♡ │
└────────────────────────────────┘
```

---

## ⚡ PERFORMANCE

### Optimierungen

1. **Caching**
   - Service-Level Cache (5 min TTL)
   - Track-Metadaten gecached
   - Genre/Mood Listen gecached

2. **Streaming**
   - Range Requests Support
   - Progressive Download
   - Adaptive Bitrate (geplant)

3. **Database**
   - Indizes auf genre, mood, tags
   - Full-text search auf title/description
   - Materialized Views für Popular Tracks (geplant)

4. **Frontend**
   - Virtualized Lists (FlatList)
   - Image Lazy Loading
   - Preload nächster Track

### Monitoring

```typescript
// Analytics tracken
await mixkitService.trackAction(trackId, 'play', {
  source: 'mobile',
  duration: 120,
  completion: 0.8,
})
```

---

## 🧪 TESTING

### Manuelle Tests

```bash
# 1. Suche testen
curl "http://localhost:3000/api/music/mixkit/search?q=electronic"

# 2. Track abrufen
curl "http://localhost:3000/api/music/mixkit/[track-id]"

# 3. Kategorien laden
curl "http://localhost:3000/api/music/mixkit/categories"

# 4. Favorite hinzufügen (Auth required)
curl -X POST "http://localhost:3000/api/music/mixkit/favorites" \
  -H "Content-Type: application/json" \
  -d '{"trackId":"uuid"}'
```

### Integration Tests

```typescript
// Test Track-Download
import { processTrack } from '@/scripts/mixkit-downloader'

test('should download and upload track', async () => {
  const result = await processTrack(MIXKIT_TRACKS[0])
  expect(result).toBe(true)
})
```

---

## 🚨 TROUBLESHOOTING

### Problem: Storage Bucket nicht gefunden

**Lösung:**
```bash
# Im Supabase Dashboard: Storage → Create Bucket "mixkit-music"
# Oder Script laufen lassen (erstellt automatisch)
npx ts-node scripts/mixkit-downloader.ts
```

### Problem: Download-Fehler

**Lösung:**
- Mixkit URLs prüfen (können sich ändern)
- Rate Limiting: Batch-Größe reduzieren
- Netzwerk-Timeout erhöhen

### Problem: TypeScript-Fehler bei Next.js imports

**Normal** - Die API Routes sind optional für Expo/React Native Apps.  
Ignorieren oder `@ts-ignore` verwenden.

---

## 📦 DEPLOYMENT

### 1. Datenbank

```bash
# Migration anwenden
supabase db push

# Oder in Production
supabase link --project-ref your-project-ref
supabase db push
```

### 2. Storage

```bash
# Bucket automatisch erstellen lassen
npx ts-node scripts/mixkit-downloader.ts

# Oder manuell im Dashboard
```

### 3. Tracks hochladen

```bash
# Produktions-ENV setzen
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Script ausführen
npx ts-node scripts/mixkit-downloader.ts
```

### 4. CDN (Optional)

Für bessere Performance: Cloudflare R2 verwenden

```typescript
// In mixkit-downloader.ts
const STORAGE_PROVIDER = 'cloudflare-r2'
const R2_BUCKET = 'mixkit-music'
const R2_ENDPOINT = 'https://your-account.r2.cloudflarestorage.com'
```

---

## 🔮 FUTURE ENHANCEMENTS

### Geplante Features

1. **Automatischer Scraper**
   - Mixkit.co regelmäßig scrapen
   - Neue Tracks automatisch hinzufügen
   - Duplicate Detection

2. **Waveform Visualization**
   - Audio-Waveform anzeigen
   - Seek per Waveform-Click

3. **Playlists**
   - User-erstellte Playlists
   - Kuratierte Playlists (Editor's Choice)

4. **Advanced Search**
   - AI-basierte Suche
   - "Similar Tracks" Feature
   - Mood-basierte Empfehlungen

5. **Social Features**
   - Track-Sharing
   - Collaborative Playlists
   - Comments & Ratings

---

## 📞 SUPPORT

**Fragen?**
- GitHub Issues: [anpip-app/issues](https://github.com/7Akdeniz/anpip-app/issues)
- Mixkit Lizenz: https://mixkit.co/license/

**Entwickler-Kontakt:**
- CTO: alan@anpip.com

---

## ✅ CHECKLISTE

- [x] Datenbank-Schema erstellt
- [x] Storage Bucket konfiguriert
- [x] Download-Script entwickelt
- [x] Service-Layer implementiert
- [x] API Endpoints erstellt
- [x] Frontend-Komponenten gebaut
- [x] UnifiedMusicContext erweitert
- [x] Player implementiert
- [x] Favoriten-System integriert
- [x] Analytics eingebaut
- [x] Lizenz-Anzeige implementiert
- [x] Performance optimiert
- [x] Dokumentation geschrieben

**Status: ✅ PRODUCTION READY**

🎉 **Mixkit Integration erfolgreich abgeschlossen!**
