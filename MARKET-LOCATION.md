# 📍 Market Location System - Technische Dokumentation

**Anpip.com** - Standort-Auswahl für Market-Listings mit OpenStreetMap Nominatim

---

## 🎯 Übersicht

Das Market Location System ermöglicht es Nutzern, beim Hochladen von Market-Videos eine Stadt weltweit auszuwählen. Die Integration nutzt die **OpenStreetMap Nominatim API** für die Stadtsuche und speichert Standortdaten strukturiert in der Datenbank.

### Hauptfunktionen

- **Weltweite Stadtsuche** über OpenStreetMap Nominatim
- **Autocomplete-Suche** mit Debounce (500ms)
- **Strukturierte Datenspeicherung** mit GPS-Koordinaten
- **Pflichtfeld** für Market-Listings
- **Schrittweise Upload-Flow**: Stadt → Kategorie → Unterkategorie

---

## 🏗️ Architektur

### 1. Datenbank-Schema

**Neue Felder in `videos` Tabelle:**

```sql
location_city           TEXT         -- Stadt (z.B. "Berlin")
location_country        TEXT         -- Land (z.B. "Deutschland")
location_lat            DECIMAL(10,8) -- Breitengrad (z.B. 52.5200066)
location_lon            DECIMAL(11,8) -- Längengrad (z.B. 13.4049540)
location_display_name   TEXT         -- Vollständiger Name (z.B. "Berlin, Deutschland")
location_postcode       TEXT         -- Postleitzahl (optional)
```

**Indizes für Performance:**

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

**Migration ausführen:**

```bash
# Im Supabase Dashboard → SQL Editor
# Datei: supabase/migrations/20241120_add_location_to_videos.sql
```

---

### 2. API Endpoint

**Datei:** `app/api/locations/search+api.ts`

**Endpoint:** `POST /api/locations/search`

**Request:**

```typescript
{
  "q": "Berlin" // Suchbegriff (min. 2 Zeichen)
}
```

**Response:**

```typescript
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 240109189,
      "city": "Berlin",
      "country": "Deutschland",
      "lat": 52.5200066,
      "lon": 13.4049540,
      "displayName": "Berlin, Deutschland",
      "postcode": "10117"
    },
    // ... weitere Ergebnisse
  ]
}
```

**Features:**

- ✅ **Rate Limiting**: Min. 1 Sekunde zwischen Requests
- ✅ **Timeout**: 5 Sekunden Request-Timeout
- ✅ **User-Agent**: `anpip.com/1.0` (Nominatim-Requirement)
- ✅ **Error Handling**: Klare Fehlermeldungen
- ✅ **Validierung**: Query-Länge 2-100 Zeichen

**Nominatim API Call:**

```
GET https://nominatim.openstreetmap.org/search
  ?q=Berlin
  &format=json
  &addressdetails=1
  &limit=10
```

---

### 3. Frontend-Komponente

**Datei:** `components/LocationAutocomplete.tsx`

**Verwendung:**

```tsx
import { LocationAutocomplete, Location } from '@/components/LocationAutocomplete';

function UploadScreen() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  return (
    <LocationAutocomplete
      onSelect={(location) => {
        setSelectedLocation(location);
        console.log('Stadt gewählt:', location.city, location.country);
      }}
      placeholder="Stadt suchen..."
      initialValue={selectedLocation}
    />
  );
}
```

**Props:**

| Prop | Typ | Beschreibung |
|------|-----|--------------|
| `onSelect` | `(location: Location) => void` | Callback bei Stadt-Auswahl |
| `placeholder` | `string?` | Placeholder-Text (default: "Stadt suchen...") |
| `disabled` | `boolean?` | Deaktiviert das Feld |
| `initialValue` | `Location?` | Vorausgewählte Stadt |

**Location Interface:**

```typescript
interface Location {
  id: number;           // Nominatim Place ID
  city: string;         // Stadt-Name
  country: string;      // Land-Name
  lat: number;          // Breitengrad
  lon: number;          // Längengrad
  displayName: string;  // Voller Name
  postcode?: string;    // Postleitzahl (optional)
}
```

**Features:**

