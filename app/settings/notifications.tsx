// ============================================================================
// 🔔 BENACHRICHTIGUNGEN
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
import { Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';
import type { NotificationSettings } from '@/types/settings';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<NotificationSettings>({
    push_enabled: true,
    comments: true,
    followers: true,
    likes: true,
    messages: true,
    mentions: true,
    group_notifications: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('notification_settings')
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

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('notification_settings')
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

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Benachrichtigungen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Allgemein" isFirst>
          <SettingsItem
            icon="notifications-outline"
            title="Push-Benachrichtigungen"
            type="switch"
            value={settings.push_enabled}
            onValueChange={(value) => updateSetting('push_enabled', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Interaktionen">
          <SettingsItem
            icon="chatbox-outline"
            title="Kommentare"
            subtitle="Bei neuen Kommentaren auf deine Videos"
            type="switch"
            value={settings.comments}
            onValueChange={(value) => updateSetting('comments', value)}
          />
          <SettingsItem
            icon="person-add-outline"
            title="Neue Follower"
            subtitle="Wenn dir jemand folgt"
            type="switch"
            value={settings.followers}
            onValueChange={(value) => updateSetting('followers', value)}
          />
          <SettingsItem
            icon="heart-outline"
            title="Likes"
            subtitle="Bei Likes auf deine Videos"
            type="switch"
            value={settings.likes}
            onValueChange={(value) => updateSetting('likes', value)}
          />
          <SettingsItem
            icon="at-outline"
            title="Erwähnungen & Antworten"
            subtitle="Wenn du erwähnt oder dir geantwortet wird"
            type="switch"
            value={settings.mentions}
            onValueChange={(value) => updateSetting('mentions', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Nachrichten">
          <SettingsItem
            icon="mail-outline"
            title="Direktnachrichten"
            subtitle="Bei neuen Nachrichten"
            type="switch"
            value={settings.messages}
            onValueChange={(value) => updateSetting('messages', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Weitere Optionen">
          <SettingsItem
            icon="layers-outline"
            title="Benachrichtigungen gruppieren"
            subtitle="Mehrere Benachrichtigungen zusammenfassen"
            type="switch"
            value={settings.group_notifications}
            onValueChange={(value) => updateSetting('group_notifications', value)}
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
