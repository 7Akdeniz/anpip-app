/**
 * ⚙️ SETTINGS PAGE (im Profil)
 * 
 * Hier kann der User:
 * - Sprache ändern (50 Sprachen)
 * - Account-Einstellungen
 * - Notifications
 * - Privacy
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n/I18nContext';
import { LANGUAGES, Language, searchLanguages } from '@/i18n/languages';

export default function SettingsPage() {
  const router = useRouter();
  const { locale, setLocale, isAutoDetected } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [showLanguageList, setShowLanguageList] = useState(false);

  const currentLanguage = LANGUAGES.find(l => l.code === locale);
  const filteredLanguages = searchQuery ? searchLanguages(searchQuery) : LANGUAGES;

  const handleSelectLanguage = (code: string) => {
    setLocale(code);
    setShowLanguageList(false);
    setSearchQuery('');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Einstellungen</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Sprach-Einstellung */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌍 Sprache</Text>
        
        {/* Aktuelle Sprache */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => setShowLanguageList(!showLanguageList)}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.flag}>{currentLanguage?.flag}</Text>
            <View>
              <Text style={styles.settingLabel}>
                {currentLanguage?.name}
              </Text>
              {isAutoDetected && (
                <Text style={styles.autoDetectedLabel}>
                  🌍 Automatisch erkannt
                </Text>
              )}
            </View>
          </View>
          <Ionicons
            name={showLanguageList ? "chevron-up" : "chevron-down"}
            size={20}
            color="#888"
          />
        </TouchableOpacity>

        {/* Sprachen-Liste (ausklappbar) */}
        {showLanguageList && (
          <View style={styles.languageListContainer}>
            {/* Suchleiste */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={16} color="#888" />
              <TextInput
                style={styles.searchInput}
                placeholder="Sprache suchen..."
                placeholderTextColor="#888"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color="#888" />
                </TouchableOpacity>
              )}
            </View>

            {/* Liste */}
            <ScrollView style={styles.languageList} nestedScrollEnabled>
              {filteredLanguages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageItem,
                    lang.code === locale && styles.languageItemSelected,
                  ]}
                  onPress={() => handleSelectLanguage(lang.code)}
                >
                  <Text style={styles.languageFlag}>{lang.flag}</Text>
                  <View style={styles.languageInfo}>
                    <Text style={[
                      styles.languageName,
                      lang.code === locale && styles.languageNameSelected,
                    ]}>
                      {lang.name}
                    </Text>
                    <Text style={styles.languageNative}>{lang.nativeName}</Text>
                  </View>
                  {lang.code === locale && (
                    <Ionicons name="checkmark-circle" size={20} color="#ff0000" />
                  )}
                </TouchableOpacity>
              ))}

              {filteredLanguages.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="language-outline" size={48} color="#888" />
                  <Text style={styles.emptyText}>Keine Sprache gefunden</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        <Text style={styles.helpText}>
          💡 Die Sprache wurde automatisch basierend auf deinem Standort erkannt.
          Du kannst sie jederzeit hier ändern.
        </Text>
      </View>

      {/* Weitere Einstellungen */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Benachrichtigungen</Text>
        
        <SettingToggle
          label="Push-Benachrichtigungen"
          icon="notifications"
          value={true}
          onValueChange={() => {}}
        />
        
        <SettingToggle
          label="Neue Follower"
          icon="person-add"
          value={true}
          onValueChange={() => {}}
        />
        
        <SettingToggle
          label="Neue Kommentare"
          icon="chatbubble"
          value={true}
          onValueChange={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔒 Privatsphäre</Text>
        
        <SettingToggle
          label="Privates Profil"
          icon="lock-closed"
          value={false}
          onValueChange={() => {}}
        />
        
        <SettingToggle
          label="Standort anzeigen"
          icon="location"
          value={true}
          onValueChange={() => {}}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 App</Text>
        
        <SettingItem
          label="Über Anpip"
          icon="information-circle"
          onPress={() => {}}
        />
        
        <SettingItem
          label="Hilfe & Support"
          icon="help-circle"
          onPress={() => {}}
        />
        
        <SettingItem
          label="Nutzungsbedingungen"
          icon="document-text"
          onPress={() => {}}
        />
        
        <SettingItem
          label="Datenschutz"
          icon="shield-checkmark"
          onPress={() => {}}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={20} color="#ff0000" />
        <Text style={styles.logoutText}>Abmelden</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

// Setting Toggle Component
function SettingToggle({
  label,
  icon,
  value,
  onValueChange,
}: {
  label: string;
  icon: any;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color="#888" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#333', true: '#ff0000' }}
        thumbColor="#fff"
      />
    </View>
  );
}

// Setting Item Component
function SettingItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={20} color="#888" />
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingLabel: {
    color: '#fff',
    fontSize: 14,
  },
  flag: {
    fontSize: 24,
  },
  autoDetectedLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 2,
  },
  helpText: {
    color: '#888',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 18,
  },
  languageListContainer: {
    backgroundColor: '#111',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  languageList: {
    maxHeight: 300,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  languageItemSelected: {
    backgroundColor: '#1a1a1a',
  },
  languageFlag: {
    fontSize: 24,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  languageNameSelected: {
    color: '#ff0000',
    fontWeight: 'bold',
  },
  languageNative: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff0000',
  },
  logoutText: {
    color: '#ff0000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
