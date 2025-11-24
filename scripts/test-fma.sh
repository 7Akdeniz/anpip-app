#!/bin/bash

# FMA Integration Test Script
# Testet alle FMA-Features automatisch

echo "🧪 FMA Integration Tests"
echo "======================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

# Helper function
test_feature() {
    local name=$1
    local result=$2
    
    if [ "$result" -eq 0 ]; then
        echo -e "${GREEN}✅ $name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ $name${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "1️⃣ Testing File Structure..."
echo ""

# Test: Types exist
test -f types/fma-music.ts
test_feature "types/fma-music.ts exists" $?

# Test: Service exists
test -f lib/fma-service.ts
test_feature "lib/fma-service.ts exists" $?

# Test: Cache Manager exists
test -f lib/fma-cache-manager.ts
test_feature "lib/fma-cache-manager.ts exists" $?

# Test: Edge Function exists
test -f supabase/functions/fma-music/index.ts
test_feature "Edge Function exists" $?

# Test: Components exist
test -f components/music/FMAMusicBrowser.tsx
test_feature "FMAMusicBrowser component exists" $?

test -f components/music/FMAMusicPlayer.tsx
test_feature "FMAMusicPlayer component exists" $?

test -f components/MusicSourceSelector.tsx
test_feature "MusicSourceSelector component exists" $?

# Test: Context exists
test -f contexts/UnifiedMusicContext.tsx
test_feature "UnifiedMusicContext exists" $?

# Test: Screen exists
test -f app/fma-music.tsx
test_feature "FMA Screen exists" $?

# Test: Migration exists
test -f supabase/migrations/20241124_fma_integration.sql
test_feature "Database migration exists" $?

# Test: Docs exist
test -f docs/FMA_INTEGRATION.md
test_feature "FMA_INTEGRATION.md exists" $?

test -f docs/FMA_QUICK_START.md
test_feature "FMA_QUICK_START.md exists" $?

echo ""
echo "2️⃣ Testing Dependencies..."
echo ""

# Test: AsyncStorage installed
if grep -q "@react-native-async-storage/async-storage" package.json; then
    test_feature "AsyncStorage dependency" 0
else
    test_feature "AsyncStorage dependency" 1
fi

echo ""
echo "3️⃣ Testing Environment Setup..."
echo ""

# Test: FMA_API_KEY in .env
if [ -f .env ] && grep -q "FMA_API_KEY" .env; then
    test_feature "FMA_API_KEY in .env" 0
else
    test_feature "FMA_API_KEY in .env" 1
    echo -e "${YELLOW}   ℹ️  Add FMA_API_KEY to .env file${NC}"
fi

echo ""
echo "4️⃣ Testing TypeScript Compilation..."
echo ""

# Test: Types compile
if command -v npx &> /dev/null; then
    npx tsc --noEmit types/fma-music.ts &> /dev/null
    test_feature "TypeScript types compile" $?
else
    echo -e "${YELLOW}   ⚠️  TypeScript not available, skipping compile test${NC}"
fi

echo ""
echo "======================="
echo "📊 Test Results"
echo "======================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Get FMA API Key: https://freemusicarchive.org/api"
    echo "2. Set secret: supabase secrets set FMA_API_KEY=your_key"
    echo "3. Deploy: supabase functions deploy fma-music"
    echo "4. Run migration: supabase db push supabase/migrations/20241124_fma_integration.sql"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi
