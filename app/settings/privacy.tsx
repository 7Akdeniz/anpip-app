// ============================================================================
// 🔒 PRIVATSPHÄRE
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import type { PrivacySettings } from '@/types/settings';

export default function PrivacyScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<PrivacySettings>({
    is_private: false,
    who_can_find_me: 'everyone',
    who_can_follow: 'everyone',
    who_can_see_videos: 'everyone',
    show_in_suggestions: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('privacy_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data) {
          setSettings(data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Einstellungen:', error);
    }
  };

  const togglePrivateAccount = async (value: boolean) => {
    try {
      const newSettings = { ...settings, is_private: value };
      setSettings(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('privacy_settings')
          .upsert({
            user_id: user.id,
            ...newSettings,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Einstellung konnte nicht gespeichert werden');
    }
  };

  const toggleSuggestions = async (value: boolean) => {
    try {
      const newSettings = { ...settings, show_in_suggestions: value };
      setSettings(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('privacy_settings')
          .upsert({
            user_id: user.id,
            ...newSettings,
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      Alert.alert('Fehler', 'Einstellung konnte nicht gespeichert werden');
    }
  };

  const getWhoCanLabel = (value: string) => {
    switch (value) {
      case 'everyone':
        return 'Jeder';
      case 'nobody':
        return 'Niemand';
      case 'verified':
        return 'Nur bestätigte Nutzer';
      default:
        return 'Jeder';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Privatsphäre',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Konto-Privatsphäre" isFirst>
          <SettingsItem
            icon="eye-off-outline"
            title="Privates Profil"
            subtitle={settings.is_private ? 'Aktiviert' : 'Deaktiviert'}
            type="switch"
            value={settings.is_private}
            onValueChange={togglePrivateAccount}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Sichtbarkeit">
          <SettingsItem
            icon="search-outline"
            title="Wer darf mich finden?"
            subtitle={getWhoCanLabel(settings.who_can_find_me)}
            onPress={() => router.push('/settings/privacy/who-can-find' as any)}
          />
          <SettingsItem
            icon="person-add-outline"
            title="Wer darf mir folgen?"
            subtitle={getWhoCanLabel(settings.who_can_follow)}
            onPress={() => router.push('/settings/privacy/who-can-follow' as any)}
          />
          <SettingsItem
            icon="play-circle-outline"
            title="Wer darf meine Videos sehen?"
            subtitle={getWhoCanLabel(settings.who_can_see_videos)}
            onPress={() => router.push('/settings/privacy/who-can-see-videos' as any)}
          />
          <SettingsItem
            icon="eye-outline"
            title="In Vorschlägen anzeigen"
            type="switch"
            value={settings.show_in_suggestions}
            onValueChange={toggleSuggestions}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Blockierte Nutzer">
          <SettingsItem
            icon="ban-outline"
            title="Blockierte Nutzer"
            subtitle="Nutzer verwalten, die du blockiert hast"
            onPress={() => router.push('/settings/privacy/blocked-users' as any)}
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
  bottomSpacer: {
    height: 40,
  },
});
