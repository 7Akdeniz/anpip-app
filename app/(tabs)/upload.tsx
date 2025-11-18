/**
 * UPLOAD SCREEN - Video hochladen
 * 
 * Hier können später Videos hochgeladen werden
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Switch } from 'react-native';
import { Typography, PrimaryButton, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

export default function UploadScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" color={Colors.primary} style={styles.header}>
          Neues Video
        </Typography>

        {/* Video Upload Bereich */}
        <Card style={styles.uploadArea}>
          <View style={styles.uploadPlaceholder}>
            <Ionicons name="cloud-upload-outline" size={80} color={Colors.primary} />
            <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
              Video auswählen
            </Typography>
            <Typography variant="caption" align="center" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>
              oder hier ablegen
            </Typography>
            <PrimaryButton
              title="Video auswählen"
              onPress={() => console.log('Video auswählen')}
              style={{ marginTop: Spacing.lg }}
            />
          </View>
        </Card>

        {/* Titel */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Titel *</Typography>
          <TextInput
            style={styles.input}
            placeholder="Gib deinem Video einen Titel..."
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Typography variant="caption" color={Colors.textSecondary} align="right">
            {title.length}/100
          </Typography>
        </View>

        {/* Beschreibung */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Beschreibung</Typography>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Erzähl mehr über dein Video..."
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
          />
          <Typography variant="caption" color={Colors.textSecondary} align="right">
            {description.length}/500
          </Typography>
        </View>

        {/* Hashtags */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Hashtags</Typography>
          <TextInput
            style={styles.input}
            placeholder="#trending #anpip #viral"
            placeholderTextColor={Colors.textSecondary}
            value={hashtags}
            onChangeText={setHashtags}
          />
          <Typography variant="caption" color={Colors.textSecondary}>
            Trenne mehrere Hashtags mit Leerzeichen
          </Typography>
        </View>

        {/* Sichtbarkeit */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Sichtbarkeit</Typography>
          <Card variant="outlined" padding={0}>
            <VisibilityOption
              icon="globe-outline"
              title="Öffentlich"
              description="Jeder kann dein Video sehen"
              isActive={visibility === 'public'}
              onPress={() => setVisibility('public')}
            />
            <VisibilityOption
              icon="people-outline"
              title="Freunde"
              description="Nur deine Freunde können es sehen"
              isActive={visibility === 'friends'}
              onPress={() => setVisibility('friends')}
            />
            <VisibilityOption
              icon="lock-closed-outline"
              title="Privat"
              description="Nur du kannst es sehen"
              isActive={visibility === 'private'}
              onPress={() => setVisibility('private')}
              isLast
            />
          </Card>
        </View>

        {/* Einstellungen */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Einstellungen</Typography>
          <Card variant="outlined" padding={0}>
            <SettingSwitch
              title="Kommentare erlauben"
              value={allowComments}
              onValueChange={setAllowComments}
            />
            <SettingSwitch
              title="Duett erlauben"
              description="Andere können mit deinem Video ein Duett erstellen"
              value={allowDuet}
              onValueChange={setAllowDuet}
              isLast
            />
          </Card>
        </View>

        {/* Veröffentlichen Button */}
        <PrimaryButton
          title="Veröffentlichen"
          onPress={() => console.log('Video veröffentlichen')}
          size="large"
          fullWidth
          style={styles.publishButton}
        />

        <PrimaryButton
          title="Als Entwurf speichern"
          onPress={() => console.log('Als Entwurf speichern')}
          variant="outlined"
          fullWidth
          style={styles.draftButton}
        />
      </View>
    </ScrollView>
  );
}

// Sichtbarkeits-Option Komponente
function VisibilityOption({ 
  icon, 
  title, 
  description, 
  isActive, 
  onPress,
  isLast = false,
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  title: string; 
  description: string; 
  isActive: boolean; 
  onPress: () => void;
  isLast?: boolean;
}) {
  return (
    <View 
      style={[
        styles.visibilityOption,
        !isLast && styles.visibilityOptionBorder,
        isActive && styles.visibilityOptionActive,
      ]}
      onTouchEnd={onPress}
    >
      <Ionicons 
        name={icon} 
        size={24} 
        color={isActive ? Colors.primary : Colors.textSecondary} 
      />
      <View style={styles.visibilityOptionText}>
        <Typography variant="body" color={isActive ? Colors.primary : Colors.text}>
          {title}
        </Typography>
        <Typography variant="caption" color={Colors.textSecondary}>
          {description}
        </Typography>
      </View>
      {isActive && (
        <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
      )}
    </View>
  );
}

// Einstellungs-Switch Komponente
function SettingSwitch({
  title,
  description,
  value,
  onValueChange,
  isLast = false,
}: {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.settingSwitch, !isLast && styles.settingSwitchBorder]}>
      <View style={{ flex: 1 }}>
        <Typography variant="body">{title}</Typography>
        {description && (
          <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
            {description}
          </Typography>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: Colors.border, true: Colors.primaryLight }}
        thumbColor={value ? Colors.primary : Colors.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  uploadArea: {
    marginBottom: Spacing.lg,
  },
  uploadPlaceholder: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: '600',
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  visibilityOptionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  visibilityOptionActive: {
    backgroundColor: Colors.primaryLight + '20',
  },
  visibilityOptionText: {
    flex: 1,
  },
  settingSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  settingSwitchBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  publishButton: {
    marginTop: Spacing.lg,
  },
  draftButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
