# Pixabay Music API Integration

## 🎵 Übersicht

Vollständige Integration der **Pixabay Music API** für Anpip.com. Kostenlose, lizenzfreie Musik für alle Videos mit weltweiter Kompatibilität (iOS, Android, Web).

---

## 🚀 Features

✅ **Musik-Bibliothek**
- 200.000+ lizenzfreie Tracks
- Suche nach Genre, Mood, Artist, BPM, Dauer
- Trending & Latest Tracks
- Favorites System

✅ **Video-Editor Integration**
- Musik auswählen für Videos
- Preview vor Auswahl
- Einfache Integration

✅ **Music Player**
- Vollständiger Player mit Controls
- Progress Bar, Volume, Play/Pause
- Compact Mode für Editor

✅ **Performance**
- Multi-Layer Caching (Memory + Storage)
- Preloading für schnelle Starts
- Rate Limiting & Error Handling

✅ **Sicherheit**
- API-Key nur auf Server
- Row-Level Security für Favorites
- Rate Limiting (100 Requests/Stunde)

---

## 📁 Dateistruktur

```
Anpip.com/
├── supabase/
│   ├── functions/
│   │   └── pixabay-music/
│   │       └── index.ts                    # Edge Function (Backend)
│   └── migrations/
│       └── 20241124_pixabay_music_favorites.sql  # Database Schema
├── types/
│   └── pixabay-music.ts                    # TypeScript Types
├── lib/
│   ├── music-service.ts                    # Service Layer
│   └── music-cache.ts                      # Cache Manager
├── contexts/
│   └── MusicContext.tsx                    # State Management
└── components/
    └── music/
        ├── MusicBrowser.tsx                # Music Browser UI
        ├── MusicPlayer.tsx                 # Music Player
        └── MusicSelector.tsx               # Video Editor Integration
```

---

## ⚙️ Setup & Installation

### 1. Umgebungsvariablen

Füge in Supabase (Edge Function Secrets) hinzu:

```bash
PIXABAY_API_KEY=dein_api_key_hier
```

**API-Key erhalten:**
1. Gehe zu https://pixabay.com/api/docs/
2. Registriere dich kostenlos
3. Kopiere deinen API-Key

### 2. Supabase Edge Function deployen

```bash
cd /Users/alanbest/Anpip.com
supabase functions deploy pixabay-music
```

### 3. Datenbank Migration ausführen

```bash
# Via Supabase Dashboard
# SQL Editor → Paste den Inhalt von:
# supabase/migrations/20241124_pixabay_music_favorites.sql

# Oder via CLI:
supabase db push
```

### 4. Dependencies installieren

```bash
# Slider für Music Player
npx expo install @react-native-community/slider

# AsyncStorage für Caching
npx expo install @react-native-async-storage/async-storage
```

### 5. MusicProvider in App integrieren

```tsx
// app/_layout.tsx
import { MusicProvider } from '../contexts/MusicContext'

export default function RootLayout() {
  return (
    <AuthProvider>
      <MusicProvider>
        {/* Deine App */}
      </MusicProvider>
    </MusicProvider>
  )
}
```

---

## 💻 Verwendung

### Music Browser (Standalone)

```tsx
import { MusicBrowser } from '../components/music/MusicBrowser'
import { MusicPlayer } from '../components/music/MusicPlayer'

export default function MusicScreen() {
  return (
    <View style={{ flex: 1 }}>
      <MusicBrowser />
      <MusicPlayer />
    </View>
  )
}
```

### Music Selector (Video-Editor)

```tsx
import { MusicSelector } from '../components/music/MusicSelector'
import { useState } from 'react'

export default function VideoEditor() {
  const [selectedMusic, setSelectedMusic] = useState(null)

  return (
    <View>
      <MusicSelector
        onSelectMusic={setSelectedMusic}
        currentTrack={selectedMusic}
      />
      {selectedMusic && (
        <Text>Gewählt: {selectedMusic.name}</Text>
      )}
    </View>
  )
}
```

### Music Player verwenden

```tsx
import { useMusic } from '../contexts/MusicContext'

export default function Component() {
  const { playTrack, pauseTrack, playerState } = useMusic()

  const handlePlay = async (track) => {
    await playTrack(track)
  }

  return (
    <View>
      {playerState.isPlaying && (
        <Text>Now Playing: {playerState.currentTrack?.name}</Text>
      )}
    </View>
  )
}
```

### Favorites Management

