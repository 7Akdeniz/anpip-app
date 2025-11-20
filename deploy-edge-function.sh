#!/bin/bash
# Video Compression Edge Function Deployment Script

set -e  # Exit on error

echo "🚀 Supabase Edge Function Deployment"
echo "======================================"
echo ""

# Schritt 1: Login Check
echo "📝 Schritt 1: Supabase Login"
echo "----------------------------"

if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI nicht gefunden!"
    echo "Installation: brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI gefunden (Version: $(supabase --version))"
echo ""

# Login prüfen
if ! supabase projects list &> /dev/null; then
    echo "⚠️  Du bist nicht eingeloggt."
    echo ""
    echo "Bitte führe aus:"
    echo "  supabase login"
    echo ""
    echo "Oder mit Token:"
    echo "  1. Öffne: https://supabase.com/dashboard/account/tokens"
    echo "  2. Generiere neuen Token (Name: Anpip CLI)"
    echo "  3. Führe aus: export SUPABASE_ACCESS_TOKEN=YOUR_TOKEN"
    echo ""
    exit 1
fi

echo "✅ Login erfolgreich"
echo ""

# Schritt 2: Projekt verbinden
echo "📝 Schritt 2: Projekt verbinden"
echo "--------------------------------"

PROJECT_REF="vlibyocpdguxpretjvnz"

# Prüfe ob bereits verbunden
if [ -f "supabase/.temp/project-ref" ]; then
    CURRENT_REF=$(cat supabase/.temp/project-ref)
    if [ "$CURRENT_REF" == "$PROJECT_REF" ]; then
        echo "✅ Projekt bereits verbunden: $PROJECT_REF"
    else
        echo "⚠️  Anderes Projekt verbunden: $CURRENT_REF"
        echo "Verbinde neu mit: $PROJECT_REF"
        supabase link --project-ref $PROJECT_REF
    fi
else
    echo "Verbinde mit Projekt: $PROJECT_REF"
    supabase link --project-ref $PROJECT_REF
fi

echo ""

# Schritt 3: Edge Function deployen
echo "📝 Schritt 3: Edge Function deployen"
echo "--------------------------------------"

if [ ! -f "supabase/functions/compress-video/index.ts" ]; then
    echo "❌ Edge Function nicht gefunden!"
    echo "Datei fehlt: supabase/functions/compress-video/index.ts"
    exit 1
fi

echo "Deploying compress-video function..."
supabase functions deploy compress-video --no-verify-jwt

echo ""
echo "✅ Edge Function deployed!"
echo ""

# Schritt 4: Secrets setzen
echo "📝 Schritt 4: Environment Secrets setzen"
echo "-----------------------------------------"

echo ""
echo "Bitte Service Role Key eingeben:"
echo "(Zu finden unter: https://supabase.com/dashboard/project/$PROJECT_REF/settings/api)"
echo ""
read -s -p "Service Role Key: " SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Kein Key eingegeben. Überspringe Secrets..."
else
    echo "Setze SUPABASE_URL..."
    supabase secrets set SUPABASE_URL=https://$PROJECT_REF.supabase.co
    
    echo "Setze SUPABASE_SERVICE_ROLE_KEY..."
    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
    
    echo "✅ Secrets gesetzt!"
fi

echo ""
echo "🎉 DEPLOYMENT ABGESCHLOSSEN!"
echo "============================"
echo ""
echo "✅ Edge Function deployed: compress-video"
echo "✅ URL: https://$PROJECT_REF.supabase.co/functions/v1/compress-video"
echo ""
echo "📋 Nächste Schritte:"
echo "1. Teste die Function: supabase functions logs compress-video --tail"
echo "2. Öffne Expo App und lade ein Video hoch"
echo "3. Checke Logs für Komprimierung"
echo ""
echo "🔍 Debugging:"
echo "  - Function Logs: https://supabase.com/dashboard/project/$PROJECT_REF/functions"
echo "  - Database Videos: SELECT * FROM videos WHERE compression_status IS NOT NULL;"
echo ""
