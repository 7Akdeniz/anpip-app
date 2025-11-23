# 🚀 AUTO-SCROLL QUICK START

## Sofort loslegen mit Auto-Scroll in 3 Schritten!

### 1️⃣ Auto-Scroll aktivieren/deaktivieren

**In der App:**
1. Gehe zu **Profil** → **Einstellungen** (⚙️)
2. Scrolle zu **Audio & Video**
3. Toggle **"Automatisches Weiter-Scrollen"** an/aus

**Standard:** ✅ Aktiviert

---

### 2️⃣ So funktioniert Auto-Scroll

#### ▶️ Wenn AKTIVIERT:
- Video spielt ab → endet → **automatisch nächstes Video** (nach 0,5s)
- Infinite Scroll: Beim letzten Video werden automatisch weitere geladen
- Sanftes, flüssiges Scroll-Verhalten

#### ⏸️ User-Interaktion hat VORRANG:
- **Manuell scrollen** → Auto-Scroll pausiert für 2 Sekunden
- **Video pausieren** → Auto-Scroll gestoppt
- **Video wieder starten** → Auto-Scroll nach 1 Sekunde aktiv

#### 🔁 Wenn DEAKTIVIERT:
- Videos laufen in Loop (endlos)
- Nur manuelles Scrollen zum nächsten Video
- Klassisches TikTok-Verhalten

---

### 3️⃣ Code-Integration (für Entwickler)

```typescript
import { useAutoScroll } from '@/hooks/useAutoScroll';

// In deiner Video-Feed-Komponente
const { onVideoEnd, onManualScroll } = useAutoScroll({
  enabled: autoScrollEnabled,
  currentIndex,
  videosLength: videos.length,
  scrollToIndex: (index) => flatListRef.current?.scrollToIndex({ index }),
  onEndReached: loadMoreVideos,
  hasMore: true,
});

// Video-Ende erkennen
<video onEnded={(e) => onVideoEnd({ 
  videoIndex: currentIndex, 
  duration: e.target.duration * 1000 
})} />

// Manuelles Scrollen erkennen
<FlatList onScroll={onManualScroll} />
```

---

## 🎯 Funktionsübersicht

| Feature | Status |
|---------|--------|
| Auto-Scroll nach Video-Ende | ✅ |
| User-Interaktion hat Vorrang | ✅ |
| Settings Toggle (An/Aus) | ✅ |
| AsyncStorage Persistenz | ✅ |
| Infinite Scroll Support | ✅ |
| Performance-optimiert | ✅ |
| Web + Mobile + Tablet | ✅ |

---

## 🐛 Troubleshooting

**Auto-Scroll funktioniert nicht?**
1. Prüfe Settings: Ist "Automatisches Weiter-Scrollen" aktiviert?
2. Hast du gerade manuell gescrollt? (2s Pause)
3. Ist das Video pausiert? (Auto-Scroll stoppt)
4. Console-Logs prüfen: `▶️ Auto-Scroll: Video X → Y`

**Videos loopen endlos?**
- Auto-Scroll ist wahrscheinlich deaktiviert
- Aktiviere es in den Settings

**Auto-Scroll zu schnell/langsam?**
- Delay ist aktuell 500ms (fest)
- Zukunft: Anpassbar in Settings

---

## 📚 Weitere Dokumentation

- **Vollständige Docs:** `AUTO_SCROLL_FEATURE.md`
- **Hook-Code:** `hooks/useAutoScroll.ts`
- **Feed-Integration:** `app/(tabs)/index.tsx`

---

**Das war's! Auto-Scroll ist jetzt aktiv. Viel Spaß! 🎉**
