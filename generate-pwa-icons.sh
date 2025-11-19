#!/bin/bash

# ============================================================================
# Anpip.com PWA Icon Generator
# Generiert alle benötigten PWA-Icons aus einer Quelldatei
# ============================================================================

set -e  # Exit bei Fehler

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
PROJECT_DIR="/Users/alanbest/Anpip.com"
SOURCE_ICON="$PROJECT_DIR/assets/images/icon.png"
OUTPUT_DIR="$PROJECT_DIR/dist/assets/icons"

# Alternative Quellen falls Hauptquelle nicht existiert
ALT_SOURCE_1="$PROJECT_DIR/assets/icon.png"
ALT_SOURCE_2="$PROJECT_DIR/source-icon.png"

# Icon-Größen
SIZES=(72 96 128 144 152 192 384 512)

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        Anpip.com PWA Icon Generator v1.0                 ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================================================
# Prüfe ImageMagick
# ============================================================================

if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Fehler: ImageMagick ist nicht installiert!${NC}"
    echo ""
    echo "Installation mit Homebrew:"
    echo -e "${YELLOW}  brew install imagemagick${NC}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${NC} ImageMagick gefunden"

# ============================================================================
# Finde Quelldatei
# ============================================================================

if [ -f "$SOURCE_ICON" ]; then
    ICON_SOURCE="$SOURCE_ICON"
    echo -e "${GREEN}✓${NC} Quelldatei gefunden: ${ICON_SOURCE}"
elif [ -f "$ALT_SOURCE_1" ]; then
    ICON_SOURCE="$ALT_SOURCE_1"
    echo -e "${YELLOW}⚠${NC} Hauptquelle nicht gefunden, verwende: ${ICON_SOURCE}"
elif [ -f "$ALT_SOURCE_2" ]; then
    ICON_SOURCE="$ALT_SOURCE_2"
    echo -e "${YELLOW}⚠${NC} Hauptquelle nicht gefunden, verwende: ${ICON_SOURCE}"
else
    echo -e "${RED}❌ Fehler: Keine Quelldatei gefunden!${NC}"
    echo ""
    echo "Bitte erstelle eine der folgenden Dateien (512x512px PNG empfohlen):"
    echo "  1. $SOURCE_ICON"
    echo "  2. $ALT_SOURCE_1"
    echo "  3. $ALT_SOURCE_2"
    echo ""
    echo "Oder verwende dieses Script mit einem Custom-Pfad:"
    echo -e "${YELLOW}  $0 /pfad/zu/deinem/icon.png${NC}"
    echo ""
    exit 1
fi

# ============================================================================
# Prüfe Bildgröße
# ============================================================================

DIMENSIONS=$(identify -format "%wx%h" "$ICON_SOURCE" 2>/dev/null || echo "0x0")
WIDTH=$(echo $DIMENSIONS | cut -d'x' -f1)
HEIGHT=$(echo $DIMENSIONS | cut -d'x' -f2)

echo -e "${BLUE}ℹ${NC} Quelldatei-Größe: ${WIDTH}x${HEIGHT}px"

if [ "$WIDTH" -lt 512 ] || [ "$HEIGHT" -lt 512 ]; then
    echo -e "${YELLOW}⚠ Warnung: Quelldatei ist kleiner als 512x512px${NC}"
    echo "  Empfohlen: mindestens 512x512px für beste Qualität"
    echo ""
    read -p "Trotzdem fortfahren? (j/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Jj]$ ]]; then
        echo "Abgebrochen."
        exit 1
    fi
fi

# ============================================================================
# Erstelle Output-Verzeichnis
# ============================================================================

mkdir -p "$OUTPUT_DIR"
echo -e "${GREEN}✓${NC} Output-Verzeichnis bereit: $OUTPUT_DIR"
echo ""

# ============================================================================
# Generiere Icons
# ============================================================================

echo -e "${BLUE}🎨 Generiere PWA-Icons...${NC}"
echo ""

FAILED=0

for size in "${SIZES[@]}"; do
    output_file="$OUTPUT_DIR/icon-${size}x${size}.png"
    
    printf "   [%-4s] Erstelle icon-${size}x${size}.png ... " "$size"
    
    if convert "$ICON_SOURCE" -resize ${size}x${size} -quality 100 "$output_file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
        FAILED=$((FAILED + 1))
    fi
done

echo ""

# ============================================================================
# Zusammenfassung
# ============================================================================

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Alle Icons erfolgreich generiert!                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "📁 Speicherort: ${BLUE}$OUTPUT_DIR${NC}"
    echo ""
    
    # Zeige Dateigrößen
    echo "Icon-Größen:"
    for size in "${SIZES[@]}"; do
        file="$OUTPUT_DIR/icon-${size}x${size}.png"
        if [ -f "$file" ]; then
            filesize=$(du -h "$file" | cut -f1)
            printf "   • icon-${size}x${size}.png → %s\n" "$filesize"
        fi
    done
    
    echo ""
    echo -e "${GREEN}Nächste Schritte:${NC}"
    echo "  1. Prüfe die Icons visuell"
    echo "  2. Erstelle einen Expo-Build: ${YELLOW}npx expo export -p web${NC}"
    echo "  3. Deploye auf Vercel: ${YELLOW}npx vercel --prod${NC}"
    echo "  4. Teste PWA: ${YELLOW}https://anpip.com${NC}"
    echo ""
    
else
    echo -e "${RED}❌ Fehler: $FAILED Icon(s) konnten nicht erstellt werden${NC}"
    exit 1
fi

# ============================================================================
# Erstelle Favicon-Kopie (optional)
# ============================================================================

if [ -f "$OUTPUT_DIR/icon-192x192.png" ]; then
    echo -e "${BLUE}🔖 Erstelle favicon.ico...${NC}"
    
    if convert "$OUTPUT_DIR/icon-192x192.png" -resize 32x32 "$PROJECT_DIR/dist/favicon.ico" 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} favicon.ico erstellt"
    else
        echo -e "   ${YELLOW}⚠${NC} favicon.ico konnte nicht erstellt werden (optional)"
    fi
fi

echo ""
echo -e "${GREEN}✨ Fertig! Deine PWA-Icons sind bereit.${NC}"
