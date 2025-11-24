# 🎵 FMA Integration - Quick Start Guide

## 🚀 In 5 Minuten starten

### 1. Setup ausführen

```bash
cd /Users/alanbest/Anpip.com
./scripts/setup-fma.sh
```

Das Script installiert automatisch:
- ✅ Dependencies (@react-native-async-storage/async-storage)
- ✅ Database Schema (Tabellen, RLS, Indexes)
- ✅ Edge Function Deployment
- ✅ Environment Variables

### 2. FMA API Key besorgen

1. Gehe zu https://freemusicarchive.org/api
2. Registriere einen Account (kostenlos)
3. Beantrage API Key
4. Setze den Key:

```bash
# In Supabase Dashboard oder CLI
supabase secrets set FMA_API_KEY=your_key_here
```

### 3. App starten

```bash
npx expo start
```

Navigiere zu `/fma-music` in deiner App.

---

## 📱 Sofort nutzen

### FMA Browser in deine App einbauen

```tsx
import { FMAMusicBrowser } from '@/components/music/FMAMusicBrowser'

function MyScreen() {
  return (
    <FMAMusicBrowser
      mode="browser"
      onPlay={(track) => console.log('Playing:', track.name)}
    />
  )
}
```

### Musik für Video auswählen

```tsx
import { MusicSourceSelector } from '@/components/MusicSourceSelector'

function VideoUpload() {
  const [showSelector, setShowSelector] = useState(false)

  return (
    <>
      <Button onPress={() => setShowSelector(true)}>
        Add Music
      </Button>

      <MusicSourceSelector
        visible={showSelector}
        onClose={() => setShowSelector(false)}
        onSelectFMA={(track) => {
          console.log('Selected:', track.name)
          // Track zu Video hinzufügen
        }}
        onSelectPixabay={(track) => {
          console.log('Selected Pixabay:', track.name)
        }}
        commercialUseOnly={true} // Nur kommerzielle Lizenzen
      />
    </>
  )
}
```

### Musik direkt suchen

```tsx
import { fmaService } from '@/lib/fma-service'

// Trending Musik
const trending = await fmaService.getTrendingMusic()

// Nach Genre suchen
const jazz = await fmaService.searchByGenre('jazz')

// Nur kommerzielle Tracks
const commercial = await fmaService.getCommercialMusic()
```

---

## 🎯 Häufige Use Cases

### Use Case 1: Video-Upload mit Musik

```tsx
import { fmaService } from '@/lib/fma-service'
import type { FMANormalizedTrack } from '@/types/fma-music'

function VideoUploadWithMusic() {
  const [selectedTrack, setSelectedTrack] = useState<FMANormalizedTrack | null>(null)

  const handleSelectMusic = (track: FMANormalizedTrack) => {
    setSelectedTrack(track)
    
    // Attribution für Legal Compliance
    const attribution = fmaService.getAttributionText(track)
    console.log('Attribution:', attribution)
    
    // Prüfe kommerzielle Nutzung
    const isCommercial = fmaService.isCommercialUse(track)
    if (!isCommercial) {
      alert('⚠️ Dieser Track ist nicht für kommerzielle Nutzung lizenziert!')
    }
  }

  return (
    <MusicSourceSelector
      visible={true}
      onSelectFMA={handleSelectMusic}
      commercialUseOnly={true}
    />
  )
}
```

### Use Case 2: Musik-Feed mit Favoriten

```tsx
import { fmaService } from '@/lib/fma-service'

function MusicFeed() {
  const [tracks, setTracks] = useState([])
  const [favorites, setFavorites] = useState(new Set())

  useEffect(() => {
    // Trending Musik laden
    fmaService.getTrendingMusic().then(res => setTracks(res.tracks))
    
    // Favoriten laden
    fmaService.getFavorites().then(favs => {
      setFavorites(new Set(favs.map(f => f.track_id)))
    })
  }, [])

  const toggleFavorite = async (track) => {
    if (favorites.has(track.id)) {
      await fmaService.removeFromFavorites(track.id)
    } else {
      await fmaService.addToFavorites(track)
    }
    // Reload favorites
    const favs = await fmaService.getFavorites()
    setFavorites(new Set(favs.map(f => f.track_id)))
  }

  return (
    <FlatList
      data={tracks}
      renderItem={({ item }) => (
        <TrackItem
          track={item}
          isFavorite={favorites.has(item.id)}
          onFavorite={() => toggleFavorite(item)}
        />
      )}
    />
  )
}
```

### Use Case 3: Smart Music Search

