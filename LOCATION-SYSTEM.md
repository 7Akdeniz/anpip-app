# 📍 Standort-basiertes System - Technische Dokumentation

**Anpip.com** - Intelligentes Location-System für Market-Listings

---

## 🎯 Übersicht

Das standortbasierte System ermöglicht es Anpip.com, Market-Anzeigen intelligent basierend auf dem Standort des Nutzers zu priorisieren. Das System kombiniert GPS-Standort-Erkennung, IP-basierte Geolocation und OpenStreetMap Nominatim für eine nahtlose Benutzererfahrung.

### Hauptfunktionen

✅ **Automatische Standort-Erkennung beim App-Start**
- GPS-basiert (HTML5 Geolocation API)
- IP-basierter Fallback
- Nutzerfreundlicher Berechtigungs-Dialog

✅ **Smart Auto-Fill beim Upload**
- Automatische Stadt-Vorauswahl basierend auf erkanntem Standort
- Manuell editierbar
- Validierung vor Upload

✅ **Lokaler Market-Feed**
- Videos aus der gleichen Stadt zuerst
- Umkreis-basierte Priorisierung (max 50km)
- Toggle zwischen "Lokal" und "Global"
- Distanz-Berechnung via Haversine-Formel

---

## 🏗️ Architektur

### 1. Komponenten-Übersicht

```
/lib/locationService.ts              → Zentrale Location-Logik
/contexts/LocationContext.tsx        → Globaler Location-State
/components/LocationDetector.tsx     → Berechtigungs-Dialog
/components/LocationAutocomplete.tsx → Stadt-Suche (bereits vorhanden)
/app/api/location/reverse+api.ts     → Reverse-Geocoding API
/app/api/location/ip+api.ts          → IP-basierte Geolocation API
```

---

## 📡 Location Service (`lib/locationService.ts`)

### Hauptfunktionen

#### `detectUserLocation(): Promise<UserLocation | null>`
Erkannt den Nutzer-Standort automatisch:

1. **GPS-Standort** (primär)
   - Nutzt `navigator.geolocation.getCurrentPosition()`
   - Fragt um Erlaubnis
   - Timeout: 10 Sekunden
   - Cache: 5 Minuten

2. **IP-basierter Standort** (Fallback)
   - Ruft `/api/location/ip` auf
   - Nutzt ipapi.co oder ip-api.com
   - Gibt Land & Stadt zurück

3. **Speicherung**
   - Speichert Ergebnis in `localStorage`
   - Max. Alter: 24 Stunden
   - Format: `UserLocation` Interface

#### `reverseGeocode(lat: number, lon: number)`
Konvertiert GPS-Koordinaten in Stadt/Land via Nominatim API.

#### `calculateDistance(lat1, lon1, lat2, lon2): number`
Berechnet Distanz zwischen zwei Koordinaten (Haversine-Formel).

#### `getStoredLocation(): UserLocation | null`
Lädt gespeicherten Standort aus localStorage.

---

## 🌐 Location Context (`contexts/LocationContext.tsx`)

### Provider Setup

```tsx
<LocationProvider>
  <App />
</LocationProvider>
```

### Hook Usage

```tsx
import { useLocation } from '@/contexts/LocationContext';

function MyComponent() {
  const { 
    userLocation,      // UserLocation | null
    isDetecting,       // boolean
    error,             // string | null
    detectLocation,    // () => Promise<void>
    setManualLocation, // (location: Location) => void
    clearLocation,     // () => void
    hasLocation,       // boolean
  } = useLocation();

  // ...
}
```

### State Management

- `userLocation`: Aktueller Standort des Nutzers
- `isDetecting`: Läuft gerade eine Standort-Erkennung?
- `error`: Fehlermeldung (falls vorhanden)
- `hasLocation`: Boolean-Flag für schnelle Checks

---

## 🎨 Location Detector (`components/LocationDetector.tsx`)

### Funktionsweise

1. **Beim App-Start** (nach 2 Sekunden Delay):
   - Prüft ob bereits ein Standort gespeichert ist
   - Prüft ob bereits nach Standort gefragt wurde
   - Zeigt Dialog, falls beides nein

2. **Dialog-Inhalt**:
   - Erklärt Vorteile der Standort-Freigabe
   - Zeigt Benefits (lokale Anzeigen, Auto-Fill, etc.)
   - Buttons: "Standort freigeben" / "Später"
   - Datenschutz-Hinweis

3. **Nach Erlaubnis**:
   - Ruft `detectLocation()` auf
   - Speichert Flag in localStorage
   - Dialog wird geschlossen

