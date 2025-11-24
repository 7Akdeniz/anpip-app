// ============================================================================
// ⚙️ HAUPTEINSTELLUNGEN - Anpip.com
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import type { User } from '@/types/settings';
import { loadAutoScrollSetting, saveAutoScrollSetting } from '@/hooks/useAutoScroll';

export default function SettingsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  useEffect(() => {
    loadUserData();
    loadAutoScrollSetting().then(setAutoScrollEnabled);
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (data) {
          setUser(data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Benutzerdaten:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleAutoScrollToggle = async (value: boolean) => {
    setAutoScrollEnabled(value);
    await saveAutoScrollSetting(value);
    
    // Visuelles Feedback für Benutzer
    if (Platform.OS === 'web') {
      // Web: Dezentes Toast-Feedback
      console.log(`✅ Auto-Scroll ${value ? 'aktiviert' : 'deaktiviert'}`);
    } else {
      // Native: Alert mit detaillierter Info
      Alert.alert(
        value ? '✅ Auto-Scroll aktiviert' : '⏸️ Auto-Scroll deaktiviert',
        value 
          ? 'Videos scrollen nach Ende automatisch zum nächsten Video weiter. Du kannst jederzeit manuell scrollen.'
          : 'Videos werden nur noch manuell gewechselt. Du musst selbst zum nächsten Video scrollen.'
      );
    }
  };

  const handleClose = () => {
    // Navigiere zur Startseite (Video-Feed)
    router.push('/(tabs)');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Einstellungen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={isDark ? '#FFFFFF' : '#000000'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. KONTO */}
        <SettingsSection title="Konto" isFirst>
          <SettingsItem
            icon="person-outline"
            title="Profil bearbeiten"
            subtitle={user?.username || user?.email}
            onPress={() => router.push('/settings/account/edit-profile')}
          />
          <SettingsItem
            icon="mail-outline"
            title="E-Mail ändern"
            subtitle={user?.email}
            onPress={() => router.push('/settings/account/change-email' as any)}
          />
          <SettingsItem
            icon="call-outline"
            title="Telefonnummer"
            subtitle={user?.phone || 'Nicht hinzugefügt'}
            onPress={() => router.push('/settings/account/phone' as any)}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Passwort ändern"
            onPress={() => router.push('/settings/account/change-password' as any)}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Zwei-Faktor-Authentifizierung"
            subtitle={user?.two_factor_enabled ? 'Aktiviert' : 'Deaktiviert'}
            onPress={() => router.push('/settings/security/two-factor' as any)}
          />
          <SettingsItem
            icon="phone-portrait-outline"
            title="Aktive Geräte"
            onPress={() => router.push('/settings/security/devices' as any)}
          />
          <SettingsItem
            icon="checkmark-circle-outline"
            title="Kontosicherheit prüfen"
            onPress={() => router.push('/settings/security/check' as any)}
            isLast
          />
        </SettingsSection>

        {/* 2. SICHERHEIT */}
        <SettingsSection title="Sicherheit">
          <SettingsItem
            icon="time-outline"
            title="Login-Historie"
            onPress={() => router.push('/settings/security/login-history' as any)}
          />
          <SettingsItem
            icon="alert-circle-outline"
            title="Unbekannte Geräte"
            onPress={() => router.push('/settings/security/devices' as any)}
          />
          <SettingsItem
            icon="keypad-outline"
            title="App-Passcode"
            onPress={() => router.push('/settings/security/passcode' as any)}
          />
          <SettingsItem
            icon="download-outline"
            title="Daten herunterladen"
            subtitle="DSGVO-Export"
            onPress={() => router.push('/settings/security/data-export' as any)}
          />
          <SettingsItem
            icon="pause-circle-outline"
            title="Konto deaktivieren"
            onPress={() => router.push('/settings/security/deactivate' as any)}
          />
          <SettingsItem
            icon="trash-outline"
            title="Konto dauerhaft löschen"
            onPress={() => router.push('/settings/security/delete-account' as any)}
            isDanger
            isLast
          />
        </SettingsSection>

        {/* 3. BENACHRICHTIGUNGEN */}
        <SettingsSection title="Benachrichtigungen">
          <SettingsItem
            icon="notifications-outline"
            title="Push-Benachrichtigungen"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="chatbox-outline"
            title="Kommentare"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="person-add-outline"
            title="Neue Follower"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="heart-outline"
            title="Likes"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="mail-outline"
            title="Nachrichten"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="at-outline"
            title="Erwähnungen & Antworten"
            onPress={() => router.push('/settings/notifications')}
          />
          <SettingsItem
            icon="layers-outline"
            title="Benachrichtigungen gruppieren"
            onPress={() => router.push('/settings/notifications')}
            isLast
          />
        </SettingsSection>

        {/* 4. PRIVATSPHÄRE */}
        <SettingsSection title="Privatsphäre">
          <SettingsItem
            icon="eye-off-outline"
            title="Privates Profil"
            subtitle={user?.is_private ? 'Aktiviert' : 'Deaktiviert'}
            onPress={() => router.push('/settings/privacy')}
          />
          <SettingsItem
            icon="search-outline"
            title="Wer darf mich finden?"
            onPress={() => router.push('/settings/privacy' as any)}
          />
          <SettingsItem
            icon="person-add-outline"
            title="Wer darf mir folgen?"
            onPress={() => router.push('/settings/privacy' as any)}
          />
          <SettingsItem
            icon="play-circle-outline"
            title="Wer darf meine Videos sehen?"
            onPress={() => router.push('/settings/privacy' as any)}
          />
          <SettingsItem
            icon="ban-outline"
            title="Blockierte Nutzer"
            onPress={() => router.push('/settings/privacy/blocked-users')}
          />
          <SettingsItem
            icon="eye-outline"
            title="Profilsichtbarkeit"
            subtitle="In Vorschlägen anzeigen"
            onPress={() => router.push('/settings/privacy' as any)}
            isLast
          />
        </SettingsSection>

        {/* 5. SPRACHE & REGION */}
        <SettingsSection title="Sprache & Region">
          <SettingsItem
            icon="language-outline"
            title="App-Sprache"
            subtitle="Deutsch"
            onPress={() => router.push('/settings/language' as any)}
          />
          <SettingsItem
            icon="globe-outline"
            title="Region"
            subtitle="Deutschland"
            onPress={() => router.push('/settings/region' as any)}
          />
          <SettingsItem
            icon="location-outline"
            title="Automatisch erkennen"
            onPress={() => router.push('/settings/location' as any)}
            isLast
          />
        </SettingsSection>

        {/* 6. ERSCHEINUNGSBILD */}
        <SettingsSection title="Erscheinungsbild">
          <SettingsItem
            icon="moon-outline"
            title="Design"
            subtitle={
              colorScheme === 'dark'
                ? 'Dark Mode'
                : colorScheme === 'light'
                ? 'Light Mode'
                : 'System'
            }
            onPress={() => router.push('/settings/appearance/theme')}
          />
          <SettingsItem
            icon="text-outline"
            title="Schriftgröße"
            subtitle="Normal"
            onPress={() => router.push('/settings/appearance/font-size' as any)}
          />
          <SettingsItem
            icon="flash-outline"
            title="Animationen"
            subtitle="Normal"
            onPress={() => router.push('/settings/appearance/animations' as any)}
          />
          <SettingsItem
            icon="accessibility-outline"
            title="Barrierefreiheit"
            onPress={() => router.push('/settings/appearance/accessibility' as any)}
            isLast
          />
        </SettingsSection>

        {/* 7. STANDORT */}
        <SettingsSection title="Standort">
          <SettingsItem
            icon="navigate-outline"
            title="Automatische Erkennung"
            onPress={() => router.push('/settings/location' as any)}
          />
          <SettingsItem
            icon="location-outline"
            title="Standort wählen"
            subtitle="Deutschland, Berlin"
            onPress={() => router.push('/settings/location' as any)}
          />
          <SettingsItem
            icon="business-outline"
            title="Für Market vorschlagen"
            onPress={() => router.push('/settings/location' as any)}
            isLast
          />
        </SettingsSection>

        {/* 8. AUDIO & VIDEO */}
        <SettingsSection title="Audio & Video">
          <SettingsItem
            icon="play-skip-forward-outline"
            title="Automatisches Weiter-Scrollen"
            subtitle={autoScrollEnabled 
              ? '✅ Aktiviert - Scrollt nach Video-Ende automatisch weiter' 
              : '⏸️ Deaktiviert - Nur manuelles Scrollen'
            }
            type="switch"
            value={autoScrollEnabled}
            onValueChange={handleAutoScrollToggle}
          />
          <SettingsItem
            icon="play-outline"
            title="Autoplay"
            onPress={() => router.push('/settings/media' as any)}
          />
          <SettingsItem
            icon="wifi-outline"
            title="Autoplay nur im WLAN"
            onPress={() => router.push('/settings/media' as any)}
          />
          <SettingsItem
            icon="volume-high-outline"
            title="Standard-Sound"
            onPress={() => router.push('/settings/media' as any)}
          />
          <SettingsItem
            icon="chatbox-ellipses-outline"
            title="Untertitel anzeigen"
            onPress={() => router.push('/settings/media' as any)}
          />
          <SettingsItem
            icon="videocam-outline"
            title="Videoqualität"
            subtitle="Automatisch"
            onPress={() => router.push('/settings/media' as any)}
            isLast
          />
        </SettingsSection>

        {/* 9. FAQ & SUPPORT */}
        <SettingsSection title="FAQ & Support">
          <SettingsItem
            icon="help-circle-outline"
            title="Häufige Fragen"
            onPress={() => router.push('/settings/support/faq')}
          />
          <SettingsItem
            icon="book-outline"
            title="Tutorials"
            onPress={() => router.push('/settings/support/tutorials' as any)}
          />
          <SettingsItem
            icon="flag-outline"
            title="Problem melden"
            onPress={() => router.push('/settings/support/report-problem' as any)}
          />
          <SettingsItem
            icon="chatbubbles-outline"
            title="Feedback senden"
            onPress={() => router.push('/settings/support/feedback' as any)}
          />
          <SettingsItem
            icon="mail-outline"
            title="Support kontaktieren"
            onPress={() => Alert.alert('Support', 'E-Mail: support@anpip.com')}
            isLast
          />
        </SettingsSection>

        {/* 10. RECHTLICHES */}
        <SettingsSection title="Rechtliches">
          <SettingsItem
            icon="shield-outline"
            title="Datenschutz"
            onPress={() => router.push('/settings/legal/privacy-policy' as any)}
          />
          <SettingsItem
            icon="document-text-outline"
            title="Nutzungsbedingungen"
            onPress={() => router.push('/settings/legal/terms-of-service' as any)}
          />
          <SettingsItem
            icon="information-circle-outline"
            title="Impressum"
            onPress={() => router.push('/settings/legal/imprint' as any)}
          />
          <SettingsItem
            icon="people-outline"
            title="Community-Richtlinien"
            onPress={() => router.push('/settings/legal/community-guidelines' as any)}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            title="Sicherheit & Jugendschutz"
            onPress={() => router.push('/settings/legal/community-guidelines' as any)}
            isLast
          />
        </SettingsSection>

        {/* 11. PREMIUM & ZAHLUNGEN */}
        <SettingsSection title="Premium & Zahlungen">
          <SettingsItem
            icon="card-outline"
            title="Zahlungsmethoden"
            onPress={() => router.push('/settings/payments/methods')}
          />
          <SettingsItem
            icon="star-outline"
            title="Abonnements verwalten"
            onPress={() => router.push('/settings/payments/subscriptions')}
          />
          <SettingsItem
            icon="receipt-outline"
            title="Rechnungsübersicht"
            onPress={() => router.push('/settings/payments/invoices' as any)}
            isLast
          />
        </SettingsSection>

        {/* 12. ABMELDEN */}
        <SettingsSection>
          <SettingsItem
            icon="log-out-outline"
            title="Abmelden"
            onPress={handleLogout}
            isDanger
            isLast
          />
        </SettingsSection>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  closeButton: {
    marginRight: 16,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 40,
  },
});