```tsx
import { useMusic } from '../contexts/MusicContext'

export default function FavoritesScreen() {
  const { favorites, addToFavorites, removeFromFavorites, isFavorite } = useMusic()

  return (
    <FlatList
      data={favorites}
      renderItem={({ item }) => (
        <View>
          <Text>{item.track_data.name}</Text>
          <Button
            title="Remove"
            onPress={() => removeFromFavorites(item.track_id)}
          />
        </View>
      )}
    />
  )
}
```

---

## 🎯 API Referenz

### MusicService

```typescript
import { musicService } from '../lib/music-service'

// Musik suchen
const results = await musicService.searchMusic({
  q: 'happy',
  genre: 'pop',
  page: 1,
  per_page: 20,
  order: 'popular'
})

// Nach Genre
const popMusic = await musicService.searchByGenre('pop')

// Nach Mood
const calmMusic = await musicService.searchByMood('calm')

// Trending
const trending = await musicService.getTrendingMusic()

// Nach Dauer
const shortTracks = await musicService.searchByDuration(0, 120) // 0-2 min

// Track abrufen
const track = await musicService.getTrack(123456)

// Favorites
await musicService.addToFavorites(track)
await musicService.removeFromFavorites(track.id)
const favorites = await musicService.getFavorites()
const isFav = await musicService.isFavorite(track.id)

// Download
const blobUrl = await musicService.downloadTrack(track)

// Preload
await musicService.preloadTracks(tracks)
```

### MusicContext (useMusic Hook)

```typescript
const {
  // Player State
  playerState,           // { currentTrack, isPlaying, progress, duration, volume, isMuted, isLoading }
  
  // Player Controls
  playTrack,            // (track) => Promise<void>
  pauseTrack,           // () => Promise<void>
  resumeTrack,          // () => Promise<void>
  stopTrack,            // () => Promise<void>
  seekTo,               // (position: 0-1) => Promise<void>
  setVolume,            // (volume: 0-1) => Promise<void>
  toggleMute,           // () => Promise<void>
  
  // Selection (Video Editor)
  selectionState,       // { selectedTrack, selectionMode }
  selectTrack,          // (track, mode) => void
  clearSelection,       // () => void
  
  // Favorites
  favorites,            // UserMusicFavorite[]
  addToFavorites,       // (track) => Promise<void>
  removeFromFavorites,  // (trackId) => Promise<void>
  isFavorite,           // (trackId) => boolean
  loadFavorites,        // () => Promise<void>
} = useMusic()
```

---

## 🎨 UI-Komponenten

### MusicBrowser

Vollständige Musik-Bibliothek mit Search, Filter, Preview.

**Props:**
- `mode?: 'browser' | 'selector'` - Browser oder Auswahl-Modus
- `onSelect?: (track) => void` - Callback bei Track-Auswahl
- `style?` - Custom Styling

**Features:**
- Suche (Query)
- Genre-Filter (30+ Genres)
- Mood-Filter (10+ Moods)
- Duration-Filter
- Sort (Popular/Latest)
- Favorites Toggle
- Infinite Scroll
- Lazy Loading

### MusicPlayer

Vollständiger Music Player mit Controls.

**Props:**
- `compact?: boolean` - Kompakt-Modus
- `style?` - Custom Styling

**Features:**
- Play/Pause/Stop
- Progress Bar mit Seek
- Volume Control
- Time Display (Current/Remaining)
- Track Info & Thumbnail
- Tags Display

### MusicSelector

Music Selector für Video-Editor.

**Props:**
- `onSelectMusic: (track) => void` - Callback bei Auswahl
- `currentTrack?: track | null` - Aktuell gewählter Track
- `style?` - Custom Styling

**Features:**
- Modal mit MusicBrowser
- Selected Track Display
- Change/Remove Buttons
- Compact Player Integration

---

## 🔧 Konfiguration

### Cache-Einstellungen

```typescript
// lib/music-cache.ts

const CACHE_EXPIRY = 24 * 60 * 60 * 1000  // 24 Stunden
const MAX_CACHE_SIZE = 50                  // Max Items
```

### Rate-Limiting

```typescript
// supabase/functions/pixabay-music/index.ts

const RATE_LIMIT_MAX = 100                 // Max Requests
const RATE_LIMIT_WINDOW = 60 * 60 * 1000  // 1 Stunde
```

### Audio-Einstellungen

```typescript
// contexts/MusicContext.tsx

Audio.setAudioModeAsync({
  playsInSilentModeIOS: true,
  staysActiveInBackground: false,
  shouldDuckAndroid: true,
})
```

