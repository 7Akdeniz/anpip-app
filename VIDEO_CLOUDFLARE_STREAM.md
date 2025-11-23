# 🎥 CLOUDFLARE STREAM INTEGRATION - ANPIP.COM

**Video-Upload & Streaming bis 2 Stunden | Weltweit skalierbar | Nummer 1 Niveau**

---

## 📋 Übersicht

Diese Integration ermöglicht es Anpip.com-Nutzern, **Videos bis zu 2 Stunden Länge** hochzuladen und weltweit in optimaler Qualität zu streamen.

### ✨ Features

- ✅ **Direct Upload vom Client** → kein Server-Proxy, kein Upload über unsere Infrastruktur
- ✅ **Automatisches Transcoding** → mehrere Qualitäten (240p - 4K)
- ✅ **Adaptive Streaming (HLS)** → automatische Qualitätsanpassung je nach Netzwerk
- ✅ **Globales CDN** → blitzschnelle Auslieferung weltweit
- ✅ **Chunk-Upload** → große Dateien sicher hochladen
- ✅ **Progress-Tracking** → Prozent, Restzeit, Geschwindigkeit
- ✅ **Pause/Resume** → Upload kann fortgesetzt werden
- ✅ **Webhook-Integration** → automatische Status-Updates
- ✅ **9:16 Vertical Video** → optimiert für TikTok/Reels-Format

---

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER (App/Web)                              │
└──────────────┬────────────────────────────────┬─────────────────────┘
               │                                │
               │ 1. Request Upload-URL         │ 5. Stream HLS Video
               │                                │
┌──────────────▼────────────────────────────────▼─────────────────────┐
│                    ANPIP.COM BACKEND                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  API Routes (Expo Router)                                    │   │
│  │  - /api/videos/create-upload  → Upload-URL erstellen         │   │
│  │  - /api/videos/[id]           → Video-Details abrufen        │   │
│  │  - /api/videos/feed           → Feed-Videos laden            │   │
│  │  - /api/videos/webhook/...    → Cloudflare Webhooks          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Supabase (PostgreSQL)                                       │   │
│  │  - videos Tabelle: Metadaten, Status, URLs                   │   │
│  │  - RLS Policies: Sicherheit                                  │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────┬──────────────────────────────────────────────────────┘
               │
               │ 2. Create Direct Upload URL
               │ 4. Webhook: Status-Updates
               │
┌──────────────▼──────────────────────────────────────────────────────┐
│                    CLOUDFLARE STREAM                                │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Upload     → tus.io Protocol (resumable)                    │   │
│  │  Transcode  → FFmpeg, mehrere Qualitäten                     │   │
│  │  Storage    → verschlüsselt, redundant                       │   │
│  │  CDN        → 200+ PoPs weltweit                             │   │
│  │  Streaming  → HLS/DASH Adaptive Bitrate                      │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
               │
               │ 3. Upload direkt zu Cloudflare
               │
┌──────────────▼──────────────────────────────────────────────────────┐
│                         USER (App/Web)                              │
│         Lädt Video-Datei in Chunks hoch (mit Progress)              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Setup & Installation

### 1. Cloudflare Stream Account

1. **Cloudflare Account erstellen**: https://dash.cloudflare.com/sign-up
2. **Stream aktivieren**: https://dash.cloudflare.com/stream
3. **API Token erstellen**:
   - Dashboard → Profile → API Tokens
   - "Create Token" → Custom Token
   - Permissions: `Stream: Edit`
   - Speichere den Token sicher!

### 2. Umgebungsvariablen

Erstelle/ergänze die `.env` Datei:

```bash
# Cloudflare Stream
CLOUDFLARE_ACCOUNT_ID=dein_account_id_hier
CLOUDFLARE_STREAM_API_TOKEN=dein_api_token_hier
CLOUDFLARE_WEBHOOK_SECRET=ein_sicheres_geheimnis_hier

# Für Frontend (Public)
EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID=dein_account_id_hier
```

**So findest du deine Account ID:**
- Dashboard → Stream → Rechts oben in der URL: `dash.cloudflare.com/<ACCOUNT_ID>/stream`

### 3. Datenbank-Migration

Führe die SQL-Migration aus:

```bash
# Supabase CLI
supabase db push

# Oder manuell im Supabase Dashboard:
# SQL Editor → Neue Query → Kopiere Inhalt aus:
# supabase/migrations/20251123_videos_cloudflare_stream.sql
```

### 4. Webhook einrichten

1. **Cloudflare Dashboard**:
   - Stream → Settings → Notifications → Webhooks
