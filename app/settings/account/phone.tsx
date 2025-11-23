// ============================================================================
// 📱 TELEFONNUMMER VERWALTEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function PhoneScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [hasPhone, setHasPhone] = useState(false);

  useEffect(() => {
    loadPhone();
  }, []);

  const loadPhone = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('phone')
          .eq('id', user.id)
          .single();
        
        if (data?.phone) {
          setPhone(data.phone);
          setHasPhone(true);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden:', error);
    }
  };

  const handleSave = async () => {
    if (!phone.trim()) {
      Alert.alert('Fehler', 'Bitte gib eine Telefonnummer ein');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ phone })
          .eq('id', user.id);

        if (error) throw error;

        Alert.alert('Erfolg', 'Telefonnummer wurde gespeichert', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      console.error('Fehler:', error);
      Alert.alert('Fehler', 'Telefonnummer konnte nicht gespeichert werden');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    Alert.alert(
      'Telefonnummer entfernen?',
      'Möchtest du deine Telefonnummer wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase
                  .from('users')
                  .update({ phone: null })
                  .eq('id', user.id);
                setPhone('');
                setHasPhone(false);
              }
            } catch (error) {
              Alert.alert('Fehler', 'Telefonnummer konnte nicht entfernt werden');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Telefonnummer',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="call" size={24} color="#34C759" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Eine Telefonnummer hilft bei der Kontowiederherstellung und ermöglicht zusätzliche Sicherheitsfunktionen.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Telefonnummer
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+49 123 456789"
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {hasPhone ? 'Aktualisieren' : 'Hinzufügen'}
              </Text>
            )}
          </TouchableOpacity>

          {hasPhone && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemove}
            >
              <Text style={styles.removeButtonText}>
                Telefonnummer entfernen
              </Text>
            </TouchableOpacity>
          )}
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
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoBoxDark: {
    backgroundColor: '#1A2E1A',
  },
  infoText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 12,
    flex: 1,
  },
  infoTextDark: {
    color: '#81C784',
  },
  form: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  labelDark: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  inputDark: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
    borderColor: '#38383A',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  removeButton: {
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#FF3B30',
    fontSize: 17,
    fontWeight: '600',
  },
});
