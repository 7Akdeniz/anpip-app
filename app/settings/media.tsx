// ============================================================================
// 🎥 AUDIO & VIDEO EINSTELLUNGEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
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
import type { MediaSettings } from '@/types/settings';

export default function MediaScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<MediaSettings>({
    autoplay: true,
    autoplay_wifi_only: false,
    default_sound: true,
    always_show_captions: false,
    video_quality: 'auto',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('media_settings')
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

  const updateSetting = async (key: keyof MediaSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('media_settings')
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

  const getQualityLabel = (quality: string) => {
    switch (quality) {
      case 'auto':
        return 'Automatisch';
      case 'low':
        return 'Niedrig (Daten sparen)';
      case 'high':
        return 'Hoch (HD)';
      default:
        return 'Automatisch';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Audio & Video',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Wiedergabe" isFirst>
          <SettingsItem
            icon="play-outline"
            title="Autoplay"
            subtitle="Videos automatisch abspielen"
            type="switch"
            value={settings.autoplay}
            onValueChange={(value) => updateSetting('autoplay', value)}
          />
          <SettingsItem
            icon="wifi-outline"
            title="Autoplay nur im WLAN"
            subtitle="Mobiles Datenvolumen schonen"
            type="switch"
            value={settings.autoplay_wifi_only}
            onValueChange={(value) => updateSetting('autoplay_wifi_only', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Audio">
          <SettingsItem
            icon="volume-high-outline"
            title="Standard-Sound"
            subtitle="Videos mit Sound starten"
            type="switch"
            value={settings.default_sound}
            onValueChange={(value) => updateSetting('default_sound', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Untertitel">
          <SettingsItem
            icon="chatbox-ellipses-outline"
            title="Untertitel immer anzeigen"
            type="switch"
            value={settings.always_show_captions}
            onValueChange={(value) => updateSetting('always_show_captions', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Qualität">
          <SettingsItem
            icon="videocam-outline"
            title="Videoqualität"
            subtitle={getQualityLabel(settings.video_quality)}
            onPress={() => Alert.alert('Info', 'Qualitätsauswahl in Entwicklung')}
            isLast
          />
        </SettingsSection>

        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            💡 Tipp: Bei automatischer Qualität passt sich die Videoqualität an deine Internetgeschwindigkeit an.
          </Text>
        </View>

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
  infoBox: {
    backgroundColor: '#E5F3FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
  },
  infoBoxDark: {
    backgroundColor: '#1C2633',
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  infoTextDark: {
    color: '#0A84FF',
  },
  bottomSpacer: {
    height: 40,
  },
});
