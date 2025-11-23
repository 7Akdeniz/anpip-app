// ============================================================================
// 📚 TUTORIALS & ANLEITUNGEN
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

type Tutorial = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  videoUrl?: string;
};

export default function TutorialsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Erste Schritte',
      description: 'Lerne die Grundlagen von Anpip kennen',
      icon: 'rocket-outline',
    },
    {
      id: '2',
      title: 'Video hochladen',
      description: 'So lädst du dein erstes Video hoch',
      icon: 'cloud-upload-outline',
    },
    {
      id: '3',
      title: 'Profil optimieren',
      description: 'Erstelle ein ansprechendes Profil',
      icon: 'person-circle-outline',
    },
    {
      id: '4',
      title: 'Sicherheit & Privatsphäre',
      description: 'Schütze dein Konto und deine Daten',
      icon: 'shield-checkmark-outline',
    },
    {
      id: '5',
      title: 'Market nutzen',
      description: 'Entdecke lokale Geschäfte und Angebote',
      icon: 'storefront-outline',
    },
    {
      id: '6',
      title: 'Live-Streaming',
      description: 'Starte deinen ersten Live-Stream',
      icon: 'videocam-outline',
    },
    {
      id: '7',
      title: 'Interaktion',
      description: 'Kommentieren, liken und teilen',
      icon: 'heart-outline',
    },
    {
      id: '8',
      title: 'Premium-Features',
      description: 'Alle Premium-Funktionen im Überblick',
      icon: 'star-outline',
    },
  ];

  const handleTutorialPress = (tutorial: Tutorial) => {
    if (tutorial.videoUrl) {
      Linking.openURL(tutorial.videoUrl);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Tutorials',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={[styles.header, isDark && styles.headerDark]}>
          <Ionicons name="book-outline" size={48} color="#007AFF" />
          <Text style={[styles.headerTitle, isDark && styles.headerTitleDark]}>
            Anleitungen & Tutorials
          </Text>
          <Text style={[styles.headerText, isDark && styles.headerTextDark]}>
            Lerne alle Funktionen von Anpip kennen
          </Text>
        </View>

        <View style={styles.tutorialsList}>
          {tutorials.map((tutorial) => (
            <TouchableOpacity
              key={tutorial.id}
              style={[styles.tutorialCard, isDark && styles.tutorialCardDark]}
              onPress={() => handleTutorialPress(tutorial)}
            >
              <View style={[styles.iconContainer, isDark && styles.iconContainerDark]}>
                <Ionicons
                  name={tutorial.icon}
                  size={32}
                  color="#007AFF"
                />
              </View>
              <View style={styles.tutorialInfo}>
                <Text style={[styles.tutorialTitle, isDark && styles.tutorialTitleDark]}>
                  {tutorial.title}
                </Text>
                <Text style={[styles.tutorialDescription, isDark && styles.tutorialDescriptionDark]}>
                  {tutorial.description}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={isDark ? '#8E8E93' : '#C7C7CC'}
              />
            </TouchableOpacity>
          ))}
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
    marginBottom: 16,
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
  tutorialsList: {
    padding: 16,
  },
  tutorialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  tutorialCardDark: {
    backgroundColor: '#1C1C1E',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconContainerDark: {
    backgroundColor: '#2C2C2E',
  },
  tutorialInfo: {
    flex: 1,
  },
  tutorialTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  tutorialTitleDark: {
    color: '#FFFFFF',
  },
  tutorialDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tutorialDescriptionDark: {
    color: '#8E8E93',
  },
});
