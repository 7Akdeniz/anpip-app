// ============================================================================
// 🌍 SPRACHE AUSWÄHLEN - 50 SPRACHEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export default function LanguageScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedLanguage, setSelectedLanguage] = useState('de');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_language');
      if (saved) {
        setSelectedLanguage(saved);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Sprache:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLanguage = async (code: string) => {
    try {
      setSelectedLanguage(code);
      await AsyncStorage.setItem('app_language', code);
      Alert.alert(
        'Sprache geändert',
        'Die App wird beim nächsten Start in der gewählten Sprache angezeigt.'
      );
    } catch (error) {
      console.error('Fehler beim Speichern der Sprache:', error);
      Alert.alert('Fehler', 'Sprache konnte nicht gespeichert werden');
    }
  };

  const languages: Language[] = [
    // Europa
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
    { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
    { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
    
    // Asien & Naher Osten
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱' },
    { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
    
    // Amerika & Andere
    { code: 'en-us', name: 'English (US)', nativeName: 'English (US)', flag: '🇺🇸' },
    { code: 'es-mx', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽' },
    { code: 'pt-br', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'fr-ca', name: 'French (Canada)', nativeName: 'Français (Canada)', flag: '🇨🇦' },
    
    // Afrika
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
    { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
    
    // Weitere
    { code: 'tl', name: 'Tagalog', nativeName: 'Tagalog', flag: '🇵🇭' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹' },
    { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭' },
    { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦' },
    { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵' },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Sprache wählen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            {languages.length} Sprachen verfügbar
          </Text>
        </View>

        <View style={[styles.languageList, isDark && styles.languageListDark]}>
          {languages.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageItem,
                isDark && styles.languageItemDark,
                index < languages.length - 1 && styles.borderBottom,
                selectedLanguage === lang.code && styles.selectedItem,
              ]}
              onPress={() => handleSelectLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, isDark && styles.languageNameDark]}>
                  {lang.nativeName}
                </Text>
                <Text style={[styles.languageSubtitle, isDark && styles.languageSubtitleDark]}>
                  {lang.name}
                </Text>
              </View>
              {selectedLanguage === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color="#FF3B30" />
              )}
            </TouchableOpacity>
          ))}
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    padding: 12,
  },
  infoBoxDark: {
    backgroundColor: '#1C2A3A',
  },
  infoText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoTextDark: {
    color: '#64B5F6',
  },
  languageList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  languageListDark: {
    backgroundColor: '#1C1C1E',
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  languageItemDark: {
    backgroundColor: '#1C1C1E',
  },
  selectedItem: {
    backgroundColor: '#FFF5F5',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  languageNameDark: {
    color: '#FFFFFF',
  },
  languageSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  languageSubtitleDark: {
    color: '#8E8E93',
  },
  bottomSpacer: {
    height: 40,
  },
});
