/**
 * ============================================================================
 * DUET RECORDER COMPONENT
 * ============================================================================
 * 
 * Split-Screen Video Recording für Duets
 * 
 * Layout:
 * ┌─────────────┬─────────────┐
 * │             │             │
 * │  Original   │   Camera    │
 * │   Video     │  Recording  │
 * │             │             │
 * └─────────────┴─────────────┘
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Video as ExpoVideo } from 'expo-av';
import { Camera, CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { createDuet } from '@/lib/duet-engine';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface DuetRecorderProps {
  originalVideoId: string;
  originalVideoUrl: string;
  onComplete?: (videoId: string) => void;
  onCancel?: () => void;
}

export default function DuetRecorder({
  originalVideoId,
  originalVideoUrl,
  onComplete,
  onCancel,
}: DuetRecorderProps) {
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const cameraRef = useRef<any>(null);
  const videoRef = useRef<ExpoVideo>(null);

  // Camera Permission
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  // Start Recording
  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      
      // Start Original Video
      if (videoRef.current) {
        await videoRef.current.playAsync();
      }

      // Start Camera Recording
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60, // Max 60 Sekunden
        quality: '720p',
      });

      setRecordedUri(video.uri);
      setIsRecording(false);

    } catch (error) {
      console.error('Recording failed:', error);
      Alert.alert('Fehler', 'Aufnahme fehlgeschlagen');
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      
      // Stop Original Video
      if (videoRef.current) {
        await videoRef.current.pauseAsync();
      }
    }
  };

  // Upload Duet
  const uploadDuet = async () => {
    if (!recordedUri) return;

    setUploading(true);

    try {
      // 1. Upload recorded video to Supabase Storage
      const fileName = `duet_${Date.now()}.mp4`;
      const formData = new FormData();
      formData.append('file', {
        uri: recordedUri,
        name: fileName,
        type: 'video/mp4',
      } as any);

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      // Upload via Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(`duets/${fileName}`, formData);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(uploadData.path);

      // 2. Create Duet Entry
      const result = await createDuet(session.session.user.id, {
        originalVideoId,
        originalVideoUrl,
        recordedVideoUrl: publicUrlData.publicUrl,
        layout: 'side-by-side',
        audioMix: 'both',
      });

      if (result.success) {
        Alert.alert('✅ Duet erstellt!', 'Dein Duet wurde hochgeladen');
        onComplete?.(result.videoId!);
      } else {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert('Fehler', 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
    }
  };

  // Retry Recording
  const retryRecording = () => {
    setRecordedUri(null);
    setIsRecording(false);
  };

  if (hasPermission === null) {
    return <Typography>Camera permission wird geladen...</Typography>;
  }

  if (hasPermission === false) {
    return <Typography>Keine Camera-Berechtigung</Typography>;
  }

  return (
    <View style={styles.container}>
      {/* Split Screen */}
      <View style={styles.splitScreen}>
        
        {/* Original Video (Links) */}
        <View style={styles.videoPanel}>
          <ExpoVideo
            ref={videoRef}
            source={{ uri: originalVideoUrl }}
            style={styles.video}
            shouldPlay={false}
            isLooping={false}
            volume={0.5}
          />
          <View style={styles.label}>
            <Typography variant="caption" style={styles.labelText}>
              Original
            </Typography>
          </View>
        </View>

        {/* Camera Recording (Rechts) */}
        <View style={styles.videoPanel}>
          {recordedUri ? (
            // Preview nach Aufnahme
            <ExpoVideo
              source={{ uri: recordedUri }}
              style={styles.video}
              shouldPlay={true}
              isLooping={true}
            />
          ) : (
            // Live Camera
            <CameraView
              ref={cameraRef}
              style={styles.video}
              facing="front"
            />
          )}
          <View style={styles.label}>
            <Typography variant="caption" style={styles.labelText}>
              {recordedUri ? 'Preview' : 'Deine Aufnahme'}
            </Typography>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        
        {recordedUri ? (
          // Nach Aufnahme: Upload oder Retry
          <>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retryRecording}
            >
              <Ionicons name="refresh" size={32} color="#FFFFFF" />
              <Typography variant="caption" style={styles.buttonText}>
                Wiederholen
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={uploadDuet}
              disabled={uploading}
            >
              <Ionicons name="cloud-upload" size={32} color="#FFFFFF" />
              <Typography variant="caption" style={styles.buttonText}>
                {uploading ? 'Wird hochgeladen...' : 'Hochladen'}
              </Typography>
            </TouchableOpacity>
          </>
        ) : (
          // Recording Controls
          <>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
            >
              <Ionicons name="close" size={32} color="#FFFFFF" />
              <Typography variant="caption" style={styles.buttonText}>
                Abbrechen
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.recordButton,
                isRecording && styles.recordButtonActive,
              ]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <View style={[
                styles.recordCircle,
                isRecording && styles.recordCircleActive,
              ]} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Recording Indicator */}
      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Typography variant="body" style={styles.recordingText}>
            Aufnahme läuft...
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  splitScreen: {
    flex: 1,
    flexDirection: 'row',
  },
  videoPanel: {
    flex: 1,
    position: 'relative',
  },
  video: {
    flex: 1,
    backgroundColor: '#000000',
  },
  label: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordButtonActive: {
    backgroundColor: 'rgba(255,0,0,0.3)',
  },
  recordCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF0000',
  },
  recordCircleActive: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  cancelButton: {
    alignItems: 'center',
  },
  retryButton: {
    alignItems: 'center',
  },
  uploadButton: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    marginTop: Spacing.xs,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF0000',
    marginRight: Spacing.xs,
  },
  recordingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
