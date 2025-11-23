# 🚀 ANPIP ADMIN-PANEL - Quick Start Guide

## Installation in 5 Minuten

### 1. Upload
```
Lade den Ordner "admin-panel" auf deinen Webserver
Ziel: /public_html/admin/ oder /admin.deine-domain.de/
```

### 2. Datenbank
```
1. Öffne phpMyAdmin
2. Erstelle neue Datenbank: anpip_admin
3. Importiere: database.sql
```

### 3. Konfiguration
```
Öffne: config.php
Ändere:
  - DB_NAME (Datenbankname)
  - DB_USER (Datenbank-User)
  - DB_PASS (Datenbank-Passwort)
  - BASE_URL (deine URL)
```

### 4. Login
```
URL: https://deine-domain.de/admin/login.php
User: admin
Pass: 123456

⚠️ PASSWORT SOFORT ÄNDERN!
```

### 5. Fertig! 🎉
```
Dashboard öffnen
Autopilot konfigurieren
Zur Nummer 1 werden
```

---

## Struktur

```
admin-panel/
├── login.php              → Login-Seite
├── index.php              → Dashboard
├── autopilot-pending.php  → Offene Bestätigungen ⭐
├── autopilot-history.php  → Historie
├── autopilot-settings.php → Einstellungen ⚙️
├── users.php              → User-Verwaltung
├── content.php            → Video-Verwaltung
├── admin-users.php        → Admin-Verwaltung
└── config.php             → WICHTIG: Konfiguration!
```

---

## Wichtigste Features

✅ **Autopilot-System** - Automatische Überwachung  
✅ **User-Management** - Sperren/Bannen/Verwalten  
✅ **Content-Moderation** - Videos prüfen  
✅ **Mobile-optimiert** - Auch am Handy nutzbar  
✅ **Sicher** - CSRF-Schutz, Passwort-Hashing  

---

## Support

Bei Problemen:
1. DEBUG_MODE in config.php aktivieren
2. Fehlermeldung lesen
3. README.md Abschnitt "Probleme" checken

---

**Alles Gute für die Weltmarke! 🌍**
