// ============================================================================
// ⏸️ KONTO DEAKTIVIEREN
// ============================================================================

import React, { useState } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function DeactivateAccountScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    Alert.alert(
      'Konto deaktivieren?',
      'Dein Profil wird ausgeblendet und du kannst es jederzeit durch erneute Anmeldung reaktivieren.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Deaktivieren',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                await supabase
                  .from('users')
                  .update({ 
                    is_active: false,
                    deactivated_at: new Date().toISOString() 
                  })
                  .eq('id', user.id);

                await supabase.auth.signOut();
                
                Alert.alert(
                  'Konto deaktiviert',
                  'Dein Konto wurde erfolgreich deaktiviert',
                  [{ text: 'OK', onPress: () => router.replace('/auth/login') }]
                );
              }
            } catch (error) {
              console.error('Fehler beim Deaktivieren:', error);
              Alert.alert('Fehler', 'Konto konnte nicht deaktiviert werden');
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
          title: 'Konto deaktivieren',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.infoBox}>
          <Ionicons name="pause-circle" size={64} color="#FF9500" />
          <Text style={styles.infoTitle}>Konto vorübergehend deaktivieren</Text>
          <Text style={styles.infoText}>
            Wenn du dein Konto deaktivierst:
          </Text>
        </View>

        <View style={[styles.featureBox, isDark && styles.featureBoxDark]}>
          <View style={styles.featureItem}>
            <Ionicons name="eye-off-outline" size={24} color="#FF9500" />
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              Dein Profil wird für andere Nutzer unsichtbar
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="save-outline" size={24} color="#34C759" />
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              Alle deine Daten bleiben erhalten
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="reload-outline" size={24} color="#34C759" />
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              Du kannst dein Konto jederzeit reaktivieren
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="alert-circle-outline" size={24} color="#8E8E93" />
            <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
              Deine Videos sind während der Deaktivierung nicht sichtbar
            </Text>
          </View>
        </View>

        <View style={[styles.compareBox, isDark && styles.compareBoxDark]}>
          <Text style={[styles.compareTitle, isDark && styles.compareTitleDark]}>
            Deaktivieren vs. Löschen
          </Text>
          <View style={styles.compareRow}>
            <Text style={[styles.compareLabel, isDark && styles.compareLabelDark]}>
              Deaktivieren:
            </Text>
            <Text style={[styles.compareValue, isDark && styles.compareValueDark]}>
              Temporär, reversibel
            </Text>
          </View>
          <View style={styles.compareRow}>
            <Text style={[styles.compareLabel, isDark && styles.compareLabelDark]}>
              Löschen:
            </Text>
            <Text style={[styles.compareValue, isDark && styles.compareValueDark]}>
              Permanent, endgültig
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.deactivateButton, loading && styles.deactivateButtonDisabled]}
          onPress={handleDeactivate}
          disabled={loading}
        >
          <Text style={styles.deactivateButtonText}>
            {loading ? 'Wird deaktiviert...' : 'Konto jetzt deaktivieren'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, isDark && styles.cancelButtonTextDark]}>
            Abbrechen
          </Text>
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
  infoBox: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  infoTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  featureBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  featureBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  featureText: {
    fontSize: 15,
    color: '#000000',
    marginLeft: 12,
    flex: 1,
  },
  featureTextDark: {
    color: '#FFFFFF',
  },
  compareBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
  },
  compareBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  compareTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  compareTitleDark: {
    color: '#FFFFFF',
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  compareLabel: {
    fontSize: 15,
    color: '#8E8E93',
  },
  compareLabelDark: {
    color: '#8E8E93',
  },
  compareValue: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '500',
  },
  compareValueDark: {
    color: '#FFFFFF',
  },
  deactivateButton: {
    backgroundColor: '#FF9500',
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deactivateButtonDisabled: {
    opacity: 0.6,
  },
  deactivateButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
  },
  cancelButtonTextDark: {
    color: '#0A84FF',
  },
  bottomSpacer: {
    height: 40,
  },
});
