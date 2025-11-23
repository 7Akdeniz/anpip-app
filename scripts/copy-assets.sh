#!/bin/bash

# Kopiere public Assets in dist
echo "📁 Kopiere Assets in dist..."

# Generiere manifest.json
node scripts/generate-manifest.js

# Kopiere Icons in dist root
if [ -d "public/icons" ]; then
  cp -r public/icons dist/
  echo "✅ Icons kopiert nach dist/icons/"
fi

# Kopiere Splash-Screen
if [ -f "public/splash-screen.png" ]; then
  cp public/splash-screen.png dist/
  echo "✅ Splash-Screen kopiert nach dist/"
fi

# Kopiere manifest.json
if [ -f "public/manifest.json" ]; then
  cp public/manifest.json dist/
  echo "✅ manifest.json kopiert nach dist/"
fi

# Liste kopierte Dateien
echo "📋 Inhalt von dist/:"
ls -la dist/ | head -20
echo "📋 Icons in dist/icons/:"
ls -la dist/icons/ 2>/dev/null | head -15
