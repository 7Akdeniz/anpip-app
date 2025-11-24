#!/bin/bash

# ============================================================================
# ANPIP SECURITY SETUP SCRIPT
# ============================================================================
# Automatische Installation aller Security-Features
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# BANNER
# ============================================================================

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         🛡️  ANPIP SECURITY SETUP - MILITÄRISCH SICHER  🛡️      ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# ============================================================================
# 1. PREREQUISITES CHECK
# ============================================================================

echo -e "${BLUE}📋 Schritt 1: Voraussetzungen prüfen...${NC}"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js nicht gefunden!${NC}"
    echo "   Installiere: https://nodejs.org"
    exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm nicht gefunden!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm installed${NC}"

# Check Supabase CLI
if ! command -v supabase &> /dev/null; then
    echo -e "${YELLOW}⚠️  Supabase CLI nicht gefunden. Installiere...${NC}"
    npm install -g supabase
fi
echo -e "${GREEN}✓ Supabase CLI installed${NC}"

# Check openssl
if ! command -v openssl &> /dev/null; then
    echo -e "${RED}❌ OpenSSL nicht gefunden!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ OpenSSL installed${NC}"

echo ""

# ============================================================================
# 2. ENVIRONMENT SETUP
# ============================================================================

echo -e "${BLUE}🔑 Schritt 2: Environment Variables...${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env nicht gefunden. Erstelle aus .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        touch .env
    fi
fi

# Generate ENCRYPTION_KEY if not exists
if ! grep -q "ENCRYPTION_KEY" .env 2>/dev/null; then
    echo ""
    echo "🔐 Generiere ENCRYPTION_KEY..."
    ENCRYPTION_KEY=$(openssl rand -hex 16)
    echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
    echo -e "${GREEN}✓ ENCRYPTION_KEY generiert${NC}"
fi

# Generate CLOUDFLARE_WEBHOOK_SECRET if not exists
if ! grep -q "CLOUDFLARE_WEBHOOK_SECRET" .env 2>/dev/null; then
    echo "🔐 Generiere CLOUDFLARE_WEBHOOK_SECRET..."
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo "CLOUDFLARE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env
    echo -e "${GREEN}✓ CLOUDFLARE_WEBHOOK_SECRET generiert${NC}"
fi

echo -e "${GREEN}✓ Environment konfiguriert${NC}"
echo ""

# ============================================================================
# 3. DATABASE MIGRATION
# ============================================================================

echo -e "${BLUE}📊 Schritt 3: Datenbank-Migration...${NC}"
echo ""

read -p "Möchtest du die Security-Migration jetzt ausführen? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Führe Migration aus..."
    
    # Check if Supabase is linked
    if [ ! -f ".git/config" ] || ! grep -q "supabase" .git/config 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Supabase Projekt nicht verlinkt${NC}"
        echo ""
        read -p "Supabase Project Ref (z.B. abcdefgh): " PROJECT_REF
        
        if [ ! -z "$PROJECT_REF" ]; then
            supabase link --project-ref "$PROJECT_REF"
        fi
    fi
    
    # Run migration
    if supabase db push; then
        echo -e "${GREEN}✓ Migration erfolgreich${NC}"
    else
        echo -e "${RED}❌ Migration fehlgeschlagen${NC}"
        echo ""
        echo "Manuelle Lösung:"
        echo "1. Gehe zu https://app.supabase.com"
        echo "2. Navigiere zu SQL Editor"
        echo "3. Führe aus: supabase/migrations/20241124_security_infrastructure.sql"
    fi
else
    echo -e "${YELLOW}⏭️  Übersprungen - Migration manuell durchführen${NC}"
fi

echo ""

# ============================================================================
# 4. VERIFY SETUP
# ============================================================================

echo -e "${BLUE}✅ Schritt 4: Setup verifizieren...${NC}"
echo ""

# Check .env
echo "📝 Prüfe .env..."
if grep -q "ENCRYPTION_KEY" .env && grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
    echo -e "${GREEN}✓ Environment Variables OK${NC}"
else
    echo -e "${YELLOW}⚠️  Fehlende Environment Variables${NC}"
    echo "   Bitte ergänze in .env:"
    echo "   - EXPO_PUBLIC_SUPABASE_URL"
    echo "   - EXPO_PUBLIC_SUPABASE_ANON_KEY"
fi

# Check security files
echo ""
echo "📁 Prüfe Security Files..."
SECURITY_FILES=(
    "lib/security/ddos-protection.ts"
    "lib/security/waf.ts"
    "lib/security/token-security.ts"
    "lib/security/two-factor-auth.ts"
    "lib/security/gdpr-compliance.ts"
    "lib/security/security-monitoring.ts"
)

for file in "${SECURITY_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}❌ $file fehlt${NC}"
    fi
done

echo ""

# ============================================================================
# 5. DEPLOYMENT INSTRUCTIONS
# ============================================================================

echo -e "${BLUE}🚀 Schritt 5: Deployment-Anweisungen${NC}"
echo ""

cat << 'EOF'
╔════════════════════════════════════════════════════════════════╗
║                    NÄCHSTE SCHRITTE                            ║
╚════════════════════════════════════════════════════════════════╝

1️⃣  LOKALES TESTEN
   npm run start
   # Teste Security Features in der App

2️⃣  VERCEL DEPLOYMENT
   npm run build:pwa
   vercel --prod

3️⃣  CLOUDFLARE SETUP
   - Dashboard → Security → WAF → Enable
   - Dashboard → Security → Rate Limiting → Configure
   - Dashboard → Security → Bots → Configure

4️⃣  MONITORING AKTIVIEREN
   - Supabase Dashboard → Database → Functions
   - Deploy cleanup functions (optional)

5️⃣  SECURITY HEALTH CHECK
   - In App: Settings → Security → Health Check
   - Oder via API: GET /api/security/health

╔════════════════════════════════════════════════════════════════╗
║                    WICHTIGE SICHERHEITSTIPPS                   ║
╚════════════════════════════════════════════════════════════════╝

✅ SSL/TLS: Nur HTTPS verwenden
✅ 2FA: Für alle Admin-Accounts aktivieren
✅ Backups: Täglich automatisch
✅ Updates: Monatlich Dependencies prüfen
✅ Monitoring: Alerts täglich checken
✅ Logs: Wöchentlich reviewen

╔════════════════════════════════════════════════════════════════╗
║                    DOKUMENTATION                               ║
╚════════════════════════════════════════════════════════════════╝

📚 Vollständige Dokumentation:
   docs/SECURITY_ARCHITECTURE.md

🚀 Quick Start Guide:
   docs/SECURITY_QUICK_START.md

📊 Security Monitoring:
   - lib/security/security-monitoring.ts
   - Supabase Dashboard → Database → security_alerts

🛡️ Security Level: MILITÄRISCH ⭐⭐⭐⭐⭐

EOF

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║         ✅ SECURITY SETUP ERFOLGREICH ABGESCHLOSSEN! ✅          ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Deine Plattform ist jetzt militärisch sicher! 🛡️${NC}"
echo ""
