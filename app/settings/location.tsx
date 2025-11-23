// ============================================================================
// 📍 STANDORT EINSTELLUNGEN
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
import type { LocationSettings } from '@/types/settings';

export default function LocationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState<LocationSettings>({
    auto_detect: true,
    country: 'Deutschland',
    city: 'Berlin',
    suggest_for_market: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('location_settings')
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

  const updateSetting = async (key: keyof LocationSettings, value: any) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('location_settings')
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
          title: 'Standort',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Standorterkennung" isFirst>
          <SettingsItem
            icon="navigate-outline"
            title="Automatische Erkennung"
            subtitle="Standort automatisch ermitteln"
            type="switch"
            value={settings.auto_detect}
            onValueChange={(value) => updateSetting('auto_detect', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Manueller Standort">
          <SettingsItem
            icon="globe-outline"
            title="Land"
            subtitle={settings.country || 'Nicht festgelegt'}
            onPress={() => Alert.alert('Info', 'Länderauswahl in Entwicklung')}
          />
          <SettingsItem
            icon="location-outline"
            title="Stadt"
            subtitle={settings.city || 'Nicht festgelegt'}
            onPress={() => Alert.alert('Info', 'Städteauswahl in Entwicklung')}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Market">
          <SettingsItem
            icon="business-outline"
            title="Für Market vorschlagen"
            subtitle="Standort für lokale Angebote nutzen"
            type="switch"
            value={settings.suggest_for_market}
            onValueChange={(value) => updateSetting('suggest_for_market', value)}
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
