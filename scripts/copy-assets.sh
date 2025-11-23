#!/bin/bash

# Kopiere public Assets in dist
echo "📁 Kopiere Assets in dist..."

# Generiere manifest.json
node scripts/generate-manifest.js

# Erstelle dist/assets Verzeichnis wenn nicht vorhanden
mkdir -p dist/assets/icons

# Kopiere Icons direkt
if [ -d "public/assets/icons" ]; then
  cp public/assets/icons/*.png dist/assets/icons/
  echo "✅ Icons kopiert nach dist/assets/icons/"
fi

# Kopiere Splash-Screen
if [ -f "public/assets/splash-screen.png" ]; then
  cp public/assets/splash-screen.png dist/assets/
  echo "✅ Splash-Screen kopiert"
fi

# Kopiere manifest.json
if [ -f "public/manifest.json" ]; then
  cp public/manifest.json dist/
  echo "✅ manifest.json kopiert"
fi

# Liste kopierte Dateien
echo "📋 Assets in dist/assets/:"
ls -la dist/assets/ 2>/dev/null | head -10
echo "📋 Icons in dist/assets/icons/:"
ls -la dist/assets/icons/ 2>/dev/null | head -15
