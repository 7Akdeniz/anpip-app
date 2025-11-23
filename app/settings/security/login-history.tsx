// ============================================================================
// 🕒 LOGIN-HISTORIE
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoginHistoryScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const history = [
    {
      id: '1',
      device: 'iPhone 15 Pro',
      location: 'Berlin, Deutschland',
      timestamp: new Date().toISOString(),
      success: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Login-Historie',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <FlatList
        data={history}
        renderItem={({ item }) => (
          <View style={[styles.item, isDark && styles.itemDark]}>
            <Ionicons
              name={item.success ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={item.success ? '#34C759' : '#FF3B30'}
            />
            <View style={styles.itemContent}>
              <Text style={[styles.device, isDark && styles.deviceDark]}>
                {item.device}
              </Text>
              <Text style={[styles.detail, isDark && styles.detailDark]}>
                {item.location}
              </Text>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
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
  list: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  itemDark: {
    backgroundColor: '#1C1C1E',
  },
  itemContent: {
    marginLeft: 12,
    flex: 1,
  },
  device: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  deviceDark: {
    color: '#FFFFFF',
  },
  detail: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  detailDark: {
    color: '#8E8E93',
  },
});
