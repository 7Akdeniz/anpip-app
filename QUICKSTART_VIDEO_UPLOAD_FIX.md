# 🚀 VIDEO UPLOAD FIX - SOFORT STARTEN

## ⚡ SCHNELLSTART (3 Schritte)

### Schritt 1: Datenbank Migration ausführen

1. **Öffne Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz
   ```

2. **Gehe zu SQL Editor:**
   - Links in Sidebar: "SQL Editor" klicken
   - "New Query" klicken

3. **Führe Migration aus:**
   ```bash
   # Kopiere die Migration in Zwischenablage:
   cat supabase/migrations/20251124_fix_video_upload_schema.sql | pbcopy
   
   # Dann:
   # - In Supabase SQL Editor einfügen (CMD+V)
   # - "Run" klicken
   # - Warte auf "Success" ✅
   ```

### Schritt 2: Storage Bucket prüfen

1. **Öffne Storage:**
   ```
   https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/storage/buckets
   ```

2. **Prüfe ob `videos` Bucket existiert:**
   - ✅ Existiert? → Weiter zu Schritt 3
   - ❌ Nicht vorhanden?
     - Klicke "New Bucket"
     - Name: `videos`
     - **Public**: ✅ JA (wichtig!)
     - "Create Bucket"

### Schritt 3: App neu starten

```bash
# Automatisches Fix-Script (empfohlen):
./scripts/fix-video-upload.sh

# ODER manuell:
pkill -9 -f "expo"
npx expo start --clear
```

---

## 🧪 TESTEN

### Test-Upload durchführen:

1. Öffne die App im Simulator/Device
2. Gehe zum **Upload-Tab** (unten)
3. Wähle ein **kleines Test-Video** (< 10 MB)
4. Klicke "Upload"
5. Beobachte die **Console-Logs**

### Erwartete Logs (SUCCESS):

```
🎬 Starte Upload... file:///...
📋 Upload-Details: { isForMarket: false, visibility: 'public' }
📖 Lese Video-Datei...
📦 Video Größe: 8.42 MB
⬆️ Starte Supabase Storage Upload...
🪣 Bucket: videos
📝 Dateiname: video_1732456789123.mp4
⏱️ Upload-Dauer: 3.45s
✅ Upload erfolgreich: { path: '...' }
🔗 Public URL: https://vlibyocpdguxpretjvnz.supabase.co/...
💾 Erstelle Datenbank-Eintrag...
📝 Insert-Daten: { video_url: ..., status: 'ready', ... }
✅ Video in Datenbank gespeichert
🆔 Video ID: 123e4567-...
✅ Video hochgeladen!
```

---

## 🔥 HÄUFIGE FEHLER & FIXES

### ❌ "column does not exist"

**Problem:**
```
❌ DB Error: column "video_url" does not exist
```

**Lösung:**
Migration wurde nicht ausgeführt!

→ Gehe zurück zu **Schritt 1** und führe die Migration aus

---

### ❌ "Bucket not found"

**Problem:**
```
❌ Storage Upload Fehler: Bucket 'videos' not found
```

**Lösung:**
Storage Bucket fehlt!

→ Gehe zurück zu **Schritt 2** und erstelle den Bucket

---

### ❌ "No permission"

**Problem:**
```
❌ PGRST116: No permission to insert
```

**Lösung:**
RLS-Policy fehlt!

1. Supabase Dashboard → Database → Policies
2. Tabelle: `videos`
3. Prüfe ob Policy "Videos erstellen" existiert
4. Falls nicht → Migration nochmal ausführen (Schritt 1)

---

### ❌ Upload bleibt hängen

**Problem:**
Upload-Progress bleibt bei "Video wird hochgeladen..." stehen

**Lösungen:**

1. **Netzwerk prüfen:**
   ```bash
   # Test Supabase Verbindung:
   curl https://vlibyocpdguxpretjvnz.supabase.co/rest/v1/
   ```

2. **Kleineres Video testen:**
   - Wähle Video < 5 MB
   - Wenn das funktioniert → Größenproblem

3. **Console Logs prüfen:**
   - Öffne Chrome DevTools (CMD+Option+I)
   - Suche nach roten Fehlern
   - Network-Tab: Failed Requests?

4. **Dev Server neu starten:**
   ```bash
   pkill -9 -f "expo"
   npx expo start --clear
   ```

---

## 📊 ERFOLG VERIFIZIEREN

Nach erfolgreichem Upload:

### 1. Video in Datenbank prüfen:

```sql
-- In Supabase SQL Editor:
SELECT 
  id,
  video_url,
  status,
  visibility,
  created_at
FROM videos
ORDER BY created_at DESC
LIMIT 5;
```

Erwartetes Resultat:
- ✅ Neue Zeile erscheint
- ✅ `video_url` ist gesetzt
- ✅ `status` = 'ready'
- ✅ `created_at` ist aktuell

### 2. Video im Storage prüfen:

1. Supabase Dashboard → Storage → videos
2. Neue Datei erscheint: `video_1732456789123.mp4`
3. ✅ Datei ist sichtbar

### 3. Video im App-Feed prüfen:

1. Öffne App
2. Gehe zum Home-Feed
3. ✅ Dein Video erscheint oben

---

## 🎯 NÄCHSTE SCHRITTE

Nach erfolgreichem Test:

### Optional: Größere Videos testen

```bash
# Test mit größerem Video (< 50 MB):
# 1. Wähle Video ~20-30 MB
# 2. Upload-Dauer sollte in Logs erscheinen
# 3. Video sollte trotzdem hochladen
```

### Optional: Market-Upload testen

```bash
# Test Market-Listing:
# 1. Aktiviere "Market" Toggle im Upload-Screen
# 2. Wähle Stadt (z.B. "Berlin")
# 3. Wähle Kategorie (z.B. "Elektronik")
# 4. Wähle Unterkategorie (z.B. "Smartphones")
# 5. Upload → Video sollte mit Market-Daten gespeichert werden
```

---

## 🆘 SUPPORT

Falls Probleme bestehen:

1. **Prüfe Console-Logs** für detaillierte Fehlermeldungen
2. **Siehe Vollständige Doku:** `docs/VIDEO_UPLOAD_FIX.md`
3. **Prüfe alle 3 Schritte** nochmal durch

### Debug-Checklist:

- [ ] Migration in Supabase ausgeführt? (Schritt 1)
- [ ] Bucket `videos` existiert und ist public? (Schritt 2)
- [ ] Dev Server neu gestartet? (Schritt 3)
- [ ] Test mit kleinem Video (< 10 MB)?
- [ ] Console-Logs zeigen detaillierte Infos?

---

## ✅ FERTIG!

Wenn alles funktioniert:

```
✅ Migration ausgeführt
✅ Storage Bucket erstellt
✅ Dev Server gestartet
✅ Test-Upload erfolgreich
✅ Video im Feed sichtbar
```

**→ Video-Upload-System ist jetzt voll funktionsfähig! 🎉**

---

**Letzte Aktualisierung:** 24. November 2024
**Version:** 1.0
