# Pixabay Music - Quick Start Guide

## 🚀 In 5 Minuten loslegen

### 1. API-Key Setup (1 min)

```bash
# 1. Gehe zu https://pixabay.com/api/docs/
# 2. Registriere dich (kostenlos)
# 3. Kopiere deinen API-Key
# 4. Füge in Supabase ein:

# Supabase Dashboard → Edge Functions → pixabay-music → Secrets
PIXABAY_API_KEY=dein_key_hier
```

### 2. Edge Function deployen (1 min)

```bash
cd /Users/alanbest/Anpip.com
supabase functions deploy pixabay-music
```

### 3. Datenbank Migration (1 min)

```sql
-- Supabase Dashboard → SQL Editor
-- Paste und Execute:
-- File: supabase/migrations/20241124_pixabay_music_favorites.sql
```

### 4. Dependencies installieren (1 min)

```bash
npx expo install @react-native-community/slider @react-native-async-storage/async-storage
```

### 5. MusicProvider aktivieren (1 min)

```tsx
// app/_layout.tsx
import { MusicProvider } from '../contexts/MusicContext'

export default function RootLayout() {
  return (
    <MusicProvider>
      {/* Deine App */}
    </MusicProvider>
  )
}
```

---

## ✅ Test

```tsx
// Neue Screen erstellen: app/music-test.tsx
import { View } from 'react-native'
import { MusicBrowser } from '../components/music/MusicBrowser'
import { MusicPlayer } from '../components/music/MusicPlayer'

export default function MusicTest() {
  return (
    <View style={{ flex: 1 }}>
      <MusicBrowser />
      <MusicPlayer />
    </View>
  )
}
```

Öffne `/music-test` in deiner App → Fertig! 🎉

---

## 🎯 Beispiele

### Music Browser
```tsx
<MusicBrowser />
```

### Music Selector (Video-Editor)
```tsx
<MusicSelector
  onSelectMusic={(track) => console.log('Selected:', track)}
  currentTrack={null}
/>
```

### Programmgesteuert
```tsx
const { playTrack, playerState } = useMusic()

// Track abspielen
await playTrack({
  id: 123,
  name: "Happy Music",
  artist: "Artist Name",
  audioUrl: "https://...",
  // ... weitere Felder
})

// Status prüfen
if (playerState.isPlaying) {
  console.log('Playing:', playerState.currentTrack.name)
}
```

---

## 📞 Support

Probleme? Prüfe:
1. API-Key korrekt in Supabase?
2. Edge Function deployed?
3. Migration ausgeführt?
4. Dependencies installiert?
5. MusicProvider in _layout.tsx?

Alle Logs: Supabase Dashboard → Edge Functions → Logs
