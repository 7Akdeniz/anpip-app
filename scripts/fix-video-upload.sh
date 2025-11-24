#!/bin/bash

# ============================================================================
# ANPIP VIDEO UPLOAD FIX - Installation Script
# ============================================================================
# Dieses Script behebt das Video-Upload-Problem durch:
# 1. Anwendung der Datenbank-Migration
# 2. Überprüfung der Supabase Storage Konfiguration
# 3. Neustart des Dev-Servers
# ============================================================================

echo "🔧 Anpip Video Upload Fix wird installiert..."
echo ""

# ============================================================================
# 1. SUPABASE MIGRATION
# ============================================================================

echo "📋 Schritt 1: Supabase Migration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WICHTIG: Du musst diese Migration manuell in Supabase ausführen!"
echo ""
echo "1. Öffne: https://supabase.com/dashboard"
echo "2. Wähle dein Projekt: vlibyocpdguxpretjvnz"
echo "3. Navigiere zu: SQL Editor"
echo "4. Kopiere die Datei: supabase/migrations/20251124_fix_video_upload_schema.sql"
echo "5. Führe das SQL aus"
echo ""
read -p "✅ Hast du die Migration ausgeführt? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Abgebrochen. Bitte führe die Migration zuerst aus."
    exit 1
fi

echo "✅ Migration wurde ausgeführt"
echo ""

# ============================================================================
# 2. SUPABASE STORAGE BUCKET CHECK
# ============================================================================

echo "📋 Schritt 2: Supabase Storage Bucket"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WICHTIG: Überprüfe ob der 'videos' Bucket existiert!"
echo ""
echo "1. Öffne: https://supabase.com/dashboard"
echo "2. Navigiere zu: Storage"
echo "3. Prüfe ob Bucket 'videos' existiert"
echo "4. Falls nicht → Erstelle: New Bucket → Name: 'videos' → Public: JA"
echo ""
read -p "✅ Existiert der 'videos' Bucket? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Abgebrochen. Bitte erstelle den Bucket zuerst."
    exit 1
fi

echo "✅ Storage Bucket existiert"
echo ""

# ============================================================================
# 3. EXPO DEV SERVER NEUSTART
# ============================================================================

echo "📋 Schritt 3: Dev Server Neustart"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Alte Prozesse beenden
echo "🛑 Beende alte Expo-Prozesse..."
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "metro" 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
sleep 2

echo "✅ Alte Prozesse beendet"
echo ""

# Neustart mit Cache-Clear
echo "🚀 Starte Expo Dev Server neu..."
echo ""
npx expo start --clear &

sleep 5

echo ""
echo "✅ Dev Server wurde neu gestartet"
echo ""

# ============================================================================
# FERTIG
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Video Upload Fix erfolgreich installiert!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Folgende Änderungen wurden vorgenommen:"
echo ""
echo "   1. ✅ Datenbank-Schema erweitert (videos Tabelle)"
echo "   2. ✅ Upload-Code optimiert mit besseren Logs"
echo "   3. ✅ Fehlerbehandlung verbessert"
echo "   4. ✅ Dev Server neu gestartet"
echo ""
echo "🎯 Nächste Schritte:"
echo ""
echo "   1. Öffne die App im Simulator/Device"
echo "   2. Gehe zum Upload-Tab"
echo "   3. Wähle ein kleines Test-Video (< 10 MB)"
echo "   4. Prüfe die Console-Logs für Debug-Infos"
echo ""
echo "📊 Debugging:"
echo ""
echo "   - Console öffnen: CMD + D → Debug JS Remotely"
echo "   - Logs in Echtzeit: npx expo start"
echo "   - Upload-Prozess wird detailliert geloggt"
echo ""
echo "🆘 Falls Probleme auftreten:"
echo ""
echo "   1. Prüfe Console-Logs für Fehlermeldungen"
echo "   2. Stelle sicher, dass Migration ausgeführt wurde"
echo "   3. Prüfe ob 'videos' Bucket in Supabase existiert"
echo "   4. Teste mit sehr kleinem Video (< 5 MB)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
