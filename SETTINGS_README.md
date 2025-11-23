# ⚙️ Einstellungsmenü - Anpip.com

Ein vollständiges, modernes und weltweit optimiertes Einstellungsmenü nach internationalen UX-Standards (TikTok, Instagram, YouTube, Snapchat, etc.).

## 📋 Inhaltsverzeichnis

- [Übersicht](#übersicht)
- [Features](#features)
- [Architektur](#architektur)
- [Installation](#installation)
- [Verwendung](#verwendung)
- [Datenbank](#datenbank)
- [Komponenten](#komponenten)
- [Anpassung](#anpassung)

---

## 🎯 Übersicht

Das Einstellungsmenü von Anpip.com bietet eine vollständige Verwaltung aller Benutzereinstellungen in 12 Hauptkategorien:

1. **Konto** - Profilverwaltung, Sicherheit, 2FA
2. **Sicherheit** - Login-Historie, App-Lock, Daten-Export
3. **Benachrichtigungen** - Push-Benachrichtigungen, Interaktionen
4. **Privatsphäre** - Profilsichtbarkeit, blockierte Nutzer
5. **Sprache & Region** - Mehrsprachigkeit, Lokalisierung
6. **Erscheinungsbild** - Dark Mode, Schriftgröße, Barrierefreiheit
7. **Standort** - Automatische Erkennung, manuelle Auswahl
8. **Audio & Video** - Autoplay, Qualität, Untertitel
9. **FAQ & Support** - Hilfe, Tutorials, Support-Kontakt
10. **Rechtliches** - Datenschutz, AGB, Impressum
11. **Premium & Zahlungen** - Abonnements, Zahlungsmethoden
12. **Abmelden** - Sicherer Logout

---

## ✨ Features

### 🎨 Design
- **Mobile-first** mit responsivem Layout
- **Dark Mode** Unterstützung
- **Minimalistisches Design** (Schwarz/Weiß/Rot)
- **Icons** von Ionicons
- **Smooth Animationen**

### 🔐 Sicherheit
- **Zwei-Faktor-Authentifizierung (2FA)**
- **Login-Historie** und Geräteüberwachung
- **App-Lock** mit Passcode
- **DSGVO-konformer Daten-Export**
- **Sicheres Konto löschen**

### 📱 Funktionalität
- **Automatisches Speichern** bei Änderungen
- **Validierung** aller Eingaben
- **Fehlerbehandlung** mit benutzerfreundlichen Meldungen
- **Offline-Fähigkeit** (AsyncStorage)
- **Supabase Integration**

### 🌍 Internationalisierung
- Mehrsprachige Unterstützung vorbereitet
- Regionale Einstellungen
- Automatische Standorterkennung

---

## 🏗️ Architektur

```
app/
├── settings.tsx                    # Haupteinstellungsseite
├── settings/
│   ├── account/
│   │   ├── edit-profile.tsx       # Profil bearbeiten
│   │   ├── change-password.tsx    # Passwort ändern
│   │   ├── change-email.tsx       # E-Mail ändern
│   │   ├── phone.tsx              # Telefonnummer
│   │   ├── two-factor.tsx         # 2FA Einstellungen
│   │   ├── devices.tsx            # Aktive Geräte
│   │   └── security-check.tsx     # Sicherheitscheck
│   ├── security/
│   │   ├── login-history.tsx      # Login-Historie
│   │   ├── unknown-devices.tsx    # Unbekannte Geräte
│   │   ├── app-lock.tsx           # App-Passcode
│   │   ├── export-data.tsx        # Daten exportieren
│   │   ├── deactivate.tsx         # Konto deaktivieren
│   │   └── delete-account.tsx     # Konto löschen
│   ├── notifications.tsx          # Benachrichtigungen
│   ├── privacy.tsx                # Privatsphäre
│   │   ├── who-can-find.tsx      # Wer darf finden
│   │   ├── who-can-follow.tsx    # Wer darf folgen
│   │   ├── who-can-see-videos.tsx # Video-Sichtbarkeit
│   │   ├── blocked-users.tsx     # Blockierte Nutzer
│   │   └── visibility.tsx        # Profilsichtbarkeit
│   ├── language.tsx               # Sprache
│   ├── region.tsx                 # Region
│   ├── appearance/
│   │   ├── theme.tsx             # Dark/Light Mode
│   │   ├── font-size.tsx         # Schriftgröße
│   │   ├── animations.tsx        # Animationen
│   │   └── accessibility.tsx     # Barrierefreiheit
│   ├── location.tsx              # Standort
│   ├── media.tsx                 # Audio & Video
│   ├── support/
│   │   ├── faq.tsx              # FAQ
│   │   ├── tutorials.tsx        # Tutorials
│   │   ├── report.tsx           # Problem melden
│   │   ├── feedback.tsx         # Feedback
│   │   └── contact.tsx          # Support kontaktieren
│   ├── legal/
│   │   ├── privacy.tsx          # Datenschutz
│   │   ├── terms.tsx            # AGB
│   │   ├── imprint.tsx          # Impressum
│   │   ├── community.tsx        # Community-Richtlinien
│   │   └── safety.tsx           # Sicherheit & Jugendschutz
│   └── payments/
│       ├── methods.tsx          # Zahlungsmethoden
│       ├── subscriptions.tsx    # Abonnements
│       └── invoices.tsx         # Rechnungen

components/
└── settings/
    ├── SettingsItem.tsx         # Wiederverwendbarer Setting-Eintrag
    └── SettingsSection.tsx      # Setting-Gruppe

types/
└── settings.ts                   # TypeScript Typen
```

---

## 🚀 Installation

### 1. Datenbank migrieren

```bash
# Supabase Migration ausführen
npx supabase db push
```

Oder manuell die SQL-Datei ausführen:
```sql
-- In Supabase Dashboard: SQL Editor
-- Datei: supabase/migrations/20250123_settings_tables.sql
```

### 2. Abhängigkeiten installieren

```bash
npm install @react-native-async-storage/async-storage
npm install expo-image-picker
```

### 3. Berechtigungen konfigurieren

In `app.json` hinzufügen:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-image-picker",
        {
          "photosPermission": "Die App benötigt Zugriff auf deine Fotos für dein Profilbild."
        }
      ]
    ]
  }
}
```

---

## 💻 Verwendung

### Einstellungsmenü öffnen

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/settings');
```

### Direkt zu einer Unterseite navigieren

```tsx
router.push('/settings/account/edit-profile');
router.push('/settings/notifications');
router.push('/settings/privacy');
```

### Einstellungen abrufen

```tsx
import { supabase } from '@/lib/supabase';

// Benachrichtigungseinstellungen laden
const { data } = await supabase
  .from('notification_settings')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Alle Einstellungen auf einmal
const { data } = await supabase
  .rpc('get_user_settings', { p_user_id: user.id });
```

---

## 🗄️ Datenbank

### Tabellen

#### `notification_settings`
```sql
- push_enabled: boolean
- comments: boolean
- followers: boolean
- likes: boolean
- messages: boolean
- mentions: boolean
- group_notifications: boolean
```

#### `privacy_settings`
```sql
- is_private: boolean
- who_can_find_me: enum('everyone', 'nobody', 'verified')
- who_can_follow: enum('everyone', 'nobody', 'verified')
- who_can_see_videos: enum('everyone', 'followers', 'nobody')
- show_in_suggestions: boolean
```

#### `location_settings`
```sql
- auto_detect: boolean
- country: string
- city: string
- suggest_for_market: boolean
```

#### `media_settings`
```sql
- autoplay: boolean
- autoplay_wifi_only: boolean
- default_sound: boolean
- always_show_captions: boolean
- video_quality: enum('auto', 'low', 'high')
```

#### `payment_methods`
```sql
- type: enum('card', 'paypal', 'apple_pay', 'google_pay')
- last_four: string
- is_default: boolean
- expiry: string
- stripe_payment_method_id: string
```

#### `subscriptions`
```sql
- plan_name: string
- status: enum('active', 'cancelled', 'expired')
- price: decimal
- currency: string
- next_billing_date: timestamp
- cancel_at_period_end: boolean
```

### Row Level Security (RLS)

Alle Tabellen haben RLS aktiviert:
- Benutzer können nur ihre eigenen Einstellungen sehen/ändern
- Automatische `user_id` Validierung
- DSGVO-konform

### Trigger

Automatische Erstellung von Default-Einstellungen bei User-Registrierung:
```sql
CREATE TRIGGER on_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_user_settings();
```

---

## 🧩 Komponenten

### SettingsItem

Wiederverwendbare Komponente für einzelne Einstellungen:

```tsx
<SettingsItem
  icon="person-outline"
  title="Profil bearbeiten"
  subtitle="Name, Bio, Profilbild"
  type="navigation"
  onPress={() => router.push('/settings/account/edit-profile')}
/>

<SettingsItem
  icon="notifications-outline"
  title="Push-Benachrichtigungen"
  type="switch"
  value={settings.push_enabled}
  onValueChange={(value) => updateSetting('push_enabled', value)}
/>
```

**Props:**
- `icon` - Ionicons Name
- `title` - Haupttext
- `subtitle` - Untertitel (optional)
- `type` - `'navigation' | 'switch' | 'info'`
- `value` - Boolean für Switch
- `onPress` - Callback für Navigation
- `onValueChange` - Callback für Switch
- `isLast` - Letztes Element in Sektion
- `isDanger` - Rote Farbe für gefährliche Aktionen

### SettingsSection

Gruppiert mehrere SettingsItems:

```tsx
<SettingsSection title="Konto">
  <SettingsItem ... />
  <SettingsItem ... />
  <SettingsItem ... isLast />
</SettingsSection>
```

---

## 🎨 Anpassung

### Farben ändern

In den Komponenten-Styles:

```tsx
const styles = StyleSheet.create({
  // Primärfarbe (derzeit Rot)
  primaryColor: '#FF3B30',
  
  // Dark Mode
  backgroundDark: '#000000',
  cardDark: '#1C1C1E',
  
  // Light Mode
  background: '#F2F2F7',
  card: '#FFFFFF',
});
```

### Neue Einstellung hinzufügen

1. **Datenbank erweitern:**
```sql
ALTER TABLE notification_settings
ADD COLUMN new_setting BOOLEAN DEFAULT true;
```

2. **TypeScript Type aktualisieren:**
```tsx
export interface NotificationSettings {
  // ... existing fields
  new_setting: boolean;
}
```

3. **UI hinzufügen:**
```tsx
<SettingsItem
  icon="icon-name"
  title="Neue Einstellung"
  type="switch"
  value={settings.new_setting}
  onValueChange={(value) => updateSetting('new_setting', value)}
/>
```

### Neue Kategorie hinzufügen

1. Ordner erstellen: `app/settings/neue-kategorie/`
2. Hauptseite: `app/settings/neue-kategorie.tsx`
3. In `settings.tsx` verlinken
4. Datenbank-Tabelle erstellen (falls nötig)

---

## 🔒 Sicherheit

### DSGVO-Konformität

- ✅ Daten-Export Funktion
- ✅ Recht auf Löschung
- ✅ Transparente Datenverarbeitung
- ✅ Einwilligung für alle Features
- ✅ Opt-out Möglichkeiten

### Best Practices

- Alle sensiblen Daten verschlüsselt
- Row Level Security aktiviert
- Input-Validierung auf Client und Server
- Rate Limiting für API-Calls
- Secure Session Management

---

## 📱 Mobile Optimierung

- Touch-freundliche Buttons (min. 44x44px)
- Native Scrolling mit Bounce-Effekt
- Haptic Feedback für wichtige Aktionen
- Pull-to-Refresh wo sinnvoll
- Optimierte Ladezeiten

---

## 🌐 Internationalisierung

### Vorbereitet für i18n

```tsx
// Beispiel mit react-i18next
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

<SettingsItem
  title={t('settings.account.editProfile')}
  subtitle={t('settings.account.editProfileDesc')}
/>
```

---

## 📊 Analytics

Tracking-Events implementieren:

```tsx
import Analytics from '@/lib/analytics';

const handleSettingChange = (key: string, value: any) => {
  Analytics.track('setting_changed', {
    setting: key,
    value: value,
    screen: 'notifications',
  });
  
  updateSetting(key, value);
};
```

---

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Spezifische Tests
npm test settings
```

---

## 🐛 Troubleshooting

### Problem: Einstellungen werden nicht gespeichert

**Lösung:**
1. RLS Policies prüfen
2. User-ID korrekt übergeben
3. Netzwerkverbindung prüfen

### Problem: Dark Mode funktioniert nicht

**Lösung:**
1. `useColorScheme()` Hook prüfen
2. AsyncStorage Theme-Key prüfen
3. App neu starten

### Problem: Migration schlägt fehl

**Lösung:**
```bash
# Rollback
npx supabase db reset

# Neu migrieren
npx supabase db push
```

---

## 📚 Ressourcen

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Supabase Docs](https://supabase.com/docs)
- [React Native Docs](https://reactnative.dev/)
- [Ionicons](https://ionic.io/ionicons)

---

## 👥 Support

Bei Fragen oder Problemen:

- **GitHub Issues:** [anpip-app/issues](https://github.com/7Akdeniz/anpip-app/issues)
- **Email:** support@anpip.com
- **Discord:** [Anpip Community](https://discord.gg/anpip)

---

## 📄 Lizenz

MIT License - siehe [LICENSE](../LICENSE)

---

**Entwickelt mit ❤️ für Anpip.com**
