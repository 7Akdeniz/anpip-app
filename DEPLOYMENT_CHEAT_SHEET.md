# 🚀 ANPIP DEPLOYMENT CHEAT SHEET
## One-Page Reference für komplettes Deployment

---

## ⚡ QUICK DEPLOY (3 Minuten)

```bash
# 1. Setup
git clone https://github.com/7Akdeniz/anpip-app.git && cd anpip-app
./setup.sh

# 2. Configure
cp .env.example .env.local
# Edit .env.local mit deinen Keys

# 3. Deploy
vercel deploy --prod
```

**Done! ✅**

---

## 🗄️ DATABASE SETUP (Supabase)

### Option 1: Supabase Dashboard
```
1. Gehe zu https://app.supabase.com
2. Create New Project
3. SQL Editor öffnen
4. Führe aus (in Reihenfolge):
   - supabase/migrations/20241121_world_timeline_engine.sql
   - supabase/migrations/20241121_ai_actors_system.sql
5. Done!
```

### Option 2: CLI
```bash
supabase login
supabase link --project-ref your-project-ref
supabase db reset
```

---

## 🌍 ENVIRONMENT VARIABLES

**Minimal (.env.local):**
```bash
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Vercel (Auto-set)
VERCEL_URL=auto-detected
```

**Production (.env.production):**
```bash
# AI Services
OPENAI_API_KEY=sk-xxx
ELEVENLABS_API_KEY=xxx
DEEPL_API_KEY=xxx

# CDN
CLOUDFLARE_API_TOKEN=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx

# Analytics
NEXT_PUBLIC_GA_ID=G-xxx
SENTRY_DSN=https://xxx
```

---

## 🐳 DOCKER DEPLOYMENT

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.production.yml up -d

# Scale services
docker-compose scale anpip-web=10 video-transcoding=5
```

---

## ☸️ KUBERNETES DEPLOYMENT

### Quick Deploy
```bash
kubectl apply -f kubernetes/production-deployment.yaml

# Check status
kubectl get pods -n production
kubectl get svc -n production

# View logs
kubectl logs -f deployment/anpip-web -n production
```

### Scale
```bash
kubectl scale deployment anpip-web --replicas=50 -n production
```

### Update
```bash
kubectl set image deployment/anpip-web web=anpip/web:v2.0
kubectl rollout status deployment/anpip-web
```

---

## 🏗️ TERRAFORM DEPLOYMENT

```bash
cd terraform

# Initialize
terraform init

# Preview
terraform plan

# Deploy
terraform apply -auto-approve

# Destroy (careful!)
terraform destroy
```

---

## 📦 BUILD COMMANDS

```bash
# Web Production Build
npm run build
npm run export          # Static export
npm run start           # Production server

# Mobile Build
npx expo build:android
npx expo build:ios
eas build --platform all   # EAS Build
```

---

## 🔄 CI/CD (GitHub Actions)

**Auto-deploys on:**
- Push to `main` → Vercel Production
- Push to `dev` → Vercel Preview
- Pull Request → Preview Deployment

**Manual Deploy:**
```bash
git push origin main
```

---

## 🌐 VERCEL DEPLOYMENT

### CLI
```bash
vercel login
vercel link
vercel deploy --prod
```

### Auto-Deploy
```
Push to main branch → Auto-deploy
```

### Environment Variables
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
```

---

## 📊 MONITORING SETUP

### Grafana + Prometheus
```bash
docker-compose up prometheus grafana -d

# Access
http://localhost:3001  # Grafana (admin/admin)
http://localhost:9090  # Prometheus
```

### Sentry (Error Tracking)
```bash
npm install @sentry/nextjs
# Add to next.config.js
```

---

## 🔐 SSL/TLS SETUP

### Cloudflare (Recommended)
```
1. Add domain to Cloudflare
2. Set DNS to Cloudflare nameservers
3. Enable "Full (Strict)" SSL
4. Enable "Always Use HTTPS"
Done!
```

