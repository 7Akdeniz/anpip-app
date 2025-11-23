// ============================================================================
// 📄 NUTZUNGSBEDINGUNGEN - Anpip.com
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

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Nutzungsbedingungen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.title, isDark && styles.titleDark]}>
            Nutzungsbedingungen
          </Text>
          <Text style={[styles.date, isDark && styles.dateDark]}>
            Stand: 23. November 2025
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            1. Geltungsbereich
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Diese Nutzungsbedingungen gelten für die Nutzung der Plattform Anpip.com und aller damit verbundenen Dienste. Durch die Registrierung und Nutzung akzeptieren Sie diese Bedingungen.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            2. Registrierung und Konto
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            • Sie müssen mindestens 13 Jahre alt sein{'\n'}
            • Sie sind für die Sicherheit Ihres Kontos verantwortlich{'\n'}
            • Sie dürfen nur ein Konto erstellen{'\n'}
            • Alle Angaben müssen wahrheitsgemäß sein{'\n'}
            • Sie dürfen Ihr Konto nicht an Dritte weitergeben
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            3. Nutzungsregeln
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Sie verpflichten sich:{'\n\n'}
            • Keine illegalen Inhalte zu veröffentlichen{'\n'}
            • Keine Urheberrechte zu verletzen{'\n'}
            • Keine hasserfüllten oder diskriminierenden Inhalte zu teilen{'\n'}
            • Keine Gewalt oder Pornografie zu zeigen{'\n'}
            • Andere Nutzer zu respektieren{'\n'}
            • Keine Spam- oder Werbeinhalte ohne Genehmigung{'\n'}
            • Die Privatsphäre anderer zu wahren
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            4. Inhalte und Urheberrechte
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            • Sie behalten die Rechte an Ihren Inhalten{'\n'}
            • Sie gewähren Anpip eine weltweite Lizenz zur Nutzung{'\n'}
            • Sie garantieren, dass Sie die Rechte an allen hochgeladenen Inhalten besitzen{'\n'}
            • Anpip kann Inhalte moderieren und entfernen
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            5. Haftungsausschluss
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Anpip haftet nicht für:{'\n\n'}
            • Von Nutzern erstellte Inhalte{'\n'}
            • Technische Störungen oder Ausfälle{'\n'}
            • Verlust von Daten{'\n'}
            • Indirekte oder Folgeschäden{'\n\n'}
            Die Plattform wird "wie besehen" bereitgestellt.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            6. Premium-Abonnements
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            • Premium-Funktionen sind kostenpflichtig{'\n'}
            • Zahlungen erfolgen im Voraus{'\n'}
            • Abonnements verlängern sich automatisch{'\n'}
            • Kündigungen sind jederzeit möglich{'\n'}
            • Keine Rückerstattung bei vorzeitiger Kündigung
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            7. Sperrung und Kündigung
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir behalten uns das Recht vor, Konten bei Verstößen gegen diese Bedingungen zu sperren oder zu löschen. Sie können Ihr Konto jederzeit in den Einstellungen löschen.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            8. Änderungen der Bedingungen
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Wir können diese Nutzungsbedingungen jederzeit ändern. Wesentliche Änderungen werden wir rechtzeitig ankündigen. Die fortgesetzte Nutzung nach Änderungen gilt als Zustimmung.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            9. Anwendbares Recht
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand ist [Stadt], sofern gesetzlich zulässig.
          </Text>

          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            10. Kontakt
          </Text>
          <Text style={[styles.text, isDark && styles.textDark]}>
            Bei Fragen zu diesen Nutzungsbedingungen:{'\n\n'}
            E-Mail: legal@anpip.com{'\n'}
            Support: support@anpip.com
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
