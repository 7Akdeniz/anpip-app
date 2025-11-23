// ============================================================================
// 🔐 KONTO LÖSCHEN
// ============================================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmation.toLowerCase() !== 'löschen') {
      Alert.alert('Fehler', 'Bitte gib "löschen" ein, um fortzufahren');
      return;
    }

    Alert.alert(
      'Konto dauerhaft löschen?',
      'Diese Aktion kann nicht rückgängig gemacht werden. Alle deine Daten, Videos und Follower werden permanent gelöscht.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Endgültig löschen',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                // Mark account for deletion
                await supabase
                  .from('users')
                  .update({ deleted_at: new Date().toISOString() })
                  .eq('id', user.id);

                // Sign out
                await supabase.auth.signOut();
                
                Alert.alert(
                  'Konto gelöscht',
                  'Dein Konto wurde erfolgreich gelöscht',
                  [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
                );
              }
            } catch (error) {
              console.error('Fehler beim Löschen:', error);
              Alert.alert('Fehler', 'Konto konnte nicht gelöscht werden');
            } finally {
              setLoading(false);
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
          title: 'Konto löschen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.warningBox}>
          <Ionicons name="warning" size={64} color="#FF3B30" />
          <Text style={styles.warningTitle}>Achtung!</Text>
          <Text style={styles.warningText}>
            Das Löschen deines Kontos ist permanent und kann nicht rückgängig gemacht werden.
          </Text>
        </View>

        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
            Was wird gelöscht?
          </Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#FF3B30" />
            <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
              Alle deine Videos und Inhalte
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#FF3B30" />
            <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
              Deine Follower und Verbindungen
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#FF3B30" />
            <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
              Alle Kommentare und Likes
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#FF3B30" />
            <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
              Dein Profil und persönliche Daten
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="checkmark-circle" size={20} color="#FF3B30" />
            <Text style={[styles.infoItemText, isDark && styles.infoItemTextDark]}>
              Premium-Abonnements (keine Rückerstattung)
            </Text>
          </View>
        </View>

        <View style={[styles.alternativeBox, isDark && styles.alternativeBoxDark]}>
          <Ionicons name="information-circle" size={24} color="#007AFF" />
          <View style={styles.alternativeContent}>
            <Text style={[styles.alternativeTitle, isDark && styles.alternativeTitleDark]}>
              Alternative: Konto deaktivieren
            </Text>
            <Text style={[styles.alternativeText, isDark && styles.alternativeTextDark]}>
              Du kannst dein Konto auch vorübergehend deaktivieren. Dabei bleiben alle deine Daten erhalten.
            </Text>
            <TouchableOpacity
              style={styles.alternativeButton}
              onPress={() => router.push('/settings/security/deactivate' as any)}
            >
              <Text style={styles.alternativeButtonText}>Konto deaktivieren</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.confirmBox, isDark && styles.confirmBoxDark]}>
          <Text style={[styles.confirmLabel, isDark && styles.confirmLabelDark]}>
            Gib "löschen" ein, um fortzufahren:
          </Text>
          <TextInput
            style={[styles.confirmInput, isDark && styles.confirmInputDark]}
            value={confirmation}
            onChangeText={setConfirmation}
            placeholder="löschen"
            placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
          onPress={handleDeleteAccount}
          disabled={loading || confirmation.toLowerCase() !== 'löschen'}
        >
          <Text style={styles.deleteButtonText}>Konto dauerhaft löschen</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
  warningBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  infoBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  infoTitleDark: {
    color: '#FFFFFF',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoItemText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 12,
  },
  infoItemTextDark: {
    color: '#FFFFFF',
  },
  alternativeBox: {
    flexDirection: 'row',
    backgroundColor: '#E5F3FF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  alternativeBoxDark: {
    backgroundColor: '#1C2633',
  },
  alternativeContent: {
    flex: 1,
    marginLeft: 12,
  },
  alternativeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  alternativeTitleDark: {
    color: '#0A84FF',
  },
  alternativeText: {
    fontSize: 13,
    color: '#007AFF',
    lineHeight: 18,
    marginBottom: 12,
  },
  alternativeTextDark: {
    color: '#0A84FF',
  },
  alternativeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  alternativeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  confirmBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  confirmLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  confirmLabelDark: {
    color: '#FFFFFF',
  },
  confirmInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  confirmInputDark: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderColor: '#38383A',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  deleteButtonDisabled: {
    opacity: 0.4,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
