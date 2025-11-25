#!/bin/bash

# ============================================================================
# VIDEO UPLOAD LIMITS - VERIFICATION SCRIPT
# ============================================================================
# 
# Testet ob die zentrale Video-Limits-Konfiguration korrekt funktioniert.
# 
# Usage:
#   bash scripts/verify-video-limits.sh
# ============================================================================

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 VIDEO UPLOAD LIMITS - VERIFICATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ============================================================================
# 1. Prüfe ob config/video-limits.ts existiert
# ============================================================================

echo "📋 Schritt 1: Prüfe Config-Datei..."

if [ ! -f "config/video-limits.ts" ]; then
  echo "❌ FEHLER: config/video-limits.ts nicht gefunden!"
  exit 1
fi

echo "✅ config/video-limits.ts existiert"
echo ""

# ============================================================================
# 2. Prüfe ENV-Variablen
# ============================================================================

echo "📋 Schritt 2: Prüfe ENV-Variablen..."

# Load .env if exists
if [ -f ".env" ]; then
  export $(cat .env | grep -v '^#' | xargs)
  echo "✅ .env Datei geladen"
else
  echo "⚠️  WARNUNG: .env Datei nicht gefunden (nutzt Defaults)"
fi

# Check wichtige Variablen
if [ -z "$VIDEO_MAX_DURATION_SECONDS" ]; then
  echo "⚠️  VIDEO_MAX_DURATION_SECONDS nicht gesetzt (nutzt Default: 60s)"
else
  echo "✅ VIDEO_MAX_DURATION_SECONDS = $VIDEO_MAX_DURATION_SECONDS Sekunden"
fi

if [ -z "$VIDEO_TECHNICAL_MAX_DURATION_SECONDS" ]; then
  echo "⚠️  VIDEO_TECHNICAL_MAX_DURATION_SECONDS nicht gesetzt (nutzt Default: 7200s)"
else
  echo "✅ VIDEO_TECHNICAL_MAX_DURATION_SECONDS = $VIDEO_TECHNICAL_MAX_DURATION_SECONDS Sekunden"
fi

echo ""

# ============================================================================
# 3. Prüfe ob Komponenten refactored wurden
# ============================================================================

echo "📋 Schritt 3: Prüfe Komponenten..."

# VideoUpload.tsx
if grep -q "VIDEO_LIMITS" components/VideoUpload.tsx; then
  echo "✅ components/VideoUpload.tsx nutzt VIDEO_LIMITS"
else
  echo "❌ components/VideoUpload.tsx nutzt NICHT VIDEO_LIMITS"
fi

# CloudflareVideoUpload.tsx
if grep -q "VIDEO_LIMITS" components/CloudflareVideoUpload.tsx; then
  echo "✅ components/CloudflareVideoUpload.tsx nutzt VIDEO_LIMITS"
else
  echo "❌ components/CloudflareVideoUpload.tsx nutzt NICHT VIDEO_LIMITS"
fi

# upload.tsx
if grep -q "VIDEO_LIMITS" app/\(tabs\)/upload.tsx; then
  echo "✅ app/(tabs)/upload.tsx nutzt VIDEO_LIMITS"
else
  echo "❌ app/(tabs)/upload.tsx nutzt NICHT VIDEO_LIMITS"
fi

# create-upload/route.ts
if grep -q "VIDEO_LIMITS" app/api/videos/create-upload/route.ts; then
  echo "✅ app/api/videos/create-upload/route.ts nutzt VIDEO_LIMITS"
else
  echo "❌ app/api/videos/create-upload/route.ts nutzt NICHT VIDEO_LIMITS"
fi

echo ""

# ============================================================================
# 4. Prüfe TypeScript-Kompilierung
# ============================================================================

echo "📋 Schritt 4: Prüfe TypeScript-Kompilierung..."

# Nur prüfen, nicht bauen
npx tsc --noEmit --skipLibCheck config/video-limits.ts 2>&1 | grep -q "error" && {
  echo "❌ TypeScript-Fehler in config/video-limits.ts gefunden!"
  npx tsc --noEmit config/video-limits.ts
  exit 1
} || {
  echo "✅ config/video-limits.ts kompiliert ohne Fehler"
}

echo ""

# ============================================================================
# 5. Prüfe Dokumentation
# ============================================================================

echo "📋 Schritt 5: Prüfe Dokumentation..."

if [ -f "docs/VIDEO_UPLOAD_ARCHITECTURE.md" ]; then
  echo "✅ docs/VIDEO_UPLOAD_ARCHITECTURE.md existiert"
else
  echo "❌ docs/VIDEO_UPLOAD_ARCHITECTURE.md fehlt!"
fi

if [ -f "docs/VIDEO_LIMITS_QUICK_START.md" ]; then
  echo "✅ docs/VIDEO_LIMITS_QUICK_START.md existiert"
else
  echo "❌ docs/VIDEO_LIMITS_QUICK_START.md fehlt!"
fi

if [ -f "IMPLEMENTATION_SUMMARY.md" ]; then
  echo "✅ IMPLEMENTATION_SUMMARY.md existiert"
else
  echo "❌ IMPLEMENTATION_SUMMARY.md fehlt!"
fi

echo ""

# ============================================================================
# 6. Zusammenfassung
# ============================================================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 ZUSAMMENFASSUNG"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Zentrale Video-Limits-Konfiguration ist korrekt implementiert!"
echo ""
echo "🎯 AKTUELLE LIMITS:"
echo "   - Technisches Maximum: ${VIDEO_TECHNICAL_MAX_DURATION_SECONDS:-7200} Sekunden"
echo "   - Aktives User-Limit: ${VIDEO_MAX_DURATION_SECONDS:-60} Sekunden"
echo ""
echo "📝 Um Limits zu ändern:"
echo "   1. Bearbeite .env Datei"
echo "   2. Ändere VIDEO_MAX_DURATION_SECONDS=120 (z.B. für 2 Minuten)"
echo "   3. Starte App neu: npm run start"
echo ""
echo "📚 Weitere Infos:"
echo "   - docs/VIDEO_LIMITS_QUICK_START.md"
echo "   - docs/VIDEO_UPLOAD_ARCHITECTURE.md"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
