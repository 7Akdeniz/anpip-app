# 🎬 Auto-Scroll Feature - Quick Reference

## Für Entwickler

### Hook verwenden
```typescript
import { useAutoScroll } from '@/hooks/useAutoScroll';

const { onVideoEnd, onManualScroll, onVideoPause, onVideoPlay } = useAutoScroll({
  enabled: autoScrollEnabled,
  currentIndex,
  videosLength: videos.length,
  scrollToIndex,
  onEndReached,
  hasMore,
});
```

### Einstellung laden/speichern
```typescript
import { loadAutoScrollSetting, saveAutoScrollSetting } from '@/hooks/useAutoScroll';

// Laden
const enabled = await loadAutoScrollSetting(); // default: true

// Speichern
await saveAutoScrollSetting(true); // oder false
```

---

## Für Benutzer

### Einstellung finden
1. App öffnen
2. **Profil** (unten rechts) → **Einstellungen**
3. Scrolle zu **"Audio & Video"**
4. Toggle: **"Automatisches Weiter-Scrollen"**

### Verhalten

**Auto-Scroll AN (✅):**
- Video läuft ab → scrollt automatisch zum nächsten
- Manuelles Scrollen → Auto-Scroll pausiert für 2 Sekunden
- Video pausieren → Auto-Scroll stoppt
- Video wieder abspielen → Auto-Scroll nach 1 Sekunde wieder aktiv

**Auto-Scroll AUS (⏸️):**
- Video läuft ab → loopt (Endlos-Schleife)
- Muss manuell zum nächsten Video scrollen

---

## Debug-Tipps

### Console-Logs
```
✅ Video beendet (5234ms) - Auto-Scroll wird vorbereitet...
▶️ Auto-Scroll: Scrolle von Video 2 → 3 (20 total)
👆 Manuelle Scroll-Interaktion erkannt
⏸️ Video pausiert - Auto-Scroll deaktiviert
▶️ Video spielt - Auto-Scroll aktiviert
```

### Test-Script
```bash
./scripts/test-auto-scroll.sh
```

---

## Konfiguration

### Anpassbare Werte
```typescript
// In hooks/useAutoScroll.ts
const AUTO_SCROLL_DELAY_MS = 500;      // Delay vor Scroll
const MIN_VIDEO_DURATION_MS = 1000;    // Min. Video-Dauer

// Als Props
useAutoScroll({
  scrollDelay: 500,           // Custom Delay
  minVideoDuration: 1000,     // Custom Min-Dauer
  preloadNext: true,          // Nächstes Video vorladen
});
```

---

## Dateien

| Datei | Beschreibung |
|-------|-------------|
| `hooks/useAutoScroll.ts` | ⭐ Hook-Logik |
| `app/(tabs)/index.tsx` | Feed-Integration |
| `app/settings.tsx` | Settings-Toggle |
| `docs/AUTO_SCROLL_FEATURE.md` | Vollständige Doku |
| `scripts/test-auto-scroll.sh` | Test-Script |

---

## Status

✅ **PRODUCTION READY**
- Alle Plattformen: iOS, Android, Web, Tablet, Desktop
- User-Interaktion hat Vorrang
- Performance-optimiert
- Einstellbar
- Vollständig dokumentiert

---

**Letzte Aktualisierung:** November 2025  
**Version:** 1.0.0
