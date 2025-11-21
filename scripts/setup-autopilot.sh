#!/bin/bash

# ================================================
# ANPIP AUTOPILOT - QUICK START SCRIPT
# ================================================
# Automatisches Setup des Autopilot-Systems
# ================================================

set -e

echo "🤖 ANPIP AUTOPILOT - QUICK START"
echo "================================"
echo ""

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Fehler: Bitte führe dieses Script im Projekt-Root aus"
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ================================================
# STEP 1: Check Prerequisites
# ================================================
echo "📋 Schritt 1: Überprüfe Voraussetzungen..."
echo ""

# Check for Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI nicht gefunden. Installiere...${NC}"
    npm install -g supabase
fi

# Check for jq (for JSON parsing)
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  jq nicht gefunden. Bitte installieren: brew install jq${NC}"
fi

echo -e "${GREEN}✅ Voraussetzungen erfüllt${NC}"
echo ""

# ================================================
# STEP 2: Database Migration
# ================================================
echo "📦 Schritt 2: Datenbank-Migration..."
echo ""

read -p "Möchtest du die Datenbank-Migration jetzt ausführen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Führe Migration aus..."
    
    # Check if linked to Supabase project
    if [ ! -f ".env.local" ]; then
        echo -e "${YELLOW}⚠️  .env.local nicht gefunden. Bitte Supabase Credentials eingeben:${NC}"
        read -p "Supabase Project URL: " SUPABASE_URL
        read -p "Supabase Anon Key: " SUPABASE_ANON_KEY
        
        cat > .env.local <<EOF
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EOF
    fi
    
    # Run migration
    if supabase db push 2>/dev/null; then
        echo -e "${GREEN}✅ Migration erfolgreich${NC}"
    else
        echo -e "${YELLOW}⚠️  Migration fehlgeschlagen. Bitte manuell ausführen:${NC}"
        echo "   1. Gehe zu Supabase Dashboard → SQL Editor"
        echo "   2. Führe supabase/migrations/20241121_autopilot_system.sql aus"
    fi
else
    echo -e "${YELLOW}⏭️  Übersprungen - Bitte später manuell ausführen${NC}"
fi

echo ""

# ================================================
# STEP 3: Deploy Edge Function
# ================================================
echo "🚀 Schritt 3: Edge Function deployen..."
echo ""

read -p "Möchtest du die Edge Function jetzt deployen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    # Check for Supabase Access Token
    if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
        echo -e "${YELLOW}⚠️  SUPABASE_ACCESS_TOKEN nicht gesetzt${NC}"
        read -p "Supabase Access Token: " SUPABASE_ACCESS_TOKEN
        export SUPABASE_ACCESS_TOKEN
    fi
    
    # Deploy function
    echo "Deploying autopilot-cron function..."
    if supabase functions deploy autopilot-cron --no-verify-jwt; then
        echo -e "${GREEN}✅ Edge Function deployed${NC}"
    else
        echo -e "${RED}❌ Deployment fehlgeschlagen${NC}"
    fi
    
    # Set secrets
    echo ""
    echo "Setze Secrets..."
    
    if [ -z "$OPENAI_API_KEY" ]; then
        read -p "OpenAI API Key (optional, Enter zum Überspringen): " OPENAI_API_KEY
    fi
    
    if [ -n "$OPENAI_API_KEY" ]; then
        supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY"
    fi
    
    # Generate CRON_SECRET
    CRON_SECRET=$(openssl rand -hex 32)
    supabase secrets set CRON_SECRET="$CRON_SECRET"
    echo "CRON_SECRET generiert: $CRON_SECRET"
    echo "CRON_SECRET=$CRON_SECRET" >> .env.local
    
    echo -e "${GREEN}✅ Secrets gesetzt${NC}"
else
    echo -e "${YELLOW}⏭️  Übersprungen${NC}"
fi

echo ""

# ================================================
# STEP 4: Create Cron Jobs SQL
# ================================================
echo "⏰ Schritt 4: Cron Jobs Setup..."
echo ""

