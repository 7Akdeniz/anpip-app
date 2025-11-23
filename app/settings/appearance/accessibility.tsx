// ============================================================================
// ♿ BARRIEREFREIHEIT
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';

export default function AccessibilityScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    screenReader: false,
    colorBlindMode: false,
  });

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Barrierefreiheit',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Sehen" isFirst>
          <SettingsItem
            icon="contrast-outline"
            title="Hoher Kontrast"
            subtitle="Verbesserte Lesbarkeit"
            type="switch"
            value={settings.highContrast}
            onValueChange={(value) => updateSetting('highContrast', value)}
          />
          <SettingsItem
            icon="text-outline"
            title="Große Schrift"
            subtitle="Schriftgröße erhöhen"
            type="switch"
            value={settings.largeText}
            onValueChange={(value) => updateSetting('largeText', value)}
          />
          <SettingsItem
            icon="color-palette-outline"
            title="Farbenblind-Modus"
            subtitle="Angepasste Farbpalette"
            type="switch"
            value={settings.colorBlindMode}
            onValueChange={(value) => updateSetting('colorBlindMode', value)}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Hören">
          <SettingsItem
            icon="chatbox-ellipses-outline"
            title="Untertitel automatisch"
            subtitle="Immer Untertitel anzeigen"
            type="switch"
            value={false}
            onValueChange={() => {}}
            isLast
          />
        </SettingsSection>

        <SettingsSection title="Interaktion">
          <SettingsItem
            icon="mic-outline"
            title="Screenreader-Support"
            subtitle="VoiceOver/TalkBack"
            type="switch"
            value={settings.screenReader}
            onValueChange={(value) => updateSetting('screenReader', value)}
            isLast
          />
        </SettingsSection>
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
});
