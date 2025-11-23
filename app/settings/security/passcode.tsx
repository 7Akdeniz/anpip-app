// ============================================================================
// 🔢 APP-PASSCODE
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';

export default function PasscodeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [enabled, setEnabled] = useState(false);

  const handleToggle = () => {
    if (!enabled) {
      Alert.alert('Info', 'Passcode-Setup in Entwicklung');
    } else {
      setEnabled(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'App-Passcode',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <SettingsSection title="Passcode" isFirst>
          <SettingsItem
            icon="keypad-outline"
            title="Passcode aktivieren"
            type="switch"
            value={enabled}
            onValueChange={handleToggle}
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
