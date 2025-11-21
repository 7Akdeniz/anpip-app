# 🚀 AUTOPILOT INSTALLATION & SETUP

**Komplette Schritt-für-Schritt Anleitung zur Aktivierung des KI-Autopilot-Systems**

---

## ✅ Voraussetzungen

- [x] Supabase Projekt
- [x] Vercel/Expo Deployment
- [x] OpenAI API Key (optional, aber empfohlen)
- [x] PostgreSQL Zugriff
- [x] Admin-Zugang zu Supabase Dashboard

---

## 📋 Installation (15-20 Minuten)

### **SCHRITT 1: Datenbank-Migration ausführen**

#### Option A: Supabase Dashboard (empfohlen)

1. Gehe zu [Supabase Dashboard](https://supabase.com/dashboard)
2. Wähle dein Projekt
3. Klick auf **SQL Editor**
4. Öffne die Migration-Datei: `supabase/migrations/20241121_autopilot_system.sql`
5. Kopiere den kompletten SQL-Code
6. Füge ihn in den SQL Editor ein
7. Klick auf **RUN**
8. Warte auf "Success" Meldung

#### Option B: Supabase CLI

```bash
# Im Projekt-Verzeichnis
cd /Users/alanbest/Anpip.com

# Supabase CLI installieren (falls noch nicht installiert)
npm install -g supabase

# Login
supabase login

# Link zu deinem Projekt
supabase link --project-ref YOUR_PROJECT_REF

# Migration ausführen
supabase db push
```

**Erwartetes Ergebnis:**
- ✅ 10 neue Tabellen erstellt
- ✅ Indexes angelegt
- ✅ RLS Policies aktiviert
- ✅ Database Functions erstellt

---

### **SCHRITT 2: Supabase Edge Function deployen**

```bash
# 1. Supabase Access Token exportieren
export SUPABASE_ACCESS_TOKEN=sbp_0ec914b945ecc54df9cace69ee9209b8babfc8b2

# 2. Edge Function deployen
supabase functions deploy autopilot-cron --no-verify-jwt

# 3. Secrets setzen
supabase secrets set OPENAI_API_KEY=sk-YOUR_KEY_HERE
supabase secrets set CRON_SECRET=$(openssl rand -hex 32)

# 4. Secret anzeigen (für später)
echo "Dein CRON_SECRET:" $(supabase secrets list | grep CRON_SECRET)
```

**Erwartetes Ergebnis:**
```
✅ Function deployed: autopilot-cron
✅ Secrets set successfully
```

---

### **SCHRITT 3: Cron Jobs aktivieren**

1. Gehe zu **Supabase Dashboard → Database → Extensions**
2. Aktiviere **pg_cron** Extension
3. Gehe zu **SQL Editor**
4. Führe folgendes SQL aus:

```sql
-- 1. pg_cron Extension aktivieren
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. http Extension aktivieren (für Webhook-Calls)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Täglicher Autopilot Job (2:00 Uhr UTC)
SELECT cron.schedule(
  'autopilot-daily',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/autopilot-cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_CRON_SECRET',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'daily'
      )
    ) AS request_id;
  $$
);

-- 4. Stündlicher Security Scan (jede Stunde)
SELECT cron.schedule(
  'autopilot-hourly',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/autopilot-cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer YOUR_CRON_SECRET',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'hourly'
      )
    ) AS request_id;
  $$
);

-- 5. Jobs überprüfen
SELECT * FROM cron.job;
```

**WICHTIG:** Ersetze `YOUR_PROJECT_REF` und `YOUR_CRON_SECRET` mit deinen Werten!

**Erwartetes Ergebnis:**
```
✅ 2 Cron Jobs erstellt
✅ Jobs werden automatisch ausgeführt
```

---

### **SCHRITT 4: Autopilot-Konfiguration aktivieren**

```sql
-- Autopilot aktivieren
UPDATE autopilot_config SET enabled = true;

-- Alle Services aktivieren
UPDATE autopilot_config 
SET services = '{
  "seo": true,
  "geo": true,
  "performance": true,
  "security": true,
  "content": true,
  "healing": true,
  "trends": true,
  "business": true,
  "planning": true
}'::jsonb;

-- Debug Mode deaktivieren (für Production)
UPDATE autopilot_config SET debug = false;

-- Konfiguration überprüfen
SELECT * FROM autopilot_config;
```

---

### **SCHRITT 5: Manuellen Test durchführen**

```bash
# Test-Request an Edge Function senden
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/autopilot-cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"type":"manual-test"}'
```

**Erwartetes Ergebnis:**
```json
{
  "success": true,
  "duration": 2341,
  "results": [
    { "job": "seo-optimization", "success": true, "actionsCount": 12 },
    { "job": "geo-optimization", "success": true, "actionsCount": 5 },
    ...
  ],
  "timestamp": "2025-11-21T12:00:00.000Z"
}
```

---

### **SCHRITT 6: Logs überprüfen**

```sql
-- Neueste Autopilot Logs anzeigen
SELECT 
  job_name,
  success,
  duration,
  actions_count,
  timestamp
FROM autopilot_logs
ORDER BY timestamp DESC
LIMIT 10;

-- Fehler anzeigen (falls vorhanden)
SELECT 
  job_name,
  errors,
  timestamp
FROM autopilot_logs
WHERE success = false
ORDER BY timestamp DESC;
```

---

### **SCHRITT 7: Dashboard integrieren (Optional)**

Füge das Dashboard zu deiner Admin-Route hinzu:

```typescript
// app/admin/autopilot.tsx
import { AutopilotDashboard } from '@/components/AutopilotDashboard';

export default function AutopilotPage() {
  return <AutopilotDashboard />;
}
```

---

## 🔧 Konfiguration

### **Services aktivieren/deaktivieren**

```sql
-- Nur SEO & Content aktivieren
UPDATE autopilot_config 
SET services = jsonb_set(
  services,
  '{seo}',
  'true'
);

UPDATE autopilot_config 
SET services = jsonb_set(
  services,
  '{security}',
  'false'
);

-- Alle Services deaktivieren
UPDATE autopilot_config SET enabled = false;
```

### **Cron Schedule ändern**

```sql
-- Job löschen
SELECT cron.unschedule('autopilot-daily');

-- Neu erstellen mit anderem Schedule
SELECT cron.schedule(
  'autopilot-daily',
  '0 4 * * *',  -- 4:00 Uhr statt 2:00 Uhr
  $$ ... $$
);
```

---

## 📊 Monitoring

### **Supabase Dashboard**

1. Gehe zu **Database → Table Editor**
2. Öffne `autopilot_logs` Tabelle
3. Filtere nach `success = false` für Fehler

### **Logs live verfolgen**

```sql
-- Real-time Logs (refreshen für Updates)
SELECT 
  job_name,
  success,
  actions_count,
  duration || 'ms' as duration,
  to_char(timestamp, 'HH24:MI:SS') as time
FROM autopilot_logs
WHERE timestamp > NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC;
```

### **Performance Metrics**

```sql
-- Durchschnittliche Job-Dauer pro Job-Type
SELECT 
  job_name,
  COUNT(*) as runs,
  AVG(duration) as avg_duration_ms,
  SUM(actions_count) as total_actions,
  (COUNT(CASE WHEN success THEN 1 END)::float / COUNT(*) * 100) as success_rate
FROM autopilot_logs
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY job_name
ORDER BY avg_duration_ms DESC;
```

---

## 🚨 Troubleshooting

### **Problem: Edge Function wird nicht ausgeführt**

```bash
# Logs anzeigen
supabase functions logs autopilot-cron

# Manuell testen
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/autopilot-cron \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **Problem: Cron Jobs laufen nicht**

```sql
-- Cron Jobs Status überprüfen
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- Falls Jobs fehlen, neu erstellen
SELECT cron.unschedule('autopilot-daily');
-- Dann SCHRITT 3 wiederholen
```

### **Problem: Database Permissions**

```sql
-- RLS Policies überprüfen
SELECT * FROM pg_policies 
WHERE tablename = 'autopilot_logs';

-- Service Role Policy hinzufügen (falls fehlt)
CREATE POLICY "Service role full access"
  ON autopilot_logs
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role')
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
```

### **Problem: Keine Actions werden ausgeführt**

```sql
-- Dry-Run Mode überprüfen
SELECT dry_run FROM autopilot_config;

-- Deaktivieren
UPDATE autopilot_config SET dry_run = false;
```

---

## ✅ Erfolgskriterien

Nach erfolgreicher Installation solltest du sehen:

- ✅ **autopilot_logs** Tabelle füllt sich täglich mit neuen Einträgen
- ✅ **Success Rate** > 95%
- ✅ **city_pages**, **landing_pages** werden automatisch erstellt
- ✅ **Videos** bekommen automatisch `seo_title`, `seo_description`
- ✅ **Trending Videos** werden automatisch markiert
- ✅ **Security Flags** werden erstellt bei verdächtigem Verhalten

---

## 📈 Erwartete Ergebnisse

### **Woche 1:**
- 50+ Videos SEO-optimiert
- 20+ Stadt-Seiten erstellt
- 100+ Videos quality-checked
- 5+ Security-Flags gesetzt

### **Monat 1:**
- 1000+ Videos SEO-optimiert
- 100+ Stadt-Seiten
- SEO Traffic: +15%
- Security Incidents: -80%

### **Monat 3:**
- Vollständige SEO-Coverage
- Performance Score: 95+
- Null manuelle Interventionen nötig
- Platform läuft 100% autonom

---

## 🔄 Updates & Maintenance

### **Autopilot Code aktualisieren**

```bash
# Nach Code-Änderungen
supabase functions deploy autopilot-cron

# Neue Engine hinzufügen
# 1. Engine-Datei erstellen: lib/autopilot/auto-xxx-engine.ts
# 2. In autopilot-core.ts registrieren
# 3. Deployen
```

### **Neue Database Tables**

```sql
-- Neue Tabelle hinzufügen
CREATE TABLE my_new_table (...);

-- RLS aktivieren
ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;

-- Policy erstellen
CREATE POLICY "Service role access"
  ON my_new_table
  USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 🎯 Next Steps

Nach erfolgreicher Installation:

1. **Monitoring aufsetzen:**
   - Dashboard im Admin-Bereich einbinden
   - Alert-System für Fehler (z.B. via Email)
   - Performance-Tracking

2. **Fine-Tuning:**
   - Cron-Schedules optimieren
   - Spezifische Services priorisieren
   - Custom Rules hinzufügen

3. **Erweitern:**
   - Neue Auto-Engines entwickeln
   - Integration mit externen APIs (OpenAI, etc.)
   - A/B Testing Automation

---

## 📚 Weitere Dokumentation

- **Hauptdokumentation:** `AUTOPILOT_SYSTEM.md`
- **Architektur:** `WORLD_TIMELINE_ENGINE.md`, `AI_ACTORS_SYSTEM.md`
- **Code:** `lib/autopilot/*.ts`
- **Migration:** `supabase/migrations/20241121_autopilot_system.sql`

---

## ✅ Checkliste

- [ ] Migration ausgeführt
- [ ] Edge Function deployed
- [ ] Secrets gesetzt
- [ ] Cron Jobs aktiviert
- [ ] Autopilot Config enabled
- [ ] Manueller Test erfolgreich
- [ ] Logs kommen an
- [ ] Dashboard läuft
- [ ] Erste automatische Optimierungen sichtbar

---

# 🎉 AUTOPILOT IST LIVE!

**Die Plattform verbessert sich jetzt jeden Tag automatisch.** 🚀

*"Set it and forget it - The Autopilot takes care of everything."*
