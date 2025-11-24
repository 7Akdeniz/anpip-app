#!/bin/bash

echo "🎬 Demo-Videos in Supabase einfügen..."

# Supabase URL und Key aus .env laden
source .env

# SQL-Datei ausführen
if command -v psql &> /dev/null; then
  # Wenn PostgreSQL installiert ist
  PGPASSWORD="${SUPABASE_DB_PASSWORD}" psql \
    -h "${SUPABASE_DB_HOST}" \
    -U "${SUPABASE_DB_USER}" \
    -d "${SUPABASE_DB_NAME}" \
    -f scripts/seed-demo-videos.sql
else
  echo "⚠️ psql nicht installiert"
  echo "�� Bitte führe die SQL-Datei manuell aus:"
  echo "   1. Gehe zu: https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
  echo "   2. Kopiere den Inhalt von: scripts/seed-demo-videos.sql"
  echo "   3. Führe die Query aus"
  echo ""
  echo "Oder verwende das Supabase CLI:"
  echo "   npx supabase db execute -f scripts/seed-demo-videos.sql"
fi

echo "✅ Fertig!"