---

## 🔌 Backend APIs

### 1. Reverse Geocoding API

**Endpoint:** `GET /api/location/reverse?lat=52.52&lon=13.40`

**Response:**
```json
{
  "lat": 52.52,
  "lon": 13.40,
  "city": "Berlin",
  "country": "Deutschland",
  "displayName": "Berlin, Deutschland",
  "postcode": "10115",
  "source": "nominatim"
}
```

**Implementierung:**
- Nutzt OpenStreetMap Nominatim API
- Validiert Koordinaten-Bereich
- Extrahiert Stadt/Land aus Address-Daten
- Fehlerbehandlung für ungültige Koordinaten

---

### 2. IP-basierte Geolocation API

**Endpoint:** `GET /api/location/ip`

**Response:**
```json
{
  "lat": 52.52,
  "lon": 13.40,
  "city": "Berlin",
  "country": "Deutschland",
  "displayName": "Berlin, Deutschland",
  "postcode": "10115",
  "source": "ip",
  "ip": "123.456.789.0"
}
```

**Implementierung:**
- Primär: ipapi.co (kostenlos, 1000 requests/Tag)
- Fallback: ip-api.com
- Default-Fallback: Berlin, Deutschland
- Extrahiert IP aus Request-Header (`x-forwarded-for`, `x-real-ip`)

---

## 📤 Upload-Flow Integration

### Auto-Fill Logik

```tsx
// app/(tabs)/upload.tsx

const { userLocation } = useLocation();

// Auto-Fill beim Aktivieren des Market-Modus
useEffect(() => {
  if (isForMarket && userLocation && !selectedLocation) {
    const autoLocation: Location = {
      id: 0,
      city: userLocation.city,
      country: userLocation.country,
      lat: userLocation.lat,
      lon: userLocation.lon,
      displayName: userLocation.displayName,
    };
    setSelectedLocation(autoLocation);
  }
}, [isForMarket, userLocation]);
```

### UI-Feedback

- Badge zeigt an: "GPS erkannt" / "IP erkannt" / "Manuell"
- Hint-Text unter Autocomplete: `📍 Berlin, Deutschland`
- Standort ist **editierbar** durch Nutzer

---

## 📺 Market Feed Integration

### Standort-basierte Sortierung

```tsx
// app/(tabs)/index.tsx

if (activeTab === 'market' && userLocation) {
  // 1. Berechne Distanz für jedes Video
  processedVideos = processedVideos.map(video => {
    if (video.location_lat && video.location_lon) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lon,
        video.location_lat,
        video.location_lon
      );
      return { ...video, distance };
    }
    return { ...video, distance: 99999 };
  });

  // 2. Filtern nach lokalem Standort (wenn aktiviert)
  if (localOnly) {
    processedVideos = processedVideos.filter(video => {
      // Gleiche Stadt ODER max 50km Umkreis
      return video.location_city === userLocation.city || 
             (video.distance !== undefined && video.distance <= 50);
    });
  }

  // 3. Sortiere nach Distanz (nächste zuerst)
  processedVideos.sort((a, b) => {
    return (a.distance ?? 99999) - (b.distance ?? 99999);
  });
}
```

### Location-Filter UI

**Position:** Unter Top-Tabs, nur im Market-Tab sichtbar

**Komponenten:**
- **Location-Info**: Zeigt aktuellen Standort (`📍 Berlin, Deutschland`)
- **Toggle-Button**: Schaltet zwischen "Lokal" und "Global"
  - `Lokal`: Nur Videos aus gleicher Stadt oder <50km
  - `Global`: Alle Videos, nach Distanz sortiert

**Styling:**
```tsx
<View style={styles.locationFilterBar}>
  <View style={styles.locationInfo}>
    <Ionicons name="location" size={14} color={Colors.primary} />
    <Typography>{userLocation.city}, {userLocation.country}</Typography>
  </View>
  
  <TouchableOpacity onPress={() => setLocalOnly(!localOnly)}>
    <Ionicons name={localOnly ? 'location' : 'globe-outline'} />
    <Typography>{localOnly ? 'Lokal' : 'Global'}</Typography>
  </TouchableOpacity>
</View>
```

---

## 💾 Datenbank-Schema

### Vorhandene Felder in `videos` Tabelle

```sql
location_city           TEXT         -- Stadt (z.B. "Berlin")
location_country        TEXT         -- Land (z.B. "Deutschland")
location_lat            DECIMAL(10,8) -- Breitengrad
location_lon            DECIMAL(11,8) -- Längengrad
location_display_name   TEXT         -- Vollständiger Name
location_postcode       TEXT         -- Postleitzahl (optional)
is_market_item          BOOLEAN      -- Ist es ein Market-Listing?
market_category         TEXT         -- Hauptkategorie
market_subcategory      TEXT         -- Unterkategorie
```

