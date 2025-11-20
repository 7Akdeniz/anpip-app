/**
 * UPLOAD SCREEN - Video hochladen (Apple Style)
 * 
 * Modern Apple-Style mit Glassmorphism, vielen Icons und schönen Animationen
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Switch, Alert, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, PrimaryButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
    <View style={styles.container}>
      {/* Header mit Glassmorphism */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <Typography variant="h2" style={styles.headerTitle}>Video erstellen</Typography>
          <Typography variant="caption" style={styles.headerSubtitle}>
            Teile deine Kreativität mit der Welt
          </Typography>
        </View>
      </BlurView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Bereich mit großen Icons */}
        <View style={styles.uploadSection}>
          {uploading ? (
            <BlurView intensity={60} tint="dark" style={styles.uploadCard}>
              <View style={styles.uploadingContent}>
                <View style={styles.uploadIconContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
                <Typography variant="h3" align="center" style={styles.uploadingTitle}>
                  {uploadProgress || 'Video wird hochgeladen...'}
                </Typography>
                <Typography variant="caption" align="center" style={styles.uploadingSubtitle}>
                  Bitte nicht schließen
                </Typography>
                
                {/* Progress Icons */}
                <View style={styles.progressIcons}>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="cloud-upload" size={24} color={Colors.primary} />
                    <Typography variant="caption" style={styles.progressText}>Upload</Typography>
                  </View>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="film" size={24} color="rgba(255,255,255,0.5)" />
                    <Typography variant="caption" style={styles.progressText}>Verarbeiten</Typography>
                  </View>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.5)" />
                    <Typography variant="caption" style={styles.progressText}>Fertig</Typography>
                  </View>
                </View>
              </View>
            </BlurView>
          ) : videoUri ? (
            <BlurView intensity={60} tint="dark" style={styles.uploadCard}>
              <View style={styles.videoPreview}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Typography variant="h3" align="center" style={styles.videoSelectedTitle}>
                  Video ausgewählt ✓
                </Typography>
                <TouchableOpacity style={styles.changeVideoButton} onPress={pickVideo}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Typography variant="body" style={styles.changeVideoText}>
                    Anderes Video wählen
                  </Typography>
                </TouchableOpacity>
              </View>
            </BlurView>
          ) : (
            <TouchableOpacity onPress={pickVideo} activeOpacity={0.8}>
              <BlurView intensity={60} tint="dark" style={styles.uploadCard}>
                <View style={styles.uploadEmptyContent}>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="cloud-upload-outline" size={48} color="#FFFFFF" />
                  </View>
                  <Typography variant="h3" align="center" style={styles.uploadTitle}>
                    Video auswählen
                  </Typography>
                  <Typography variant="caption" align="center" style={styles.uploadSubtitle}>
                    Tippe hier, um dein Video hochzuladen
                  </Typography>
                  
                  {/* Feature Icons */}
                  <View style={styles.featureIcons}>
                    <View style={styles.featureItem}>
                      <Ionicons name="time-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>Max 60s</Typography>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="videocam-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>HD Qualität</Typography>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="musical-notes-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>Mit Sound</Typography>
                    </View>
                  </View>
                </View>
              </BlurView>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions mit Icons */}
        <View style={styles.quickActions}>
          <Typography variant="h3" style={styles.sectionTitle}>Schnellaktionen</Typography>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={pickVideo}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF6B6B' }]}>
                <Ionicons name="images-outline" size={28} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionText}>
                Aus Galerie
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
                <Ionicons name="camera-outline" size={28} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionText}>
                Aufnehmen
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FFD93D' }]}>
                <Ionicons name="cut-outline" size={28} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionText}>
                Bearbeiten
              </Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#95E1D3' }]}>
                <Ionicons name="color-filter-outline" size={28} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionText}>
                Filter
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beschreibung */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="text-outline" size={22} color={Colors.primary} />
            <Typography variant="h3" style={styles.sectionTitleInline}>Beschreibung</Typography>
          </View>
          <BlurView intensity={40} tint="dark" style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Erzähl mehr über dein Video... 
