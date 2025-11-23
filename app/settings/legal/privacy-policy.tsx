// ============================================================================
// 🔐 DATENSCHUTZERKLÄRUNG - Anpip.com
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

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Datenschutzerklärung',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Datenschutzerklärung
          </Text>
          <Text style={[styles.date, isDark && styles.dateDark]}>
            Stand: 23. November 2025
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            1. Verantwortlicher
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Verantwortlich für die Datenverarbeitung auf dieser Website ist:{'\n\n'}
            Anpip.com{'\n'}
            [Adresse]{'\n'}
            E-Mail: privacy@anpip.com
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            2. Erfassung und Speicherung personenbezogener Daten
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Beim Besuch unserer Website werden automatisch Informationen allgemeiner Natur erfasst. Diese Informationen (Server-Logfiles) beinhalten etwa die Art des Webbrowsers, das verwendete Betriebssystem, den Domainnamen Ihres Internet-Service-Providers und Ähnliches.
            {'\n\n'}
            Bei der Registrierung erheben wir folgende Daten:{'\n'}
            • E-Mail-Adresse{'\n'}
            • Benutzername{'\n'}
            • Profilinformationen (optional){'\n'}
            • Standortdaten (mit Ihrer Zustimmung)
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            3. Verwendung Ihrer Daten
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir verwenden Ihre personenbezogenen Daten zu folgenden Zwecken:{'\n\n'}
            • Bereitstellung und Verbesserung unserer Dienste{'\n'}
            • Kommunikation mit Ihnen{'\n'}
            • Sicherheit und Betrugsprävention{'\n'}
            • Personalisierung von Inhalten{'\n'}
            • Analyse und Verbesserung unserer Plattform
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            4. Weitergabe von Daten
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir geben Ihre personenbezogenen Daten nur in folgenden Fällen weiter:{'\n\n'}
            • Mit Ihrer ausdrücklichen Einwilligung{'\n'}
            • Zur Erfüllung gesetzlicher Verpflichtungen{'\n'}
            • An Dienstleister, die uns bei der Bereitstellung unserer Dienste unterstützen{'\n'}
            • Zum Schutz unserer Rechte und Sicherheit
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            5. Cookies und Tracking
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Unsere Website verwendet Cookies, um die Benutzerfreundlichkeit zu verbessern. Sie können in Ihren Browser-Einstellungen die Verwendung von Cookies deaktivieren. Dies kann jedoch die Funktionalität einschränken.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            6. Ihre Rechte
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:{'\n\n'}
            • Recht auf Auskunft{'\n'}
            • Recht auf Berichtigung{'\n'}
            • Recht auf Löschung{'\n'}
            • Recht auf Einschränkung der Verarbeitung{'\n'}
            • Recht auf Datenübertragbarkeit{'\n'}
            • Widerspruchsrecht{'\n\n'}
            Zur Ausübung dieser Rechte kontaktieren Sie uns unter privacy@anpip.com
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            7. Datensicherheit
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, Verlust, Zerstörung oder den Zugriff unberechtigter Personen zu schützen.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            8. Speicherdauer
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung der jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen bestehen.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            9. Minderjährige
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Unsere Dienste richten sich nicht an Personen unter 13 Jahren. Wir erfassen wissentlich keine personenbezogenen Daten von Kindern unter 13 Jahren.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            10. Änderungen dieser Datenschutzerklärung
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            11. Kontakt
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Bei Fragen zum Datenschutz wenden Sie sich bitte an:{'\n\n'}
            E-Mail: privacy@anpip.com{'\n'}
            Telefon: [Telefonnummer]
          </Text>
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
    marginBottom: 8,
  },
  titleDark: {
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 24,
  },
  dateDark: {
    color: '#8E8E93',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleDark: {
    color: '#FFFFFF',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    color: '#000000',
  },
  textDark: {
    color: '#E5E5E7',
  },
});
