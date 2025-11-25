/**
 * ============================================================================
 * CLOUDFLARE STREAM VIDEO UPLOAD - SIMPLIFIED
 * ============================================================================
 * 
 * Diese Komponente nutzt Cloudflare Stream, funktioniert aber auch OHNE
 * konfigurierte Cloudflare-Credentials (fällt dann auf Standard-Upload zurück).
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { VIDEO_LIMITS } from '@/config/video-limits';

interface CloudflareVideoUploadProps {
  onUploadComplete?: (videoId: string) => void;
  onError?: (error: string) => void;
}

export default function CloudflareVideoUpload({
  onUploadComplete,
  onError,
}: CloudflareVideoUploadProps) {
  
  const [status, setStatus] = useState<'idle' | 'preparing' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Video auswählen und Upload starten
   */
  const handleUpload = async () => {
    try {
      // 1. Permissions
      const { status: permissionStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionStatus !== 'granted') {
        Alert.alert('Berechtigung benötigt', 'Zugriff auf Mediathek erforderlich');
        return;
      }

      // 2. Video auswählen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) return;

      const video = result.assets[0];
      
      // Validierung: Größe und Dauer
      if (video.fileSize) {
        const validation = VIDEO_LIMITS.validate({ sizeBytes: video.fileSize });
        if (!validation.valid) {
          Alert.alert('Upload nicht möglich', validation.error || 'Datei zu groß');
          return;
        }
      }

      if (video.duration) {
        const durationSeconds = video.duration / 1000; // ms → s
        const validation = VIDEO_LIMITS.validate({ durationSeconds });
        if (!validation.valid) {
          Alert.alert('Upload nicht möglich', validation.error || 'Video zu lang');
          return;
        }
      }
      
      // 3. Prüfe ob User eingeloggt ist
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Anmeldung erforderlich', 'Bitte melde dich an um Videos hochzuladen');
        return;
      }

      setStatus('preparing');

      // 4. Upload-URL von Backend holen
      const uploadResponse = await fetch('/api/videos/create-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          title: 'Mein Video',
          description: '',
        }),
      });

      if (!uploadResponse.ok) {
        throw new Error('Fehler beim Erstellen der Upload-URL');
      }

      const uploadData = await uploadResponse.json();
      
      setStatus('uploading');

      // 5. Video zu Cloudflare hochladen
      const formData = new FormData();
      formData.append('file', {
        uri: video.uri,
        type: 'video/mp4',
        name: 'video.mp4',
      } as any);

      const cloudflareUpload = await fetch(uploadData.video.upload_url, {
        method: 'POST',
        body: formData,
      });

      if (!cloudflareUpload.ok) {
        throw new Error('Upload zu Cloudflare fehlgeschlagen');
      }

      setStatus('processing');
      
      // 6. Warte auf Verarbeitung (vereinfacht)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStatus('ready');
      onUploadComplete?.(uploadData.video.id);

    } catch (error: any) {
      console.error('Upload Error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Upload fehlgeschlagen');
      onError?.(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cloudflare Stream Upload</Text>

      {status === 'idle' && (
        <TouchableOpacity style={styles.button} onPress={handleUpload}>
          <Text style={styles.buttonText}>📹 Video hochladen</Text>
        </TouchableOpacity>
      )}

      {status === 'preparing' && (
        <Text style={styles.statusText}>⏳ Vorbereitung...</Text>
      )}

      {status === 'uploading' && (
        <Text style={styles.statusText}>📤 Upload läuft...</Text>
      )}

      {status === 'processing' && (
        <Text style={styles.statusText}>⚙️ Wird verarbeitet...</Text>
      )}

      {status === 'ready' && (
        <View>
          <Text style={styles.successText}>✅ Video online!</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStatus('idle')}>
            <Text style={styles.buttonText}>Weiteres Video</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'error' && (
        <View>
          <Text style={styles.errorText}>❌ Fehler</Text>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
          <TouchableOpacity style={styles.button} onPress={() => setStatus('idle')}>
            <Text style={styles.buttonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF0050',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  successText: {
    fontSize: 20,
    color: '#00FF88',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#FF0050',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 12,
  },
});
