// ============================================================================
// ⚡ ANIMATIONEN
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type AnimationMode = 'normal' | 'reduced' | 'off';

export default function AnimationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedMode, setSelectedMode] = useState<AnimationMode>('normal');

  const modes: { value: AnimationMode; label: string; description: string }[] = [
    { value: 'normal', label: 'Normal', description: 'Alle Animationen aktiviert' },
    { value: 'reduced', label: 'Reduziert', description: 'Weniger Bewegungen' },
    { value: 'off', label: 'Aus', description: 'Keine Animationen' },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Animationen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.modeList, isDark && styles.modeListDark]}>
          {modes.map((mode, index) => (
            <TouchableOpacity
              key={mode.value}
              style={[
                styles.modeItem,
                isDark && styles.modeItemDark,
                index < modes.length - 1 && styles.borderBottom,
              ]}
              onPress={() => setSelectedMode(mode.value)}
            >
              <View style={styles.modeInfo}>
                <Text style={[styles.modeLabel, isDark && styles.modeLabelDark]}>
                  {mode.label}
                </Text>
                <Text style={[styles.modeDescription, isDark && styles.modeDescriptionDark]}>
                  {mode.description}
                </Text>
              </View>
              {selectedMode === mode.value && (
                <Ionicons name="checkmark" size={24} color="#FF3B30" />
              )}
            </TouchableOpacity>
          ))}
        </View>
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
  modeList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    overflow: 'hidden',
  },
  modeListDark: {
    backgroundColor: '#1C1C1E',
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  modeItemDark: {
    backgroundColor: '#1C1C1E',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  modeInfo: {
    flex: 1,
  },
  modeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  modeLabelDark: {
    color: '#FFFFFF',
  },
  modeDescription: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  modeDescriptionDark: {
    color: '#8E8E93',
  },
});
