# 📦 PACKAGE DEPENDENCIES - ANPIP.COM v2.0

## 🔧 Neue Dependencies für Enterprise-Features

### **Video Processing:**
```bash
npm install --save ffmpeg-static fluent-ffmpeg
```

### **Queue System:**
```bash
npm install --save bull redis
```

### **Monitoring:**
```bash
npm install --save @sentry/nextjs @sentry/react-native
npm install --save winston
```

### **Performance:**
```bash
npm install --save web-vitals
npm install --save workbox-webpack-plugin
```

### **Security:**
```bash
npm install --save helmet
npm install --save express-rate-limit
```

### **GEO:**
```bash
npm install --save geolib
npm install --save @turf/turf
```

### **Development:**
```bash
npm install --save-dev @types/fluent-ffmpeg
npm install --save-dev @types/bull
```

---

## 📋 Vollständige package.json

Siehe `package.json` - wurde mit neuen Scripts erweitert:
- `deploy:functions` - Edge Functions deployen
- `deploy:migrations` - DB-Migrationen
- `deploy:all` - Komplett-Deployment
- `docker:*` - Docker Commands
- `k8s:*` - Kubernetes Commands
