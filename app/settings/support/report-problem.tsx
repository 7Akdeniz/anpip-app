// ============================================================================
// 🚩 PROBLEM MELDEN
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
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type ProblemCategory = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export default function ReportProblemScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const categories: ProblemCategory[] = [
    { id: 'bug', label: 'Technischer Fehler', icon: 'bug-outline' },
    { id: 'upload', label: 'Upload-Problem', icon: 'cloud-upload-outline' },
    { id: 'video', label: 'Video-Wiedergabe', icon: 'play-circle-outline' },
    { id: 'account', label: 'Konto & Login', icon: 'person-outline' },
    { id: 'payment', label: 'Zahlung & Abo', icon: 'card-outline' },
    { id: 'privacy', label: 'Datenschutz', icon: 'shield-outline' },
    { id: 'other', label: 'Sonstiges', icon: 'ellipsis-horizontal-outline' },
  ];

  const handleSubmit = async () => {
    if (!selectedCategory || !description.trim()) {
      Alert.alert('Fehler', 'Bitte wähle eine Kategorie und beschreibe das Problem');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Problem-Bericht in Datenbank speichern
        const { error } = await supabase
          .from('problem_reports')
          .insert({
            user_id: user.id,
            category: selectedCategory,
            description: description,
            status: 'open',
          });

        if (error) throw error;

        Alert.alert(
          'Problem gemeldet',
          'Danke für deine Meldung! Wir kümmern uns darum.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Fehler:', error);
      Alert.alert('Fehler', 'Problem konnte nicht gemeldet werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Problem melden',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="flag-outline" size={32} color="#FF9500" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            Beschreibe das Problem so genau wie möglich, damit wir dir schnell helfen können.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Kategorie wählen
          </Text>
          
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isDark && styles.categoryCardDark,
                  selectedCategory === category.id && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon}
                  size={28}
                  color={selectedCategory === category.id ? '#007AFF' : (isDark ? '#FFFFFF' : '#000000')}
                />
                <Text
                  style={[
                    styles.categoryLabel,
                    isDark && styles.categoryLabelDark,
                    selectedCategory === category.id && styles.categoryLabelSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Beschreibung
          </Text>
          
          <TextInput
            style={[styles.textArea, isDark && styles.textAreaDark]}
            value={description}
            onChangeText={setDescription}
            placeholder="Beschreibe das Problem so genau wie möglich..."
            placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Problem melden</Text>
              </>
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
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  infoBoxDark: {
    backgroundColor: '#2C2416',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#663C00',
    marginLeft: 12,
  },
  infoTextDark: {
    color: '#FFB84D',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardDark: {
    backgroundColor: '#1C1C1E',
  },
  categoryCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E5F1FF',
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
    textAlign: 'center',
  },
  categoryLabelDark: {
    color: '#FFFFFF',
  },
  categoryLabelSelected: {
    color: '#007AFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000000',
    minHeight: 150,
    marginBottom: 16,
  },
  textAreaDark: {
    backgroundColor: '#1C1C1E',
    color: '#FFFFFF',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
