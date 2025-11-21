#!/bin/bash

# ========================================
# ANPIP.COM - QUICK START SETUP
# ========================================
# Vollautomatisches Setup aller 13 Systeme

set -e

echo "🚀 ANPIP.COM - MASTER SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ==================== ENVIRONMENT CHECK ====================
echo "🔍 Checking environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Check Expo CLI
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g expo-cli
fi
echo "✅ Expo CLI installed"

# ==================== INSTALLATION ====================
echo ""
echo "📦 Installing dependencies..."
npm install

# Install Expo dependencies
npx expo install

echo "✅ Dependencies installed"

# ==================== DATABASE SETUP ====================
echo ""
echo "🗄️ Setting up database..."

if [ -f .env.local ]; then
    echo "✅ .env.local found"
else
    echo "⚠️  Creating .env.local from template..."
    cat > .env.local << EOF
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Vercel
VERCEL_URL=your-vercel-url

# AI Services (Optional - für Production)
OPENAI_API_KEY=your-openai-key
ELEVENLABS_API_KEY=your-elevenlabs-key
DEEPL_API_KEY=your-deepl-key

# CDN (Optional - für Production)
CLOUDFLARE_API_TOKEN=your-cloudflare-token
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
EOF
    echo "⚠️  Please configure .env.local with your credentials"
fi

# ==================== APPLY MIGRATIONS ====================
echo ""
echo "🔄 Applying database migrations..."

if command -v supabase &> /dev/null; then
    echo "📊 Running Supabase migrations..."
    supabase db reset
    echo "✅ Migrations applied"
else
    echo "⚠️  Supabase CLI not found. Please apply migrations manually:"
    echo "   1. Go to https://app.supabase.com"
    echo "   2. Navigate to SQL Editor"
    echo "   3. Run files in supabase/migrations/"
fi

# ==================== BUILD CHECK ====================
echo ""
echo "🏗️ Checking TypeScript compilation..."
npx tsc --noEmit
echo "✅ TypeScript OK"

# ==================== INITIALIZE SYSTEMS ====================
echo ""
echo "🤖 Initializing ANPIP Master Engine..."

cat > temp-init.ts << 'EOF'
import { anpipMaster } from './lib/anpip-master-engine';

async function init() {
  await anpipMaster.initialize();
  console.log('✅ All 13 systems initialized!');
  process.exit(0);
}

init().catch(error => {
  console.error('❌ Initialization failed:', error);
  process.exit(1);
});
EOF

npx ts-node temp-init.ts
rm temp-init.ts

# ==================== SUMMARY ====================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ANPIP.COM SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 INSTALLED SYSTEMS:"
echo "  1. ✅ World Timeline Engine"
echo "  2. ✅ AI Actors System"
echo "  3. ✅ Personal AI Feed"
echo "  4. ✅ ANPIP Search Engine"
echo "  5. ✅ Region Trend Engine"
echo "  6. ✅ Media OS"
echo "  7. ✅ KI Autopilot"
echo "  8. ✅ Creator Ecosystem"
echo "  9. ✅ Super-Security Stack"
echo " 10. ✅ Netflix-Level Infrastructure"
echo " 11. ✅ ANPIP Ad Exchange"
echo " 12. ✅ 50-Sprachen-System"
echo " 13. ✅ Future Systems"
echo ""
echo "🚀 QUICK START:"
echo ""
echo "  Development:"
echo "    npm run dev          # Web development"
echo "    npx expo start       # Mobile development"
echo ""
echo "  Production:"
echo "    npm run build        # Build for production"
echo "    vercel deploy        # Deploy to Vercel"
echo ""
echo "  Infrastructure:"
echo "    docker-compose -f docker-compose.production.yml up"
echo "    kubectl apply -f kubernetes/production-deployment.yaml"
echo "    cd terraform && terraform apply"
echo ""
echo "📚 DOCUMENTATION:"
echo "    MASTER_BLUEPRINT_2025.md     # Complete overview"
echo "    ARCHITECTURE.md              # Technical details"
echo "    DEPLOYMENT_GUIDE.md          # Deployment guide"
echo ""
echo "🌍 NEXT STEPS:"
echo "  1. Configure .env.local with your API keys"
echo "  2. Apply database migrations via Supabase Dashboard"
echo "  3. Run 'npx expo start' for development"
echo "  4. Deploy to production with 'vercel deploy --prod'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 READY TO DOMINATE THE WORLD!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
