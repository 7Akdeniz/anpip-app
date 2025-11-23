// ============================================================================
// 📥 DSGVO-DATENEXPORT
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
  ActivityIndicator,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function DataExportScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Export angefordert',
        'Du erhältst eine E-Mail mit einem Download-Link, sobald dein Export bereit ist.'
      );
    }, 2000);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Daten exportieren',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="information-circle" size={48} color="#007AFF" />
          <Text style={[styles.infoTitle, isDark && styles.infoTitleDark]}>
            DSGVO-Datenexport
          </Text>
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Lade alle deine persönlichen Daten herunter. Der Export enthält:
          </Text>
        </View>

        <View style={[styles.listBox, isDark && styles.listBoxDark]}>
          <View style={styles.listItem}>
            <Ionicons name="checkmark" size={20} color="#34C759" />
            <Text style={[styles.listText, isDark && styles.listTextDark]}>
              Profil und Kontoinformationen
            </Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="checkmark" size={20} color="#34C759" />
            <Text style={[styles.listText, isDark && styles.listTextDark]}>
              Alle hochgeladenen Videos
            </Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="checkmark" size={20} color="#34C759" />
            <Text style={[styles.listText, isDark && styles.listTextDark]}>
              Kommentare und Interaktionen
            </Text>
          </View>
          <View style={styles.listItem}>
            <Ionicons name="checkmark" size={20} color="#34C759" />
            <Text style={[styles.listText, isDark && styles.listTextDark]}>
              Verbindungen und Follower
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.exportButton, loading && styles.exportButtonDisabled]}
          onPress={handleExport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={24} color="#FFFFFF" />
              <Text style={styles.exportButtonText}>Export anfordern</Text>
            </>
          )}
        </TouchableOpacity>
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
    padding: 24,
    margin: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  infoBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginTop: 12,
  },
  infoTitleDark: {
    color: '#FFFFFF',
  },
  infoText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  infoTextDark: {
    color: '#8E8E93',
  },
  listBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
  },
  listBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  listText: {
    fontSize: 15,
    color: '#000000',
    marginLeft: 12,
  },
  listTextDark: {
    color: '#FFFFFF',
  },
  exportButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    margin: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    marginLeft: 8,
  },
});
