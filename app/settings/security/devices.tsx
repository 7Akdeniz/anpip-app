// ============================================================================
// 📱 AKTIVE GERÄTE
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import type { UserSession } from '@/types/settings';

export default function DevicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      // Mock-Daten für Demo-Zwecke
      const mockSessions: UserSession[] = [
        {
          id: '1',
          device_name: 'iPhone 15 Pro',
          device_type: 'mobile',
          location: 'Berlin, Deutschland',
          ip_address: '192.168.1.1',
          last_active: new Date().toISOString(),
          is_current: true,
        },
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDevice = (session: UserSession) => {
    Alert.alert(
      'Gerät entfernen',
      `Möchtest du ${session.device_name} wirklich abmelden?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: () => {
            setSessions(sessions.filter(s => s.id !== session.id));
            Alert.alert('Erfolg', 'Gerät wurde abgemeldet');
          },
        },
      ]
    );
  };

  const getDeviceIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'mobile':
        return 'phone-portrait-outline';
      case 'tablet':
        return 'tablet-portrait-outline';
      case 'desktop':
        return 'desktop-outline';
      default:
        return 'phone-portrait-outline';
    }
  };

  const renderSession = ({ item }: { item: UserSession }) => (
    <View style={[styles.sessionItem, isDark && styles.sessionItemDark]}>
      <View style={styles.sessionIcon}>
        <Ionicons
          name={getDeviceIcon(item.device_type)}
          size={32}
          color={item.is_current ? '#34C759' : isDark ? '#FFFFFF' : '#000000'}
        />
      </View>
      <View style={styles.sessionInfo}>
        <View style={styles.sessionHeader}>
          <Text style={[styles.deviceName, isDark && styles.deviceNameDark]}>
            {item.device_name}
          </Text>
          {item.is_current && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentBadgeText}>Aktuell</Text>
            </View>
          )}
        </View>
        <Text style={[styles.sessionDetail, isDark && styles.sessionDetailDark]}>
          {item.location}
        </Text>
        <Text style={[styles.sessionDetail, isDark && styles.sessionDetailDark]}>
          Zuletzt aktiv: {new Date(item.last_active).toLocaleString('de-DE')}
        </Text>
      </View>
      {!item.is_current && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveDevice(item)}
        >
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Aktive Geräte',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <FlatList
        data={sessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="phone-portrait-outline"
              size={64}
              color={isDark ? '#8E8E93' : '#C7C7CC'}
            />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              Keine aktiven Geräte
            </Text>
          </View>
        }
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
  listContent: {
    padding: 16,
  },
  sessionItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  sessionItemDark: {
    backgroundColor: '#1C1C1E',
  },
  sessionIcon: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  deviceNameDark: {
    color: '#FFFFFF',
  },
  currentBadge: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  sessionDetail: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  sessionDetailDark: {
    color: '#8E8E93',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
  },
  emptyTextDark: {
    color: '#8E8E93',
  },
});
