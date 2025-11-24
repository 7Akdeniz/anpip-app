#!/bin/bash

# ============================================================================
# 📋 VIDEO UPLOAD FIX - INTERACTIVE CHECKLIST
# ============================================================================

clear

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🔧 ANPIP VIDEO UPLOAD FIX - Schritt-für-Schritt Anleitung   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# STEP 1: MIGRATION
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCHRITT 1/3: Datenbank Migration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Öffne Supabase Dashboard:"
echo "    → https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz"
echo ""
echo "2️⃣  Gehe zu SQL Editor (links in Sidebar)"
echo ""
echo "3️⃣  Kopiere Migration:"

# Kopiere Migration in Zwischenablage
cat supabase/migrations/20251124_fix_video_upload_schema.sql | pbcopy

echo "    ✅ Migration wurde in Zwischenablage kopiert!"
echo ""
echo "4️⃣  In Supabase SQL Editor:"
echo "    - 'New Query' klicken"
echo "    - CMD+V zum Einfügen"
echo "    - 'Run' klicken"
echo "    - Warte auf 'Success' ✅"
echo ""

read -p "✅ Hast du die Migration ausgeführt und 'Success' gesehen? [y/n] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Bitte führe die Migration zuerst aus!"
    echo "   Die SQL-Befehle sind in deiner Zwischenablage."
    echo "   Füge sie in Supabase SQL Editor ein und klicke 'Run'."
    exit 1
fi

echo "✅ Schritt 1 abgeschlossen!"
echo ""

# ============================================================================
# STEP 2: STORAGE BUCKET
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCHRITT 2/3: Storage Bucket prüfen"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Öffne Storage:"
echo "    → https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/storage/buckets"
echo ""
echo "2️⃣  Prüfe ob Bucket 'videos' existiert"
echo ""
echo "3️⃣  Falls NICHT vorhanden:"
echo "    - 'New Bucket' klicken"
echo "    - Name: videos"
echo "    - Public: ✅ JA (wichtig!)"
echo "    - 'Create Bucket' klicken"
echo ""

read -p "✅ Existiert der 'videos' Bucket und ist Public? [y/n] " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "❌ Bitte erstelle den Bucket zuerst!"
    echo "   1. Dashboard → Storage"
    echo "   2. New Bucket → Name: 'videos' → Public: JA"
    exit 1
fi

echo "✅ Schritt 2 abgeschlossen!"
echo ""

# ============================================================================
# STEP 3: DEV SERVER RESTART
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 SCHRITT 3/3: Dev Server neu starten"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🛑 Beende alte Prozesse..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

echo "✅ Alte Prozesse beendet"
echo ""

echo "🚀 Starte Expo Dev Server neu..."
echo ""
npx expo start --clear &

sleep 5

echo ""
echo "✅ Schritt 3 abgeschlossen!"
echo ""

# ============================================================================
# SUCCESS
# ============================================================================

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✅ VIDEO UPLOAD FIX ERFOLGREICH INSTALLIERT!                 ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

echo "🎯 NÄCHSTE SCHRITTE:"
echo ""
echo "1️⃣  Öffne die App im Simulator/Device"
echo ""
echo "2️⃣  Gehe zum Upload-Tab (unten in der Navigation)"
echo ""
echo "3️⃣  Wähle ein KLEINES Test-Video (< 10 MB)"
echo ""
echo "4️⃣  Klicke 'Upload' und beobachte die Console-Logs"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 ERWARTETE LOGS (bei Erfolg):"
echo ""
echo "   🎬 Starte Upload..."
echo "   📦 Video Größe: X.XX MB"
echo "   ⬆️  Starte Supabase Storage Upload..."
echo "   ⏱️  Upload-Dauer: X.XXs"
echo "   ✅ Upload erfolgreich"
echo "   ✅ Video in Datenbank gespeichert"
echo "   ✅ Video hochgeladen!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🐛 DEBUGGING:"
echo ""
echo "   - Console öffnen: CMD+D → Debug JS Remotely"
echo "   - Logs in Echtzeit im Terminal sichtbar"
echo "   - Falls Fehler → siehe QUICKSTART_VIDEO_UPLOAD_FIX.md"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📚 DOKUMENTATION:"
echo ""
echo "   → QUICKSTART_VIDEO_UPLOAD_FIX.md (Schnellstart)"
echo "   → docs/VIDEO_UPLOAD_FIX.md (Vollständige Doku)"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ VIEL ERFOLG BEIM TESTEN!"
echo ""
