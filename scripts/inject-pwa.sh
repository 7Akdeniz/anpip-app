#!/bin/bash

# ============================================================================
# Anpip.com PWA HTML Injector
# Fügt PWA-Code automatisch in die generierte index.html ein
# ============================================================================

set -e

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

HTML_FILE="dist/index.html"
PUBLIC_DIR="public"

echo -e "${BLUE}🔧 PWA HTML Injector${NC}"

# Prüfe ob dist/index.html existiert
if [ ! -f "$HTML_FILE" ]; then
    echo -e "${RED}❌ Fehler: $HTML_FILE nicht gefunden${NC}"
    echo "   Führe zuerst aus: ${YELLOW}npx expo export -p web${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} $HTML_FILE gefunden"

# Kopiere PWA-Dateien von public nach dist
echo -e "${BLUE}📦 Kopiere PWA-Dateien...${NC}"
cp -v "$PUBLIC_DIR/manifest.webmanifest" "dist/" 2>/dev/null && echo -e "${GREEN}✓${NC} manifest.webmanifest kopiert" || echo -e "${YELLOW}⚠️${NC}  manifest.webmanifest nicht gefunden"
cp -v "$PUBLIC_DIR/service-worker.js" "dist/" 2>/dev/null && echo -e "${GREEN}✓${NC} service-worker.js kopiert" || echo -e "${YELLOW}⚠️${NC}  service-worker.js nicht gefunden"
cp -v "$PUBLIC_DIR/pwa-install.js" "dist/" 2>/dev/null && echo -e "${GREEN}✓${NC} pwa-install.js kopiert" || echo -e "${YELLOW}⚠️${NC}  pwa-install.js nicht gefunden"
cp -v "$PUBLIC_DIR/pwa-banner.css" "dist/" 2>/dev/null && echo -e "${GREEN}✓${NC} pwa-banner.css kopiert" || echo -e "${YELLOW}⚠️${NC}  pwa-banner.css nicht gefunden"
cp -v "$PUBLIC_DIR/browserconfig.xml" "dist/" 2>/dev/null && echo -e "${GREEN}✓${NC} browserconfig.xml kopiert" || echo -e "${YELLOW}⚠️${NC}  browserconfig.xml nicht gefunden"

# Backup erstellen
cp "$HTML_FILE" "${HTML_FILE}.backup"
echo -e "${GREEN}✓${NC} Backup erstellt: ${HTML_FILE}.backup"

# ============================================================================
# PWA Meta Tags & Links im <head>
# ============================================================================

HEAD_INJECTION='<!-- PWA Meta Tags --><meta name="theme-color" content="#0ea5e9" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#1e3a8a" media="(prefers-color-scheme: dark)"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Anpip"><link rel="apple-touch-icon" href="/assets/icons/icon-192x192.png"><link rel="manifest" href="/manifest.webmanifest"><link rel="stylesheet" href="/pwa-banner.css">'

# Füge vor </head> ein (macOS sed syntax)
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|</head>|${HEAD_INJECTION}</head>|" "$HTML_FILE"
else
    sed -i "s|</head>|${HEAD_INJECTION}</head>|" "$HTML_FILE"
fi

echo -e "${GREEN}✓${NC} PWA Meta-Tags injiziert"

# ============================================================================
# Service Worker & Install Script vor </body>
# ============================================================================

BODY_INJECTION='<script>if("serviceWorker"in navigator){window.addEventListener("load",()=>{navigator.serviceWorker.register("/service-worker.js").then(r=>console.log("[PWA] Service Worker registriert:",r.scope)).catch(e=>console.error("[PWA] SW-Fehler:",e));navigator.serviceWorker.addEventListener("controllerchange",()=>{console.log("[PWA] SW aktualisiert");window.location.reload()})})}</script><script src="/pwa-install.js" defer></script>'

# Füge vor </body> ein
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|</body>|${BODY_INJECTION}</body>|" "$HTML_FILE"
else
    sed -i "s|</body>|${BODY_INJECTION}</body>|" "$HTML_FILE"
fi

echo -e "${GREEN}✓${NC} Service Worker & Install-Script injiziert"

# ============================================================================
# Verification
# ============================================================================

echo ""
echo -e "${BLUE}🔍 Verifikation...${NC}"

# Prüfe ob Injection erfolgreich
if grep -q "manifest.webmanifest" "$HTML_FILE" && grep -q "service-worker.js" "$HTML_FILE" && grep -q "pwa-install.js" "$HTML_FILE"; then
    echo -e "${GREEN}✅ PWA-Integration erfolgreich!${NC}"
    echo ""
    echo "Nächste Schritte:"
    echo "  1. Prüfe die Änderungen: ${YELLOW}cat $HTML_FILE | grep -i pwa${NC}"
    echo "  2. Deploye auf Vercel: ${YELLOW}npx vercel --prod${NC}"
    echo ""
else
    echo -e "${RED}❌ Fehler: Injection fehlgeschlagen${NC}"
    echo "   Stelle Backup wieder her: ${YELLOW}mv ${HTML_FILE}.backup $HTML_FILE${NC}"
    exit 1
fi

# Zeige Statistik
ORIG_SIZE=$(wc -c < "${HTML_FILE}.backup")
NEW_SIZE=$(wc -c < "$HTML_FILE")
DIFF=$((NEW_SIZE - ORIG_SIZE))

echo "Dateigröße:"
echo "  • Vorher: $(numfmt --to=iec $ORIG_SIZE 2>/dev/null || echo "${ORIG_SIZE} bytes")"
echo "  • Nachher: $(numfmt --to=iec $NEW_SIZE 2>/dev/null || echo "${NEW_SIZE} bytes")"
echo "  • Differenz: +${DIFF} bytes (~1KB PWA-Code)"
echo ""

echo -e "${GREEN}✨ Fertig!${NC}"