---

## 📊 Performance Best Practices

### 1. Caching nutzen

```typescript
import { musicCacheManager } from '../lib/music-cache'

// Cache warm-up beim App-Start
await musicCacheManager.warmUpCache()

// Preload popular tracks
await musicCacheManager.preloadPopularTracks(tracks)
```

### 2. Lazy Loading

MusicBrowser implementiert automatisch Infinite Scroll mit `onEndReached`.

### 3. Preloading

```typescript
// Ersten 5 Tracks preloaden
await musicService.preloadTracks(tracks)
```

### 4. Cache Stats

```typescript
const stats = musicCacheManager.getCacheStats()
console.log('Cache:', stats.memorySize, 'items')
```

---

## 🔒 Sicherheit

### 1. API-Key-Schutz

✅ API-Key wird **NUR** auf dem Server (Edge Function) gespeichert
✅ Niemals im Client-Code sichtbar

### 2. Authentifizierung

✅ Alle API-Calls erfordern gültigen Auth-Token
✅ User-ID wird automatisch aus Token extrahiert

### 3. Rate-Limiting

✅ 100 Requests/Stunde pro User
✅ Automatische Sperre bei Überschreitung

### 4. Row-Level Security

✅ User können nur eigene Favorites sehen/ändern
✅ Enforced durch Supabase RLS Policies

---

## 🌍 Internationalisierung

Musik-API unterstützt mehrere Sprachen:

```typescript
await musicService.searchMusic({
  q: 'happy',
  lang: 'de'  // en, de, es, fr, it, pt, nl, etc.
})
```

**Verfügbare Sprachen:**
- `en` - English
- `de` - Deutsch
- `es` - Español
- `fr` - Français
- `it` - Italiano
- `pt` - Português
- `nl` - Nederlands
- und viele mehr...

---

## 🐛 Debugging

### Logs aktivieren

Alle Services loggen automatisch:

```
🎵 Music Search - Found 127 tracks
🎵 Playing: Happy Upbeat Music
✅ Track added to favorites: Happy Upbeat Music
✅ Cache warmed up
```

### Häufige Probleme

**Problem:** Musik lädt nicht
- Prüfe Internet-Verbindung
- Prüfe API-Key in Supabase
- Prüfe Edge Function Logs

**Problem:** Kein Sound auf iOS
- Prüfe `playsInSilentModeIOS: true` Setting
- Prüfe Device Volume

**Problem:** Rate-Limit Error
- Warte 1 Stunde oder erhöhe `RATE_LIMIT_MAX`

---

## 📱 Platform-Spezifisch

### iOS
- Auto-Play funktioniert nur nach User-Interaktion
- `playsInSilentModeIOS: true` für Silent-Mode Support

### Android
- `shouldDuckAndroid: true` für Audio-Ducking

### Web
- `HTMLAudioElement` wird verwendet statt Expo AV
- Alle Features voll unterstützt

---

## 🎯 Nächste Schritte

1. **Playlists erstellen**
   - User-generierte Playlists
   - Public/Private Sharing

2. **AI-Recommendations**
   - Musik basierend auf Video-Content
   - Personalisierte Vorschläge

3. **Offline-Support**
   - Download für Offline-Nutzung
   - Background Downloads

4. **Social Features**
   - Most-Used Tracks anzeigen
   - Community-Favorites

5. **Video-Editor Features**
   - Musik trimmen/schneiden
   - Volume-Fades
   - Multi-Track-Mixing

---

## 📄 Lizenz

Pixabay Music ist **kostenlos** und **lizenzfrei** für kommerzielle und nicht-kommerzielle Nutzung.

**Bedingungen:**
- ✅ Keine Attribution erforderlich
- ✅ Kommerzielle Nutzung erlaubt
- ✅ Modifikation erlaubt
- ❌ Weiterverkauf der Musik nicht erlaubt
- ❌ Musik nicht als eigene präsentieren

Details: https://pixabay.com/service/license-summary/

---

## 🔗 Links

- Pixabay Music API Docs: https://pixabay.com/api/docs/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Expo AV: https://docs.expo.dev/versions/latest/sdk/av/

---

## 💡 Support

Bei Fragen oder Problemen:
1. Prüfe diese Dokumentation
2. Prüfe Edge Function Logs in Supabase
3. Prüfe Console Logs in der App
4. Kontaktiere das Dev-Team

---

**🎉 Happy Music Integration! 🎵**
