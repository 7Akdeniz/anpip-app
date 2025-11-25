# 🚀 Video-Limits ändern – Quick Start Guide

**Ziel**: Video-Upload-Limit von aktuell **60 Sekunden** auf z.B. **2 Minuten** erhöhen

**Zeitaufwand**: ⏱️ 2 Minuten

---

## 📝 Schritt 1: .env Datei bearbeiten

Öffne die `.env` Datei (oder `.env.local`) im Root-Verzeichnis:

```bash
# Aktuelle Zeile finden (ca. Zeile 95):
VIDEO_MAX_DURATION_SECONDS=60

# Ändern auf gewünschten Wert (z.B. 2 Minuten = 120 Sekunden):
VIDEO_MAX_DURATION_SECONDS=120
```

### Beispiele für verschiedene Limits:

```bash
# 2 Minuten
VIDEO_MAX_DURATION_SECONDS=120

# 5 Minuten
VIDEO_MAX_DURATION_SECONDS=300

# 10 Minuten
VIDEO_MAX_DURATION_SECONDS=600

# 30 Minuten
VIDEO_MAX_DURATION_SECONDS=1800

# 1 Stunde
VIDEO_MAX_DURATION_SECONDS=3600

# 2 Stunden (Maximum)
VIDEO_MAX_DURATION_SECONDS=7200
```

**Wichtig**: Wert darf **nicht größer als 7200** sein (technisches Maximum)!

---

## 🔄 Schritt 2: App neu starten

### Development (lokal):

```bash
# Expo Dev Server stoppen (Ctrl + C im Terminal)
# Dann neu starten:
npm run start
```

### Production (Server):

```bash
# Mit PM2:
pm2 restart anpip-app

# Mit Docker:
docker-compose restart

# Mit Systemd:
sudo systemctl restart anpip
```

---

## ✅ Schritt 3: Testen

1. **App öffnen** (Web oder Mobile)
2. **Upload-Tab** öffnen
3. **Video auswählen** mit neuer Länge (z.B. 90 Sekunden)
4. **Upload starten**

### Erwartetes Ergebnis:

- ✅ Video mit 120 Sekunden → **Upload funktioniert**
- ❌ Video mit 130 Sekunden → **Fehlermeldung: "Video zu lang"**

---

## 🐛 Troubleshooting

### Problem: Limit wurde nicht übernommen

**Prüfe Console-Logs beim App-Start:**

```bash
npm run start
```

Du solltest sehen:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📹 VIDEO UPLOAD LIMITS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ACTIVE MAXIMUM (User-Limit):
   2m 0s (120s)    ← Sollte hier der neue Wert stehen!
```

**Falls alter Wert (60s) angezeigt wird:**

1. Prüfe, ob `.env` gespeichert wurde
2. Prüfe, ob richtige `.env` Datei bearbeitet (nicht `.env.example`)
3. Cache leeren:
   ```bash
   rm -rf node_modules/.cache
   npm run start --clear
   ```

---

### Problem: Upload hängt

**Cloudflare API prüfen:**

```bash
# Test ob Cloudflare erreichbar ist:
curl -H "Authorization: Bearer $CLOUDFLARE_STREAM_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/stream
```

**Erwartete Antwort**: `{"success":true,...}`

Falls **Fehler**: Prüfe `CLOUDFLARE_ACCOUNT_ID` und `CLOUDFLARE_STREAM_API_TOKEN` in `.env`

---

## 📊 Limit-Empfehlungen nach Use Case

| Use Case | Empfohlenes Limit | Begründung |
|----------|-------------------|------------|
| **TikTok-Style Short-Videos** | 60s | Kurz & knackig, hohe Engagement-Rate |
| **Instagram Reels** | 90s | Standard für Social Media |
| **YouTube Shorts** | 60s | YouTube-Limit |
| **Story-Telling** | 2-5 Min | Ausführlichere Inhalte |
| **Tutorials** | 10-15 Min | Erklärvideos mit Details |
| **Vlogs / Long-Form** | 30-60 Min | YouTube-ähnliche Inhalte |
| **Live-Events / Streams** | 1-2 Std | Maximum der Architektur |

---

## 🎯 Beispiel: Schrittweise Erhöhung

**Strategie**: Langsam steigern, User-Feedback beobachten

```bash
# Woche 1: Start
VIDEO_MAX_DURATION_SECONDS=60

# Woche 2: Test mit Power-Usern
VIDEO_MAX_DURATION_SECONDS=120

# Woche 4: Breiter Rollout
VIDEO_MAX_DURATION_SECONDS=300

# Woche 8: Premium-Feature
VIDEO_MAX_DURATION_SECONDS=600  # Nur für Premium-User
```

**Code für Premium-Check**:

```typescript
// In VideoUpload.tsx
const maxDuration = user.isPremium 
  ? 600  // 10 Minuten für Premium
  : VIDEO_LIMITS.ACTIVE_MAX_DURATION_SECONDS; // 60s für Free
```

---

## 🔐 Sicherheit: Rate Limiting

**Wichtig**: Bei höheren Limits auch Rate-Limiting anpassen!

**Aktuell**: 10 Uploads / Stunde / User

**Für längere Videos empfohlen**: 5 Uploads / Stunde

```typescript
// In Supabase Edge Function oder Backend-API:
const rateLimit = {
  maxUploads: 5,
  windowHours: 1
};

const recentUploads = await supabase
  .from('videos')
  .select('id')
  .eq('user_id', userId)
  .gte('created_at', new Date(Date.now() - rateLimit.windowHours * 60 * 60 * 1000));

if (recentUploads.data.length >= rateLimit.maxUploads) {
  throw new Error('Upload-Limit erreicht. Bitte später versuchen.');
}
```

---

## 💰 Kosten-Kalkulation

**Cloudflare Stream Preise**:
- Encoding: $0.005 / Minute
- Delivery: $1 / 1000 Minuten

**Beispiel-Rechnung** (bei 2-Minuten-Limit):

```
100 User × 1 Upload/Tag × 2 Min = 200 Min/Tag
200 Min × 30 Tage = 6.000 Min/Monat

Kosten:
- Encoding: 6.000 × $0.005 = $30
- Delivery (10x Views): 60.000 × $0.001 = $60
---------------------------------------------
Total: ~$90/Monat für 100 aktive User
```

**Bei 60-Sekunden-Limit** (aktuell):
- Kosten: ~$45/Monat (halb so viel!)

---

## ✅ Fertig!

Nach diesen 3 einfachen Schritten:
1. ✅ `.env` bearbeitet
2. ✅ App neu gestartet
3. ✅ Getestet

...läuft deine App mit dem neuen Video-Limit! 🎉

---

**Für technische Details**: Siehe [VIDEO_UPLOAD_ARCHITECTURE.md](./VIDEO_UPLOAD_ARCHITECTURE.md)

**Bei Problemen**: Erstelle ein GitHub Issue oder kontaktiere tech@anpip.com