2. **Webhook URL**:
   ```
   https://anpip.com/api/videos/webhook/cloudflare-stream
   ```
3. **Events aktivieren**:
   - ✅ Video Upload Complete
   - ✅ Video Ready
   - ✅ Video Error
4. **Secret** (optional aber empfohlen):
   - Setze ein Secret, das mit `CLOUDFLARE_WEBHOOK_SECRET` übereinstimmt

### 5. Dependencies (falls noch nicht vorhanden)

```bash
npm install @supabase/supabase-js
npm install expo-av
npm install expo-document-picker  # Für Upload-Komponente
```

---

## 📁 Dateistruktur

```
Anpip.com/
├── lib/
│   └── cloudflare-stream.ts           # Cloudflare Stream Client
│
├── app/api/videos/
│   ├── create-upload/
│   │   └── route.ts                   # POST: Upload-URL erstellen
│   ├── [id]+api.ts                    # GET: Video-Details
│   ├── feed+api.ts                    # GET: Feed-Videos
│   └── webhook/
│       └── cloudflare-stream+api.ts   # POST: Webhook-Handler
│
├── components/
│   ├── VideoUpload.tsx                # Upload-Komponente
│   ├── VideoPlayer.tsx                # HLS-Player
│   └── VideoFeedItem.tsx              # Feed-Item mit Player
│
├── supabase/migrations/
│   └── 20251123_videos_cloudflare_stream.sql  # DB-Schema
│
└── .env                               # Umgebungsvariablen
```

---

## 🚀 Verwendung

### Upload-Komponente verwenden

```tsx
import VideoUpload from '@/components/VideoUpload';

export default function UploadScreen() {
  return (
    <VideoUpload
      onUploadComplete={(videoId) => {
        console.log('Video hochgeladen:', videoId);
        // Navigation zum Video oder Feed
      }}
      onError={(error) => {
        console.error('Upload-Fehler:', error);
      }}
      maxSizeBytes={10 * 1024 * 1024 * 1024}  // 10GB
      maxDurationSeconds={7200}                // 2 Stunden
    />
  );
}
```

### Player-Komponente verwenden

```tsx
import VideoPlayer from '@/components/VideoPlayer';

export default function VideoScreen({ videoId, playbackUrl }) {
  return (
    <VideoPlayer
      videoId={videoId}
      playbackUrl={playbackUrl}
      autoplay={true}
      muted={false}
      loop={true}
      aspectRatio="9:16"
      onViewCountIncrement={() => {
        console.log('Video wurde angesehen');
      }}
    />
  );
}
```

### Feed-Item verwenden

```tsx
import VideoFeedItem from '@/components/VideoFeedItem';

export default function FeedScreen() {
  const videos = [...]; // Von API laden

  return (
    <FlatList
      data={videos}
      renderItem={({ item, index }) => (
        <VideoFeedItem
          video={item}
          isActive={index === currentIndex}
          onLike={(id) => console.log('Like', id)}
          onComment={(id) => console.log('Comment', id)}
          onShare={(id) => console.log('Share', id)}
        />
      )}
      pagingEnabled
      snapToInterval={Dimensions.get('window').height}
    />
  );
}
```

---

## 🔌 API-Endpunkte

### POST /api/videos/create-upload

**Erstellt eine Upload-URL bei Cloudflare Stream**

