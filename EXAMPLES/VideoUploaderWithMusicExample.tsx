/**
 * VIDEO UPLOADER WITH MUSIC INTEGRATION
 * 
 * Erweiterte Version der VideoUploader-Komponente mit:
 * - Musik-Auswahl für Videos
 * - Music Preview
 * - Integrierter MusicSelector
 * 
 * INTEGRATION-BEISPIEL für components/upload/VideoUploader.tsx
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChunkedUploader, UploadProgress } from '../../lib/upload/ChunkedUploader';
import { Ionicons } from '@expo/vector-icons';
import { MusicSelector } from '../music/MusicSelector';
import { MusicPlayer } from '../music/MusicPlayer';
import type { PixabayMusicTrack } from '../../types/pixabay-music';

export const VideoUploaderWithMusic: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploader, setUploader] = useState<ChunkedUploader | null>(null);
  const [wifiOnly, setWifiOnly] = useState(false);
  
  // 🎵 Music State
  const [selectedMusic, setSelectedMusic] = useState<PixabayMusicTrack | null>(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);

  /**
   * Video auswählen
   */
  const pickVideo = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Bitte erlaube Zugriff auf deine Medien');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 7200,
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const video = result.assets[0];
      setVideoUri(video.uri);
      
      Alert.alert(
        'Video ausgewählt',
        'Möchtest du Musik hinzufügen?',
        [
          { text: 'Nein, direkt hochladen', onPress: () => startUpload(video.uri, null) },
          { text: 'Ja, Musik hinzufügen', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Video Pick Error:', error);
      Alert.alert('Fehler', 'Video konnte nicht ausgewählt werden');
    }
  }, []);

  /**
   * 🎵 Musik-Auswahl
   */
  const handleMusicSelect = useCallback((track: PixabayMusicTrack) => {
    setSelectedMusic(track);
    Alert.alert(
      'Musik ausgewählt',
      `${track.name} - ${track.artist}`,
      [
        { text: 'OK' }
      ]
    );
  }, []);

  /**
   * Upload starten (mit oder ohne Musik)
   */
  const startUpload = useCallback(async (uri: string, music: PixabayMusicTrack | null) => {
    try {
      const fileName = uri.split('/').pop() || 'video.mp4';

      // Upload-Metadaten vorbereiten
      const metadata = {
        video_uri: uri,
        filename: fileName,
        // 🎵 Musik-Daten
        music_id: music?.id || null,
        music_name: music?.name || null,
        music_artist: music?.artist || null,
        music_url: music?.audioUrl || null,
        music_genre: music?.genre || null,
        music_duration: music?.duration || null,
      };

      console.log('📤 Upload-Metadaten:', metadata);

      // ChunkedUploader erstellen
      const newUploader = new ChunkedUploader({
        fileUri: uri,
        fileName,
        uploadUrl: 'https://your-upload-endpoint.com/upload',
        onProgress: setUploadProgress,
        wifiOnly,
        metadata, // Metadaten mit Musik-Info
      });

      setUploader(newUploader);

      // Upload starten
      const result = await newUploader.start();
      
      if (result.success) {
        Alert.alert(
          'Upload erfolgreich! 🎉',
          music ? `Video mit Musik "${music.name}" hochgeladen` : 'Video hochgeladen'
        );
        
        // Reset
        setVideoUri(null);
        setSelectedMusic(null);
        setUploadProgress(null);
        setUploader(null);
      }
    } catch (error) {
      console.error('Upload Error:', error);
      Alert.alert('Upload fehlgeschlagen', 'Bitte versuche es erneut');
    }
  }, [wifiOnly]);

  /**
   * Upload mit ausgewählter Musik starten
   */
  const handleUpload = useCallback(() => {
    if (!videoUri) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Video');
      return;
    }

    startUpload(videoUri, selectedMusic);
  }, [videoUri, selectedMusic, startUpload]);

  /**
   * Upload pausieren
   */
  const handlePause = useCallback(() => {
    uploader?.pause();
  }, [uploader]);

  /**
   * Upload fortsetzen
   */
  const handleResume = useCallback(() => {
    uploader?.resume();
  }, [uploader]);

  /**
   * Upload abbrechen
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Upload abbrechen?',
      'Möchtest du den Upload wirklich abbrechen?',
      [
        { text: 'Nein', style: 'cancel' },
        {
          text: 'Ja, abbrechen',
          style: 'destructive',
          onPress: () => {
            uploader?.cancel();
            setUploadProgress(null);
            setUploader(null);
            setVideoUri(null);
            setSelectedMusic(null);
          },
        },
      ]
    );
  }, [uploader]);

  // Upload läuft
  const isUploading = uploadProgress !== null && !uploadProgress.isComplete;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Video hochladen</Text>

      {/* Video-Auswahl */}
      {!videoUri ? (
        <TouchableOpacity style={styles.selectButton} onPress={pickVideo}>
          <Ionicons name="videocam" size={40} color="#1DB954" />
          <Text style={styles.selectButtonText}>Video auswählen</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.selectedVideoContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
          <Text style={styles.selectedVideoText}>Video ausgewählt</Text>
          <TouchableOpacity onPress={() => setVideoUri(null)}>
            <Ionicons name="close-circle" size={24} color="#ff4444" />
          </TouchableOpacity>
        </View>
      )}

      {/* 🎵 Music Selector (nur wenn Video ausgewählt) */}
      {videoUri && !isUploading && (
        <View style={styles.musicSection}>
          <Text style={styles.sectionTitle}>🎵 Musik (optional)</Text>
          <MusicSelector
            onSelectMusic={handleMusicSelect}
            currentTrack={selectedMusic}
            style={styles.musicSelector}
          />
        </View>
      )}

      {/* Upload-Button */}
      {videoUri && !isUploading && (
        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
          <Ionicons name="cloud-upload" size={24} color="#fff" />
          <Text style={styles.uploadButtonText}>
            {selectedMusic ? '🎵 Mit Musik hochladen' : 'Hochladen'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Upload-Fortschritt */}
      {uploadProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>
              {uploadProgress.isComplete ? '✅ Upload abgeschlossen' : '📤 Uploading...'}
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(uploadProgress.percentage)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View
              style={[styles.progressBarFill, { width: `${uploadProgress.percentage}%` }]}
            />
          </View>

          {/* Upload-Info */}
          <View style={styles.uploadInfo}>
            <Text style={styles.uploadInfoText}>
              {uploadProgress.uploadedChunks} / {uploadProgress.totalChunks} Chunks
            </Text>
            {uploadProgress.speed > 0 && (
              <Text style={styles.uploadInfoText}>
                {(uploadProgress.speed / 1024 / 1024).toFixed(2)} MB/s
              </Text>
            )}
            {uploadProgress.estimatedTimeRemaining > 0 && (
              <Text style={styles.uploadInfoText}>
                ~{Math.round(uploadProgress.estimatedTimeRemaining / 1000)}s verbleibend
              </Text>
            )}
          </View>

          {/* 🎵 Music Info beim Upload */}
          {selectedMusic && (
            <View style={styles.uploadMusicInfo}>
              <Ionicons name="musical-notes" size={16} color="#1DB954" />
              <Text style={styles.uploadMusicText}>
                {selectedMusic.name} - {selectedMusic.artist}
              </Text>
            </View>
          )}

          {/* Upload Controls */}
          {!uploadProgress.isComplete && (
            <View style={styles.uploadControls}>
              {uploadProgress.isPaused ? (
                <TouchableOpacity style={styles.controlButton} onPress={handleResume}>
                  <Ionicons name="play" size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>Fortsetzen</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
                  <Ionicons name="pause" size={24} color="#fff" />
                  <Text style={styles.controlButtonText}>Pausieren</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.controlButton, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Ionicons name="close" size={24} color="#ff4444" />
                <Text style={[styles.controlButtonText, styles.cancelButtonText]}>
                  Abbrechen
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* WiFi-Only Option */}
      <View style={styles.settingsContainer}>
        <Text style={styles.settingsLabel}>Nur über WLAN hochladen</Text>
        <Switch value={wifiOnly} onValueChange={setWifiOnly} />
      </View>

      {/* 🎵 Music Player (wenn Musik ausgewählt) */}
      {selectedMusic && !isUploading && (
        <View style={styles.playerContainer}>
          <Text style={styles.sectionTitle}>Vorschau</Text>
          <MusicPlayer compact />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  selectButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#1DB954',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  selectedVideoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  selectedVideoText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  musicSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  musicSelector: {
    // Custom styles
  },
  uploadButton: {
    backgroundColor: '#1DB954',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressPercentage: {
    color: '#1DB954',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  uploadInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  uploadInfoText: {
    color: '#aaa',
    fontSize: 12,
  },
  uploadMusicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0d0d',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    gap: 8,
  },
  uploadMusicText: {
    color: '#1DB954',
    fontSize: 14,
    flex: 1,
  },
  uploadControls: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  cancelButtonText: {
    color: '#ff4444',
  },
  settingsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  settingsLabel: {
    color: '#fff',
    fontSize: 16,
  },
  playerContainer: {
    marginTop: 8,
  },
});
