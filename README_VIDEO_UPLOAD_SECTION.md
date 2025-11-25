# 📹 Video Upload System – README Sektion

Füge diese Sektion in deine `README.md` ein:

---

## 🎬 Video Upload

Anpip nutzt ein **weltklasse Video-Upload & Streaming-System** mit Cloudflare Stream.

### ✨ Features

- ✅ **Bis zu 2 Stunden** Videos technisch unterstützt (konfigurierbar auf 60s)
- ✅ **Direct Upload** vom Client zu Cloudflare (kein Server-Proxy = schneller)
- ✅ **Globales CDN** (300+ Edge-Locations weltweit)
- ✅ **Auto-Transcoding** in mehrere Qualitäten (HLS/DASH)
- ✅ **Adaptive Bitrate Streaming** (optimale Qualität für jede Verbindung)
- ✅ **Chunk-basierter Upload** für zuverlässige große Dateien
- ✅ **Progress-Tracking** (Prozent, Restzeit, Geschwindigkeit)
- ✅ **ENV-konfigurierbar** – Limits ohne Code-Änderung anpassbar

### 🚀 Quick Start: Limits ändern

**Aktuelles Limit**: 60 Sekunden (1 Minute)

**Auf 2 Minuten erhöhen**:

```bash
# 1. .env bearbeiten
VIDEO_MAX_DURATION_SECONDS=120

# 2. App neu starten
npm run start

# 3. Fertig! ✅
```

Siehe [Video Limits Quick Start Guide](./docs/VIDEO_LIMITS_QUICK_START.md) für Details.

### 📚 Dokumentation

- **[Video Upload Architecture](./docs/VIDEO_UPLOAD_ARCHITECTURE.md)** – Vollständige Architektur-Dokumentation
- **[Video Limits Quick Start](./docs/VIDEO_LIMITS_QUICK_START.md)** – 2-Minuten-Guide für Limit-Änderungen
- **[Implementation Summary](./IMPLEMENTATION_SUMMARY.md)** – Zusammenfassung der Implementierung

### 🏗️ Architektur

```
Client → Validierung → Upload-URL Request → Direct Upload zu Cloudflare
    ↓                      ↓                         ↓
Größe & Dauer      Backend-API             Chunk-basiert + Progress
    ↓                      ↓                         ↓
VIDEO_LIMITS       DB-Eintrag erstellt      Auto-Transcoding (HLS/DASH)
    ↓                      ↓                         ↓
config/video-limits.ts   status: uploading    Globales CDN (300+ POPs)
                           ↓                         ↓
                    Webhook/Polling          status: ready → Video online!
```

### 🔧 Konfiguration

Alle Limits werden zentral in `config/video-limits.ts` gesteuert und per ENV-Variablen konfiguriert:

```typescript
VIDEO_LIMITS.TECHNICAL_MAX_DURATION_SECONDS  // 7200 (2 Stunden)
VIDEO_LIMITS.ACTIVE_MAX_DURATION_SECONDS     // 60 (1 Minute)
VIDEO_LIMITS.MAX_SIZE_BYTES                  // 10 GB
```

ENV-Variablen (`.env`):
```bash
VIDEO_MAX_DURATION_SECONDS=60        # Aktives User-Limit
VIDEO_MAX_SIZE_BYTES=10737418240     # 10 GB
CLOUDFLARE_ACCOUNT_ID=...            # Cloudflare Setup
CLOUDFLARE_STREAM_API_TOKEN=...
```

Siehe [.env.example](./.env.example) für alle Optionen.

### 💰 Kosten

**Cloudflare Stream** (sehr günstig):
- Encoding: $0.005 / Minute
- Delivery: $1 / 1000 Minuten

**Beispiel** (1000 User, 1 Min/Tag):
- Encoding: $150/Monat
- Delivery: $300/Monat (bei 10x Views)
- **Total**: ~$450/Monat

### 🔐 Sicherheit

- ✅ JWT-Authentifizierung (nur eingeloggte User)
- ✅ Client & Server Validierung (Größe, Dauer)
- ✅ Rate-Limiting (10 Uploads/Stunde/User)
- ✅ Auto-Moderation (AI-gestützt)

---

**Für technische Details**: Siehe [VIDEO_UPLOAD_ARCHITECTURE.md](./docs/VIDEO_UPLOAD_ARCHITECTURE.md)
