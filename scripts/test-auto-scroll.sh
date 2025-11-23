#!/bin/bash

# ============================================================================
# AUTO-SCROLL FEATURE - Quick Test & Reload Script
# ============================================================================
# 
# Dieses Script testet das Auto-Scroll Feature und lädt die App neu
#

echo "🎬 Anpip.com - Auto-Scroll Feature Test"
echo "========================================"
echo ""

# 1. TypeScript-Fehler prüfen
echo "📝 Prüfe TypeScript-Fehler..."
npx tsc --noEmit 2>&1 | grep -E "(error|warning)" || echo "✅ Keine TypeScript-Fehler"
echo ""

# 2. Expo Dev Server Reload
echo "🔄 Lade Expo App neu..."
if lsof -ti:8081 > /dev/null 2>&1; then
    echo "r" | nc -w 1 localhost 8081 2>/dev/null && echo "✅ App neu geladen!" || echo "❌ Reload fehlgeschlagen"
else
    echo "⚠️  Expo Dev Server läuft nicht auf Port 8081"
    echo "   Starte mit: npx expo start"
fi
echo ""

# 3. Wichtige Logs anzeigen
echo "📊 Letzte Auto-Scroll Logs:"
echo "   (Öffne Browser Console oder React Native Debugger für Details)"
echo ""

# 4. Test-Hinweise
echo "🧪 Test-Szenarien für Auto-Scroll:"
echo "   ✅ Video bis Ende schauen → sollte automatisch zum nächsten scrollen"
echo "   ✅ Während Video manuell scrollen → Auto-Scroll sollte stoppen"
echo "   ✅ Video pausieren → Auto-Scroll sollte deaktiviert sein"
echo "   ✅ Settings → Audio & Video → Auto-Scroll Ein/Aus"
echo ""

# 5. Nützliche Befehle
echo "💡 Nützliche Befehle:"
echo "   npx expo start              # Dev Server starten"
echo "   npx expo start --clear      # Mit Cache-Clear"
echo "   open http://localhost:8081  # Web-Version öffnen"
echo ""

echo "✅ Script beendet!"
