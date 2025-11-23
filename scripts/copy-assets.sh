#!/bin/bash

# Kopiere public Assets in dist
echo "📁 Kopiere Assets in dist..."

# Erstelle dist/assets Verzeichnis wenn nicht vorhanden
mkdir -p dist/assets

# Kopiere alle Assets
if [ -d "public/assets" ]; then
  cp -r public/assets/* dist/assets/
  echo "✅ Assets kopiert"
else
  echo "⚠️  public/assets nicht gefunden"
fi

# Liste kopierte Dateien
echo "📋 Kopierte Assets:"
ls -la dist/assets/ | head -20
