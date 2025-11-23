// ============================================================================
// ✉️ E-MAIL ÄNDERN
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

export default function ChangeEmailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    loadCurrentEmail();
  }, []);

  const loadCurrentEmail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentEmail(user.email || '');
      }
    } catch (error) {
      console.error('Fehler beim Laden der E-Mail:', error);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !password) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    if (!newEmail.includes('@')) {
      Alert.alert('Fehler', 'Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }

    if (newEmail === currentEmail) {
      Alert.alert('Fehler', 'Die neue E-Mail ist identisch mit der aktuellen');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      Alert.alert(
        'Bestätigungs-E-Mail versendet',
        'Wir haben dir eine E-Mail an deine neue Adresse gesendet. Bitte bestätige diese, um die Änderung abzuschließen.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Fehler beim Ändern der E-Mail:', error);
      Alert.alert('Fehler', error.message || 'E-Mail konnte nicht geändert werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'E-Mail ändern',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Nach der Änderung erhältst du eine Bestätigungs-E-Mail an deine neue Adresse.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Aktuelle E-Mail */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Aktuelle E-Mail
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark, styles.disabledInput]}
              value={currentEmail}
              editable={false}
            />
          </View>

          {/* Neue E-Mail */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Neue E-Mail-Adresse
            </Text>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              value={newEmail}
              onChangeText={setNewEmail}
              placeholder="neue@email.com"
              placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Passwort zur Bestätigung */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Passwort bestätigen
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={password}
                onChangeText={setPassword}
                placeholder="Dein Passwort"
                placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#8E8E93' : '#C7C7CC'}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleChangeEmail}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>E-Mail ändern</Text>
            )}
          </TouchableOpacity>
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
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  infoBoxDark: {
    backgroundColor: '#1C2A3A',
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    flex: 1,
  },
  infoTextDark: {
    color: '#64B5F6',
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
  disabledInput: {
    backgroundColor: '#F2F2F7',
    color: '#8E8E93',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  saveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
