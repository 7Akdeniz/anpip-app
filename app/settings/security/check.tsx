// ============================================================================
// ✅ KONTOSICHERHEIT PRÜFEN
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';

export default function SecurityCheckScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const securityScore = 75; // Mock

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Sicherheitscheck',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.scoreBox, isDark && styles.scoreBoxDark]}>
          <Text style={styles.scoreNumber}>{securityScore}%</Text>
          <Text style={[styles.scoreLabel, isDark && styles.scoreLabelDark]}>
            Sicherheitsbewertung
          </Text>
        </View>

        <SettingsSection title="Empfehlungen" isFirst>
          <SettingsItem
            icon="shield-checkmark-outline"
            title="2FA aktivieren"
            subtitle="Empfohlen"
            onPress={() => {}}
          />
          <SettingsItem
            icon="key-outline"
            title="Starkes Passwort verwenden"
            subtitle="Gut"
            onPress={() => {}}
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
  scoreBox: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  scoreBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: '#34C759',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
  },
  scoreLabelDark: {
    color: '#8E8E93',
  },
});
