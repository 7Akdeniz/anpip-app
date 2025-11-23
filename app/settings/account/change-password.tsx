// ============================================================================
// 🔐 PASSWORT ÄNDERN
// ============================================================================

import React, { useState } from 'react';
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

export default function ChangePasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Fehler', 'Bitte fülle alle Felder aus');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Fehler', 'Das neue Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Fehler', 'Die Passwörter stimmen nicht überein');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      Alert.alert('Erfolg', 'Passwort wurde erfolgreich geändert', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Fehler beim Ändern des Passworts:', error);
      Alert.alert('Fehler', error.message || 'Passwort konnte nicht geändert werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Passwort ändern',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* Aktuelles Passwort */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Aktuelles Passwort
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Aktuelles Passwort"
                placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
                secureTextEntry={!showCurrent}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowCurrent(!showCurrent)}
              >
                <Ionicons
                  name={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#8E8E93' : '#C7C7CC'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Neues Passwort */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Neues Passwort
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Mindestens 8 Zeichen"
                placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
                secureTextEntry={!showNew}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNew(!showNew)}
              >
                <Ionicons
                  name={showNew ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#8E8E93' : '#C7C7CC'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Passwort bestätigen */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isDark && styles.labelDark]}>
              Passwort bestätigen
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, isDark && styles.inputDark]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Neues Passwort wiederholen"
                placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={isDark ? '#8E8E93' : '#C7C7CC'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sicherheitshinweis */}
          <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
            <Ionicons
              name="information-circle"
              size={20}
              color={isDark ? '#0A84FF' : '#007AFF'}
              style={styles.infoIcon}
            />
            <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
              Dein Passwort sollte mindestens 8 Zeichen lang sein und Buchstaben, Zahlen und Sonderzeichen enthalten.
            </Text>
          </View>

          {/* Speichern Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Passwort ändern</Text>
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
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  labelDark: {
    color: '#8E8E93',
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    paddingRight: 50,
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
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E5F3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
  },
  infoBoxDark: {
    backgroundColor: '#1C2633',
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#007AFF',
    lineHeight: 18,
  },
  infoTextDark: {
    color: '#0A84FF',
  },
  saveButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
