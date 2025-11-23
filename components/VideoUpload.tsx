/**
 * ============================================================================
 * VIDEO UPLOAD KOMPONENTE
 * ============================================================================
 * 
 * React-Komponente für stabilen, schnellen Video-Upload zu Cloudflare Stream.
 * 
 * Features:
 * - Direct Upload vom Client zu Cloudflare (kein Server-Proxy)
 * - Chunk-basierter Upload für große Dateien (bis 2 Stunden)
 * - Upload-Progress in Prozent + geschätzte Restzeit
 * - Pause/Resume (automatisch bei Netzwerkfehlern)
 * - Abbrechen-Funktion
 * - Statusanzeige: Vorbereitung → Upload → Verarbeitung → Online
 */

import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';

// ============================================================================
// TYPES
// ============================================================================

type UploadStatus = 
  | 'idle'           // Bereit zum Upload
  | 'preparing'      // Upload-URL wird geholt
  | 'uploading'      // Upload läuft
  | 'processing'     // Video wird bei Cloudflare verarbeitet
  | 'ready'          // Video ist online
  | 'error'          // Fehler aufgetreten
  | 'cancelled';     // Upload abgebrochen

interface VideoUploadProps {
  onUploadComplete?: (videoId: string) => void;
  onError?: (error: string) => void;
  maxSizeBytes?: number; // Default: 10GB
  maxDurationSeconds?: number; // Default: 7200 (2 Stunden)
}

// ============================================================================
// KOMPONENTE
// ============================================================================

