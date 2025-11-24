#!/bin/bash

# ============================================
# ANPIP SEO BULK UPDATE SCRIPT
# Aktualisiert alle SEO-Metadaten auf einmal
# ============================================

echo "🚀 ANPIP SEO BULK UPDATE"
echo "======================="
echo ""

# Farben
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funktion für Status-Ausgabe
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Script erstellen wenn nicht vorhanden
create_script() {
    local script_name=$1
    local script_content=$2
    
    if [ ! -f "scripts/$script_name" ]; then
        print_status "Erstelle $script_name..."
        mkdir -p scripts
        echo "$script_content" > "scripts/$script_name"
        print_success "$script_name erstellt"
    fi
}

# Video SEO Update Script
VIDEO_SEO_SCRIPT='import { bulkUpdateVideoSEO } from "../lib/video-seo-enhancer";

async function main() {
  console.log("🎬 Starting bulk video SEO update...");
  try {
    await bulkUpdateVideoSEO();
    console.log("✅ Video SEO update completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();'

# Profile SEO Update Script
PROFILE_SEO_SCRIPT='import { bulkUpdateProfileSEO } from "../lib/profile-seo-optimizer";

async function main() {
  console.log("👤 Starting bulk profile SEO update...");
  try {
    await bulkUpdateProfileSEO();
    console.log("✅ Profile SEO update completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();'

# Scripts erstellen
create_script "update-video-seo.ts" "$VIDEO_SEO_SCRIPT"
create_script "update-profile-seo.ts" "$PROFILE_SEO_SCRIPT"

echo ""
print_status "Welche Updates möchtest du durchführen?"
echo ""
echo "1) Video-SEO Update (Alle Videos)"
echo "2) Profile-SEO Update (Alle Profile)"
echo "3) Beide Updates"
echo "4) Abbrechen"
echo ""
read -p "Auswahl (1-4): " choice

case $choice in
    1)
        print_status "Starte Video-SEO Update..."
        npx tsx scripts/update-video-seo.ts
        ;;
    2)
        print_status "Starte Profile-SEO Update..."
        npx tsx scripts/update-profile-seo.ts
        ;;
    3)
        print_status "Starte beide Updates..."
        print_status "1/2 - Video-SEO Update..."
        npx tsx scripts/update-video-seo.ts
        echo ""
        print_status "2/2 - Profile-SEO Update..."
        npx tsx scripts/update-profile-seo.ts
        ;;
    4)
        print_warning "Abgebrochen"
        exit 0
        ;;
    *)
        print_warning "Ungültige Auswahl"
        exit 1
        ;;
esac

echo ""
print_success "Alle Updates abgeschlossen! 🎉"
echo ""
print_status "Nächste Schritte:"
echo "  1. Google Search Console: Sitemaps submitten"
echo "  2. Bing Webmaster: Site verifizieren"
echo "  3. Analytics: Tracking prüfen"
echo "  4. Performance: Core Web Vitals messen"
echo ""
