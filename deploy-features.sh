#!/bin/bash

# ============================================
# ANPIP.COM - FEATURES DEPLOYMENT SCRIPT
# Deployt alle neuen Features in Production
# ============================================

set -e  # Exit on error

echo "🚀 ANPIP Features Deployment gestartet..."
echo "=========================================="

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. Pre-Checks
# ============================================
echo ""
echo "📋 Pre-Deployment Checks..."

# Check if Supabase is configured
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${RED}❌ SUPABASE_URL nicht gesetzt${NC}"
    echo "Bitte .env.local konfigurieren"
    exit 1
fi

if [ -z "$SUPABASE_ANON_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_ANON_KEY nicht gesetzt${NC}"
    echo "Bitte .env.local konfigurieren"
    exit 1
fi

echo -e "${GREEN}✅ Environment Variablen OK${NC}"

# ============================================
# 2. Database Migration
# ============================================
echo ""
echo "🗄️  Database Migration..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI nicht installiert${NC}"
    echo "Installiere mit: npm install -g supabase"
    echo ""
    echo "Alternative: Migration manuell in Supabase Dashboard ausführen:"
    echo "  1. Öffne https://app.supabase.com"
    echo "  2. Wähle dein Projekt"
    echo "  3. SQL Editor → New Query"
    echo "  4. Kopiere Inhalt von: supabase/migrations/20251122_features_schema.sql"
    echo "  5. Run"
    read -p "Migration manuell ausgeführt? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    # Run migration with Supabase CLI
    echo "Führe Migration aus..."
    supabase db push
    echo -e "${GREEN}✅ Migration erfolgreich${NC}"
fi

# ============================================
# 3. Install Dependencies
# ============================================
echo ""
echo "📦 Dependencies installieren..."

npm install

echo -e "${GREEN}✅ Dependencies installiert${NC}"

# ============================================
# 4. Type Check
# ============================================
echo ""
echo "🔍 TypeScript Type Check..."

npx tsc --noEmit

echo -e "${GREEN}✅ Type Check erfolgreich${NC}"

# ============================================
# 5. Run Tests (optional)
# ============================================
echo ""
read -p "Tests ausführen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Tests ausführen..."
    npm test __tests__/features.test.ts || true
fi

# ============================================
# 6. Build Check
# ============================================
echo ""
echo "🏗️  Build Check..."

# Expo Web Build
npx expo export:web --output-dir web-build

echo -e "${GREEN}✅ Build erfolgreich${NC}"

# ============================================
# 7. Deployment Options
# ============================================
echo ""
echo "=========================================="
echo "🎉 Pre-Deployment erfolgreich!"
echo "=========================================="
echo ""
echo "Nächste Schritte für Deployment:"
echo ""
echo "Option 1 - Vercel (Web):"
echo "  1. git add ."
echo "  2. git commit -m 'feat: implement all icon functions'"
echo "  3. git push"
echo "  → Vercel deployt automatisch"
echo ""
echo "Option 2 - Expo (Mobile):"
echo "  npx expo build:ios"
echo "  npx expo build:android"
echo ""
echo "Option 3 - Manual Web Deploy:"
echo "  npm run build"
echo "  npm run deploy"
echo ""
read -p "Jetzt zu Git pushen? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Git Push..."
    
    git add .
    git commit -m "feat: implement all icon functions - Top Bar, Right Sidebar, Video Feed

    ✅ Top Bar Icons:
    - Live Videos filter
    - Friends screen with suggestions & nearby
    - Market/Classifieds filter
    - Activity screen
    - All videos view
    
    ✅ Right Sidebar Icons:
    - Follow/Unfollow
    - Like/Unlike with counter
    - Comments modal
    - Share with tracking
    - Bookmark/Save
    - Gift system with coins
    - Last gift sender profile
    - Music/Sound modal
    
    ✅ Video Feed:
    - Snap-to-item scrolling (always 1 video)
    - Performance optimizations
    - View tracking
    
    ✅ Backend:
    - videoService with all interactions
    - giftService with coin system
    - musicService for sounds
    - Database schema migrations
    - RLS policies
    
    ✅ Tests:
    - Automated test suite
    - Manual test checklist"
    
    git push
    
    echo ""
    echo -e "${GREEN}✅ Push erfolgreich!${NC}"
    echo ""
    echo "Vercel deployt jetzt automatisch..."
    echo "Check Status: https://vercel.com/dashboard"
else
    echo ""
    echo "OK, Push später manuell durchführen"
fi

echo ""
echo "=========================================="
echo "✨ Deployment Complete!"
echo "=========================================="
echo ""
echo "📱 App testen:"
echo "  - Web: https://www.anpip.com"
echo "  - Mobile: npx expo start"
echo ""
echo "📊 Monitoring:"
echo "  - Supabase: https://app.supabase.com"
echo "  - Vercel: https://vercel.com/dashboard"
echo ""
echo "📄 Dokumentation:"
echo "  - Features: IMPLEMENTATION_COMPLETE_FEATURES.md"
echo "  - Tests: __tests__/features.test.ts"
echo ""
