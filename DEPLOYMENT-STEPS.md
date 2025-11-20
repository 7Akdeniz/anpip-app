# 🚀 Edge Function Deployment - Manuelle Schritte

## Schritt 3: Supabase CLI Login

### Option A: Browser Login (Empfohlen)
```bash
supabase login
# Drücke Enter → Browser öffnet sich → Login → Fertig
```

### Option B: Token Login
```bash
# 1. Öffne: https://supabase.com/dashboard/account/tokens
# 2. Klicke "Generate New Token"
# 3. Name: Anpip CLI
# 4. Kopiere Token und führe aus:

export SUPABASE_ACCESS_TOKEN=sbp_...DEIN_TOKEN...
```

### Login testen:
```bash
supabase projects list
# Sollte deine Projekte zeigen
```

---

## Schritt 4: Automatisches Deployment

Nach erfolgreichem Login:

```bash
cd /Users/alanbest/Anpip.com
./deploy-edge-function.sh
```

Das Script macht automatisch:
✅ Projekt verbinden (vlibyocpdguxpretjvnz)
✅ Edge Function deployen
✅ Secrets setzen (fragt nach Service Role Key)

---

## ODER: Manuelle Schritte

Falls das Script nicht funktioniert:

### 1. Projekt verbinden
```bash
supabase link --project-ref vlibyocpdguxpretjvnz
```

### 2. Edge Function deployen
```bash
supabase functions deploy compress-video --no-verify-jwt
```

### 3. Service Role Key finden
Öffne: https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/settings/api

Kopiere den **service_role** Key (nicht anon!)

### 4. Secrets setzen
```bash
# Ersetze YOUR_SERVICE_ROLE_KEY mit deinem Key:
supabase secrets set SUPABASE_URL=https://vlibyocpdguxpretjvnz.supabase.co

supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Schritt 5: Testing

### Logs Live anschauen:
```bash
supabase functions logs compress-video --tail
```

### Test-Upload in App:
1. Öffne Expo App
2. Gehe zu Upload Tab
3. Wähle ein Video (kann jetzt >50MB sein!)
4. Upload starten
5. Warte auf "Server komprimiert Video..."

### Database Check:
```sql
-- Im Supabase Dashboard SQL Editor:
SELECT 
  id,
  description,
  compression_status,
  original_size_mb,
  compressed_size_mb,
  created_at
FROM videos
WHERE compression_status IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;
```

---

## Troubleshooting

### ❌ "Login failed"
```bash
# Token Login nutzen stattdessen:
export SUPABASE_ACCESS_TOKEN=sbp_...
```

### ❌ "Project not found"
```bash
# Projekt-Ref prüfen:
supabase projects list
```

### ❌ "Function deployment failed"
```bash
# Logs checken:
supabase functions deploy compress-video --debug
```

### ❌ "Secrets not working"
```bash
# Secrets auflisten:
supabase secrets list

# Neu setzen:
supabase secrets unset SUPABASE_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=NEW_KEY
```

---

## Quick Commands Übersicht

```bash
# Login
supabase login

# Projekt verbinden
supabase link --project-ref vlibyocpdguxpretjvnz

# Deployen
supabase functions deploy compress-video --no-verify-jwt

# Secrets
supabase secrets set SUPABASE_URL=https://vlibyocpdguxpretjvnz.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_KEY

# Logs
supabase functions logs compress-video --tail

# Status
supabase status
```

---

## ✅ Success Checklist

- [ ] `supabase login` erfolgreich
- [ ] `supabase projects list` zeigt dein Projekt
- [ ] `supabase link` hat vlibyocpdguxpretjvnz verbunden
- [ ] `supabase functions deploy` war erfolgreich
- [ ] Secrets gesetzt (SUPABASE_URL + SERVICE_ROLE_KEY)
- [ ] Test-Upload in App funktioniert
- [ ] Video wird komprimiert (Status: pending → completed)
- [ ] Logs zeigen keine Fehler

---

## 🎉 Nach erfolgreichem Deployment

Deine App kann jetzt:
✅ Videos bis 500MB hochladen
✅ Automatische Server-seitige Komprimierung
✅ Hohe Qualität (CRF 23 = quasi verlustfrei)
✅ Original-Videos werden automatisch gelöscht
✅ Speicherplatz-optimiert

**Viel Erfolg!** 🚀