- ✅ **Debounced Search**: 500ms Verzögerung
- ✅ **Live-Suche**: Ab 2 Zeichen
- ✅ **Dropdown**: Max. 10 Vorschläge
- ✅ **Visual Feedback**: Checkmark bei Auswahl
- ✅ **Error Handling**: Nutzerfreundliche Fehlermeldungen
- ✅ **Keyboard Dismiss**: Tastatur schließt bei Auswahl

---

### 4. Upload-Flow

**Neue Reihenfolge:**

1. **Market-Toggle aktivieren**
2. **Stadt wählen** (Pflicht) ← Neu!
3. **Kategorie wählen** (nur wenn Stadt gewählt)
4. **Unterkategorie wählen** (nur wenn Kategorie gewählt)
5. **Video hochladen + Beschreibung**

**Validierung:**

```typescript
if (isForMarket) {
  if (!selectedLocation) {
    Alert.alert('Stadt fehlt', 'Bitte wähle zuerst eine Stadt aus.');
    return;
  }
  if (!selectedCategory) {
    Alert.alert('Kategorie fehlt', 'Bitte wähle eine Kategorie aus.');
    return;
  }
  if (!selectedSubcategory) {
    Alert.alert('Unterkategorie fehlt', 'Bitte wähle eine Unterkategorie aus.');
    return;
  }
}
```

**Daten-Speicherung:**

```typescript
await supabase.from('videos').insert({
  // ... andere Felder
  is_market_item: true,
  market_category: 'vehicles',
  market_subcategory: 'Autos',
  location_city: selectedLocation.city,
  location_country: selectedLocation.country,
  location_lat: selectedLocation.lat,
  location_lon: selectedLocation.lon,
  location_display_name: selectedLocation.displayName,
  location_postcode: selectedLocation.postcode,
});
```

---

## 🚀 Verwendung

### 1. Datenbank-Migration ausführen

```sql
-- Im Supabase Dashboard → SQL Editor
-- Führe aus: supabase/migrations/20241120_add_location_to_videos.sql
```

### 2. API-Route testen

**cURL Beispiel:**

```bash
curl -X POST http://localhost:8081/api/locations/search \
  -H "Content-Type: application/json" \
  -d '{"q":"Berlin"}'
```

**Browser GET (Entwicklung):**

```
http://localhost:8081/api/locations/search?q=Berlin
```

### 3. In App nutzen

1. Market-Toggle aktivieren
2. Stadt suchen und auswählen
3. Kategorie und Unterkategorie wählen
4. Video hochladen

---

## 🔧 Erweiterungen

### Umkreissuche implementieren

**Datenbankabfrage für "Videos in 50km Umkreis":**

```sql
-- Haversine-Formel für Distanzberechnung
SELECT *,
  (6371 * acos(
    cos(radians(52.52)) * cos(radians(location_lat)) *
    cos(radians(location_lon) - radians(13.40)) +
    sin(radians(52.52)) * sin(radians(location_lat))
  )) AS distance_km
FROM videos
WHERE is_market_item = TRUE
  AND location_lat IS NOT NULL
  AND location_lon IS NOT NULL
HAVING distance_km < 50
ORDER BY distance_km ASC;
```

**Supabase Client (TypeScript):**

```typescript
// Erfordert PostGIS-Extension oder Custom RPC
const { data } = await supabase.rpc('search_nearby_listings', {
  lat: 52.5200066,
  lon: 13.4049540,
  radius_km: 50
});
```

### Stadt-Filter in Feed

**Filtern nach Stadt:**

```typescript
const { data } = await supabase
  .from('videos')
  .select('*')
  .eq('is_market_item', true)
  .eq('location_city', 'Berlin')
  .eq('location_country', 'Deutschland')
  .order('created_at', { ascending: false });
```

### Autocomplete-Caching

**Local Storage für häufige Suchen:**

```typescript
// In LocationAutocomplete.tsx erweitern
const CACHE_KEY = 'location_search_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Stunden

// Vor API-Call prüfen
const cachedResults = await AsyncStorage.getItem(`${CACHE_KEY}_${query}`);
if (cachedResults) {
  const { data, timestamp } = JSON.parse(cachedResults);
  if (Date.now() - timestamp < CACHE_DURATION) {
    return data;
  }
}
```

### Alternative: Google Places API

Falls Nominatim Limits erreicht werden:

```typescript
// Alternative API
const GOOGLE_PLACES_URL = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';

const response = await fetch(
  `${GOOGLE_PLACES_URL}?input=${query}&key=${GOOGLE_API_KEY}&types=(cities)`
);
```