**Request:**
```json
{
  "title": "Mein Video",
  "description": "Beschreibung",
  "maxDurationSeconds": 7200,
  "locationLat": 51.5074,
  "locationLng": -0.1278,
  "locationName": "London",
  "tags": ["travel", "adventure"]
}
```

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "uuid",
    "cloudflare_uid": "abc123",
    "upload_url": "https://upload.cloudflarestream.com/...",
    "status": "uploading"
  }
}
```

**Auth:** Bearer Token (Supabase Session)

---

### GET /api/videos/[id]

**Holt Video-Details aus DB + Cloudflare**

**Response:**
```json
{
  "success": true,
  "video": {
    "id": "uuid",
    "cloudflare_uid": "abc123",
    "title": "Mein Video",
    "status": "ready",
    "playback_url": "https://customer-xxx.cloudflarestream.com/abc123/manifest/video.m3u8",
    "thumbnail_url": "https://...",
    "duration": 120.5,
    "view_count": 1000,
    "...": "..."
  },
  "cloudflare": { /* Aktuelle Cloudflare-Daten */ }
}
```

---

### GET /api/videos/feed

**Liefert Feed-Videos (paginiert)**

**Query-Parameter:**
- `limit` (default: 20)
- `offset` (default: 0)
- `userId` (optional)

**Response:**
```json
{
  "success": true,
  "videos": [
    {
      "id": "uuid",
      "cloudflare_uid": "abc123",
      "title": "Video 1",
      "playback_url": "https://...",
      "thumbnail_url": "https://...",
      "...": "..."
    }
  ],
  "count": 20,
  "limit": 20,
  "offset": 0
}
```

---

### POST /api/videos/webhook/cloudflare-stream

**Empfängt Webhooks von Cloudflare**

**Payload (Beispiel):**
```json
{
  "uid": "abc123",
  "status": {
    "state": "ready"
  },
  "duration": 120.5,
  "playback": {
    "hls": "https://...",
    "dash": "https://..."
  },
  "thumbnail": "https://...",
  "input": {
    "width": 1080,
    "height": 1920
  }
}
```

**Status-Mapping:**
- `pendingupload` → `uploading`
- `downloading`, `queued`, `inprogress` → `processing`
- `ready` → `ready`
- `error` → `error`

---

## 📊 Datenbank-Schema

### `videos` Tabelle

| Spalte | Typ | Beschreibung |
|--------|-----|--------------|
| `id` | UUID | Primary Key |
| `user_id` | UUID | Foreign Key → auth.users |
| `cloudflare_uid` | TEXT | Cloudflare Stream Video ID |
| `title` | TEXT | Video-Titel |
| `description` | TEXT | Beschreibung |
| `status` | TEXT | `uploading`, `processing`, `ready`, `error`, `deleted` |
| `duration` | NUMERIC | Videolänge in Sekunden |
| `width` | INTEGER | Videobreite in Pixel |
| `height` | INTEGER | Videohöhe in Pixel |
| `size_bytes` | BIGINT | Dateigröße |
| `playback_url` | TEXT | HLS m3u8 URL |
| `dash_url` | TEXT | DASH URL |
| `thumbnail_url` | TEXT | Thumbnail-URL |
| `embed_url` | TEXT | iFrame-Embed-URL |
| `upload_url` | TEXT | Temporäre Upload-URL |
| `upload_started_at` | TIMESTAMPTZ | Upload-Start |
| `upload_completed_at` | TIMESTAMPTZ | Upload-Ende |
| `processing_started_at` | TIMESTAMPTZ | Verarbeitung-Start |
| `processing_completed_at` | TIMESTAMPTZ | Verarbeitung-Ende |
| `error_code` | TEXT | Fehlercode |
| `error_message` | TEXT | Fehlermeldung |
| `moderation_status` | TEXT | `pending`, `approved`, `rejected`, `flagged` |
| `is_public` | BOOLEAN | Öffentlich sichtbar? |
| `view_count` | BIGINT | Anzahl Views |
| `like_count` | BIGINT | Anzahl Likes |
| `comment_count` | BIGINT | Anzahl Kommentare |
| `share_count` | BIGINT | Anzahl Shares |
| `location_lat` | NUMERIC | Breitengrad |
| `location_lng` | NUMERIC | Längengrad |
| `location_name` | TEXT | Ortsname |
| `tags` | TEXT[] | Tags-Array |
| `created_at` | TIMESTAMPTZ | Erstellungsdatum |
| `updated_at` | TIMESTAMPTZ | Letzte Änderung |
| `deleted_at` | TIMESTAMPTZ | Soft-Delete |

---

## 🔒 Sicherheit

### Row Level Security (RLS)

Alle Policies sind in der Migration aktiviert:

- ✅ **Öffentliche Videos sehen**: Jeder kann `ready` + `is_public` Videos sehen
- ✅ **Eigene Videos sehen**: User sieht alle eigenen Videos (auch private)
- ✅ **Videos erstellen**: Nur eingeloggte User
- ✅ **Videos bearbeiten**: Nur eigene Videos
- ✅ **Videos löschen**: Nur eigene Videos

### Webhook-Sicherheit

- ✅ Webhook-Secret prüfen (optional aber empfohlen)
- ✅ Nur bekannte Cloudflare-IPs erlauben (via Firewall)

---

## 💰 Kosten (Cloudflare Stream)

**Preismodell (Stand 2025):**

- **Storage**: $5 pro 1.000 Minuten gespeicherte Videos
- **Delivery**: $1 pro 1.000 Minuten gestreamte Videos
- **Kein Datenausgang-Preis** (CDN inklusive!)

**Beispielrechnung:**

- 1.000 Videos à 2 Stunden = 120.000 Minuten Storage = **$600/Monat**
- 1 Million Views à 1 Minute Durchschnitt = 1.000.000 Minuten Delivery = **$1.000/Monat**

**→ Sehr günstig verglichen mit S3 + CloudFront + MediaConvert!**

---

## 🚦 Status-Flow

```
┌─────────────┐
│  uploading  │  ← Video-Eintrag erstellt, Upload-URL generiert
└──────┬──────┘
       │
       │ User lädt hoch
       │
