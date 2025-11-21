# 📍 Standort-basiertes Market-System - Quick Start

## ✨ Neu implementierte Features

### 1️⃣ Automatische Standort-Erkennung beim App-Start

Beim ersten Öffnen der App fragt ein freundlicher Dialog:
> "Standort freigeben?"

**Ablauf:**
- ✅ GPS-Standort wird zuerst versucht (höchste Genauigkeit)
- ✅ IP-basierter Fallback, falls GPS abgelehnt/fehlschlägt
- ✅ Standort wird 24h im localStorage gecacht
- ✅ Datenschutz-konform mit expliziter Einwilligung

---

### 2️⃣ Smart Auto-Fill beim Video-Upload

Beim Erstellen eines Market-Listings:
- 🎯 Stadt wird **automatisch vorausgefüllt** basierend auf erkanntem Standort
- 🏷️ Badge zeigt Quelle: "GPS erkannt", "IP erkannt" oder "Manuell"
- ✏️ Nutzer kann die Stadt **jederzeit ändern**
- ✅ Validierung vor Upload

**Reihenfolge bleibt:**
1. Stadt (jetzt automatisch!)
2. Kategorie
3. Unterkategorie

---

### 3️⃣ Lokaler Market-Feed

Im Market-Tab:
- 📍 **"Lokale Anzeigen"** als Standard (Videos aus deiner Stadt + 50km Umkreis)
- 🌍 Toggle zu **"Alle Anzeigen"** möglich
- 🎯 Videos werden nach Distanz sortiert (nächste zuerst)
- 📊 Location-Info zeigt aktuellen Standort an

**Filter-Logik:**
- **Lokal**: Nur Videos aus gleicher Stadt ODER max 50km Entfernung
- **Global**: Alle Videos, sortiert nach Distanz zu deinem Standort

---

## 🚀 Verwendung

### Als Entwickler

#### 1. Location-Context nutzen

```tsx
import { useLocation } from '@/contexts/LocationContext';

function MyComponent() {
  const { 
    userLocation,      // Aktueller Standort
    isDetecting,       // Läuft Erkennung?
    detectLocation,    // Standort neu erkennen
    hasLocation,       // Ist Standort vorhanden?
  } = useLocation();

  if (!hasLocation) {
    return <Button onPress={detectLocation}>Standort aktivieren</Button>;
  }

  return <Text>Du bist in: {userLocation.city}</Text>;
}
```

#### 2. Distanz berechnen

```tsx
import { calculateDistance } from '@/lib/locationService';

const distance = calculateDistance(
  userLat, userLon,
  videoLat, videoLon
);
// Gibt Distanz in km zurück (gerundet auf 1 Dezimalstelle)
```

#### 3. Reverse-Geocoding

```tsx
// GPS-Koordinaten → Stadt
const response = await fetch(
  `/api/location/reverse?lat=52.52&lon=13.40`
);
const { city, country } = await response.json();
// { city: "Berlin", country: "Deutschland", ... }
```

#### 4. IP-basierte Location

```tsx
// IP-Adresse → grober Standort
const response = await fetch('/api/location/ip');
const { city, country } = await response.json();
// { city: "Berlin", country: "Deutschland", ... }
```

---

## 📁 Neue Dateien

### Core-System
- ✅ `lib/locationService.ts` - Zentrale Location-Logik
- ✅ `contexts/LocationContext.tsx` - Globaler Location-State
- ✅ `components/LocationDetector.tsx` - Berechtigungs-Dialog

### Backend-APIs
- ✅ `app/api/location/reverse+api.ts` - Reverse-Geocoding
- ✅ `app/api/location/ip+api.ts` - IP-basierte Geolocation

### Dokumentation
- ✅ `LOCATION-SYSTEM.md` - Technische Dokumentation (ausführlich)
- ✅ `LOCATION-QUICK-START.md` - Diese Datei

### Angepasste Dateien
- ✏️ `app/_layout.tsx` - LocationProvider eingebunden
- ✏️ `app/(tabs)/upload.tsx` - Auto-Fill für Stadt
- ✏️ `app/(tabs)/index.tsx` - Standort-basierter Feed

---

## 🧪 Testen

### 1. Standort-Erkennung
```bash
# App öffnen
npm run dev
# oder
npx expo start

# Nach 2 Sekunden erscheint Dialog → "Standort freigeben" klicken
# Console prüfen:
# ✅ Standort erkannt: { city: "Berlin", ... }
```

### 2. Upload-Flow
```bash
# Upload-Tab öffnen
# "Market-Video hochladen" aktivieren
# → Stadt sollte automatisch ausgefüllt sein
# → Badge zeigt "GPS erkannt" oder "IP erkannt"
```

### 3. Market-Feed
```bash
# Market-Tab öffnen
# → Standort-Info in Filter-Bar sichtbar
# → Toggle zwischen "Lokal" / "Global"
# → Videos nach Distanz sortiert
```

---

## 🔧 Konfiguration

### Umkreis-Radius ändern

In `app/(tabs)/index.tsx`:
```tsx
// Zeile ~165
return video.distance !== undefined && video.distance <= 50; // ← Ändere 50 (km)
```

### Cache-Dauer ändern

In `lib/locationService.ts`:
```tsx
// Zeile ~224
const maxAge = 24 * 60 * 60 * 1000; // ← Ändere 24 (Stunden)
```

### Dialog-Delay ändern

In `components/LocationDetector.tsx`:
```tsx
// Zeile ~25
await new Promise(resolve => setTimeout(resolve, 2000)); // ← Ändere 2000 (ms)
```

---

## 🐛 Bekannte Einschränkungen

### Browser-Kompatibilität
- **GPS-Standort**: Funktioniert nur bei HTTPS oder localhost
- **Safari**: Benötigt explizite Berechtigung pro Session
- **Mobile Browser**: GPS oft genauer als Desktop

### Rate Limits
- **Nominatim**: Max 1 Request/Sekunde (für Reverse-Geocoding)
- **ipapi.co**: 1000 Requests/Tag (für IP-Location)
- **Fallback**: ip-api.com (unbegrenzt)

### Performance
- **Feed-Sortierung**: Client-seitig, max 100 Videos empfohlen
- **Distanz-Berechnung**: O(n) Komplexität, schnell bis ~500 Videos

---

## 🎯 Nächste Schritte (Optional)

### Erweiterte Features

1. **Umkreis-Slider**
   - Nutzer kann Radius selbst wählen (25km, 50km, 100km, ...)
   - UI-Komponente für Slider

2. **Server-seitige Geo-Queries**
   - PostGIS-Extension in Supabase
   - SQL-Query mit `ST_Distance_Sphere()`
   - Bessere Performance für große Datenmengen

3. **Favorisierte Städte**
   - Nutzer kann mehrere Städte favorisieren
   - Quick-Switch zwischen Städten

4. **Push-Notifications**
   - Benachrichtigung bei neuen lokalen Listings

---

## 📚 Weitere Dokumentation

- **Ausführlich**: Siehe `LOCATION-SYSTEM.md` (50+ Seiten)
- **Market-System**: Siehe `MARKET-LOCATION.md` (bestehende Doku)
- **Code-Kommentare**: Alle Funktionen sind dokumentiert

---

## ✅ Checkliste für Deployment

- [ ] Supabase Migration ausgeführt (`20241120_add_location_to_videos.sql`)
- [ ] Location-Felder in Videos-Tabelle vorhanden
- [ ] Indizes erstellt (`idx_videos_location`, `idx_videos_geo`)
- [ ] API-Routen funktionieren (`/api/location/reverse`, `/api/location/ip`)
- [ ] LocationProvider im Root-Layout eingebunden
- [ ] Browser-Berechtigungen für Geolocation getestet
- [ ] HTTPS aktiviert (für GPS in Produktion)
- [ ] Datenschutz-Hinweise aktualisiert

---

**🎉 Fertig!** Das standortbasierte System ist einsatzbereit.

Bei Fragen siehe `LOCATION-SYSTEM.md` oder GitHub Issues.