---

## ⚠️ Wichtige Hinweise

### Nominatim Fair Use Policy

**Limits:**

- ✅ Max. 1 Request pro Sekunde
- ✅ User-Agent Header **Pflicht**
- ✅ Keine massenhaften Abfragen
- ✅ Caching empfohlen

**Bei Verletzung:**

- IP-Adresse wird geblockt
- Empfehlung: Eigene Nominatim-Instanz hosten

**Hosting-Optionen:**

1. **Docker Nominatim**: https://github.com/mediagis/nominatim-docker
2. **MapQuest Nominatim**: Commercial Service mit höheren Limits
3. **Photon API**: Alternative zu Nominatim

### Performance-Tipps

**1. Debounce erhöhen bei langsamer Verbindung:**

```typescript
// In LocationAutocomplete.tsx
const DEBOUNCE_MS = 800; // Statt 500ms
```

**2. Limit reduzieren:**

```typescript
// In search+api.ts
const params = new URLSearchParams({
  limit: '5', // Statt 10
});
```

**3. Results cachen:**

```typescript
// Simple in-memory cache
const resultsCache = new Map<string, { data: Location[], timestamp: number }>();
```

---

## 🐛 Troubleshooting

### Problem: "Failed to fetch locations"

**Lösung:**

```bash
# 1. API-Route testen
curl http://localhost:8081/api/locations/search?q=Berlin

# 2. Nominatim direkt testen
curl "https://nominatim.openstreetmap.org/search?q=Berlin&format=json&addressdetails=1"

# 3. User-Agent prüfen (in Browser Network Tab)
```

### Problem: "Keine Städte gefunden"

**Ursachen:**

- Query zu kurz (< 2 Zeichen)
- Tippfehler in Stadtnamen
- Stadt existiert nicht in Nominatim

**Test:**

```bash
# Direkt in Nominatim suchen
https://nominatim.openstreetmap.org/search?q=YourCity&format=json
```

### Problem: Rate Limit erreicht

**Lösung:**

```typescript
// Rate Limiting erhöhen
const MIN_REQUEST_INTERVAL = 2000; // 2 Sekunden statt 1
```

**Oder Nominatim selbst hosten:**

```bash
docker run -d \
  -p 8080:8080 \
  -e PBF_URL=https://download.geofabrik.de/europe/germany-latest.osm.pbf \
  --name nominatim \
  mediagis/nominatim:4.2
```

---

## 📊 Monitoring

### Logging

**Backend (search+api.ts):**

```typescript
console.log('📍 Location search:', {
  query,
  results: locations.length,
  timestamp: new Date().toISOString(),
});
```

**Frontend (LocationAutocomplete.tsx):**

```typescript
console.log('🔍 Searching for:', query);
console.log('✅ Found locations:', results.length);
console.log('❌ Search error:', error);
```

### Analytics

**Track in Analytics-Tool:**

```typescript
// Bei Stadt-Auswahl
analytics.track('location_selected', {
  city: location.city,
  country: location.country,
  category: 'market_upload',
});
```

---

## 📝 Changelog

### v1.0.0 (2024-11-20)

- ✨ Initiale Implementation
- ✨ Nominatim API Integration
- ✨ LocationAutocomplete Komponente
- ✨ Upload-Flow Anpassung (Stadt → Kategorie → Unterkategorie)
- ✨ Datenbank-Migration mit Location-Feldern
- ✨ Validierung: Stadt ist Pflichtfeld
- 📚 Technische Dokumentation

---

## 🔗 Links

- **OpenStreetMap Nominatim**: https://nominatim.openstreetmap.org/
- **Nominatim API Docs**: https://nominatim.org/release-docs/latest/api/Search/
- **Usage Policy**: https://operations.osmfoundation.org/policies/nominatim/
- **Alternative: Photon**: https://photon.komoot.io/

---

## 👥 Support

Bei Fragen oder Problemen:

1. **Dokumentation prüfen** (diese Datei)
2. **Logs checken** (Console im Browser/Terminal)
3. **API direkt testen** (cURL/Browser)
4. **Issue erstellen** im Repository

---

**Entwickelt für Anpip.com** | Version 1.0.0 | 2024-11-20
