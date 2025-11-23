#!/bin/bash

# Kopiere public Assets in dist
echo "📁 Kopiere Assets in dist..."

# Generiere manifest.json
node scripts/generate-manifest.js

# Erstelle dist/assets Verzeichnis wenn nicht vorhanden
mkdir -p dist/assets

# Kopiere alle Assets
if [ -d "public/assets" ]; then
  cp -r public/assets/* dist/assets/
  echo "✅ Assets kopiert"
else
  echo "⚠️  public/assets nicht gefunden"
fi

# Kopiere manifest.json
if [ -f "public/manifest.json" ]; then
  cp public/manifest.json dist/
  echo "✅ manifest.json kopiert"
fi

# Liste kopierte Dateien
echo "📋 Kopierte Assets:"
ls -la dist/assets/ 2>/dev/null | head -20
