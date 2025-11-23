// ============================================================================
// 🔐 ZWEI-FAKTOR-AUTHENTIFIZIERUNG (2FA)
// ============================================================================

import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/lib/supabase';
import SettingsSection from '@/components/settings/SettingsSection';
import SettingsItem from '@/components/settings/SettingsItem';

export default function TwoFactorScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('two_factor_enabled')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setEnabled(data.two_factor_enabled || false);
        }
      }
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (enabled) {
      Alert.alert(
        '2FA deaktivieren?',
        'Möchtest du die Zwei-Faktor-Authentifizierung wirklich deaktivieren? Dein Konto ist dann weniger sicher.',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Deaktivieren',
            style: 'destructive',
            onPress: async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await supabase
                    .from('users')
                    .update({ two_factor_enabled: false })
                    .eq('id', user.id);
                  setEnabled(false);
                }
              } catch (error) {
                Alert.alert('Fehler', '2FA konnte nicht deaktiviert werden');
              }
            },
          },
        ]
      );
    } else {
      Alert.alert('Info', '2FA-Setup wird implementiert');
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: '2FA-Authentifizierung',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.statusBox, enabled && styles.statusBoxEnabled]}>
          <Ionicons
            name={enabled ? 'shield-checkmark' : 'shield-outline'}
            size={48}
            color={enabled ? '#34C759' : '#8E8E93'}
          />
          <Text style={[styles.statusTitle, enabled && styles.statusTitleEnabled]}>
            {enabled ? '2FA ist aktiviert' : '2FA ist deaktiviert'}
          </Text>
          <Text style={styles.statusText}>
            {enabled
              ? 'Dein Konto ist durch Zwei-Faktor-Authentifizierung geschützt'
              : 'Aktiviere 2FA für zusätzlichen Schutz'}
          </Text>
        </View>

        <SettingsSection title="Einstellungen" isFirst>
          <SettingsItem
            icon="shield-checkmark-outline"
            title="2FA aktivieren/deaktivieren"
            subtitle={enabled ? 'Aktiviert' : 'Deaktiviert'}
            type="switch"
            value={enabled}
            onValueChange={handleToggle2FA}
            isLast
          />
        </SettingsSection>

        {enabled && (
          <SettingsSection title="Verwaltung">
            <SettingsItem
              icon="qr-code-outline"
              title="QR-Code anzeigen"
              onPress={() => Alert.alert('Info', 'QR-Code-Ansicht in Entwicklung')}
            />
            <SettingsItem
              icon="key-outline"
              title="Backup-Codes generieren"
              onPress={() => Alert.alert('Info', 'Backup-Codes in Entwicklung')}
              isLast
            />
          </SettingsSection>
        )}
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
  statusBox: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  statusBoxEnabled: {
    backgroundColor: '#E8F5E9',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
  },
  statusTitleEnabled: {
    color: '#34C759',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
});
