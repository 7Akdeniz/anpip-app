#!/bin/bash

# ============================================================================
# VIDEO UPLOAD FIX - Installation
# ============================================================================
# Führt die komplette Migration in Supabase aus
# ============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                    🔧 VIDEO UPLOAD FIX                           ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}📋 Was wird gemacht:${NC}"
echo "  1. ✅ Schema-Fix (fehlende Spalten hinzufügen)"
echo "  2. ✅ RLS Policies (INSERT/SELECT/UPDATE/DELETE)"
echo "  3. ✅ Storage Policies (videos bucket)"
echo ""

# Migration in Zwischenablage kopieren
echo -e "${BLUE}📋 Kopiere Migration in Zwischenablage...${NC}"
cat supabase/migrations/20251124_complete_video_upload_fix.sql | pbcopy
echo -e "${GREEN}✅ Migration kopiert!${NC}"
echo ""

# Öffne Supabase Dashboard
echo -e "${YELLOW}📍 SCHRITT 1: Supabase Dashboard öffnen${NC}"
echo ""
echo "  → https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/sql/new"
echo ""
open "https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/sql/new"
sleep 2

echo ""
echo -e "${YELLOW}📍 SCHRITT 2: Migration ausführen${NC}"
echo ""
echo "  1. Im Supabase SQL Editor:"
echo "     • Die Migration ist bereits in deiner Zwischenablage"
echo "     • Drücke ${GREEN}CMD+V${NC} zum Einfügen"
echo "     • Klicke ${GREEN}RUN${NC}"
echo "     • Warte auf ${GREEN}Success ✅${NC}"
echo ""
echo "  2. Erwartetes Ergebnis:"
echo "     • ${GREEN}✅ Video Upload Fix erfolgreich angewendet!${NC}"
echo "     • ${GREEN}Schema: ✅ Fehlende Spalten hinzugefügt${NC}"
echo "     • ${GREEN}RLS: ✅ Policies konfiguriert${NC}"
echo "     • ${GREEN}Storage: ✅ Bucket Policies gesetzt${NC}"
echo ""

read -p "⏸️  Drücke ENTER wenn die Migration erfolgreich war..."

echo ""
echo -e "${YELLOW}📍 SCHRITT 3: Storage Bucket prüfen${NC}"
echo ""
echo "  → https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/storage/buckets"
echo ""
open "https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/storage/buckets"
sleep 2

echo ""
echo "  Prüfe im Storage Dashboard:"
echo "    • Bucket 'videos' existiert? ${GREEN}✅${NC}"
echo "    • Bucket ist PUBLIC? ${GREEN}✅${NC}"
echo ""
echo "  Falls Bucket fehlt:"
echo "    1. Klicke 'New Bucket'"
echo "    2. Name: ${BLUE}videos${NC}"
echo "    3. Public: ${GREEN}✅ JA${NC}"
echo "    4. Erstellen"
echo ""

read -p "⏸️  Drücke ENTER wenn der Bucket existiert und PUBLIC ist..."

echo ""
echo -e "${YELLOW}📍 SCHRITT 4: App neu starten${NC}"
echo ""

# Expo Server neu starten
echo -e "${BLUE}🔄 Stoppe alten Expo Server...${NC}"
pkill -9 -f "expo" 2>/dev/null || true
sleep 2

echo -e "${BLUE}🚀 Starte Expo Server neu...${NC}"
cd /Users/alanbest/Anpip.com
npx expo start --clear &

sleep 5

echo ""
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║                     ✅ INSTALLATION FERTIG                       ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🎉 Video Upload ist jetzt konfiguriert!${NC}"
echo ""
echo -e "${BLUE}📱 Teste jetzt:${NC}"
echo "  1. Öffne die App im Simulator/Device"
echo "  2. Gehe zum Upload-Tab"
echo "  3. Wähle ein Video aus (< 200 MB empfohlen)"
echo "  4. Klicke auf 'Hochladen'"
echo ""
echo -e "${BLUE}✅ Erwartete Logs:${NC}"
echo "  📤 Lade Video als Blob..."
echo "  📦 Blob Größe: X.XX MB"
echo "  ⏱️ Upload-Dauer: X.XXs"
echo "  ✅ Upload erfolgreich"
echo "  ✅ Video in Datenbank gespeichert"
echo "  ✅ Video hochgeladen!"
echo ""
echo -e "${YELLOW}⚠️  Bei Problemen:${NC}"
echo "  • Prüfe Console-Logs auf Fehler"
echo "  • Supabase Dashboard → Logs prüfen"
echo "  • Storage → Videos prüfen ob Datei da ist"
echo ""
