# 🔧 VIDEO UPLOAD FIX - Vollständige Dokumentation

## 🎯 Problem

Das Video-Upload-System konnte keine Videos hochladen. Der Upload blieb beim Laden hängen ohne Fehlermeldung.

## 🔍 Root Cause Analysis

### Identifizierte Probleme:

1. **Schema Mismatch** (KRITISCH ⚠️)
   - Der Upload-Code in `app/(tabs)/upload.tsx` versuchte, Felder zu setzen, die in der `videos` Tabelle nicht existierten
   - Beispiele: `video_url`, `visibility`, `is_market_item`, `market_category`, etc.
   - Die Tabelle hatte stattdessen: `playback_url`, `is_public`, keine Market-Felder

2. **Fehlende Error-Handling**
   - Datenbank-Fehler wurden nicht detailliert geloggt
   - User bekam keine aussagekräftigen Fehlermeldungen

3. **Unvollständige Validierung**
   - Keine Größenprüfung vor Upload
   - Keine Bucket-Existenz-Prüfung

## ✅ Implementierte Lösungen

### 1. Datenbank-Schema Fix

**Datei:** `supabase/migrations/20251124_fix_video_upload_schema.sql`

Hinzugefügte Felder:
```sql
-- Legacy Support
video_url TEXT                    -- Supabase Storage URL

-- Visibility Management  
visibility TEXT                   -- 'public', 'friends', 'private', 'blocked'

-- Market Listings
is_market_item BOOLEAN           -- Ist dies ein Market-Listing?
market_category TEXT             -- Hauptkategorie (z.B. 'vehicles')
market_subcategory TEXT          -- Unterkategorie (z.B. 'Autos')

-- Location für Market
location_city TEXT
location_country TEXT
location_lon NUMERIC
location_display_name TEXT
location_postcode TEXT

-- Moderation
block_reason TEXT                -- Grund für Blockierung
```

**Installation:**
1. Öffne Supabase Dashboard: https://supabase.com/dashboard
2. Wähle dein Projekt
3. Navigiere zu: SQL Editor
4. Kopiere den Inhalt von `supabase/migrations/20251124_fix_video_upload_schema.sql`
5. Führe das SQL aus
6. ✅ Prüfe, ob "Query successful" angezeigt wird

### 2. Upload-Code Optimierung

**Datei:** `app/(tabs)/upload.tsx`

**Verbesserungen:**

#### a) Detailliertes Logging
```typescript
console.log('🎬 Starte Upload...', videoUri);
console.log('📋 Upload-Details:', {
  isForMarket,
  hasLocation: !!selectedLocation,
  hasCategory: !!selectedCategory,
  visibility
});
console.log('📦 Video Größe:', sizeMB, 'MB');
console.log('⏱️ Upload-Dauer:', uploadDuration, 's');
```

#### b) Größenvalidierung VOR Upload
```typescript
if (originalSize > 50 * 1024 * 1024) {
  Alert.alert('Video zu groß', `Max: 50 MB\nDein Video: ${sizeMB} MB`);
  return;
}
```

#### c) Verbesserte Fehlerbehandlung
```typescript
if (dbError) {
  console.error('❌ DB Error Code:', dbError.code);
  console.error('❌ DB Error Details:', dbError.details);
  console.error('❌ DB Error Hint:', dbError.hint);
  
  // Spezifische Fehlermeldungen
  if (dbError.message?.includes('column') && dbError.message?.includes('does not exist')) {
    Alert.alert('Schema-Fehler', 'Bitte Migration ausführen: 20251124_fix_video_upload_schema.sql');
  }
}
```

#### d) Bessere Insert-Daten
```typescript
const insertData = {
  video_url: publicUrl,
  status: 'ready',              // Wichtig für RLS
  is_public: visibility === 'public',  // Für RLS-Policy
  // ... alle Market & Location Felder
};
```

### 3. Installations-Script

**Datei:** `scripts/fix-video-upload.sh`

**Features:**
- ✅ Interaktive Checkliste
- ✅ Überprüft Migration-Status
- ✅ Überprüft Storage Bucket
- ✅ Startet Dev-Server neu

**Verwendung:**
```bash
./scripts/fix-video-upload.sh
```

## 🚀 Installation & Testing

### Schritt 1: Datenbank Migration ausführen

```bash
# 1. Öffne Supabase Dashboard
open https://supabase.com/dashboard

# 2. Gehe zu SQL Editor
# 3. Kopiere Migration in Zwischenablage
cat supabase/migrations/20251124_fix_video_upload_schema.sql | pbcopy

# 4. Füge in SQL Editor ein und führe aus
```

### Schritt 2: Storage Bucket prüfen

1. Öffne Supabase Dashboard → Storage
2. Prüfe ob Bucket `videos` existiert
3. Falls nicht:
   - Klicke "New Bucket"
   - Name: `videos`
   - Public: ✅ JA (wichtig!)
   - Erstellen

### Schritt 3: Dev Server neu starten

```bash
# Option A: Automatisches Script
./scripts/fix-video-upload.sh

# Option B: Manuell
pkill -9 -f "expo"
npx expo start --clear
```

### Schritt 4: Test durchführen

1. Öffne App im Simulator/Device
2. Gehe zum Upload-Tab
3. Wähle ein **kleines Test-Video** (< 10 MB)
4. Beobachte die Console-Logs

