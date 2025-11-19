/**
 * UPLOAD SCREEN - Video hochladen
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Switch, Alert, ActivityIndicator } from 'react-native';
import { Typography, PrimaryButton, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

export default function UploadScreen() {
  const router = useRouter();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [allowDuet, setAllowDuet] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const pickVideo = async () => {
    // Berechtigungen anfragen
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Bitte erlaube den Zugriff auf deine Galerie, um Videos auszuwählen.');
      return;
    }

    // Video aus Galerie wählen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 60, // Max 60 Sekunden
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Prüfe Video-Dauer (falls verfügbar)
      if (asset.duration && asset.duration > 60000) { // 60000ms = 60 Sekunden
        Alert.alert(
          'Video zu lang', 
          'Dein Video darf maximal 60 Sekunden lang sein. Bitte schneide es kürzer.'
        );
        return;
      }
      
      setVideoUri(asset.uri);
      console.log('Video ausgewählt:', asset.uri, 'Dauer:', asset.duration, 'Größe:', asset.fileSize);
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Video aus.');
      return;
    }

    setUploading(true);
    setUploadProgress('Video wird vorbereitet...');

    try {
      console.log('🎬 Starte Upload...', videoUri);
      
      // Video-Datei vorbereiten
      const videoName = `video_${Date.now()}.mp4`;
      
      setUploadProgress('Video wird hochgeladen...');
      
      // Verwende fetch mit arrayBuffer für React Native Kompatibilität
      const response = await fetch(videoUri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const originalSize = uint8Array.length;
      console.log('📦 Video Größe:', (originalSize / 1024 / 1024).toFixed(2), 'MB');

      // Wenn Video größer als 50 MB, informiere User
      if (originalSize > 50 * 1024 * 1024) {
        setUploadProgress(`Großes Video (${(originalSize / 1024 / 1024).toFixed(0)} MB) - Upload läuft...`);
      }

      // Upload zu Supabase Storage mit Uint8Array
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('videos')
        .upload(videoName, uint8Array, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Storage Upload Fehler:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload erfolgreich:', uploadData);
      setUploadProgress('Video wird in Datenbank gespeichert...');

      // Public URL vom hochgeladenen Video
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(videoName);

      console.log('🔗 Public URL:', publicUrl);

      // Video-Eintrag in Datenbank erstellen
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          video_url: publicUrl,
          thumbnail_url: publicUrl,
          description: description,
          visibility: visibility,
          duration: 0,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Datenbank Fehler:', dbError);
        throw dbError;
      }

      console.log('✅ Video in Datenbank gespeichert:', videoData);
      setUploadProgress('Fertig!');

      // Formular zurücksetzen
      setVideoUri(null);
      setDescription('');
      setVisibility('public');
      
      // Direkt zur Startseite wechseln (OHNE Bestätigung)
      router.push('/(tabs)/feed');

    } catch (error: any) {
      console.error('Upload-Fehler:', error);
      Alert.alert('Upload fehlgeschlagen', error.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Typography variant="h2" color={Colors.primary} style={styles.header}>
          Neues Video
        </Typography>

        {/* Video Upload Bereich */}
        <Card style={styles.uploadArea}>
          <View style={styles.uploadPlaceholder}>
            {uploading ? (
              <>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
                  {uploadProgress || 'Video wird hochgeladen...'}
                </Typography>
                <Typography variant="caption" align="center" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>
                  Bitte nicht schließen
                </Typography>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={80} color={Colors.primary} />
                <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
                  {videoUri ? 'Video ausgewählt ✓' : 'Video auswählen'}
                </Typography>
                <Typography variant="caption" align="center" color={Colors.textSecondary} style={{ marginTop: Spacing.sm }}>
                  Max 60 Sekunden
                </Typography>
                <PrimaryButton
                  title={videoUri ? 'Anderes Video wählen' : 'Video auswählen'}
                  onPress={pickVideo}
                  style={{ marginTop: Spacing.lg }}
                />
              </>
            )}
          </View>
        </Card>

        {/* Beschreibung */}
        <View style={styles.inputGroup}>
          <Typography variant="body" style={styles.label}>Beschreibung</Typography>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Erzähl mehr über dein Video... Du kannst auch #hashtags verwenden"
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={6}
            maxLength={2000}
          />
          <Typography variant="caption" color={Colors.textSecondary} align="right">
            {description.length}/2000
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
          title={uploading ? 'Wird hochgeladen...' : 'Veröffentlichen'}
          onPress={uploadVideo}
          size="large"
          fullWidth
          style={styles.publishButton}
          disabled={uploading || !videoUri}
        />
        
        {uploading && (
          <View style={styles.uploadingIndicator}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Typography variant="caption" color={Colors.textSecondary} style={{ marginLeft: Spacing.sm }}>
              Video wird hochgeladen...
            </Typography>
          </View>
        )}
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
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  draftButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
});