```tsx
import { fmaService } from '@/lib/fma-service'

function SmartMusicSearch() {
  const searchWithFilters = async () => {
    // Suche nach Genre + Lizenz + Sortierung
    const results = await fmaService.searchMusic({
      genre: 'electronic',
      license: 'cc-by', // Nur CC BY Lizenz
      sort: 'track_interest',
      order: 'desc',
      per_page: 20,
    })
    
    console.log(`Found ${results.totalHits} tracks`)
    return results.tracks
  }

  const searchByMood = async (mood: 'upbeat' | 'calm' | 'energetic') => {
    // Mood-basierte Suche
    const results = await fmaService.searchByTag(mood)
    return results.tracks
  }

  return (
    <View>
      <Button onPress={() => searchWithFilters()}>
        Search Electronic (CC BY)
      </Button>
      <Button onPress={() => searchByMood('upbeat')}>
        Search Upbeat Music
      </Button>
    </View>
  )
}
```

---

## 🔒 Lizenzen richtig nutzen

### Kommerzielle Nutzung (Werbung, Monetarisierung)

```tsx
// Nur CC BY und CC BY-SA Tracks
const commercialTracks = await fmaService.searchMusic({
  license: 'cc-by', // oder 'cc-by-sa'
})

// Oder benutze getCommercialMusic()
const commercial = await fmaService.getCommercialMusic()
```

### Attribution immer hinzufügen

```tsx
const track = await fmaService.getTrack('track_id')

// Attribution Text generieren
const attribution = fmaService.getAttributionText(track)
// Output: "Track Name" by Artist (CC BY) - freemusicarchive.org

// In Video Description einfügen
const videoDescription = `
My awesome video!

Music: ${attribution}
`
```

### Lizenz-Info anzeigen

```tsx
const license = fmaService.getLicenseInfo(track)

console.log({
  title: license.title,           // "CC BY"
  url: license.url,               // "https://creativecommons.org/..."
  commercial: license.commercial,  // true/false
  attribution: license.attribution // true (immer true bei CC)
})

// UI Alert
if (!license.commercial) {
  Alert.alert(
    'Non-Commercial License',
    'This track cannot be used for commercial purposes (ads, monetized videos, etc.)'
  )
}
```

---

## ⚡ Performance-Tipps

### Caching nutzen

```tsx
import { fmaCacheManager } from '@/lib/fma-cache-manager'

// Cache Stats
const stats = await fmaCacheManager.getCacheStats()
console.log('Memory Cache:', stats.memorySize)
console.log('Persistent Cache:', stats.persistentSize)

// Cache löschen (z.B. bei Logout)
await fmaCacheManager.clearAll()
```

### Preloading aktivieren

```tsx
// Nach Track-Liste geladen
fmaCacheManager.initPreloadQueue(tracks, currentIndex)
await fmaCacheManager.preloadNext(10) // Nächste 10 Tracks vorladen

// Bei Track-Wechsel
fmaCacheManager.updatePreloadIndex(newIndex)
```

### Offline-Support

```tsx
// Track für Offline speichern
await fmaCacheManager.downloadTrackOffline(track)

// Offline-Tracks abrufen
const offlineTracks = await fmaCacheManager.getOfflineTracks()

// Offline-Track löschen
await fmaCacheManager.removeOfflineTrack(track.id)
```

---

## 🧪 Testing

### Test Edge Function

```bash
curl -X GET "https://your-project.supabase.co/functions/v1/fma-music?action=search&q=jazz&per_page=5" \
  -H "Authorization: Bearer YOUR_USER_TOKEN"
```

### Test im Code

```tsx
// Test FMA Service
const testFMA = async () => {
  try {
    // 1. Search
    const results = await fmaService.searchMusic({ q: 'jazz', per_page: 5 })
    console.log('✅ Search works:', results.totalHits, 'tracks')

    // 2. Get Single Track
    if (results.tracks.length > 0) {
      const track = await fmaService.getTrack(results.tracks[0].id)
      console.log('✅ Get track works:', track.name)
    }

    // 3. Favorites
    await fmaService.addToFavorites(results.tracks[0])
    const favs = await fmaService.getFavorites()
    console.log('✅ Favorites work:', favs.length)

    // 4. Attribution
    const attribution = fmaService.getAttributionText(results.tracks[0])
    console.log('✅ Attribution:', attribution)

  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFMA()
```

---

## 🐛 Troubleshooting

### Problem: "FMA API Error: 401"
```bash
# API Key prüfen
supabase secrets list

# Neu setzen
supabase secrets set FMA_API_KEY=your_key_here
```

### Problem: "Rate limit exceeded"
```tsx
// Cache nutzen
import { fmaCacheManager } from '@/lib/fma-cache-manager'

const cached = fmaCacheManager.getMemoryCache(cacheKey)
if (cached) return cached
```

### Problem: "No tracks found"
```tsx
// Genre-Handle prüfen (lowercase!)
await fmaService.searchByGenre('electronic') // ✅ Richtig
await fmaService.searchByGenre('Electronic') // ❌ Falsch
```

---

## 📚 Weitere Ressourcen

- **Komplette Dokumentation**: `docs/FMA_INTEGRATION.md`
- **FMA API Docs**: https://freemusicarchive.org/api
- **Creative Commons**: https://creativecommons.org/licenses/
- **TypeScript Types**: `types/fma-music.ts`

---

**Du bist ready! 🚀 Viel Erfolg mit der FMA Integration!**
