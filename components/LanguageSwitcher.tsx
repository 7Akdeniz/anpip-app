/**
 * LANGUAGE SWITCHER - Floating Button + Modal
 * 
 * Zeigt die aktuelle Sprache und öffnet ein Modal zum Wechseln
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Typography, Card, IconButton } from './ui';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n/I18nContext';
import { LANGUAGES, Language, searchLanguages } from '@/i18n/languages';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLanguage = LANGUAGES.find(lang => lang.code === locale);
  const filteredLanguages = searchQuery ? searchLanguages(searchQuery) : LANGUAGES;

  const handleSelectLanguage = (languageCode: string) => {
    setLocale(languageCode);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      {/* Floating Button (unten rechts) */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.buttonContent}>
          <Typography variant="h3" style={styles.flag}>
            {currentLanguage?.flag}
          </Typography>
          <Typography variant="caption" color={Colors.textOnPrimary} style={{ fontWeight: '600' }}>
            {currentLanguage?.code.toUpperCase()}
          </Typography>
        </View>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Typography variant="h2">Sprache auswählen</Typography>
              <IconButton
                icon="close"
                onPress={() => {
                  setModalVisible(false);
                  setSearchQuery('');
                }}
                size={36}
                backgroundColor="transparent"
                color={Colors.text}
              />
            </View>

            {/* Suchleiste */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Sprache suchen..."
                placeholderTextColor={Colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Sprachen-Liste */}
            <ScrollView style={styles.languageList}>
              {filteredLanguages.map((language) => (
                <LanguageItem
                  key={language.code}
                  language={language}
                  isSelected={language.code === locale}
                  onPress={() => handleSelectLanguage(language.code)}
                />
              ))}

              {filteredLanguages.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons name="language-outline" size={60} color={Colors.textSecondary} />
                  <Typography variant="body" color={Colors.textSecondary} align="center" style={{ marginTop: Spacing.md }}>
                    Keine Sprache gefunden
                  </Typography>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

// Einzelne Sprach-Option
function LanguageItem({
  language,
  isSelected,
  onPress,
}: {
  language: Language;
  isSelected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.languageItem,
        isSelected && styles.languageItemSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.languageItemContent}>
        <Typography variant="h3" style={styles.languageFlag}>
          {language.flag}
        </Typography>
        <View style={styles.languageInfo}>
          <Typography variant="body" color={isSelected ? Colors.primary : Colors.text}>
            {language.name}
          </Typography>
          <Typography variant="caption" color={Colors.textSecondary}>
            {language.nativeName}
          </Typography>
        </View>
        {isSelected && (
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 90 : 80, // Über der Tab-Bar
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    ...Shadows.large,
    zIndex: 999,
  },
  buttonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flag: {
    fontSize: 28,
    marginBottom: 2,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '90%',
    ...Shadows.large,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  languageList: {
    flex: 1,
  },
  languageItem: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  languageItemSelected: {
    backgroundColor: Colors.primaryLight + '20',
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageFlag: {
    fontSize: 32,
    marginRight: Spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
});