**Erwartete Logs:**
```
🎬 Starte Upload... file:///...
📋 Upload-Details: { isForMarket: false, ... }
📖 Lese Video-Datei...
📦 Video Größe: 8.42 MB
⬆️ Starte Supabase Storage Upload...
🪣 Bucket: videos
📝 Dateiname: video_1732456789123.mp4
⏱️ Upload-Dauer: 3.45s
✅ Upload erfolgreich: { path: 'video_1732456789123.mp4' }
🔗 Public URL: https://...
💾 Erstelle Datenbank-Eintrag...
✅ Video in Datenbank gespeichert
🆔 Video ID: 123e4567-e89b-12d3-a456-426614174000
```

## 🐛 Debugging

### Problem: "Column does not exist"

**Symptom:**
```
❌ DB Error: column "video_url" does not exist
```

**Lösung:**
Migration wurde nicht ausgeführt oder fehlgeschlagen.

```bash
# 1. Prüfe ob Migration in Supabase angewendet wurde
# Dashboard → Database → Migrations

# 2. Führe Migration manuell aus
# SQL Editor → Paste Migration → Run
```

### Problem: "Bucket not found"

**Symptom:**
```
❌ Storage Upload Fehler: Bucket 'videos' not found
```

**Lösung:**
```bash
# Erstelle Bucket in Supabase:
# 1. Dashboard → Storage
# 2. New Bucket
# 3. Name: videos
# 4. Public: JA ✅
```

### Problem: "No permission"

**Symptom:**
```
❌ PGRST116: No permission
```

**Lösung:**
RLS-Policy fehlt oder ist falsch konfiguriert.

```sql
-- Prüfe ob Policy existiert:
SELECT * FROM pg_policies WHERE tablename = 'videos';

-- Falls "Videos erstellen" Policy fehlt → Migration nochmal ausführen
```

### Problem: Upload hängt

**Symptom:**
Upload-Progress bleibt bei "Video wird hochgeladen..." stehen

**Debug-Schritte:**

1. **Prüfe Netzwerk:**
   ```bash
   # Test Supabase Verbindung
   curl https://vlibyocpdguxpretjvnz.supabase.co/rest/v1/
   ```

2. **Prüfe Console für Fehler:**
   - Öffne Chrome DevTools
   - Suche nach roten Fehlern
   - Prüfe Network-Tab für failed requests

3. **Teste mit kleinerem Video:**
   - Wähle Video < 5 MB
   - Wenn das funktioniert → Größenproblem

4. **Prüfe Supabase Quota:**
   ```
   Dashboard → Settings → Usage
   → Storage: ?/1GB verwendet
   ```

## 📊 Monitoring & Analytics

### Upload-Metriken überwachen

```sql
-- Erfolgreiche Uploads heute
SELECT COUNT(*) 
FROM videos 
WHERE created_at > NOW() - INTERVAL '1 day'
AND status = 'ready';

-- Fehlgeschlagene Uploads
SELECT COUNT(*) 
FROM videos 
WHERE created_at > NOW() - INTERVAL '1 day'
AND status = 'error';

-- Durchschnittliche Video-Größe
SELECT AVG(size_bytes) / 1024 / 1024 as avg_mb
FROM videos
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Storage Verwendung

```sql
-- Storage pro User
SELECT 
  user_id,
  COUNT(*) as video_count,
  SUM(size_bytes) / 1024 / 1024 as total_mb
FROM videos
GROUP BY user_id
ORDER BY total_mb DESC
LIMIT 10;
```

## 🔄 Rollback (falls nötig)

Wenn du die Änderungen rückgängig machen musst:

```sql
-- Entferne neue Felder
ALTER TABLE videos DROP COLUMN IF EXISTS video_url;
ALTER TABLE videos DROP COLUMN IF EXISTS visibility;
ALTER TABLE videos DROP COLUMN IF EXISTS is_market_item;
-- ... etc

-- Lösche Policies
DROP POLICY IF EXISTS "Öffentliche Videos sehen" ON videos;
```

## 📚 Weitere Resourcen

- **Supabase Storage Docs:** https://supabase.com/docs/guides/storage
- **Supabase RLS:** https://supabase.com/docs/guides/auth/row-level-security
- **Expo ImagePicker:** https://docs.expo.dev/versions/latest/sdk/imagepicker/

## 🎯 Next Steps (Optional)

### 1. Cloudflare Stream Integration

Für bessere Performance bei größeren Videos:

```typescript
// Verwende Cloudflare Stream statt Supabase Storage
const { uploadUrl } = await getCloudflareUploadUrl();
await uploadToCloudflare(videoFile, uploadUrl);
```

### 2. Thumbnail Generation

Automatische Thumbnail-Erstellung:

```typescript
// In Supabase Edge Function
import { createThumbnail } from '@supabase/storage-api';

const thumbnail = await createThumbnail(videoUrl, {
  width: 640,
  height: 360,
  quality: 80
});
```

### 3. Progress Tracking

Echtzeit Upload-Progress:

```typescript
const { data, error } = await supabase.storage
  .from('videos')
  .upload(videoName, file, {
    onUploadProgress: (progress) => {
      const percent = (progress.loaded / progress.total) * 100;
      setUploadProgress(percent);
    }
  });
```

## ✅ Checkliste

- [ ] Migration in Supabase ausgeführt
- [ ] Storage Bucket `videos` existiert und ist public
- [ ] Dev Server neu gestartet
- [ ] Test-Upload mit kleinem Video erfolgreich
- [ ] Logs zeigen alle Debug-Infos
- [ ] Video erscheint im Feed
- [ ] Thumbnail wird angezeigt

---

**Stand:** 24. November 2024
**Version:** 1.0
**Autor:** Senior Full-Stack Engineer
