#!/bin/bash
# Quick Deployment - Nur Tokens eingeben, Rest automatisch

echo "🚀 Supabase Edge Function - Quick Deploy"
echo "=========================================="
echo ""

# Token 1: Access Token
echo "📝 SCHRITT 1: Supabase Access Token"
echo "Öffne: https://supabase.com/dashboard/account/tokens"
echo "Klicke 'Generate New Token' (Name: Anpip CLI)"
echo ""
read -p "Access Token eingeben: " ACCESS_TOKEN

if [ -z "$ACCESS_TOKEN" ]; then
    echo "❌ Kein Token eingegeben!"
    exit 1
fi

export SUPABASE_ACCESS_TOKEN="$ACCESS_TOKEN"
echo "✅ Access Token gesetzt"
echo ""

# Token 2: Service Role Key
echo "📝 SCHRITT 2: Service Role Key"
echo "Öffne: https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/settings/api"
echo "Kopiere 'service_role' Key (NICHT anon!)"
echo ""
read -s -p "Service Role Key eingeben: " SERVICE_ROLE_KEY
echo ""

if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "❌ Kein Key eingegeben!"
    exit 1
fi

echo "✅ Service Role Key gesetzt"
echo ""

# Deployment starten
echo "🚀 Starte Deployment..."
echo ""

# Projekt verbinden
echo "1. Verbinde Projekt..."
supabase link --project-ref vlibyocpdguxpretjvnz

echo ""

# Edge Function deployen
echo "2. Deploye Edge Function..."
supabase functions deploy compress-video --no-verify-jwt

echo ""

# Secrets setzen
echo "3. Setze Environment Secrets..."
supabase secrets set SUPABASE_URL=https://vlibyocpdguxpretjvnz.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY"

echo ""
echo "🎉 DEPLOYMENT ERFOLGREICH!"
echo "=========================="
echo ""
echo "✅ Edge Function: compress-video deployed"
echo "✅ URL: https://vlibyocpdguxpretjvnz.supabase.co/functions/v1/compress-video"
echo ""
echo "📋 Nächste Schritte:"
echo "1. npx expo start"
echo "2. Upload Tab öffnen"
echo "3. Video hochladen (kann jetzt >50MB sein!)"
echo ""
echo "🔍 Logs anschauen:"
echo "supabase functions logs compress-video --tail"
echo ""
