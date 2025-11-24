#!/bin/bash
# Pixabay Music API - Deployment Script
# Automatisches Setup der kompletten Music Integration

set -e

echo "🎵 Pixabay Music API - Deployment"
echo "=================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI nicht gefunden!"
    echo "   Installiere: npm install -g supabase"
    exit 1
fi

# Check API Key
echo "📋 Prüfe Umgebungsvariablen..."
if [ -z "$PIXABAY_API_KEY" ]; then
    echo "⚠️  PIXABAY_API_KEY nicht gesetzt!"
    echo ""
    echo "Bitte erstelle einen API-Key:"
    echo "1. Gehe zu https://pixabay.com/api/docs/"
    echo "2. Registriere dich (kostenlos)"
    echo "3. Kopiere deinen API-Key"
    echo ""
    read -p "Gib deinen Pixabay API-Key ein: " api_key
    export PIXABAY_API_KEY="$api_key"
fi

# Deploy Edge Function
echo ""
echo "🚀 Deploye Edge Function..."
supabase functions deploy pixabay-music

# Set Environment Variables
echo ""
echo "🔑 Setze Umgebungsvariablen..."
supabase secrets set PIXABAY_API_KEY="$PIXABAY_API_KEY"

# Run Migration
echo ""
echo "📊 Führe Datenbank-Migration aus..."
supabase db push

# Install Dependencies
echo ""
echo "📦 Installiere Dependencies..."
npx expo install @react-native-community/slider @react-native-async-storage/async-storage

# Success
echo ""
echo "✅ Deployment erfolgreich!"
echo ""
echo "Nächste Schritte:"
echo "1. Füge MusicProvider in app/_layout.tsx hinzu"
echo "2. Nutze <MusicBrowser /> in deiner App"
echo "3. Teste mit /music-test Route"
echo ""
echo "Dokumentation: docs/PIXABAY_MUSIC_INTEGRATION.md"
echo ""
echo "🎉 Viel Spaß mit der Music-Integration!"
