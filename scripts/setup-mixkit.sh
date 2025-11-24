#!/bin/bash

# MIXKIT MUSIC SETUP SCRIPT
# Schnelle Einrichtung der Mixkit-Integration

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎵 MIXKIT MUSIC INTEGRATION - SETUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Environment Variables
echo "📋 Checking environment variables..."
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL nicht gesetzt"
  echo "   export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co"
  exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY nicht gesetzt"
  echo "   export SUPABASE_SERVICE_ROLE_KEY=your-service-key"
  exit 1
fi

echo "✅ Environment variables OK"
echo ""

# Install Dependencies
echo "📦 Installing dependencies..."
npm install --save-dev axios music-metadata
echo "✅ Dependencies installed"
echo ""

# Database Migration
echo "💾 Running database migration..."
if command -v supabase &> /dev/null; then
  echo "   Using Supabase CLI..."
  supabase db push
else
  echo "⚠️  Supabase CLI not found"
  echo "   Please run migration manually:"
  echo "   1. Open Supabase Dashboard → SQL Editor"
  echo "   2. Copy & paste: supabase/migrations/20241124_mixkit_integration.sql"
  echo "   3. Run migration"
  echo ""
  read -p "   Continue? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Setup aborted"
    exit 1
  fi
fi
echo "✅ Database migration complete"
echo ""

# Create temp directory
echo "📁 Creating temp directory..."
mkdir -p temp/mixkit-downloads
echo "✅ Temp directory created"
echo ""

# Download & Upload Tracks
echo "🎵 Starting track download & upload..."
echo "   This may take several minutes..."
echo ""
npx ts-node scripts/mixkit-downloader.ts

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MIXKIT MUSIC SETUP COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Next steps:"
echo "   1. Start your app: npm run dev"
echo "   2. Navigate to: /mixkit-music"
echo "   3. Browse and enjoy free music!"
echo ""
echo "📚 Documentation:"
echo "   docs/MIXKIT_INTEGRATION.md"
echo ""
echo "🎉 Happy coding!"
echo ""
