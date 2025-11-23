// ============================================================================
// 📏 SCHRIFTGRÖSSE
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

type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

export default function FontSizeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedSize, setSelectedSize] = useState<FontSize>('medium');

  const sizes: { value: FontSize; label: string; preview: number }[] = [
    { value: 'small', label: 'Klein', preview: 14 },
    { value: 'medium', label: 'Normal', preview: 16 },
    { value: 'large', label: 'Groß', preview: 18 },
    { value: 'xlarge', label: 'Sehr groß', preview: 20 },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Schriftgröße',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.preview, isDark && styles.previewDark]}>
          <Text style={[
            styles.previewText,
            isDark && styles.previewTextDark,
            { fontSize: sizes.find(s => s.value === selectedSize)?.preview },
          ]}>
            Beispieltext in gewählter Schriftgröße
          </Text>
        </View>

        <View style={[styles.sizeList, isDark && styles.sizeListDark]}>
          {sizes.map((size, index) => (
            <TouchableOpacity
              key={size.value}
              style={[
                styles.sizeItem,
                isDark && styles.sizeItemDark,
                index < sizes.length - 1 && styles.borderBottom,
              ]}
              onPress={() => setSelectedSize(size.value)}
            >
              <View style={styles.sizeInfo}>
                <Text style={[styles.sizeLabel, isDark && styles.sizeLabelDark]}>
                  {size.label}
                </Text>
                <Text style={[styles.sizePreview, isDark && styles.sizePreviewDark, { fontSize: size.preview }]}>
                  Aa
                </Text>
              </View>
              {selectedSize === size.value && (
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
  preview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 24,
    alignItems: 'center',
  },
  previewDark: {
    backgroundColor: '#1C1C1E',
  },
  previewText: {
    color: '#000000',
    textAlign: 'center',
  },
  previewTextDark: {
    color: '#FFFFFF',
  },
  sizeList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sizeListDark: {
    backgroundColor: '#1C1C1E',
  },
  sizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  sizeItemDark: {
    backgroundColor: '#1C1C1E',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  sizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  sizeLabelDark: {
    color: '#FFFFFF',
  },
  sizePreview: {
    fontWeight: '700',
    color: '#8E8E93',
    marginRight: 12,
  },
  sizePreviewDark: {
    color: '#8E8E93',
  },
});
