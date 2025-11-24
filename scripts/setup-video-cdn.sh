#!/bin/bash

# ============================================================================
# CDN & VIDEO OPTIMIZATION - QUICK SETUP
# ============================================================================

echo "🚀 Setting up CDN & Video Optimization..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ============================================================================
# 1. CHECK PREREQUISITES
# ============================================================================

echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# ============================================================================
# 2. CHECK .ENV CONFIGURATION
# ============================================================================

echo ""
echo "🔑 Checking environment variables..."

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    cp .env.example .env 2>/dev/null || touch .env
fi

# Check Cloudflare credentials
if ! grep -q "EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID not set${NC}"
    echo "   Get it from: https://dash.cloudflare.com/stream"
    echo ""
    read -p "Enter your Cloudflare Account ID (or skip): " ACCOUNT_ID
    if [ ! -z "$ACCOUNT_ID" ]; then
        echo "EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID" >> .env
        echo -e "${GREEN}✅ Added to .env${NC}"
    fi
fi

if ! grep -q "CLOUDFLARE_STREAM_API_TOKEN" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠️  CLOUDFLARE_STREAM_API_TOKEN not set${NC}"
    echo "   Create token: https://dash.cloudflare.com/profile/api-tokens"
    echo "   Permissions needed: Stream:Edit"
    echo ""
    read -p "Enter your Cloudflare Stream API Token (or skip): " API_TOKEN
    if [ ! -z "$API_TOKEN" ]; then
        echo "CLOUDFLARE_STREAM_API_TOKEN=$API_TOKEN" >> .env
        echo -e "${GREEN}✅ Added to .env${NC}"
    fi
fi

echo -e "${GREEN}✅ Environment configured${NC}"

# ============================================================================
# 3. INSTALL DEPENDENCIES (if needed)
# ============================================================================

echo ""
echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# ============================================================================
# 4. CLOUDFLARE WORKERS SETUP (Optional)
# ============================================================================

echo ""
echo "⚙️  Cloudflare Workers Setup (Optional)"
echo ""
read -p "Do you want to deploy Cloudflare Workers? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Check wrangler
    if ! command -v wrangler &> /dev/null; then
        echo "Installing Wrangler CLI..."
        npm install -g wrangler
    fi
    
    echo "Setting up Workers..."
    cd workers
    
    # Login
    echo "Please login to Cloudflare..."
    wrangler login
    
    # Create KV Namespace
    echo "Creating KV Namespace..."
    wrangler kv:namespace create "VIDEO_CACHE"
    
    echo -e "${YELLOW}⚠️  Copy the KV Namespace ID to workers/wrangler.toml${NC}"
    echo ""
    read -p "Press enter when done..."
    
    # Deploy
    echo "Deploying Worker..."
    wrangler publish
    
    cd ..
    echo -e "${GREEN}✅ Workers deployed${NC}"
else
    echo "Skipping Workers deployment."
fi

# ============================================================================
# 5. VERIFY SETUP
# ============================================================================

echo ""
echo "🔍 Verifying setup..."

# Check if OptimizedVideoPlayer exists
if [ -f "components/OptimizedVideoPlayer.tsx" ]; then
    echo -e "${GREEN}✅ OptimizedVideoPlayer.tsx${NC}"
else
    echo -e "${RED}❌ OptimizedVideoPlayer.tsx not found${NC}"
fi

# Check if cdn-config exists
if [ -f "lib/video/cdn-config.ts" ]; then
    echo -e "${GREEN}✅ lib/video/cdn-config.ts${NC}"
else
    echo -e "${RED}❌ lib/video/cdn-config.ts not found${NC}"
fi

# Check if video-preloader exists
if [ -f "lib/video/video-preloader.ts" ]; then
    echo -e "${GREEN}✅ lib/video/video-preloader.ts${NC}"
else
    echo -e "${RED}❌ lib/video/video-preloader.ts not found${NC}"
fi

# ============================================================================
# 6. DEPLOYMENT INSTRUCTIONS
# ============================================================================

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo "========================================"
echo ""
echo "📚 Next Steps:"
echo ""
echo "1. Update your components to use OptimizedVideoPlayer:"
echo "   import OptimizedVideoPlayer from '@/components/OptimizedVideoPlayer';"
echo ""
echo "2. Test locally:"
echo "   npm run web"
echo ""
echo "3. Deploy to Vercel:"
echo "   vercel --prod"
echo ""
echo "4. Read full documentation:"
echo "   docs/CDN_VIDEO_OPTIMIZATION.md"
echo ""
echo "🎯 Performance Goals:"
echo "   - Video Start: < 1 second ⚡"
echo "   - Buffering: < 2% 🎯"
echo "   - Quality: Adaptive 240p-1080p 📊"
echo "   - CDN: 300+ Global Locations 🌍"
echo ""
echo "🏆 Target: Top 1% Video Performance Worldwide!"
echo ""
