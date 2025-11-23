// ============================================================================
// 🎨 ERSCHEINUNGSBILD - THEME
// ============================================================================

import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeScreen() {
  const systemColorScheme = useColorScheme();
  const isDark = systemColorScheme === 'dark';
  const [selectedTheme, setSelectedTheme] = useState<Theme>('system');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('theme');
      if (saved) {
        setSelectedTheme(saved as Theme);
      }
    } catch (error) {
      console.error('Fehler beim Laden des Themes:', error);
    }
  };

  const handleSelectTheme = async (theme: Theme) => {
    try {
      setSelectedTheme(theme);
      await AsyncStorage.setItem('theme', theme);
    } catch (error) {
      console.error('Fehler beim Speichern des Themes:', error);
    }
  };

  const themes: { value: Theme; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { value: 'light', label: 'Light Mode', icon: 'sunny-outline' },
    { value: 'dark', label: 'Dark Mode', icon: 'moon-outline' },
    { value: 'system', label: 'System', icon: 'phone-portrait-outline' },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Design',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.section, isDark && styles.sectionDark]}>
          {themes.map((theme, index) => (
            <TouchableOpacity
              key={theme.value}
              style={[
                styles.item,
                isDark && styles.itemDark,
                index < themes.length - 1 && styles.borderBottom,
              ]}
              onPress={() => handleSelectTheme(theme.value)}
            >
              <View style={styles.leftContent}>
                <Ionicons
                  name={theme.icon}
                  size={22}
                  color={isDark ? '#FFFFFF' : '#000000'}
                  style={styles.icon}
                />
                <Text style={[styles.label, isDark && styles.labelDark]}>
                  {theme.label}
                </Text>
              </View>
              {selectedTheme === theme.value && (
                <Ionicons name="checkmark" size={22} color="#FF3B30" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.hint, isDark && styles.hintDark]}>
          Bei "System" wird automatisch das Design deines Geräts verwendet.
        </Text>
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
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    overflow: 'hidden',
  },
  sectionDark: {
    backgroundColor: '#1C1C1E',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  itemDark: {
    backgroundColor: '#1C1C1E',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
    width: 24,
  },
  label: {
    fontSize: 16,
    color: '#000000',
  },
  labelDark: {
    color: '#FFFFFF',
  },
  hint: {
    fontSize: 13,
    color: '#8E8E93',
    marginHorizontal: 16,
    marginTop: 12,
    lineHeight: 18,
  },
  hintDark: {
    color: '#8E8E93',
  },
});
