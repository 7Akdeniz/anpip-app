// ============================================================================
// ℹ️ IMPRESSUM - Anpip.com
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ImprintScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handlePhone = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Impressum',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Impressum
          </Text>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Angaben gemäß § 5 TMG
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Anpip.com{'\n'}
              [Firmenname]{'\n'}
              [Straße und Hausnummer]{'\n'}
              [PLZ und Ort]{'\n'}
              [Land]
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Vertreten durch
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              [Name des Geschäftsführers/Inhabers]
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Kontakt
            </Text>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handlePhone('+49 XXX XXXXXXX')}
            >
              <Ionicons name="call-outline" size={20} color="#007AFF" />
              <Text style={[styles.contactText, styles.linkText]}>
                +49 XXX XXXXXXX
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactItem}
              onPress={() => handleEmail('info@anpip.com')}
            >
              <Ionicons name="mail-outline" size={20} color="#007AFF" />
              <Text style={[styles.contactText, styles.linkText]}>
                info@anpip.com
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Registereintrag
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Eintragung im Handelsregister{'\n'}
              Registergericht: [Amtsgericht]{'\n'}
              Registernummer: [HRB XXXXX]
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Umsatzsteuer-ID
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:{'\n'}
              DE XXX XXX XXX
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              [Name]{'\n'}
              [Adresse]
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Haftungsausschluss
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
            </Text>
          </View>

          <View style={[styles.section, isDark && styles.sectionDark]}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              Streitschlichtung
            </Text>
            <Text style={[styles.text, isDark && styles.textDark]}>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{'\n'}
              https://ec.europa.eu/consumers/odr{'\n\n'}
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
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
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 24,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionDark: {
    backgroundColor: '#1C1C1E',
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
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000000',
  },
  textDark: {
    color: '#E5E5E7',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    marginLeft: 12,
  },
  linkText: {
    color: '#007AFF',
  },
});
