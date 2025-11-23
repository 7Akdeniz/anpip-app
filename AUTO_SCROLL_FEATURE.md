# 🎬 AUTO-SCROLL FEATURE - Anpip.com Video Feed

## 📋 Übersicht

Das Auto-Scroll-Feature ermöglicht es, dass Videos im Feed automatisch zum nächsten Video weiter scrollen, sobald ein Video zu Ende ist. Dies schafft ein nahtloses, TV-ähnliches Erlebnis wie bei TikTok, YouTube Shorts und Instagram Reels.

---

## ✅ Implementierte Features

### 1. **Automatisches Weiter-Scrollen**
- ✅ Videos scrollen automatisch zum nächsten Video nach Ende
- ✅ Sanfter, flüssiger Scroll mit 500ms Delay
- ✅ Snap-to-Video Verhalten (immer genau EIN Video sichtbar)
- ✅ Funktioniert auf Mobile, Tablet, Desktop & Web

### 2. **User-Interaktion hat Vorrang**
- ✅ Manuelles Scrollen deaktiviert Auto-Scroll für 2 Sekunden
- ✅ Video pausieren stoppt Auto-Scroll
- ✅ Video wieder abspielen aktiviert Auto-Scroll nach 1 Sekunde
- ✅ Verhindert störende automatische Aktionen während User-Interaktion

### 3. **Infinite Scroll Support**
- ✅ Beim letzten Video werden automatisch weitere Videos nachgeladen
- ✅ Auto-Scroll setzt sich nahtlos fort
- ✅ Fallback: Bleibt beim letzten Video stehen, wenn keine weiteren Videos verfügbar

### 4. **Einstellungen**
- ✅ Toggle in Settings: "Automatisches Weiter-Scrollen"
- ✅ Standard: Aktiviert (kann deaktiviert werden)
- ✅ Einstellung wird in AsyncStorage gespeichert
- ✅ Persistiert über App-Neustarts

### 5. **Performance-Optimierungen**
- ✅ Nur ein aktives Video gleichzeitig
- ✅ Ressourcenschonend (keine unnötigen Scrolls)
- ✅ Minimaler Batterieverbrauch
- ✅ Video-Loop wird deaktiviert wenn Auto-Scroll aktiv ist

---

## 🏗️ Architektur

### Dateien

```
hooks/
  └── useAutoScroll.ts          # Haupt-Hook für Auto-Scroll-Logik

app/
  └── (tabs)/
      └── index.tsx             # Video-Feed mit Auto-Scroll-Integration
  └── settings.tsx              # Settings mit Auto-Scroll-Toggle

components/
  └── VideoPlayer.tsx           # Video-Player mit onVideoEnd Callback
```

### Hook: `useAutoScroll`

```typescript
const { onVideoEnd, onManualScroll, onVideoPause, onVideoPlay } = useAutoScroll({
  enabled: autoScrollEnabled,        // Auto-Scroll aktiviert?
  currentIndex,                      // Aktueller Video-Index
  videosLength: videos.length,       // Anzahl Videos
  scrollToIndex,                     // Scroll-Funktion
  onEndReached,                      // Callback für Infinite Scroll
  hasMore,                           // Weitere Videos verfügbar?
});
```

**Callbacks:**
- `onVideoEnd()` - Triggert Auto-Scroll zum nächsten Video
- `onManualScroll()` - Deaktiviert Auto-Scroll temporär
- `onVideoPause()` - Stoppt Auto-Scroll bei Pause
- `onVideoPlay()` - Aktiviert Auto-Scroll wieder

---

## 🎯 Verwendung

### 1. Auto-Scroll in Video-Feed integrieren

```typescript
import { useAutoScroll, loadAutoScrollSetting } from '@/hooks/useAutoScroll';

// State
const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

// Einstellung laden
useEffect(() => {
  loadAutoScrollSetting().then(setAutoScrollEnabled);
}, []);

// Hook verwenden
const { onVideoEnd, onManualScroll, onVideoPause, onVideoPlay } = useAutoScroll({
  enabled: autoScrollEnabled,
  currentIndex,
  videosLength: videos.length,
  scrollToIndex: (index) => flatListRef.current?.scrollToIndex({ index }),
  onEndReached: loadMoreVideos,
  hasMore: true,
});

// In Video-Player
<video
  onEnded={(e) => {
    const duration = e.target.duration * 1000;
    onVideoEnd({ videoIndex: currentIndex, duration });
  }}
/>

// Bei manuellem Scroll
<FlatList
  onScroll={onManualScroll}
  ...
/>
```

### 2. Settings Toggle

```typescript
import { loadAutoScrollSetting, saveAutoScrollSetting } from '@/hooks/useAutoScroll';

const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

const handleToggle = async (value: boolean) => {
  setAutoScrollEnabled(value);
  await saveAutoScrollSetting(value);
};

<SettingsItem
  icon="play-skip-forward-outline"
  title="Automatisches Weiter-Scrollen"
  type="switch"
  value={autoScrollEnabled}
  onValueChange={handleToggle}
/>
```