### Let's Encrypt (Manual)
```bash
certbot certonly --standalone -d anpip.com -d www.anpip.com
```

---

## 🚦 HEALTH CHECKS

```bash
# App Health
curl https://anpip.com/health

# API Health
curl https://anpip.com/api/health

# Database
curl https://xxx.supabase.co/rest/v1/

# CDN
curl -I https://cdn.anpip.com
```

---

## 🐛 TROUBLESHOOTING

### App won't start
```bash
rm -rf node_modules .next
npm install
npm run dev
```

### Database errors
```bash
supabase db reset
supabase db push
```

### Build fails
```bash
npm run lint -- --fix
npx tsc --noEmit
```

### Slow performance
```bash
# Clear cache
redis-cli FLUSHALL

# Rebuild CDN
vercel --prod --force
```

---

## 📈 SCALING CHECKLIST

**10K Users:**
- ✅ Vercel Hobby/Pro
- ✅ Supabase Free/Pro
- ✅ Cloudflare Free

**100K Users:**
- ✅ Vercel Pro
- ✅ Supabase Pro
- ✅ Cloudflare Pro
- ✅ Redis Cache

**1M Users:**
- ✅ Kubernetes (3 nodes)
- ✅ Supabase Team
- ✅ Cloudflare Business
- ✅ Multi-Region DB

**10M+ Users:**
- ✅ Kubernetes (20+ nodes)
- ✅ Supabase Enterprise
- ✅ Cloudflare Enterprise
- ✅ Multi-Cloud (AWS+GCP)
- ✅ GPU Cluster

---

## 💰 COST ESTIMATION

### Startup (0-10K Users)
- Vercel: $0-20/mo
- Supabase: $0-25/mo
- Cloudflare: $0/mo
- **Total: $0-45/mo**

### Growth (10K-100K Users)
- Vercel: $150/mo
- Supabase: $599/mo
- Cloudflare: $200/mo
- Redis: $50/mo
- **Total: ~$1,000/mo**

### Scale (100K-1M Users)
- Infrastructure: $5-10K/mo
- CDN: $2K/mo
- Database: $2K/mo
- AI Services: $3K/mo
- **Total: ~$15K/mo**

---

## 🔧 USEFUL COMMANDS

```bash
# Kill stuck processes
lsof -ti:8081 | xargs kill -9

# Clear Expo cache
npx expo start --clear

# Reset everything
rm -rf node_modules .expo .next
npm install

# Database backup
supabase db dump > backup.sql

# Restore database
psql < backup.sql

# View logs
vercel logs anpip-app
kubectl logs -f <pod>
docker logs -f <container>
```

---

## 🎯 PRE-LAUNCH CHECKLIST

**Code:**
- [ ] All 13 systems tested
- [ ] TypeScript compiles
- [ ] Linter passes
- [ ] Build succeeds

**Database:**
- [ ] Migrations applied
- [ ] RLS policies active
- [ ] Backups configured
- [ ] Indexes optimized

**Security:**
- [ ] SSL/TLS enabled
- [ ] API keys secured
- [ ] CORS configured
- [ ] Rate limiting enabled

**Performance:**
- [ ] CDN configured
- [ ] Images optimized
- [ ] Caching enabled
- [ ] Load tested

**Monitoring:**
- [ ] Error tracking (Sentry)
- [ ] Analytics (GA)
- [ ] Uptime monitoring
- [ ] Alerts configured

---

## 📞 SUPPORT

**Emergency:**
- Check status: https://status.anpip.com
- Rollback: `vercel rollback`
- Contact: emergency@anpip.com

**General:**
- Docs: https://docs.anpip.com
- Discord: https://discord.gg/anpip
- Email: support@anpip.com

---

<div align="center">

## 🚀 DEPLOY NOW

```bash
./setup.sh && vercel deploy --prod
```

**Time to dominate: ~3 minutes** ⚡

</div>
