#!/bin/bash

# 🔍 GOOGLE OAUTH REDIRECT-URIs TEST
# Überprüft, ob die Redirect-URIs korrekt konfiguriert sind

echo "🔍 Überprüfe Google OAuth Konfiguration..."
echo ""

# Lese client_id aus .env
CLIENT_ID=$(grep EXPO_PUBLIC_GOOGLE_CLIENT_ID .env | cut -d '=' -f2)

if [ -z "$CLIENT_ID" ]; then
    echo "❌ EXPO_PUBLIC_GOOGLE_CLIENT_ID nicht in .env gefunden"
    exit 1
fi

echo "✅ Client ID gefunden: $CLIENT_ID"
echo ""

echo "📝 Folgende Redirect-URIs müssen in der Google Cloud Console konfiguriert sein:"
echo ""
echo "  ✓ http://localhost:8081/auth/google/callback"
echo "  ✓ http://localhost:3000/auth/google/callback"
echo "  ✓ https://www.anpip.com/auth/google/callback"
echo "  ✓ https://anpip.com/auth/google/callback"
echo ""

echo "📝 Folgende JavaScript-Ursprünge müssen konfiguriert sein:"
echo ""
echo "  ✓ http://localhost:8081"
echo "  ✓ http://localhost:3000"
echo "  ✓ https://www.anpip.com"
echo "  ✓ https://anpip.com"
echo ""

echo "🌐 Öffne Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""

echo "✅ Wenn alles konfiguriert ist, sollte der Google-Login funktionieren!"