---

## 🔧 Konfiguration

### Konstanten (useAutoScroll.ts)

```typescript
const AUTO_SCROLL_DELAY_MS = 500;      // Verzögerung vor Auto-Scroll
const MIN_VIDEO_DURATION_MS = 1000;     // Min. Dauer für Auto-Scroll
const USER_INTERACTION_TIMEOUT = 2000;  // Timeout nach manuellem Scroll
```

### Video-Loop Verhalten

```typescript
// Loop wird automatisch deaktiviert wenn Auto-Scroll aktiv
loop={!autoScrollEnabled}
```

---

## 🎬 Video-Ende Erkennung

### Web (HTML5 Video)

```javascript
<video
  onEnded={(e) => {
    if (autoScrollEnabled && isActive) {
      const duration = e.target.duration * 1000;
      handleVideoEnd(duration);
    }
  }}
/>
```

### React Native (Expo Video)

```typescript
<ExpoVideo
  onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
    if (
      autoScrollEnabled &&
      isActive &&
      status.isLoaded &&
      status.didJustFinish &&
      status.durationMillis
    ) {
      handleVideoEnd(status.durationMillis);
    }
  }}
/>
```

---

## 🚀 User Experience

### Verhalten

1. **Video startet** → Auto-Scroll bereit
2. **Video endet** → 500ms Pause → Scroll zum nächsten Video
3. **User scrollt manuell** → Auto-Scroll pausiert für 2 Sekunden
4. **User pausiert Video** → Auto-Scroll gestoppt
5. **User startet Video** → Auto-Scroll nach 1 Sekunde wieder aktiv
6. **Letztes Video** → Weitere Videos werden nachgeladen

### Settings

- **Pfad:** Settings → Audio & Video → "Automatisches Weiter-Scrollen"
- **Standard:** Aktiviert
- **Toggle:** Sofort wirksam, kein Reload nötig
- **Persistenz:** Gespeichert in AsyncStorage

---

## 🐛 Debug & Logs

### Console Logs

```
✅ Video beendet - Auto-Scroll wird vorbereitet...
▶️ Auto-Scroll: Video 2 → 3
👆 Manuelle Scroll-Interaktion erkannt
⏸️ Video pausiert - Auto-Scroll deaktiviert
▶️ Video spielt - Auto-Scroll aktiviert
🔄 Auto-Scroll: Lade weitere Videos...
⏹️ Auto-Scroll: Feed-Ende erreicht
```

---

## 🔮 Zukunftserweiterungen

### Geplant (vorbereitet, nicht implementiert)

1. **Timer-basiert:** Auto-Scroll nach X Sekunden (auch bei langen Videos)
2. **Kategorie-Filter:** Nur bei bestimmten Feeds/Kategorien aktiv
3. **Interaktion-Pause:** Auto-Scroll pausieren bei Kommentar-/Beschreibungs-Ansicht
4. **Swipe-Geschwindigkeit:** Anpassbare Scroll-Animation
5. **A/B Testing:** Auto-Scroll für bestimmte User-Gruppen

### Code-Struktur

Der Hook ist bereits so aufgebaut, dass diese Features leicht ergänzt werden können:

```typescript
export function useAutoScroll(config: AutoScrollConfig) {
  // ... bestehende Logik
  
  // Einfach erweiterbar:
  const autoScrollDelay = config.delay ?? AUTO_SCROLL_DELAY_MS;
  const onlyInCategories = config.categories ?? [];
  // etc.
}
```

---

## ✅ Testing Checklist

- [x] Auto-Scroll nach Video-Ende funktioniert
- [x] Manuelles Scrollen pausiert Auto-Scroll
- [x] Video pausieren stoppt Auto-Scroll
- [x] Settings Toggle speichert Einstellung
- [x] Einstellung persistiert über App-Neustart
- [x] Infinite Scroll lädt weitere Videos
- [x] Kein Auto-Scroll beim letzten Video (wenn keine weiteren)
- [x] Performance: Nur ein Video aktiv
- [x] Web & Mobile beide funktional
- [x] Loop deaktiviert bei Auto-Scroll

---

## 🎉 Zusammenfassung

**Das Auto-Scroll-Feature ist produktionsreif und liefert:**

✅ **Weltklasse UX** - Nahtloses Video-Erlebnis wie TikTok
✅ **User-Kontrolle** - Manuelle Interaktion hat immer Vorrang
✅ **Performance** - Ressourcenschonend, batterie-freundlich
✅ **Flexibilität** - An/Aus-Schaltbar, zukunftssicher erweiterbar
✅ **Plattform-Support** - Web, iOS, Android, Tablet, Desktop

**Anpip.com ist jetzt eine Nr. 1 Video-Plattform mit perfektem Auto-Scroll!** 🚀