┌──────▼──────┐
│ processing  │  ← Upload fertig, Transcoding läuft
└──────┬──────┘
       │
       │ Cloudflare Webhook: ready
       │
┌──────▼──────┐
│    ready    │  ← Video online, im Feed sichtbar
└─────────────┘
```

**Error-Handling:**
- Jeder Status kann zu `error` wechseln
- `retry_count` tracken für automatische Retries
- User-Benachrichtigung bei Fehlern

---

## 🧪 Testing

### Manueller Upload-Test

1. App starten: `npm start`
2. Upload-Screen öffnen
3. Video auswählen (am besten klein, z.B. 10 MB für ersten Test)
4. Upload-Progress beobachten
5. In Cloudflare Dashboard prüfen: Stream → Videos
6. Webhook-Logs checken: Backend-Logs
7. Video im Feed prüfen

### Cloudflare Dashboard testen

- https://dash.cloudflare.com/stream
- Dort sollten hochgeladene Videos erscheinen
- Status: `ready`
- Test-Playback direkt im Dashboard möglich

---

## 🔮 Nächste Schritte / Erweiterungen

### Jetzt implementiert ✅

- ✅ Direct Upload zu Cloudflare
- ✅ HLS Streaming
- ✅ Progress-Tracking
- ✅ Webhook-Integration
- ✅ Feed mit 9:16 Videos
- ✅ RLS-Sicherheit

### Zukünftig (Nice-to-have) 🚀

- 📱 **Push-Benachrichtigungen** wenn Video fertig verarbeitet ist
- 🔍 **Content-Moderation** (automatisch via KI)
- 📊 **Analytics-Dashboard** (Views, Watch-Time, Drop-Off-Rate)
- 🎨 **Wasserzeichen** für Branding
- 🌐 **Multi-Language-Untertitel** (Auto-generiert)
- 🎬 **Live-Streaming** (Cloudflare Stream Live)
- 💾 **Offline-Download** für Premium-User
- 🔐 **DRM / Signed URLs** für geschützte Inhalte
- 🎭 **NFT-Gating** (Token-basierter Zugang)

---

## 📚 Ressourcen

- **Cloudflare Stream Docs**: https://developers.cloudflare.com/stream
- **Cloudflare Stream API**: https://developers.cloudflare.com/api/operations/stream-videos-list-videos
- **HLS Streaming**: https://en.wikipedia.org/wiki/HTTP_Live_Streaming
- **tus.io Protocol**: https://tus.io/
- **Expo AV Docs**: https://docs.expo.dev/versions/latest/sdk/av/

---

## 🆘 Troubleshooting

### Upload schlägt fehl

- ✅ Prüfe `.env` Variablen (Account ID, API Token)
- ✅ Prüfe Cloudflare Dashboard: Stream aktiviert?
- ✅ Prüfe Netzwerkverbindung
- ✅ Prüfe Dateigröße (max. 30GB bei Cloudflare Stream)
- ✅ Browser-Konsole / App-Logs prüfen

### Webhook kommt nicht an

- ✅ Webhook-URL korrekt konfiguriert? (https://, öffentlich erreichbar)
- ✅ Webhook-Secret stimmt überein?
- ✅ Cloudflare Dashboard: Webhook-Delivery-Logs prüfen
- ✅ Backend-Logs checken

### Video bleibt auf "processing"

- ✅ Cloudflare Dashboard: Video-Status prüfen
- ✅ Encoding kann bei 2h Videos 10-30 Minuten dauern (normal!)
- ✅ Webhook-Logs prüfen
- ✅ Bei >1h Wartezeit: Cloudflare Support kontaktieren

### Player zeigt nichts an

- ✅ `playback_url` in DB gesetzt?
- ✅ `EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID` in `.env`?
- ✅ CORS-Einstellungen in Cloudflare (sollte auto-konfiguriert sein)
- ✅ HLS-URL im Browser testen: `https://customer-XXX.cloudflarestream.com/VIDEO_ID/manifest/video.m3u8`

---

## 👥 Team

**CTO/Lead-Entwickler**: Du  
**Cloudflare Stream**: Managed Service  
**Anpip.com**: Auf dem Weg zur weltweiten Nr. 1 🚀

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Letzte Aktualisierung**: 23. November 2025  

---

*Gebaut für Anpip.com – Die weltweite Nr. 1 für Video-Sharing* 🎥🌍