### Indizes (bereits vorhanden)

```sql
-- Index für Stadt/Land-Suche
CREATE INDEX idx_videos_location 
  ON videos(location_city, location_country) 
  WHERE is_market_item = TRUE;

-- Index für Geo-Queries (Umkreissuche)
CREATE INDEX idx_videos_geo 
  ON videos(location_lat, location_lon) 
  WHERE is_market_item = TRUE;
```

---

## 🔄 Ablauf-Diagramme

### 1. Standort-Erkennung beim App-Start

```
App-Start
    ↓
Lade gespeicherten Standort aus localStorage
    ↓
Vorhanden? → JA → Nutze gespeicherten Standort
    ↓ NEIN
Zeige Berechtigungs-Dialog nach 2 Sekunden
    ↓
Nutzer erlaubt? → JA → Starte GPS-Erkennung
    ↓                      ↓
    NEIN              GPS erfolgreich?
    ↓                      ↓ JA
Nutze IP-Fallback    Reverse-Geocoding
    ↓                      ↓
Speichere in         Speichere in localStorage
localStorage              ↓
    ↓                 Nutze Standort
    └─────────────────────┘
```

### 2. Upload-Flow mit Auto-Location

```
Nutzer wählt "Market-Video hochladen"
    ↓
Ist Standort vorhanden?
    ↓ JA                    ↓ NEIN
Fülle Stadt-Feld          Normales Autocomplete
automatisch aus
    ↓
Zeige Badge: "GPS erkannt"
    ↓
Nutzer kann Stadt ändern (optional)
    ↓
Nutzer wählt Kategorie & Unterkategorie
    ↓
Video wird hochgeladen mit location_city, location_country, lat, lon
```

### 3. Market-Feed mit lokalem Filter

```
Nutzer öffnet Market-Tab
    ↓
Ist Standort vorhanden?
    ↓ JA                              ↓ NEIN
Zeige Location-Filter-Bar         Zeige alle Videos
    ↓
Ist "Lokal"-Filter aktiv?
    ↓ JA                              ↓ NEIN
Filtere Videos:                   Sortiere Videos nach Distanz
- Gleiche Stadt ODER
- Max 50km Umkreis
    ↓                                  ↓
Sortiere nach Distanz             Zeige alle (nächste zuerst)
    ↓                                  ↓
Zeige Feed                        Zeige Feed
```

---

## 🧪 Testing

### 1. Standort-Erkennung testen

**Browser-Console:**
```javascript
// GPS-Standort simulieren
navigator.geolocation.getCurrentPosition(
  (pos) => console.log(pos),
  (err) => console.error(err)
);

// localStorage überprüfen
localStorage.getItem('userLocation');
localStorage.getItem('locationAsked');
```

### 2. API-Endpunkte testen

**Reverse Geocoding:**
```bash
curl "http://localhost:8081/api/location/reverse?lat=52.52&lon=13.40"
```

**IP-basierte Location:**
```bash
curl "http://localhost:8081/api/location/ip"
```

### 3. Feed-Sortierung testen

1. Erstelle Market-Videos mit verschiedenen Standorten
2. Setze eigenen Standort (z.B. Berlin)
3. Öffne Market-Tab
4. Prüfe Reihenfolge: Berliner Videos zuerst
5. Toggle "Lokal" → "Global"
6. Prüfe: Alle Videos sichtbar, nach Distanz sortiert

---

## 🚀 Deployment

### 1. Umgebungsvariablen

Keine zusätzlichen Umgebungsvariablen erforderlich.

### 2. Externe Dienste

**OpenStreetMap Nominatim:**
- Kostenlos
- Keine API-Key erforderlich
- Rate Limit: 1 Request/Sekunde
- User-Agent erforderlich: `Anpip.com App`

**ipapi.co:**
- Kostenlos: 1000 requests/Tag
- Kein API-Key erforderlich
- Fallback zu ip-api.com

**ip-api.com:**
- Kostenlos: Unbegrenzt
- Kein API-Key erforderlich
- HTTP-only (kein HTTPS in Free-Version)

### 3. Supabase Migration

Die Location-Felder wurden bereits in der Migration hinzugefügt:
```sql
supabase/migrations/20241120_add_location_to_videos.sql
```

---

## 📊 Performance-Optimierungen

### 1. Caching

