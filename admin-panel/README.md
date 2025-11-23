# 🚀 ANPIP ADMIN-PANEL - Installations- und Bedienungsanleitung

## 📋 Inhaltsverzeichnis
1. [Systemanforderungen](#systemanforderungen)
2. [Installation Schritt für Schritt](#installation)
3. [Datenbank-Konfiguration](#datenbank)
4. [Erster Login](#login)
5. [Bedienungsanleitung](#bedienung)
6. [Autopilot-System](#autopilot)
7. [Sicherheit](#sicherheit)
8. [Häufige Probleme](#probleme)

---

## 🖥️ Systemanforderungen {#systemanforderungen}

**Minimale Anforderungen:**
- **Webserver:** Apache 2.4+ oder nginx
- **PHP:** Version 7.4 oder höher (empfohlen: PHP 8.0+)
- **Datenbank:** MySQL 5.7+ oder MariaDB 10.3+
- **PHP-Erweiterungen:** PDO, pdo_mysql
- **Speicherplatz:** ca. 5 MB

**Kompatibel mit:**
- ✅ cPanel Hosting
- ✅ Plesk Hosting
- ✅ IONOS, Strato, 1&1
- ✅ Shared Hosting (Standard-Pakete)

---

## 📦 Installation Schritt für Schritt {#installation}

### Schritt 1: Dateien hochladen

1. **Lade den kompletten Ordner `admin-panel` auf deinen Webserver hoch**
   - Per FTP (FileZilla, Cyberduck) oder
   - Über das cPanel File Manager

2. **Ziel-Verzeichnis:**
   ```
   Option A: /public_html/admin/           → URL: https://deine-domain.de/admin
   Option B: /admin.deine-domain.de/       → URL: https://admin.deine-domain.de
   ```

3. **Datei-Struktur nach Upload:**
   ```
   admin-panel/
   ├── config.php
   ├── login.php
   ├── logout.php
   ├── index.php
   ├── database.sql
   ├── autopilot-pending.php
   ├── autopilot-history.php
   ├── autopilot-settings.php
   ├── users.php
   ├── content.php
   ├── admin-users.php
   └── includes/
       ├── header.php
       └── footer.php
   ```

---

### Schritt 2: Datenbank erstellen {#datenbank}

**Via phpMyAdmin (empfohlen für Anfänger):**

1. **Öffne phpMyAdmin** in deinem Webhosting-Panel
2. **Klicke auf "Neu"** (links oben)
3. **Datenbankname eingeben:** z.B. `anpip_admin`
4. **Zeichensatz wählen:** `utf8mb4_unicode_ci`
5. **Klicke auf "Anlegen"**

**SQL-Datei importieren:**

1. **Wähle die neu erstellte Datenbank** `anpip_admin` aus
2. **Klicke auf "Importieren"**
3. **Datei auswählen:** `database.sql` (aus dem admin-panel Ordner)
4. **Klicke auf "OK"**
5. **Fertig!** Es werden automatisch alle Tabellen + Demo-Daten erstellt

**Alternative: Manuell via SQL-Tab:**

1. Öffne den Reiter **"SQL"**
2. Kopiere den kompletten Inhalt der Datei `database.sql`
3. Füge ihn in das Textfeld ein
4. Klicke auf **"OK"**

---

### Schritt 3: Konfiguration anpassen

**Öffne die Datei `config.php` und passe folgende Zeilen an:**

```php
// DATENBANK-KONFIGURATION
define('DB_HOST', 'localhost');          // ← Bei den meisten Hostern: 'localhost'
define('DB_NAME', 'anpip_admin');        // ← Dein Datenbankname
define('DB_USER', 'dein_db_user');       // ← Dein Datenbank-Benutzername
define('DB_PASS', 'dein_db_passwort');   // ← Dein Datenbank-Passwort

// BASE URL
define('BASE_URL', 'https://deine-domain.de/admin');  // ← Deine Admin-Panel URL
```

**Wo finde ich diese Daten?**
- **cPanel:** MySQL® Databases → Database Users
- **Plesk:** Datenbanken
- **Bei deinem Hoster:** Support-Bereich oder E-Mail nach Registrierung

**Debug-Modus (nur während Einrichtung):**
```php
define('DEBUG_MODE', true);  // ← Zeigt detaillierte Fehlermeldungen
```

⚠️ **WICHTIG:** Nach erfolgreicher Einrichtung auf `false` setzen!

---

## 🔐 Erster Login {#login}

### Login-Daten (Standard)

1. **Öffne deine Admin-Panel URL im Browser:**
   ```
   https://deine-domain.de/admin/login.php
   ```

2. **Standard-Zugangsdaten:**
   ```
   Benutzername: admin
   Passwort:     123456
   ```

3. **Nach erfolgreichem Login:**
   - Du wirst automatisch zum Dashboard weitergeleitet
   - ⚠️ **WICHTIG:** Ändere sofort dein Passwort!

### Passwort ändern

1. Gehe zu **"Admin-User"** (im linken Menü)
2. Erstelle einen neuen Super-Admin mit sicherem Passwort
3. Logge dich mit dem neuen Account ein
4. Deaktiviere den alten `admin` User

---

## 📚 Bedienungsanleitung {#bedienung}

### Dashboard (Startseite)

Nach dem Login siehst du:

**📊 Statistik-Kacheln:**
- **User Gesamt** - Alle registrierten Nutzer
- **Videos Gesamt** - Alle hochgeladenen Videos
- **Offene Bestätigungen** - Autopilot-Aktionen, die deine Bestätigung brauchen
- **Gemeldete Inhalte** - Von Usern gemeldete Videos

**📜 Letzte Autopilot-Aktionen:**
- Zeigt die 10 neuesten Autopilot-Aktivitäten
- Mit Status: Offen, Bestätigt, Abgelehnt

---

### 👥 User-Verwaltung

**Pfad:** Dashboard → User

**Funktionen:**
- Liste aller User mit Status (Aktiv, Gesperrt, Gebannt)
- Suche nach Username oder E-Mail
- Filter nach Status

**Aktionen:**
- **Sperren** - User kann sich nicht mehr anmelden (reversibel)
- **Entsperren** - Sperre aufheben
- **Bannen** - Permanenter Ausschluss

**Tipps:**
- Bei Spam-Verdacht: Erst sperren, dann prüfen
- Gebannte User können nicht wiederhergestellt werden

---

### 🎥 Videos / Inhalte

**Pfad:** Dashboard → Videos / Inhalte

**Filter:**
- **Alle Videos** - Komplette Übersicht
- **Veröffentlicht** - Aktuell online
- **Gemeldet** - Von Usern als problematisch gemeldet
- **Entfernt** - Offline genommene Videos

**Aktionen:**
- **Markieren** - Als problematisch kennzeichnen
- **Entfernen** - Video offline nehmen
- **Wiederherstellen** - Entferntes Video wieder online stellen

**Wichtige Spalten:**
- **Meldungen** - Anzahl der User-Reports (🚩 bei >0)
- **Views** - Wie oft das Video angesehen wurde

---

## 🤖 Autopilot-System (HERZSTÜCK) {#autopilot}

Der Autopilot überwacht deine Plattform 24/7 und erkennt automatisch Probleme.

### Offene Bestätigungen

**Pfad:** Dashboard → Autopilot → Offene Bestätigungen

**Was siehst du hier?**
- Alle Aktionen, die der Autopilot erkannt hat
- Priorität: 🔴 Kritisch, 🟠 Hoch, 🟡 Mittel, 🟢 Niedrig
- Beschreibung der Aktion

**Deine Optionen:**
1. **✅ Bestätigen** - Autopilot-Vorschlag wird ausgeführt
2. **❌ Ablehnen** - Nichts passiert

**Beispiele für Autopilot-Aktionen:**
- Rechtschreibfehler in Video-Titeln
- Spam-Erkennung (massenhaftes Kommentieren)
- Verdächtige Anmeldemuster
- Mehrfach gemeldete Inhalte

**Filter:**
- Nach Typ (z.B. nur "spam_detection")
- Nach Priorität (nur kritische anzeigen)
- Suche nach Schlüsselwörtern

**Workflow:**
1. Öffne "Offene Bestätigungen"
2. Lese Beschreibung
3. Klicke auf "Mehr Details" für technische Infos
4. Entscheide: Bestätigen oder Ablehnen
5. Fertig!

---

### Letzte Änderungen

**Pfad:** Dashboard → Autopilot → Letzte Änderungen

**Was siehst du hier?**
- Historie aller abgeschlossenen Autopilot-Aktionen
- Wer hat was entschieden (Bestätigt/Abgelehnt)
- Zeitstempel

**Nutzen:**
- Nachvollziehen, was der Autopilot getan hat
- Überprüfen eigener Entscheidungen
- Kontrolle behalten

---

### Einstellungen

**Pfad:** Dashboard → Autopilot → Einstellungen

**Hier legst du fest, was der Autopilot AUTOMATISCH tun darf:**

#### ✏️ Automatische Textkorrekturen
- **Aktiviert:** Autopilot korrigiert Rechtschreibfehler selbstständig
- **Deaktiviert:** Korrekturen müssen manuell bestätigt werden
- **Empfehlung:** Deaktiviert (für volle Kontrolle)

#### 🚫 Spam automatisch löschen
- **Aktiviert:** ⚠️ Spam wird SOFORT gelöscht ohne Bestätigung!
- **Deaktiviert:** Spam wird nur gemeldet
- **Empfehlung:** Deaktiviert (Sicherheit geht vor)

#### 🔒 Kritische Änderungen immer bestätigen
- **Aktiviert:** ✅ Wichtige Aktionen brauchen immer deine Zustimmung
- **Deaktiviert:** Autopilot entscheidet selbst
- **Empfehlung:** IMMER aktiviert!

#### 🚩 Verdächtige Inhalte automatisch markieren
- **Aktiviert:** Auffällige Videos werden automatisch zur Prüfung markiert
- **Deaktiviert:** Keine automatische Erkennung
- **Empfehlung:** Aktiviert (hilft bei Moderation)

**Tipp:** Taste dich langsam heran. Starte mit ALLEN Bestätigungen und aktiviere erst später automatische Aktionen.

---

## 🔐 Admin-User-Verwaltung

**Pfad:** Dashboard → System → Admin-User

⚠️ **Nur für Super-Admins zugänglich!**

**Funktionen:**
- Neue Admin-User erstellen
- Rollen zuweisen (Super Admin, Admin, Moderator)
- Admin-User deaktivieren/aktivieren

**Rollen-Erklärung:**
- **👑 Super Admin** - Volle Rechte (inkl. Admin-Verwaltung)
- **🔐 Admin** - User, Inhalte, Autopilot verwalten
- **👮 Moderator** - Nur Content moderieren

**Neuen Admin erstellen:**
1. Formular oben ausfüllen
2. **Sichere Passwörter verwenden!** (min. 8 Zeichen)
3. Rolle wählen
4. "Erstellen" klicken

---

## 🛡️ Sicherheits-Tipps {#sicherheit}

### ✅ WICHTIG - Sofort umsetzen:

1. **Standard-Passwort ändern**
   ```
   Login: admin / 123456 → SOFORT ändern!
   ```

2. **Starke Passwörter verwenden**
   - Mindestens 12 Zeichen
   - Groß- und Kleinbuchstaben
   - Zahlen und Sonderzeichen
   - Beispiel: `AnP!p2025$SecuRe`

3. **Debug-Modus deaktivieren**
   ```php
   define('DEBUG_MODE', false);  // In config.php
   ```

4. **Regelmäßige Backups**
   - Datenbank wöchentlich sichern (via phpMyAdmin → Export)
   - Admin-Panel-Dateien monatlich sichern

5. **SSL-Verschlüsselung nutzen**
   - Admin-Panel nur über HTTPS aufrufen
   - Bei deinem Hoster SSL-Zertifikat aktivieren (oft kostenlos)

6. **Admin-Panel verstecken**
   ```
   Nicht: https://anpip.com/admin
   Besser: https://anpip.com/geheimer-admin-bereich-xyz
   ```

7. **IP-Whitelist einrichten** (Optional, fortgeschritten)
   - In .htaccess nur bestimmte IPs erlauben

---

## 🆘 Häufige Probleme & Lösungen {#probleme}

### Problem: "Datenbankverbindung fehlgeschlagen"

**Lösung:**
1. Prüfe `config.php` - sind DB_HOST, DB_NAME, DB_USER, DB_PASS korrekt?
2. Teste Datenbank-Zugriff in phpMyAdmin
3. Bei Shared-Hosting: Host ist oft `localhost`, nicht die Domain

---

### Problem: "Page not found" beim Aufruf

**Lösung:**
1. Prüfe, ob alle Dateien hochgeladen wurden
2. Ist die URL korrekt? `/admin/login.php` nicht `/admin-panel/login.php`
3. Überprüfe BASE_URL in `config.php`

---

### Problem: Login funktioniert nicht

**Lösung:**
1. Standard-Login: `admin` / `123456`
2. Prüfe, ob Datenbank korrekt importiert wurde
3. Überprüfe in phpMyAdmin:
   ```sql
   SELECT * FROM admin_users WHERE username = 'admin';
   ```
   Sollte einen Eintrag zeigen.

---

### Problem: "Session-Fehler" oder ständiges Ausloggen

**Lösung:**
1. In `config.php` Session-Einstellungen prüfen
2. PHP-Sessions aktiviert? (Normalerweise ja)
3. Browser-Cookies aktiviert?

---

### Problem: Design wird nicht angezeigt (nur weißer Text)

**Lösung:**
- TailwindCSS wird von CDN geladen
- Internetverbindung vorhanden?
- Im Browser: Strg+F5 (Cache leeren)

---

## 📞 Support & Weiterentwicklung

### Bei Problemen:

1. **Debug-Modus aktivieren** (`config.php` → `DEBUG_MODE = true`)
2. **Fehlermeldung notieren**
3. **System-Logs prüfen:**
   - In phpMyAdmin: Tabelle `system_logs` öffnen
   - Letzte Einträge mit `severity = 'error'` ansehen

### Erweiterungen (Später):

Das Admin-Panel ist modular aufgebaut. Du kannst später problemlos erweitern:
- Eigene Statistiken hinzufügen
- Weitere Autopilot-Regeln definieren
- Benachrichtigungen per E-Mail
- API-Integration

---

## 🎉 Fertig!

**Du hast jetzt ein professionelles Admin-Panel für deine Weltmarke!**

### Nächste Schritte:

1. ✅ Login mit Standard-Account
2. ✅ Passwort ändern
3. ✅ Dashboard erkunden
4. ✅ Autopilot-Einstellungen anpassen
5. ✅ Ersten Test-User sperren/entsperren
6. 🚀 **Anpip zur Nummer 1 machen!**

---

## 📄 Datei-Übersicht

```
admin-panel/
├── config.php                  ← Datenbank & Einstellungen
├── login.php                   ← Login-Seite
├── logout.php                  ← Logout-Funktion
├── index.php                   ← Dashboard (Startseite)
├── database.sql                ← SQL-Import für Datenbank
├── autopilot-pending.php       ← Offene Autopilot-Bestätigungen
├── autopilot-history.php       ← Autopilot-Historie
├── autopilot-settings.php      ← Autopilot-Einstellungen
├── users.php                   ← User-Verwaltung
├── content.php                 ← Video/Content-Verwaltung
├── admin-users.php             ← Admin-User-Verwaltung
└── includes/
    ├── header.php              ← Header (Navigation, Menü)
    └── footer.php              ← Footer (JavaScript)
```

---

**Viel Erfolg mit Anpip! 🚀🌍**

_Entwickelt für eine zukünftige Weltmarke._
