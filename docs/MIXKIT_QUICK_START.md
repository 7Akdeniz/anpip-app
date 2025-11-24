# MIXKIT MUSIC - QUICK START

Schnellstart-Anleitung für die Mixkit-Integration.

## 1. Installation

```bash
# Dependencies installieren
npm install

# Mixkit Setup-Script ausführen
chmod +x scripts/setup-mixkit.sh
./scripts/setup-mixkit.sh
```

## 2. Konfiguration

### Environment Variables

```bash
# .env.local erstellen
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

### Supabase Setup

1. **Dashboard öffnen**: https://app.supabase.com
2. **SQL Editor** → Neue Query
3. **Migration einfügen**: `supabase/migrations/20241124_mixkit_integration.sql`
4. **Ausführen**

## 3. Tracks hinzufügen

### Automatisch

```bash
npx ts-node scripts/mixkit-downloader.ts
```

### Manuell (Track-Liste erweitern)

`scripts/mixkit-downloader.ts` öffnen und Tracks hinzufügen:

```typescript
const MIXKIT_TRACKS: MixkitTrackData[] = [
  {
    mixkit_id: 'mixkit-your-track-123',
    title: 'Your Track Title',
    genre: 'electronic',
    mood: 'energetic',
    bpm: 128,
    download_url: 'https://assets.mixkit.co/music/download/mixkit-your-track-123.mp3',
    original_url: 'https://mixkit.co/free-stock-music/your-track-123/',
  },
]
```

## 4. App-Integration

### Route verwenden

```tsx
import { router } from 'expo-router'

// Navigate zu Mixkit-Musik
router.push('/mixkit-music')
```

### Komponente einbinden

```tsx
import { MixkitBrowser } from '@/components/music/MixkitBrowser'

<MixkitBrowser showPlayer={true} mode="browse" />
```

### Context nutzen

```tsx
import { useUnifiedMusic } from '@/contexts/UnifiedMusicContext'

const {
  activeSource,
  setActiveSource,
  mixkitFavorites,
  addMixkitFavorite,
} = useUnifiedMusic()

// Zu Mixkit wechseln
setActiveSource('mixkit')
```

## 5. Video-Editor Integration

```tsx
<MixkitBrowser
  mode="select"
  onSelectTrack={(track) => {
    // Track für Video verwenden
    setVideoMusic(track)
  }}
/>
```

## 6. API Testen

```bash
# Alle Tracks
curl http://localhost:3000/api/music/mixkit/list

# Suche
curl "http://localhost:3000/api/music/mixkit/search?q=electronic&genre=electronic"

# Kategorien
curl http://localhost:3000/api/music/mixkit/categories
```

## 7. Deployment

```bash
# Migration zu Production
supabase link --project-ref your-project
supabase db push

# Tracks hochladen (Production)
NEXT_PUBLIC_SUPABASE_URL=https://your-prod.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-prod-key \
npx ts-node scripts/mixkit-downloader.ts
```

## Troubleshooting

### "Storage bucket not found"
```bash
# Bucket manuell erstellen (Supabase Dashboard)
# Oder Script laufen lassen (erstellt automatisch)
```

### "Module not found: axios"
```bash
npm install axios music-metadata
```

### TypeScript Errors
```typescript
// Normal für Expo-Projekte (Next.js imports sind optional)
// @ts-ignore vor problematischen Imports
```

## Weitere Infos

📚 Vollständige Dokumentation: `docs/MIXKIT_INTEGRATION.md`  
🔗 Mixkit Website: https://mixkit.co  
📜 Lizenz: https://mixkit.co/license/#sfxFree  

✅ **Happy Coding!**
