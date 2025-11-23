// ============================================================================
// 📦 SETTINGS SECTION COMPONENT - Grouped Settings
// ============================================================================

import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  isFirst?: boolean;
}

export default function SettingsSection({
  title,
  children,
  isFirst = false,
}: SettingsSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.container, isFirst && styles.firstSection]}>
      {title && (
        <Text style={[styles.title, isDark && styles.titleDark]}>{title}</Text>
      )}
      <View style={[styles.content, isDark && styles.contentDark]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  firstSection: {
    marginTop: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  titleDark: {
    color: '#8E8E93',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  contentDark: {
    backgroundColor: '#1C1C1E',
  },
});
