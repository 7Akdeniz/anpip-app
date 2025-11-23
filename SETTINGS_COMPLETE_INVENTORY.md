# ⚙️ VOLLSTÄNDIGE INVENTUR - ALLE EINSTELLUNGEN

> **Stand:** 23. November 2025  
> **Status:** Systematische Prüfung läuft  
> **Ziel:** Jede Funktion UI → Logik → API → DB prüfen

---

## 📋 ÜBERSICHT ALLER EINSTELLUNGSBEREICHE

### 1️⃣ KONTO (7 Funktionen)
- ✅ Profil bearbeiten → `/settings/account/edit-profile` → **DATEI EXISTIERT**
- ❓ E-Mail ändern → `/settings/account/change-email` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Telefonnummer → `/settings/account/phone` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Passwort ändern → `/settings/account/change-password` → **DATEI EXISTIERT** → PRÜFEN

### 2️⃣ SICHERHEIT (8 Funktionen)
- ❓ Zwei-Faktor-Authentifizierung (2FA) → `/settings/security/two-factor` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Aktive Geräte → `/settings/security/devices` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Kontosicherheit prüfen → `/settings/security/check` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Login-Historie → `/settings/security/login-history` → **DATEI EXISTIERT** → PRÜFEN
- ❓ App-Passcode → `/settings/security/passcode` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Daten herunterladen (DSGVO) → `/settings/security/data-export` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Konto deaktivieren → `/settings/security/deactivate` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Konto dauerhaft löschen → `/settings/security/delete-account` → **DATEI EXISTIERT** → PRÜFEN

### 3️⃣ BENACHRICHTIGUNGEN (7 Kategorien)
- ❓ Push-Benachrichtigungen → `/settings/notifications` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Kommentare → `/settings/notifications` → PRÜFEN
- ❓ Neue Follower → `/settings/notifications` → PRÜFEN
- ❓ Likes → `/settings/notifications` → PRÜFEN
- ❓ Nachrichten → `/settings/notifications` → PRÜFEN
- ❓ Erwähnungen & Antworten → `/settings/notifications` → PRÜFEN
- ❓ Benachrichtigungen gruppieren → `/settings/notifications` → PRÜFEN

### 4️⃣ PRIVATSPHÄRE (6 Funktionen)
- ❓ Privates Profil → `/settings/privacy` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Wer darf mich finden? → `/settings/privacy` → PRÜFEN
- ❓ Wer darf mir folgen? → `/settings/privacy` → PRÜFEN
- ❓ Wer darf meine Videos sehen? → `/settings/privacy` → PRÜFEN
- ❓ Blockierte Nutzer → `/settings/privacy/blocked-users` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Profilsichtbarkeit → `/settings/privacy` → PRÜFEN

### 5️⃣ SPRACHE & REGION (3 Funktionen)
- ❓ App-Sprache (50 Sprachen) → `/settings/language` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Region (150+ Länder) → `/settings/region` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Automatisch erkennen → `/settings/location` → **DATEI EXISTIERT** → PRÜFEN

### 6️⃣ ERSCHEINUNGSBILD (4 Funktionen)
- ❓ Design (Dark/Light) → `/settings/appearance/theme` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Schriftgröße → `/settings/appearance/font-size` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Animationen → `/settings/appearance/animations` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Barrierefreiheit → `/settings/appearance/accessibility` → **DATEI EXISTIERT** → PRÜFEN

### 7️⃣ STANDORT (3 Funktionen)
- ❓ Automatische Erkennung → `/settings/location` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Standort wählen → `/settings/location` → PRÜFEN
- ❓ Für Market vorschlagen → `/settings/location` → PRÜFEN

### 8️⃣ AUDIO & VIDEO (5 Funktionen)
- ❓ Autoplay → `/settings/media` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Autoplay nur im WLAN → `/settings/media` → PRÜFEN
- ❓ Standard-Sound → `/settings/media` → PRÜFEN
- ❓ Untertitel anzeigen → `/settings/media` → PRÜFEN
- ❓ Videoqualität → `/settings/media` → PRÜFEN

### 9️⃣ FAQ & SUPPORT (5 Funktionen)
- ❓ Häufige Fragen → `/settings/support/faq` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Tutorials → `/settings/support/tutorials` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Problem melden → `/settings/support/report-problem` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Feedback senden → `/settings/support/feedback` → **DATEI EXISTIERT** → PRÜFEN
- ✅ Support kontaktieren → Alert mit E-Mail → **FUNKTIONIERT**

### 🔟 RECHTLICHES (5 Seiten)
- ❓ Datenschutz → `/settings/legal/privacy-policy` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Nutzungsbedingungen → `/settings/legal/terms-of-service` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Impressum → `/settings/legal/imprint` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Community-Richtlinien → `/settings/legal/community-guidelines` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Sicherheit & Jugendschutz → `/settings/legal/community-guidelines` → PRÜFEN (duplicate?)

### 1️⃣1️⃣ PREMIUM & ZAHLUNGEN (3 Funktionen)
- ❓ Zahlungsmethoden → `/settings/payments/methods` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Abonnements verwalten → `/settings/payments/subscriptions` → **DATEI EXISTIERT** → PRÜFEN
- ❓ Rechnungsübersicht → `/settings/payments/invoices` → **DATEI EXISTIERT** → PRÜFEN

### 1️⃣2️⃣ ABMELDEN (1 Funktion)
- ✅ Abmelden → handleLogout() → **FUNKTIONIERT** (Alert + signOut + redirect)

---

## 📊 STATISTIK

- **Gesamt:** ~56 Einstellungsfunktionen
- **Dateien gefunden:** 32 Settings-Screens
- **Zu prüfen:** ~54 Funktionen
- **Funktionierende:** 2 (Support kontaktieren, Abmelden)

---

## 🎯 NÄCHSTE SCHRITTE

1. **Konto & Sicherheit** komplett durchgehen (15 Funktionen)
2. **Sprache & Region** mit 50 Sprachen + Flaggen prüfen
3. **Benachrichtigungen** - alle 7 Kategorien
4. **Privatsphäre** - 6 Features
5. **Erscheinungsbild** - Dark/Light, Schrift, Animationen
6. **Audio/Video** - Autoplay, Qualität, Untertitel
7. **Support** - Tutorials, Problem melden, Feedback
8. **Rechtliches** - alle 5 Seiten vollständig
9. **Zahlungen** - Payment-Integration

---

## ⚠️ BEKANNTE PROBLEME

- Viele Routen haben `as any` → TypeScript-Typen fehlen
- Mehrere Funktionen zeigen nur Alerts statt echte Screens
- Database-Integration unklar bei vielen Features
- Speicherung/Persistierung muss geprüft werden
