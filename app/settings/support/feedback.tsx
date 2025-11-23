// ============================================================================
// 💬 FEEDBACK SENDEN
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

type FeedbackType = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function FeedbackScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [selectedType, setSelectedType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const feedbackTypes: FeedbackType[] = [
    { id: 'feature', label: 'Feature-Wunsch', icon: 'bulb-outline', color: '#FFB800' },
    { id: 'improvement', label: 'Verbesserung', icon: 'trending-up-outline', color: '#34C759' },
    { id: 'compliment', label: 'Lob', icon: 'heart-outline', color: '#FF3B30' },
    { id: 'general', label: 'Allgemein', icon: 'chatbubbles-outline', color: '#007AFF' },
  ];

  const handleSubmit = async () => {
    if (!selectedType || !message.trim()) {
      Alert.alert('Fehler', 'Bitte wähle einen Typ und schreibe eine Nachricht');
      return;
    }

    if (rating === 0) {
      Alert.alert('Fehler', 'Bitte gib eine Bewertung ab');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('user_feedback')
          .insert({
            user_id: user.id,
            type: selectedType,
            message: message,
            rating: rating,
            status: 'new',
          });

        if (error) throw error;

        Alert.alert(
          'Feedback gesendet',
          'Vielen Dank für dein Feedback! Es hilft uns, Anpip zu verbessern.',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    } catch (error: any) {
      console.error('Fehler:', error);
      Alert.alert('Fehler', 'Feedback konnte nicht gesendet werden');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Feedback senden',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Ionicons name="chatbubbles" size={48} color="#007AFF" />
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Deine Meinung zählt!
          </Text>
          <Text style={[styles.headerText, isDark && styles.headerTextDark]}>
            Hilf uns, Anpip noch besser zu machen
          </Text>
        </View>

        <View style={styles.form}>
          {/* Bewertung */}
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Wie zufrieden bist du?
          </Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={40}
                  color={star <= rating ? '#FFB800' : '#C7C7CC'}
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* Feedback-Typ */}
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Worum geht es?
          </Text>
          <View style={styles.typesContainer}>
            {feedbackTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  isDark && styles.typeCardDark,
                  selectedType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={24}
                  color={selectedType === type.id ? type.color : (isDark ? '#8E8E93' : '#C7C7CC')}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    isDark && styles.typeLabelDark,
                    selectedType === type.id && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Nachricht */}
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            Deine Nachricht
          </Text>
          <TextInput
            style={[styles.textArea, isDark && styles.textAreaDark]}
            value={message}
            onChangeText={setMessage}
            placeholder="Was möchtest du uns mitteilen?"
            placeholderTextColor={isDark ? '#8E8E93' : '#C7C7CC'}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Feedback senden</Text>
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
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  headerDark: {
    backgroundColor: '#1C1C1E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 8,
  },
  headerTextDark: {
    color: '#8E8E93',
  },
  form: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardDark: {
    backgroundColor: '#1C1C1E',
  },
  typeCardSelected: {
    borderColor: '#007AFF',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginLeft: 8,
  },
  typeLabelDark: {
    color: '#FFFFFF',
  },
  typeLabelSelected: {
    color: '#007AFF',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#000000',
    minHeight: 120,
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
    marginTop: 8,
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
