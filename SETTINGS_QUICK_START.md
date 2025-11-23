# ⚡ EINSTELLUNGEN - QUICK START GUIDE

> **Für Entwickler:** So verwendest du das Einstellungs-System in deinem Code

---

## 🚀 SCHNELLSTART

### 1. Einstellungen in einer Komponente verwenden

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

function MyComponent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('appearance_settings')
        .select('theme')
        .eq('user_id', user.id)
        .single();
      
      setIsDarkMode(data?.theme === 'dark');
    }
  };
  
  return <View>{/* Your UI */}</View>;
}
```

---

## 📚 ALLE SETTINGS-TABELLEN

### 1. Benachrichtigungen

```typescript
// Laden
const { data } = await supabase
  .from('notification_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

// Aktualisieren
await supabase
  .from('notification_settings')
  .update({ push_enabled: true })
  .eq('user_id', userId);
```

**Felder:**
- `push_enabled` (boolean)
- `comments` (boolean)
- `followers` (boolean)
- `likes` (boolean)
- `messages` (boolean)
- `mentions` (boolean)
- `group_notifications` (boolean)

---

### 2. Privatsphäre

```typescript
const { data } = await supabase
  .from('privacy_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

await supabase
  .from('privacy_settings')
  .update({ is_private: true })
  .eq('user_id', userId);
```

**Felder:**
- `is_private` (boolean)
- `who_can_find_me` (everyone/nobody/verified)
- `who_can_follow` (everyone/nobody/verified)
- `who_can_see_videos` (everyone/followers/nobody)
- `show_in_suggestions` (boolean)

---

### 3. Standort

```typescript
const { data } = await supabase
  .from('location_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

await supabase
  .from('location_settings')
  .update({ 
    country: 'Deutschland',
    city: 'Berlin'
  })
  .eq('user_id', userId);
```

**Felder:**
- `auto_detect` (boolean)
- `country` (string)
- `city` (string)
- `suggest_for_market` (boolean)

---

### 4. Media

```typescript
const { data } = await supabase
  .from('media_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

await supabase
  .from('media_settings')
  .update({ autoplay: false })
  .eq('user_id', userId);
```

**Felder:**
- `autoplay` (boolean)
- `autoplay_wifi_only` (boolean)
- `default_sound` (boolean)
- `always_show_captions` (boolean)
- `video_quality` (auto/low/high)

---

### 5. Erscheinungsbild

```typescript
const { data } = await supabase
  .from('appearance_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

await supabase
  .from('appearance_settings')
  .update({ theme: 'dark' })
  .eq('user_id', userId);
```

**Felder:**
- `theme` (light/dark/system)
- `font_size` (small/medium/large)
- `animations` (normal/reduced/none)
- `accessibility_mode` (boolean)
- `high_contrast` (boolean)
- `reduce_motion` (boolean)

---

## 🔐 SICHERHEITS-FEATURES

### Aktive Geräte abrufen

```typescript
const { data: sessions } = await supabase
  .from('user_sessions')
  .select('*')
  .eq('user_id', userId)
  .order('last_active', { ascending: false });
```

### Login-Historie

```typescript
const { data: history } = await supabase
  .from('login_history')
  .select('*')
  .eq('user_id', userId)
  .order('timestamp', { ascending: false })
  .limit(20);
```

### Blockierte User

```typescript
const { data: blocked } = await supabase
  .from('blocked_users')
  .select('*, blocked_user:users(*)')
  .eq('user_id', userId);

// User blockieren
await supabase
  .from('blocked_users')
  .insert({
    user_id: currentUserId,
    blocked_user_id: targetUserId
  });
```

---

## 💳 ZAHLUNGEN

### Zahlungsmethoden

```typescript
const { data: methods } = await supabase
  .from('payment_methods')
  .select('*')
  .eq('user_id', userId)
  .order('is_default', { ascending: false });

// Standard-Methode setzen
await supabase
  .from('payment_methods')
  .update({ is_default: false })
  .eq('user_id', userId);

await supabase
  .from('payment_methods')
  .update({ is_default: true })
  .eq('id', methodId);
```

### Abonnements

```typescript
const { data: subs } = await supabase
  .from('subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'active');

// Abo kündigen
await supabase
  .from('subscriptions')
  .update({ 
    cancel_at_period_end: true,
    status: 'cancelled' 
  })
  .eq('id', subscriptionId);
```

### Rechnungen

```typescript
const { data: invoices } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', userId)
  .order('date', { ascending: false });
```

---

## 🆘 SUPPORT

### Problem melden

```typescript
await supabase
  .from('problem_reports')
  .insert({
    user_id: userId,
    category: 'bug', // bug/upload/video/account/payment/privacy/other
    description: 'Beschreibung des Problems',
    status: 'open'
  });
```

### Feedback senden

```typescript
await supabase
  .from('user_feedback')
  .insert({
    user_id: userId,
    type: 'feature', // feature/improvement/compliment/general
    message: 'Mein Feedback',
    rating: 5, // 1-5
    status: 'new'
  });
```

---

## 🎨 UI-KOMPONENTEN

### SettingsSection

```typescript
import SettingsSection from '@/components/settings/SettingsSection';

<SettingsSection title="Meine Einstellungen" isFirst>
  {/* Items hier */}
</SettingsSection>
```

### SettingsItem

```typescript
import SettingsItem from '@/components/settings/SettingsItem';

// Navigation
<SettingsItem
  icon="person-outline"
  title="Profil bearbeiten"
  subtitle="Benutzername, Bio, etc."
  onPress={() => router.push('/profile/edit')}
/>

// Switch/Toggle
<SettingsItem
  icon="notifications-outline"
  title="Push-Benachrichtigungen"
  type="switch"
  value={enabled}
  onValueChange={setEnabled}
/>

// Info (nicht klickbar)
<SettingsItem
  icon="information-circle-outline"
  title="App-Version"
  subtitle="1.0.0"
  type="info"
/>

// Gefährliche Aktion (rot)
<SettingsItem
  icon="trash-outline"
  title="Konto löschen"
  isDanger
  onPress={handleDelete}
/>

// Letztes Item (keine Border)
<SettingsItem
  icon="log-out-outline"
  title="Abmelden"
  isLast
  onPress={handleLogout}
/>
```

---

## 🔄 ECHTZEIT-UPDATES

### Settings-Updates abonnieren

```typescript
useEffect(() => {
  const subscription = supabase
    .channel('user-settings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notification_settings',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('Einstellungen geändert:', payload);
        // UI aktualisieren
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [userId]);
```

---

## 📱 LOKALE SPEICHERUNG (AsyncStorage)

Für Einstellungen, die NICHT in der DB gespeichert werden sollen:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Speichern
await AsyncStorage.setItem('app_language', 'de');

// Laden
const language = await AsyncStorage.getItem('app_language');

// Löschen
await AsyncStorage.removeItem('app_language');

// Mehrere gleichzeitig
await AsyncStorage.multiSet([
  ['app_language', 'de'],
  ['app_region', 'DE']
]);
```

**Verwendung für:**
- `app_language` - Gewählte Sprache
- `app_region` - Gewählte Region
- `theme_preference` - Theme-Präferenz (wenn nicht in DB)
- `onboarding_completed` - Ob Onboarding abgeschlossen

---

## 🧪 TESTING

### Unit Test Beispiel

```typescript
import { render, fireEvent } from '@testing-library/react-native';
import SettingsItem from '@/components/settings/SettingsItem';

describe('SettingsItem', () => {
  it('should call onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SettingsItem title="Test" onPress={onPress} />
    );
    
    fireEvent.press(getByText('Test'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

### Integration Test Beispiel

```typescript
import { supabase } from '@/lib/supabase';

describe('Privacy Settings', () => {
  it('should update privacy settings', async () => {
    const userId = 'test-user-id';
    
    const { error } = await supabase
      .from('privacy_settings')
      .update({ is_private: true })
      .eq('user_id', userId);
    
    expect(error).toBeNull();
    
    const { data } = await supabase
      .from('privacy_settings')
      .select('is_private')
      .eq('user_id', userId)
      .single();
    
    expect(data.is_private).toBe(true);
  });
});
```

---

## 🐛 DEBUGGING

### Einstellungen debuggen

```typescript
// In jeder Settings-Komponente
useEffect(() => {
  console.log('🔧 Settings loaded:', settings);
}, [settings]);

// DB-Queries loggen
const { data, error } = await supabase
  .from('notification_settings')
  .select('*')
  .eq('user_id', userId)
  .single();

console.log('📊 DB Response:', { data, error });
```

### Häufige Probleme

**Problem:** Einstellungen werden nicht geladen
```typescript
// Lösung: Prüfe ob User eingeloggt ist
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  console.error('Kein User eingeloggt');
  return;
}
```

**Problem:** RLS blockiert Update
```typescript
// Lösung: Prüfe RLS-Policies in Supabase Dashboard
// Stelle sicher, dass user_id mit auth.uid() übereinstimmt
```

**Problem:** Einstellungen nicht persistent
```typescript
// Lösung: Prüfe ob update erfolgreich war
const { error } = await supabase
  .from('settings')
  .update(...)
  .eq('user_id', userId);

if (error) {
  console.error('Update fehlgeschlagen:', error);
}
```

---

## 📖 WEITERE RESSOURCEN

- **Hauptdokumentation:** `SETTINGS_COMPLETE_DOCUMENTATION.md`
- **Validierungsbericht:** `SETTINGS_VALIDATION_REPORT.md`
- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev/docs

---

## 💡 TIPPS & TRICKS

### 1. Batch-Updates vermeiden Race Conditions

```typescript
// ❌ Schlecht
await update1();
await update2();
await update3();

// ✅ Gut
await Promise.all([update1(), update2(), update3()]);
```

### 2. Default-Werte setzen

```typescript
const settings = {
  push_enabled: true,
  comments: true,
  ...loadedSettings // Überschreibt Defaults
};
```

### 3. Loading States

```typescript
const [loading, setLoading] = useState(true);

const loadSettings = async () => {
  try {
    setLoading(true);
    const data = await fetchSettings();
    setSettings(data);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};

if (loading) return <ActivityIndicator />;
```

### 4. Optimistic Updates

```typescript
const handleToggle = async (newValue) => {
  // UI sofort aktualisieren
  setEnabled(newValue);
  
  try {
    // Datenbank im Hintergrund
    await supabase...update();
  } catch (error) {
    // Bei Fehler zurücksetzen
    setEnabled(!newValue);
    Alert.alert('Fehler', 'Einstellung konnte nicht gespeichert werden');
  }
};
```

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 23. November 2025
