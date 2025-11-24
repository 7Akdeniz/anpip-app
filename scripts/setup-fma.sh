#!/bin/bash

# FMA Integration Setup Script
# Automatisiert die komplette Installation

set -e  # Exit on error

echo "🎵 FMA Integration Setup - Anpip.com"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================
# 1. Check Prerequisites
# ============================================

echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Check npm/yarn
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed${NC}"

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI not found. Installing...${NC}"
    npm install -g supabase
fi
echo -e "${GREEN}✓ Supabase CLI installed${NC}"

echo ""

# ============================================
# 2. Install Dependencies
# ============================================

echo "📦 Installing dependencies..."

# React Native AsyncStorage
if grep -q "expo" package.json; then
    echo "Installing with Expo..."
    npx expo install @react-native-async-storage/async-storage
else
    echo "Installing with npm..."
    npm install @react-native-async-storage/async-storage
fi

echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# ============================================
# 3. Setup Environment Variables
# ============================================

echo "🔑 Setup Environment Variables"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating...${NC}"
    cp .env.example .env 2>/dev/null || touch .env
fi

# Prompt for FMA API Key
read -p "Enter your FMA API Key (or press Enter to skip): " FMA_API_KEY

if [ ! -z "$FMA_API_KEY" ]; then
    # Add to .env if not exists
    if ! grep -q "FMA_API_KEY" .env; then
        echo "FMA_API_KEY=$FMA_API_KEY" >> .env
        echo -e "${GREEN}✓ FMA_API_KEY added to .env${NC}"
    else
        echo -e "${YELLOW}⚠️  FMA_API_KEY already exists in .env${NC}"
    fi
    
    # Set Supabase Secret
    echo "Setting Supabase Secret..."
    supabase secrets set FMA_API_KEY="$FMA_API_KEY" 2>/dev/null || echo -e "${YELLOW}⚠️  Could not set Supabase secret (run manually: supabase secrets set FMA_API_KEY=...)${NC}"
else
    echo -e "${YELLOW}⚠️  FMA API Key skipped. Remember to add it later!${NC}"
fi

echo ""

# ============================================
# 4. Database Migration
# ============================================

echo "🗄️  Running Database Migration..."

# Check if Supabase is linked
if supabase status &> /dev/null; then
    echo "Running migration..."
    supabase db push supabase/migrations/20241124_fma_integration.sql 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not run migration automatically${NC}"
        echo "Run manually: supabase db push supabase/migrations/20241124_fma_integration.sql"
    }
    echo -e "${GREEN}✓ Database migration completed${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase not linked. Run migration manually:${NC}"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo "   supabase db push supabase/migrations/20241124_fma_integration.sql"
fi

echo ""

# ============================================
# 5. Deploy Edge Function
# ============================================

echo "🚀 Deploying Edge Function..."

if supabase status &> /dev/null; then
    echo "Deploying fma-music function..."
    supabase functions deploy fma-music 2>/dev/null || {
        echo -e "${YELLOW}⚠️  Could not deploy function automatically${NC}"
        echo "Run manually: supabase functions deploy fma-music"
    }
    echo -e "${GREEN}✓ Edge function deployed${NC}"
else
    echo -e "${YELLOW}⚠️  Supabase not linked. Deploy manually:${NC}"
    echo "   supabase functions deploy fma-music"
fi

echo ""

# ============================================
# 6. Setup Complete
# ============================================

echo ""
echo "============================================"
echo -e "${GREEN}🎉 FMA Integration Setup Complete!${NC}"
echo "============================================"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Get FMA API Key (if not done):"
echo "   https://freemusicarchive.org/api"
echo ""
echo "2. Set Environment Variable:"
echo "   supabase secrets set FMA_API_KEY=your_key_here"
echo ""
echo "3. Test the integration:"
echo "   Open app and navigate to /fma-music"
echo ""
echo "4. Read the documentation:"
echo "   docs/FMA_INTEGRATION.md"
echo ""
echo "============================================"
echo ""

# ============================================
# 7. Optional: Test API
# ============================================

read -p "Do you want to test the FMA API connection? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🧪 Testing FMA API..."
    
    SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2)
    
    if [ -z "$SUPABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  EXPO_PUBLIC_SUPABASE_URL not found in .env${NC}"
        echo "Cannot test API connection."
    else
        echo "Testing connection to: $SUPABASE_URL/functions/v1/fma-music"
        echo ""
        echo "Test with:"
        echo "curl -X GET \"$SUPABASE_URL/functions/v1/fma-music?action=search&q=jazz&per_page=5\" \\"
        echo "  -H \"Authorization: Bearer YOUR_USER_TOKEN\""
    fi
fi

echo ""
echo -e "${GREEN}✅ Setup script finished!${NC}"
echo ""

exit 0
