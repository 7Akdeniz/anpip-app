// ============================================================================
// ❓ FAQ & SUPPORT
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [expandedIndex, setExpandedIndex] = React.useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: 'Wie erstelle ich ein Video?',
      answer: 'Tippe auf das + Symbol in der Mitte der unteren Navigation. Wähle dann ein Video aus deiner Galerie oder nimm ein neues Video auf.',
    },
    {
      question: 'Wie kann ich mein Profil verifizieren?',
      answer: 'Verifizierte Accounts werden von unserem Team geprüft. Kontaktiere den Support, um eine Verifizierung zu beantragen.',
    },
    {
      question: 'Wie funktioniert der Market?',
      answer: 'Im Market kannst du lokale Angebote und Produkte entdecken. Verwende Videos, um Artikel zu präsentieren und zu verkaufen.',
    },
    {
      question: 'Wie kann ich Videos herunterladen?',
      answer: 'Tippe auf das Teilen-Symbol und wähle "Video speichern". Der Download erfolgt in deine Galerie.',
    },
    {
      question: 'Was sind Premium-Features?',
      answer: 'Premium-Nutzer erhalten Zugriff auf erweiterte Statistiken, werbefreies Erlebnis und exklusive Filter.',
    },
    {
      question: 'Wie melde ich unangemessene Inhalte?',
      answer: 'Tippe auf die drei Punkte beim Video und wähle "Melden". Unser Team prüft alle Meldungen innerhalb von 24 Stunden.',
    },
    {
      question: 'Wie kann ich mein Konto löschen?',
      answer: 'Gehe zu Einstellungen > Sicherheit > Konto dauerhaft löschen. Beachte, dass dies nicht rückgängig gemacht werden kann.',
    },
    {
      question: 'Werden meine Daten DSGVO-konform verarbeitet?',
      answer: 'Ja, wir halten alle DSGVO-Richtlinien ein. Du kannst deine Daten jederzeit exportieren oder löschen.',
    },
  ];

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@anpip.com?subject=Support Anfrage');
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Häufige Fragen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons
            name="help-circle"
            size={48}
            color={isDark ? '#FF3B30' : '#FF3B30'}
          />
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Wie können wir helfen?
          </Text>
          <Text style={[styles.headerSubtitle, isDark && styles.headerSubtitleDark]}>
            Finde schnelle Antworten auf häufige Fragen
          </Text>
        </View>

        <View style={styles.faqList}>
          {faqs.map((faq, index) => (
            <View key={index} style={[styles.faqItem, isDark && styles.faqItemDark]}>
              <TouchableOpacity
                style={styles.questionContainer}
                onPress={() => toggleExpand(index)}
              >
                <Text style={[styles.question, isDark && styles.questionDark]}>
                  {faq.question}
                </Text>
                <Ionicons
                  name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={isDark ? '#8E8E93' : '#C7C7CC'}
                />
              </TouchableOpacity>
              
              {expandedIndex === index && (
                <View style={styles.answerContainer}>
                  <Text style={[styles.answer, isDark && styles.answerDark]}>
                    {faq.answer}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={[styles.supportBox, isDark && styles.supportBoxDark]}>
          <Ionicons
            name="mail-outline"
            size={32}
            color={isDark ? '#FF3B30' : '#FF3B30'}
          />
          <Text style={[styles.supportTitle, isDark && styles.supportTitleDark]}>
            Weitere Hilfe benötigt?
          </Text>
          <Text style={[styles.supportText, isDark && styles.supportTextDark]}>
            Unser Support-Team hilft dir gerne weiter
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={handleContactSupport}
          >
            <Text style={styles.contactButtonText}>Support kontaktieren</Text>
          </TouchableOpacity>
        </View>

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
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  headerTitleDark: {
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  headerSubtitleDark: {
    color: '#8E8E93',
  },
  faqList: {
    marginHorizontal: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  faqItemDark: {
    backgroundColor: '#1C1C1E',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 12,
  },
  questionDark: {
    color: '#FFFFFF',
  },
  answerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answer: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  answerDark: {
    color: '#AEAEB2',
  },
  supportBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 24,
    alignItems: 'center',
  },
  supportBoxDark: {
    backgroundColor: '#1C1C1E',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginTop: 12,
    marginBottom: 8,
  },
  supportTitleDark: {
    color: '#FFFFFF',
  },
  supportText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  supportTextDark: {
    color: '#AEAEB2',
  },
  contactButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