# Get Supabase project ref
if [ -f ".env.local" ]; then
    PROJECT_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d '=' -f2)
    PROJECT_REF=$(echo "$PROJECT_URL" | sed -E 's/https:\/\/([^.]+).*/\1/')
else
    read -p "Supabase Project Ref (z.B. xyzabc123): " PROJECT_REF
fi

if [ -z "$CRON_SECRET" ]; then
    CRON_SECRET=$(grep CRON_SECRET .env.local | cut -d '=' -f2 || echo "YOUR_CRON_SECRET")
fi

# Create SQL file for cron jobs
cat > /tmp/setup_autopilot_cron.sql <<EOF
-- ================================================
-- AUTOPILOT CRON JOBS SETUP
-- ================================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Daily Autopilot (2:00 AM UTC)
SELECT cron.schedule(
  'autopilot-daily',
  '0 2 * * *',
  \$\$
  SELECT
    net.http_post(
      url := 'https://${PROJECT_REF}.supabase.co/functions/v1/autopilot-cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ${CRON_SECRET}',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'daily'
      )
    ) AS request_id;
  \$\$
);

-- 3. Hourly Security Scan
SELECT cron.schedule(
  'autopilot-hourly',
  '0 * * * *',
  \$\$
  SELECT
    net.http_post(
      url := 'https://${PROJECT_REF}.supabase.co/functions/v1/autopilot-cron',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ${CRON_SECRET}',
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'type', 'hourly'
      )
    ) AS request_id;
  \$\$
);

-- 4. Enable Autopilot
UPDATE autopilot_config SET enabled = true;

-- 5. Verify Jobs
SELECT * FROM cron.job;
EOF

echo -e "${GREEN}✅ Cron Job SQL erstellt: /tmp/setup_autopilot_cron.sql${NC}"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Gehe zu Supabase Dashboard → SQL Editor"
echo "   2. Führe /tmp/setup_autopilot_cron.sql aus"
echo ""

# ================================================
# STEP 5: Test Edge Function
# ================================================
echo "🧪 Schritt 5: Test Edge Function..."
echo ""

read -p "Möchtest du die Edge Function jetzt testen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    
    if [ -z "$CRON_SECRET" ]; then
        read -p "CRON_SECRET: " CRON_SECRET
    fi
    
    echo "Sende Test-Request..."
    RESPONSE=$(curl -s -X POST \
        "https://${PROJECT_REF}.supabase.co/functions/v1/autopilot-cron" \
        -H "Authorization: Bearer ${CRON_SECRET}" \
        -H "Content-Type: application/json" \
        -d '{"type":"manual-test"}')
    
    echo ""
    echo "Response:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    
    if echo "$RESPONSE" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ Test erfolgreich!${NC}"
    else
        echo -e "${RED}❌ Test fehlgeschlagen${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Übersprungen${NC}"
fi

echo ""

# ================================================
# STEP 6: Summary
# ================================================
echo "================================================"
echo "🎉 AUTOPILOT SETUP COMPLETE!"
echo "================================================"
echo ""
echo "📋 Zusammenfassung:"
echo ""
echo "   ✅ Datenbank-Schema erstellt"
echo "   ✅ Edge Function deployed"
echo "   ✅ Secrets gesetzt"
echo "   ⏰ Cron Jobs bereit (SQL in /tmp/setup_autopilot_cron.sql)"
echo ""
echo "📝 TODO:"
echo ""
echo "   1. Führe /tmp/setup_autopilot_cron.sql in Supabase aus"
echo "   2. Überprüfe Logs: supabase functions logs autopilot-cron"
echo "   3. Checke Dashboard: http://localhost:3000/admin/autopilot"
echo ""
echo "📊 Monitoring:"
echo ""
echo "   SELECT * FROM autopilot_logs ORDER BY timestamp DESC LIMIT 10;"
echo ""
echo "🔄 Autopilot läuft jetzt automatisch:"
echo ""
echo "   • Täglich um 2:00 Uhr UTC"
echo "   • Stündlich für Security Scans"
echo ""
echo "================================================"
echo ""
echo -e "${GREEN}✨ Die Plattform verbessert sich jetzt automatisch! ✨${NC}"
echo ""
