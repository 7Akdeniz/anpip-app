/**
 * VIDEO UPLOADER COMPONENT
 * 
 * Benutzerfreundliches Upload-Interface mit:
 * - Fortschrittsanzeige
 * - Pause/Resume/Cancel
 * - WLAN-Only Option
 * - Geschwindigkeitsanzeige
 * - Verbleibende Zeit
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChunkedUploader, UploadProgress } from '../../lib/upload/ChunkedUploader';
import { Ionicons } from '@expo/vector-icons';

export const VideoUploader: React.FC = () => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploader, setUploader] = useState<ChunkedUploader | null>(null);
  const [wifiOnly, setWifiOnly] = useState(false);

  /**
   * Video auswählen und Upload starten
   */
  const pickAndUploadVideo = useCallback(async () => {
    try {
      // Berechtigungen prüfen
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Berechtigung erforderlich', 'Bitte erlaube Zugriff auf deine Medien');
        return;
      }

      // Video auswählen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
        videoMaxDuration: 7200, // 2 Stunden = 120 Minuten
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const video = result.assets[0];
      const fileUri = video.uri;
      const fileName = fileUri.split('/').pop() || 'video.mp4';

      // Erstelle Uploader
      const newUploader = new ChunkedUploader(fileUri, fileName, {
        chunkSize: 8 * 1024 * 1024, // 8 MB
        maxRetries: 3,
        wifiOnly,
        onProgress: (progress) => {
          setUploadProgress(progress);
        },
        onComplete: (videoUrl, videoId) => {
          Alert.alert('Erfolg!', 'Video wurde hochgeladen und wird verarbeitet');
          setUploadProgress(null);
          setUploader(null);
        },
        onError: (error) => {
          Alert.alert('Upload-Fehler', error.message);
          setUploadProgress(null);
          setUploader(null);
        },
      });

      setUploader(newUploader);

      // Starte Upload
      await newUploader.start();
    } catch (error: any) {
      Alert.alert('Fehler', error.message);
    }
  }, [wifiOnly]);

  /**
   * Upload pausieren
   */
  const handlePause = useCallback(() => {
    if (uploader) {
      uploader.pause();
      setUploadProgress(prev => prev ? { ...prev, status: 'paused' } : null);
    }
  }, [uploader]);

  /**
   * Upload fortsetzen
   */
  const handleResume = useCallback(() => {
    if (uploader) {
      uploader.resume();
      setUploadProgress(prev => prev ? { ...prev, status: 'uploading' } : null);
    }
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
          text: 'Ja',
          style: 'destructive',
          onPress: () => {
            if (uploader) {
              uploader.cancel();
              setUploadProgress(null);
              setUploader(null);
            }
          },
        },
      ]
    );
  }, [uploader]);

  /**
   * Formatiert Bytes in lesbare Größe
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  /**
   * Formatiert Sekunden in lesbare Zeit
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  };

  return (
    <View style={styles.container}>
      {!uploadProgress ? (
        // Upload-Button
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickAndUploadVideo}>
            <Ionicons name="cloud-upload-outline" size={48} color="#fff" />
            <Text style={styles.uploadButtonText}>Video hochladen</Text>
            <Text style={styles.uploadSubtext}>Bis zu 2 Stunden</Text>
          </TouchableOpacity>

          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Nur über WLAN hochladen</Text>
            <Switch value={wifiOnly} onValueChange={setWifiOnly} />
          </View>
        </View>
      ) : (
        // Upload-Fortschritt
        <View style={styles.progressSection}>
          <Text style={styles.fileName}>{uploadProgress.fileName}</Text>

          {/* Fortschrittsbalken */}
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${uploadProgress.progress}%` },
              ]}
            />
          </View>

          {/* Fortschritts-Info */}
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>
              {uploadProgress.progress.toFixed(1)}%
            </Text>
            <Text style={styles.progressText}>
              {formatBytes(uploadProgress.uploadedSize)} / {formatBytes(uploadProgress.totalSize)}
            </Text>
          </View>

          {/* Chunk-Info */}
          <Text style={styles.chunkInfo}>
            Chunk {uploadProgress.currentChunk} / {uploadProgress.totalChunks}
          </Text>

          {/* Geschwindigkeit & Zeit */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="speedometer-outline" size={20} color="#666" />
              <Text style={styles.statText}>
                {formatBytes(uploadProgress.speed)}/s
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color="#666" />
              <Text style={styles.statText}>
                {formatTime(uploadProgress.remainingTime)} verbleibend
              </Text>
            </View>
          </View>

          {/* Steuerungs-Buttons */}
          <View style={styles.controls}>
            {uploadProgress.status === 'uploading' ? (
              <TouchableOpacity style={styles.controlButton} onPress={handlePause}>
                <Ionicons name="pause" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Pause</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.controlButton} onPress={handleResume}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.controlButtonText}>Fortsetzen</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.controlButton, styles.cancelButton]}
              onPress={handleCancel}
            >
              <Ionicons name="close" size={24} color="#fff" />
              <Text style={styles.controlButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  uploadSubtext: {
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
  },
  optionLabel: {
    fontSize: 16,
    color: '#333',
  },
  progressSection: {
    padding: 20,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#9C27B0',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  chunkInfo: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
