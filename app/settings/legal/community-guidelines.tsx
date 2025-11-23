// ============================================================================
// 👥 COMMUNITY-RICHTLINIEN - Anpip.com
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function CommunityGuidelinesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Community-Richtlinien',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={[styles.header, isDark && styles.headerDark]}>
            <Ionicons name="people" size={48} color="#007AFF" />
            <Text style={[styles.title, isDark && styles.titleDark]}>
              Community-Richtlinien
            </Text>
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              Gemeinsam für eine bessere Community
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="heart" size={24} color="#FF3B30" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Respekt und Freundlichkeit
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              • Behandle andere so, wie du behandelt werden möchtest{'\n'}
              • Sei respektvoll in Kommentaren und Nachrichten{'\n'}
              • Akzeptiere unterschiedliche Meinungen{'\n'}
              • Keine Beleidigungen oder persönliche Angriffe
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#34C759" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Sicherheit geht vor
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              • Keine Gewaltdarstellungen{'\n'}
              • Keine Bedrohungen oder Einschüchterungen{'\n'}
              • Keine Verbreitung privater Informationen{'\n'}
              • Melde gefährliche Inhalte sofort
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="hand-left" size={24} color="#FF9500" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Keine Diskriminierung
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Wir tolerieren keine Diskriminierung aufgrund von:{'\n\n'}
              • Hautfarbe, Herkunft oder Nationalität{'\n'}
              • Religion oder Weltanschauung{'\n'}
              • Geschlecht oder sexueller Orientierung{'\n'}
              • Behinderung oder Alter
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="sparkles" size={24} color="#AF52DE" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Authentische Inhalte
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              • Teile nur eigene Inhalte oder mit Erlaubnis{'\n'}
              • Keine Fake News oder Desinformation{'\n'}
              • Kennzeichne Werbung klar{'\n'}
              • Sei transparent über gesponserte Inhalte
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="eye-off" size={24} color="#5856D6" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Jugendschutz
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              • Keine pornografischen Inhalte{'\n'}
              • Keine sexuell anzüglichen Darstellungen{'\n'}
              • Schutz Minderjähriger hat höchste Priorität{'\n'}
              • Altersgerechte Inhalte
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="ban" size={24} color="#FF3B30" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Verbotene Inhalte
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Folgende Inhalte sind strikt verboten:{'\n\n'}
              • Illegale Aktivitäten{'\n'}
              • Drogen- oder Waffenhandel{'\n'}
              • Hassrede und Hetze{'\n'}
              • Selbstverletzung oder Suizid{'\n'}
              • Urheberrechtsverletzungen{'\n'}
              • Spam und Betrug
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="flag" size={24} color="#FF9500" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Verstöße melden
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Wenn du einen Verstoß bemerkst:{'\n\n'}
              • Nutze die Melde-Funktion{'\n'}
              • Beschreibe den Verstoß genau{'\n'}
              • Blockiere beleidigende Nutzer{'\n'}
              • Wir prüfen jede Meldung
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <View style={styles.iconHeader}>
              <Ionicons name="alert-circle" size={24} color="#FF3B30" />
              <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
                Konsequenzen bei Verstößen
              </Text>
            </View>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Bei Verstößen gegen diese Richtlinien:{'\n\n'}
              • Verwarnung{'\n'}
              • Entfernung von Inhalten{'\n'}
              • Temporäre Sperrung{'\n'}
              • Permanenter Ausschluss{'\n'}
              • Rechtliche Schritte bei schweren Verstößen
            </Text>
          </View>

          <View style={[styles.footer, isDark && styles.footerDark]}>
            <Ionicons name="information-circle" size={24} color="#007AFF" />
            <Text style={[styles.footerText, isDark && styles.footerTextDark]}>
              Danke, dass du zu einer positiven und sicheren Community beiträgst!
            </Text>
          </View>
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
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
  },
  headerDark: {
    backgroundColor: '#1C1C1E',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginTop: 16,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    marginTop: 8,
  },
  subtitleDark: {
    color: '#8E8E93',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionDark: {
    backgroundColor: '#1C1C1E',
  },
  iconHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
  },
  textDark: {
    color: '#E5E5E7',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F1FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footerDark: {
    backgroundColor: '#1A2A3A',
  },
  footerText: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  footerTextDark: {
    color: '#64B5F6',
  },
});