Du kannst auch #hashtags und @mentions verwenden"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={2000}
            />
            <View style={styles.inputFooter}>
              <View style={styles.inputIcons}>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="happy-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="at-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="pricetag-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              <Typography variant="caption" style={styles.charCount}>
                {description.length}/2000
              </Typography>
            </View>
          </BlurView>
        </View>

        {/* Sichtbarkeit mit Icons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={22} color={Colors.primary} />
            <Typography variant="h3" style={styles.sectionTitleInline}>Sichtbarkeit</Typography>
          </View>
          
          <TouchableOpacity onPress={() => setVisibility('public')} activeOpacity={0.7}>
            <BlurView intensity={40} tint="dark" style={[
              styles.visibilityCard,
              visibility === 'public' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <View style={[styles.visibilityIconContainer, { backgroundColor: '#4CAF50' }]}>
                  <Ionicons name="globe" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Öffentlich</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Jeder kann dein Video sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'public' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisibility('friends')} activeOpacity={0.7}>
            <BlurView intensity={40} tint="dark" style={[
              styles.visibilityCard,
              visibility === 'friends' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <View style={[styles.visibilityIconContainer, { backgroundColor: '#2196F3' }]}>
                  <Ionicons name="people" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Freunde</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Nur deine Freunde können es sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'friends' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisibility('private')} activeOpacity={0.7}>
            <BlurView intensity={40} tint="dark" style={[
              styles.visibilityCard,
              visibility === 'private' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <View style={[styles.visibilityIconContainer, { backgroundColor: '#FF9800' }]}>
                  <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Privat</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Nur du kannst es sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'private' && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </BlurView>
          </TouchableOpacity>
        </View>

        {/* Einstellungen mit Icons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={22} color={Colors.primary} />
            <Typography variant="h3" style={styles.sectionTitleInline}>Einstellungen</Typography>
          </View>
          
          <BlurView intensity={40} tint="dark" style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="chatbubble-outline" size={22} color="#4ECDC4" />
                <View style={styles.settingTextContainer}>
                  <Typography variant="body" style={styles.settingTitle}>Kommentare erlauben</Typography>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Andere können kommentieren
                  </Typography>
                </View>
              </View>
              <Switch
                value={allowComments}
                onValueChange={setAllowComments}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.settingDivider} />

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Ionicons name="people-outline" size={22} color="#FFD93D" />
                <View style={styles.settingTextContainer}>
                  <Typography variant="body" style={styles.settingTitle}>Duett erlauben</Typography>
                  <Typography variant="caption" style={styles.settingSubtitle}>
                    Andere können Duett erstellen
                  </Typography>
                </View>
              </View>
              <Switch
                value={allowDuet}
                onValueChange={setAllowDuet}
                trackColor={{ false: 'rgba(255,255,255,0.2)', true: Colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </BlurView>
        </View>

        {/* Veröffentlichen Button */}
        <TouchableOpacity
          style={[
            styles.publishButton,
            (uploading || !videoUri) && styles.publishButtonDisabled
          ]}
          onPress={uploadVideo}
          disabled={uploading || !videoUri}
          activeOpacity={0.8}
        >
          <BlurView intensity={80} tint="light" style={styles.publishButtonContent}>
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Typography variant="h3" style={styles.publishButtonText}>
                  Wird hochgeladen...
                </Typography>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                <Typography variant="h3" style={styles.publishButtonText}>
                  Veröffentlichen
                </Typography>
              </>
            )}
          </BlurView>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    gap: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
  },
  content: {
    flex: 1,
  },
  
  // Upload Section
  uploadSection: {
    padding: Spacing.md,
  },
  uploadCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  uploadingContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadingTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  progressIcons: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 24,
  },
  progressIconItem: {
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  videoPreview: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  videoSelectedTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 16,
  },
  changeVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  changeVideoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  uploadEmptyContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  uploadSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  featureIcons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },

  // Quick Actions
  quickActions: {
    padding: Spacing.md,
    paddingTop: 0,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },

  // Sections
  section: {
    padding: Spacing.md,
    paddingTop: 0,
    marginTop: 20,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitleInline: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },

  // Input Card
  inputCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: Spacing.md,
  },
  textArea: {
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  inputIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  // Visibility Cards
  visibilityCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visibilityCardActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  visibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  visibilityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  visibilitySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },

  // Settings Card
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 16,
  },

  // Publish Button
  publishButton: {
    marginHorizontal: Spacing.md,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonContent: {
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.primary,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});