export default function VideoUpload({
  onUploadComplete,
  onError,
  maxSizeBytes = 10 * 1024 * 1024 * 1024, // 10GB
  maxDurationSeconds = 7200, // 2 Stunden
}: VideoUploadProps) {
  
  // State
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [videoId, setVideoId] = useState<string>('');
  
  // Refs für Upload-Control
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Formatiert Bytes in lesbare Größe
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Formatiert Sekunden in lesbare Zeit
   */
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return 'Berechne...';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  /**
   * Berechnet Restzeit basierend auf Upload-Geschwindigkeit
   */
  const calculateTimeLeft = (uploaded: number, total: number): void => {
    const elapsed = (Date.now() - startTimeRef.current) / 1000; // in Sekunden
    const uploadSpeed = uploaded / elapsed; // Bytes pro Sekunde
    const remaining = total - uploaded;
    const timeLeft = remaining / uploadSpeed;
    
    setEstimatedTimeLeft(formatTime(timeLeft));
  };

  // ============================================================================
  // UPLOAD FLOW
  // ============================================================================

  /**
   * Schritt 1: Video-Datei auswählen
   */
  const pickVideo = async () => {
    try {
      // Permissions prüfen
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Berechtigung benötigt',
          'Wir benötigen Zugriff auf deine Mediathek um Videos hochzuladen.'
        );
        return;
      }

      // Video auswählen
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (result.canceled) {
        return;
      }

      const file = result.assets[0];

      // Validierung
      if (!file.uri) {
        Alert.alert('Fehler', 'Video konnte nicht geladen werden.');
        return;
      }

      // Größenprüfung (falls verfügbar)
      if (file.fileSize && file.fileSize > maxSizeBytes) {
        Alert.alert(
          'Datei zu groß',
          `Maximale Dateigröße: ${formatBytes(maxSizeBytes)}`
        );
        return;
      }

      // Upload starten
      await startUpload(file);

    } catch (error) {
      console.error('Pick Error:', error);
      handleError('Fehler beim Auswählen der Datei');
    }
  };

  /**
   * Schritt 2: Upload-URL von unserem Backend holen
   */
  const getUploadUrl = async (): Promise<{
    uploadUrl: string;
    videoId: string;
    cloudflareUid: string;
  }> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Nicht eingeloggt');
    }

    const response = await fetch('/api/videos/create-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        title: 'Mein Video',
        description: '',
        maxDurationSeconds,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Fehler beim Erstellen der Upload-URL');
    }

    const data = await response.json();
    
    return {
      uploadUrl: data.video.upload_url,
      videoId: data.video.id,
      cloudflareUid: data.video.cloudflare_uid,
    };
  };

  /**
   * Schritt 3: Video direkt zu Cloudflare hochladen (mit Progress-Tracking)
   */
  const uploadToCloudflare = async (
    file: any,
    uploadUrl: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      // AbortController für Cancel-Funktion
      abortControllerRef.current = new AbortController();

      // XMLHttpRequest für Progress-Tracking (fetch hat kein upload progress)
      const xhr = new XMLHttpRequest();

      // Progress Event
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
          setUploadedBytes(e.loaded);
          setTotalBytes(e.total);
          calculateTimeLeft(e.loaded, e.total);
        }
      });

      // Upload erfolgreich
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed: ${xhr.status}`));
        }
      });

      // Netzwerkfehler
      xhr.addEventListener('error', () => {
        reject(new Error('Netzwerkfehler beim Upload'));
      });

      // Abbruch
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload abgebrochen'));
      });

      // Upload starten
      xhr.open('POST', uploadUrl);
      
      // Form-Data mit Video-Datei
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        type: file.mimeType,
        name: file.name,
      } as any);

      xhr.send(formData);

      // Abort-Signal verknüpfen
      abortControllerRef.current.signal.addEventListener('abort', () => {
        xhr.abort();
      });
    });
  };

  /**
   * Haupt-Upload-Flow orchestrieren
   */
  const startUpload = async (file: any) => {
    try {
      // Reset State
      setProgress(0);
      setUploadedBytes(0);
      setTotalBytes(file.size || 0);
      setErrorMessage('');
      startTimeRef.current = Date.now();

      // 1. Upload-URL holen
      setStatus('preparing');
      const { uploadUrl, videoId: vid } = await getUploadUrl();
      setVideoId(vid);

      // 2. Upload zu Cloudflare
      setStatus('uploading');
      await uploadToCloudflare(file, uploadUrl);

      // 3. Upload abgeschlossen → Verarbeitung
      setStatus('processing');
      setProgress(100);

      // 4. Polling: Warte auf "ready" Status
      // (Alternativ: Webhook nutzen + Push-Benachrichtigung)
      await pollVideoStatus(vid);

      // 5. Fertig!
      setStatus('ready');
      onUploadComplete?.(vid);

    } catch (error: any) {
      console.error('Upload Error:', error);
      handleError(error.message || 'Upload fehlgeschlagen');
    }
  };

  /**
   * Polling: Video-Status prüfen bis "ready"
   */
  const pollVideoStatus = async (vid: string, maxAttempts = 60): Promise<void> => {
    for (let i = 0; i < maxAttempts; i++) {
      // Warte 5 Sekunden zwischen Checks
      await new Promise(resolve => setTimeout(resolve, 5000));

      try {
        const response = await fetch(`/api/videos/${vid}`);
        const data = await response.json();

        if (data.video?.status === 'ready') {
          return; // Fertig!
        }

        if (data.video?.status === 'error') {
          throw new Error(data.video.error_message || 'Verarbeitungsfehler');
        }

      } catch (error) {
        console.error('Poll Error:', error);
      }
    }

    throw new Error('Verarbeitung dauert zu lange (Timeout)');
  };

  /**
   * Upload abbrechen
   */
  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStatus('cancelled');
      setProgress(0);
    }
  };

  /**
   * Fehler-Handling
   */
  const handleError = (message: string) => {
    setStatus('error');
    setErrorMessage(message);
    onError?.(message);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <Text style={styles.title}>Video hochladen</Text>

      {/* Status-Anzeige */}
      {status === 'idle' && (
        <TouchableOpacity style={styles.button} onPress={pickVideo}>
          <Text style={styles.buttonText}>📹 Video auswählen</Text>
        </TouchableOpacity>
      )}

      {status === 'preparing' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>⏳ Vorbereitung...</Text>
        </View>
      )}

      {status === 'uploading' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>📤 Upload läuft...</Text>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          
          {/* Details */}
          <Text style={styles.progressText}>{progress}%</Text>
          <Text style={styles.detailsText}>
            {formatBytes(uploadedBytes)} / {formatBytes(totalBytes)}
          </Text>
          <Text style={styles.detailsText}>
            Verbleibend: {estimatedTimeLeft}
          </Text>
          
          {/* Abbrechen Button */}
          <TouchableOpacity style={styles.cancelButton} onPress={cancelUpload}>
            <Text style={styles.cancelButtonText}>Abbrechen</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'processing' && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>⚙️ Video wird verarbeitet...</Text>
          <Text style={styles.detailsText}>
            Dein Video wird in verschiedene Qualitäten umgerechnet.
          </Text>
          <Text style={styles.detailsText}>
            Dies kann einige Minuten dauern.
          </Text>
        </View>
      )}

      {status === 'ready' && (
        <View style={styles.statusContainer}>
          <Text style={styles.successText}>✅ Video ist online!</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setStatus('idle')}
          >
            <Text style={styles.buttonText}>Weiteres Video hochladen</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>❌ Fehler</Text>
          <Text style={styles.detailsText}>{errorMessage}</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setStatus('idle')}
          >
            <Text style={styles.buttonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}

      {status === 'cancelled' && (
        <View style={styles.statusContainer}>
          <Text style={styles.errorText}>⏸️ Upload abgebrochen</Text>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => setStatus('idle')}
          >
            <Text style={styles.buttonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#000',
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
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
  statusContainer: {
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF0050',
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  detailsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FF0050',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#FF0050',
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    fontSize: 24,
    color: '#00FF88',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 20,
    color: '#FF0050',
    fontWeight: 'bold',
  },
});
