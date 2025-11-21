# 🎯 SCHNELLSTART-GUIDE - ANPIP.COM

## 🚀 In 5 Minuten live!

### **1. Repository klonen**
```bash
git clone https://github.com/yourusername/anpip-app.git
cd anpip-app
```

### **2. Dependencies installieren**
```bash
npm install
```

### **3. Supabase Setup**
```bash
# Supabase CLI installieren
npm install -g supabase

# Supabase Projekt initialisieren
supabase init

# Mit Supabase verbinden
supabase link --project-ref your-project-ref

# Migrationen ausführen
supabase db push
```

### **4. Environment-Variablen**
```bash
# .env erstellen
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EOF
```

### **5. Edge Functions deployen**
```bash
supabase functions deploy initialize-upload
supabase functions deploy get-chunk-upload-url
supabase functions deploy finalize-upload
supabase functions deploy process-video
```

### **6. App starten**
```bash
# Development
npm start

# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

---

## 🎬 VIDEO-UPLOAD TESTEN

```bash
# 1. App öffnen
# 2. Auf Upload-Button tippen
# 3. Video auswählen (bis 2 Stunden)
# 4. Upload startet automatisch
# 5. Fortschritt wird angezeigt
# 6. Video wird automatisch verarbeitet
```

---

## 🐳 DOCKER QUICK START

```bash
# Development Environment starten
docker-compose up -d

# Logs anschauen
docker-compose logs -f

# Stoppen
docker-compose down
```

---

## ☸️ KUBERNETES DEPLOYMENT

```bash
# Namespace erstellen
kubectl create namespace anpip

# Secrets erstellen
kubectl create secret generic anpip-secrets \
  --from-literal=supabase-url=$SUPABASE_URL \
  --from-literal=supabase-service-role-key=$SERVICE_ROLE_KEY \
  -n anpip

# Deployments
kubectl apply -f kubernetes/ -n anpip

# Status prüfen
kubectl get pods -n anpip
```

---

## 🌍 PRODUKTION DEPLOYMENT

```bash
# 1. Web Build
npm run build:pwa

# 2. Deploy zu Vercel
vercel --prod

# Oder Docker:
docker build -t anpip/web:latest .
docker push anpip/web:latest
```

---

## 🔍 TROUBLESHOOTING

### Upload funktioniert nicht?
```bash
# Edge Functions Status prüfen
supabase functions list

# Logs anschauen
supabase functions logs initialize-upload
```

### Video-Processing hängt?
```bash
# Worker-Status prüfen
kubectl get pods -n anpip -l app=video-worker

# Logs
kubectl logs -f deployment/video-worker -n anpip
```

### Performance-Probleme?
```bash
# Web Vitals im Browser prüfen
# Chrome DevTools > Lighthouse > Run
```

---

## 📚 WEITERE INFOS

- **Vollständige Dokumentation:** `IMPLEMENTATION_COMPLETE.md`
- **Architektur-Details:** `ARCHITECTURE.md`
- **SEO-Guide:** `SEO_IMPLEMENTATION_2025.md`
- **API-Docs:** `API_DOCUMENTATION.md`

---

**Viel Erfolg! 🚀**
