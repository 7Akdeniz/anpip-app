#!/bin/zsh
# Quick environment + API checks for Anpip
# Usage: ./scripts/check-env-and-apis.sh

set -euo pipefail

echo "Checking important env vars..."
: ${EXPO_PUBLIC_SUPABASE_URL:?"EXPO_PUBLIC_SUPABASE_URL not set"}
: ${EXPO_PUBLIC_SUPABASE_ANON_KEY:?"EXPO_PUBLIC_SUPABASE_ANON_KEY not set"}

echo "EXPO_PUBLIC_SUPABASE_URL=$EXPO_PUBLIC_SUPABASE_URL"
# Don't echo keys in logs by default
if [[ -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  echo "SUPABASE_SERVICE_ROLE_KEY not set (ok for client-only checks)"
else
  echo "SUPABASE_SERVICE_ROLE_KEY is set"
fi

echo "\nTesting Supabase REST (anon) - /videos?limit=1"
curl -s -S -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
  "$EXPO_PUBLIC_SUPABASE_URL/rest/v1/videos?select=id,title&limit=1" | jq || true

echo "\nTesting API proxy (api.anpip.com) - /rest/v1/videos?limit=1"
if command -v jq >/dev/null 2>&1; then
  curl -s -S -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
    "https://api.anpip.com/rest/v1/videos?select=id,title&limit=1" | jq || true
else
  curl -v -H "apikey: $EXPO_PUBLIC_SUPABASE_ANON_KEY" \
    "https://api.anpip.com/rest/v1/videos?select=id,title&limit=1" || true
fi

echo "\nDone. If any check fails, set the missing env vars (local .env or in Vercel) and restart the dev server."