- **localStorage**: Standort wird 24 Stunden gecacht
- **GPS-Cache**: `maximumAge: 300000` (5 Minuten)
- **API-Responses**: Standard HTTP-Caching

### 2. Lazy Loading

- Location-Erkennung startet erst 2 Sekunden nach App-Start
- Dialog wird nur gezeigt, wenn nötig
- Nominatim-Calls werden nur bei Bedarf gemacht

### 3. Batch-Verarbeitung

- Feed lädt 100 Videos statt 20
- Distanz-Berechnung auf Client-Seite (parallel)
- Sortierung vor Anzeige

---

## 🔐 Datenschutz & Sicherheit

### DSGVO-Konformität

✅ **Explizite Einwilligung**: Nutzer muss Standort freigeben  
✅ **Transparenz**: Dialog erklärt Nutzung  
✅ **Minimierung**: Nur Stadt/Land, keine exakten Koordinaten in UI  
✅ **Speicherung**: Nur im localStorage (Client-seitig)  
✅ **Löschung**: Nutzer kann Standort jederzeit löschen  

### Sicherheit

- **Validierung**: Koordinaten-Bereich wird geprüft
- **Sanitization**: Alle Eingaben werden validiert
- **Rate Limiting**: Nominatim-Calls respektieren Rate Limits
- **Fallbacks**: Mehrere Backup-Dienste für Verfügbarkeit

---

## 🐛 Troubleshooting

### Problem: Standort wird nicht erkannt

**Lösung:**
1. Prüfe Browser-Berechtigungen für Geolocation
2. Prüfe Console auf Fehler
3. Teste IP-Fallback: `/api/location/ip`
4. Prüfe localStorage: `localStorage.getItem('userLocation')`

### Problem: Videos werden nicht nach Standort sortiert

**Lösung:**
1. Prüfe ob Market-Videos `location_lat` und `location_lon` haben
2. Prüfe Console-Logs: "Videos nach Distanz sortiert"
3. Prüfe ob `localOnly` State korrekt ist
4. Verifiziere `calculateDistance()` Funktion

### Problem: Upload-Autocomplete zeigt keinen Standort

**Lösung:**
1. Prüfe ob `userLocation` im Context vorhanden ist
2. Prüfe `useEffect` Dependency-Array
3. Teste manuelles Setzen: `setSelectedLocation(...)`

---

## 📚 Best Practices

### 1. Location Service

```tsx
// ✅ RICHTIG
const { userLocation } = useLocation();
if (userLocation) {
  // Nutze Standort
}

// ❌ FALSCH
const location = localStorage.getItem('userLocation');
// Nutze Context statt direktem localStorage-Zugriff
```

### 2. Distanz-Berechnung

```tsx
// ✅ RICHTIG
const distance = calculateDistance(
  userLat, userLon,
  videoLat, videoLon
);

// ❌ FALSCH
const distance = Math.abs(userLat - videoLat); 
// Nutze Haversine-Formel für korrekte Distanzen
```

### 3. Feed-Filterung

```tsx
// ✅ RICHTIG
if (localOnly) {
  videos = videos.filter(v => 
    v.location_city === userCity || v.distance <= 50
  );
}

// ❌ FALSCH
if (localOnly) {
  videos = videos.filter(v => v.location_city === userCity);
  // Berücksichtige auch Umkreis!
}
```

---

## 🎯 Zukünftige Erweiterungen

### Geplante Features

1. **Umkreis-Slider**: Nutzer kann Radius selbst wählen (25km, 50km, 100km)
2. **Multi-City-Support**: Nutzer kann mehrere Städte favorisieren
3. **Standort-Historie**: Letzte 5 Standorte speichern
4. **Offline-Modus**: Gecachte Standort-Daten für Offline-Nutzung
5. **Push-Notifications**: Benachrichtigung bei neuen lokalen Anzeigen

### Technische Verbesserungen

1. **PostGIS-Integration**: Server-seitige Geo-Queries für bessere Performance
2. **CDN-Caching**: Geo-Daten in CDN cachen
3. **WebSockets**: Live-Updates für neue lokale Listings
4. **Service Worker**: Offline-Funktionalität für Standort-Daten

---

## 📞 Support & Kontakt

Bei Fragen oder Problemen:
- GitHub Issues: `github.com/7Akdeniz/anpip-app/issues`
- Dokumentation: Siehe `MARKET-LOCATION.md`
- Code-Review: Siehe `lib/locationService.ts`, `contexts/LocationContext.tsx`

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 21. November 2024  
**Autor:** GitHub Copilot  
**Projekt:** Anpip.com - Video Social Platform
