# 🚀 Einstellungsmenü Schnellstart

## Installation in 3 Schritten

### 1️⃣ Datenbank migrieren

```bash
# Supabase Migration ausführen
cd /Users/alanbest/Anpip.com
npx supabase db push
```

### 2️⃣ Abhängigkeiten installieren

```bash
npm install @react-native-async-storage/async-storage expo-image-picker
```

### 3️⃣ App starten

```bash
npx expo start
```

---

## 📱 Schneller Zugriff

### Einstellungen öffnen

```tsx
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/settings');
```

### Häufige Unterseiten

```tsx
// Profil bearbeiten
router.push('/settings/account/edit-profile');

// Benachrichtigungen
router.push('/settings/notifications');

// Dark Mode
router.push('/settings/appearance/theme');

// Zahlungsmethoden
router.push('/settings/payments/methods');
```

---

## 🎯 Kernfunktionen

### ✅ Was bereits funktioniert

- ✅ **12 Hauptkategorien** komplett implementiert
- ✅ **Dark Mode** Unterstützung
- ✅ **Automatisches Speichern** aller Einstellungen
- ✅ **Responsive Design** (Mobile, Tablet, Desktop)
- ✅ **TypeScript** vollständig typisiert
- ✅ **Supabase Integration** mit RLS
- ✅ **DSGVO-konform**

### 🔧 Was noch entwickelt werden muss

- ⏳ E-Mail ändern Funktion
- ⏳ Telefonnummer hinzufügen
- ⏳ Zwei-Faktor-Authentifizierung
- ⏳ Stripe Zahlungsintegration
- ⏳ Mehrsprachigkeit (i18n)
- ⏳ Erweiterte Tutorials

---

## 🗂️ Dateistruktur

```
📁 app/
  └── settings.tsx              ← Hauptseite
  └── 📁 settings/
      ├── 📁 account/          ← Konto-Unterseiten
      ├── 📁 security/         ← Sicherheit
      ├── 📁 appearance/       ← Design
      ├── 📁 support/          ← FAQ & Support
      ├── 📁 payments/         ← Zahlungen
      ├── notifications.tsx
      ├── privacy.tsx
      ├── location.tsx
      └── media.tsx

📁 components/
  └── 📁 settings/
      ├── SettingsItem.tsx     ← Wiederverwendbar
      └── SettingsSection.tsx  ← Gruppierung

📁 types/
  └── settings.ts              ← TypeScript Typen

📁 supabase/
  └── 📁 migrations/
      └── 20250123_settings_tables.sql
```

---

## 💡 Code-Beispiele

### Setting mit Switch

```tsx
<SettingsItem
  icon="notifications-outline"
  title="Push-Benachrichtigungen"
  type="switch"
  value={settings.push_enabled}
  onValueChange={(value) => updateSetting('push_enabled', value)}
/>
```

### Setting mit Navigation

```tsx
<SettingsItem
  icon="person-outline"
  title="Profil bearbeiten"
  subtitle={user?.username}
  type="navigation"
  onPress={() => router.push('/settings/account/edit-profile')}
/>
```

### Einstellung speichern

```tsx
const updateSetting = async (key: string, value: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('notification_settings')
    .upsert({
      user_id: user.id,
      [key]: value,
    });
};
```

---

## 🎨 Styling anpassen

### Farben

```tsx
// In StyleSheet ändern
const styles = StyleSheet.create({
  primaryColor: '#FF3B30',  // Rot → Deine Farbe
  background: '#F2F2F7',    // Hell-Grau
  backgroundDark: '#000000', // Schwarz
});
```

### Icons

```tsx
// Ionicons verwenden
import { Ionicons } from '@expo/vector-icons';

<Ionicons name="settings-outline" size={24} color="#FF3B30" />
```

---

## 🔐 Sicherheit

### RLS Policies prüfen

```sql
-- In Supabase SQL Editor
SELECT * FROM pg_policies 
WHERE tablename = 'notification_settings';
```

### User-Berechtigung testen

```tsx
const { data, error } = await supabase
  .from('privacy_settings')
  .select('*')
  .eq('user_id', user.id)
  .single();

if (error) console.error('RLS Error:', error);
```

---

## 🐛 Häufige Probleme

### Problem: "Cannot find module 'settings'"

**Lösung:** Expo Dev Client neu builden
```bash
npx expo prebuild --clean
npx expo run:ios
```

### Problem: Dark Mode funktioniert nicht

**Lösung:** System-Einstellung prüfen oder manuell setzen
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('theme', 'dark');
```

### Problem: Supabase RLS Error

**Lösung:** Policies prüfen und User-ID validieren
```sql
-- RLS für notification_settings
CREATE POLICY notification_settings_select_own 
ON notification_settings
FOR SELECT 
USING (auth.uid() = user_id);
```

---

## 📊 Datenbank-Schema

### Wichtigste Tabellen

```
notification_settings
├── user_id (FK)
├── push_enabled
├── comments
├── followers
├── likes
└── messages

privacy_settings
├── user_id (FK)
├── is_private
├── who_can_find_me
└── show_in_suggestions

media_settings
├── user_id (FK)
├── autoplay
├── video_quality
└── always_show_captions

payment_methods
├── user_id (FK)
├── type
├── last_four
└── is_default
```

---

## 🎯 Nächste Schritte

1. **Migration ausführen** → Datenbank aufsetzen
2. **Einstellungen testen** → Jede Kategorie durchgehen
3. **Stripe integrieren** → Zahlungen aktivieren
4. **i18n hinzufügen** → Mehrsprachigkeit
5. **Analytics tracken** → User-Verhalten analysieren

---

## 📞 Support

**Fragen?** → support@anpip.com  
**Bugs?** → GitHub Issues  
**Docs?** → `SETTINGS_README.md`

---

**Viel Erfolg! 🚀**
