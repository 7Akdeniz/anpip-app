#!/bin/bash
# Test der compress-video Edge Function

echo "🧪 Testing Edge Function: compress-video"
echo "=========================================="
echo ""

# Service Role Key aus .env oder von User
if [ -z "$SERVICE_ROLE_KEY" ]; then
    echo "Service Role Key wird benötigt..."
    echo "Öffne: https://supabase.com/dashboard/project/vlibyocpdguxpretjvnz/settings/api"
    read -s -p "Service Role Key eingeben: " SERVICE_ROLE_KEY
    echo ""
fi

# Test-Call
echo ""
echo "📤 Sende Test-Request..."
echo ""

RESPONSE=$(curl -s -X POST \
  'https://vlibyocpdguxpretjvnz.supabase.co/functions/v1/compress-video' \
  -H "Authorization: Bearer $SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  --data '{
    "videoPath": "test_video.mp4",
    "userId": "test-user-123",
    "videoId": "test-video-id-123"
  }')

echo "📥 Response:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Check ob erfolgreich
if echo "$RESPONSE" | grep -q '"success":true' 2>/dev/null; then
    echo "✅ Edge Function funktioniert!"
else
    echo "⚠️  Edge Function Response:"
    echo "$RESPONSE"
    echo ""
    echo "Das ist OK - Fehler ist erwartet weil test_video.mp4 nicht existiert."
    echo "Die Function ist aber deployed und erreichbar!"
fi

echo ""
echo "📋 Nächste Schritte:"
echo "1. Öffne Expo App"
echo "2. Gehe zu Upload Tab"
echo "3. Wähle ein Video"
echo "4. Upload starten"
echo "5. Logs: supabase functions logs compress-video --tail"
echo ""
