/**
 * 🎥 ADVANCED VIDEO UPLOAD SYSTEM 2025
 * 
 * Features:
 * - Videos bis 2 Stunden (7,2 GB bei 8 Mbps)
 * - Chunk-Upload mit Resume
 * - Background Upload
 * - Anti-Timeout (keine Zeitlimits)
 * - Auto-Retry bei Fehler
 * - Progress-Tracking
 * - KI-Auto-Processing
 */

import { supabase } from '../supabase';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// Optimierte Chunk-Größe für große Dateien
const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB Chunks (optimal für Mobilfunk & WLAN)
const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 2000;
const CHUNK_TIMEOUT_MS = 120000; // 2 Minuten pro Chunk

export interface UploadProgress {
  uploadId: string;
  status: 'preparing' | 'uploading' | 'processing' | 'completed' | 'failed' | 'paused';
  uploadedBytes: number;
  totalBytes: number;
  uploadedChunks: number;
  totalChunks: number;
  percentage: number;
  speed: number; // Bytes/Sekunde
  estimatedTimeRemaining: number; // Sekunden
  currentChunk?: number;
  error?: string;
}

export interface VideoMetadata {
  userId: string;
  title: string;
  description?: string;
  category: string;
  tags?: string[];
  location?: {
    country: string;
    city: string;
    lat?: number;
    lng?: number;
  };
  language?: string;
  visibility?: 'public' | 'private' | 'unlisted';
}

export interface UploadTask {
  id: string;
  videoUri: string;
  fileName: string;
  fileSize: number;
  metadata: VideoMetadata;
  uploadedChunks: number;
  totalChunks: number;
  startTime: number;
  lastUpdateTime: number;
  uploadId?: string;
  status: UploadProgress['status'];
}

export class AdvancedVideoUploadService {
  
  private activeTasks: Map<string, UploadTask> = new Map();
  private progressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();
  private isOnline: boolean = true;
  
  constructor() {
    this.initNetworkMonitoring();
  }
  
  /**
   * 📡 Netzwerk-Überwachung
   */
  private initNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;
      
      if (wasOffline && this.isOnline) {
        console.log('🌐 Network reconnected - resuming uploads');
        this.resumePausedUploads();
      } else if (!this.isOnline) {
        console.log('📴 Network lost - pausing uploads');
        this.pauseAllUploads();
      }
    });
  }
  
  /**
   * 🎬 Video-Upload starten
   */
  async startUpload(
    videoUri: string,
    metadata: VideoMetadata,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    
    // Datei-Info abrufen
    const fileInfo = await FileSystem.getInfoAsync(videoUri);
    if (!fileInfo.exists) {
      throw new Error('Video file not found');
    }
    
    const fileSize = fileInfo.size || 0;
    const fileName = videoUri.split('/').pop() || 'video.mp4';
    
    // Validierung: Max 2 Stunden = ~7.2 GB bei 8 Mbps
    const MAX_FILE_SIZE = 7.5 * 1024 * 1024 * 1024; // 7.5 GB
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error('Video exceeds maximum size of 7.5 GB (approx. 2 hours)');
    }
    
    const taskId = this.generateTaskId();
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
    
    const task: UploadTask = {
      id: taskId,
      videoUri,
      fileName,
      fileSize,
      metadata,
      uploadedChunks: 0,
      totalChunks,
      startTime: Date.now(),
      lastUpdateTime: Date.now(),
      status: 'preparing',
    };
    
    this.activeTasks.set(taskId, task);
    
    if (onProgress) {
      this.progressCallbacks.set(taskId, onProgress);
    }
    
    // Upload starten (async)
    this.processUpload(task).catch(error => {
      console.error('Upload failed:', error);
      this.updateProgress(taskId, { status: 'failed', error: error.message });
    });
    
    return taskId;
  }
  
  /**
   * 📤 Upload verarbeiten
   */
  private async processUpload(task: UploadTask): Promise<void> {
    
    // 1. Upload initialisieren
    this.updateProgress(task.id, { status: 'preparing' });
    
    const { data: initData, error: initError } = await supabase.functions.invoke(
      'initialize-upload',
      {
        body: {
          fileName: task.fileName,
          fileSize: task.fileSize,
          metadata: task.metadata,
        },
      }
    );
    
    if (initError || !initData) {
      throw new Error('Failed to initialize upload: ' + initError?.message);
    }
    
    task.uploadId = initData.uploadId;
    this.activeTasks.set(task.id, task);
    
    // 2. Chunks hochladen
    this.updateProgress(task.id, { status: 'uploading' });
    
    for (let chunkIndex = task.uploadedChunks; chunkIndex < task.totalChunks; chunkIndex++) {
      
      // Prüfe ob Upload pausiert oder abgebrochen wurde
      const currentTask = this.activeTasks.get(task.id);
      if (!currentTask || currentTask.status === 'paused') {
        console.log(`Upload ${task.id} paused`);
        return;
      }
      
      // Chunk hochladen mit Retry-Logik
      await this.uploadChunkWithRetry(task, chunkIndex);
      
      // Progress aktualisieren
      task.uploadedChunks = chunkIndex + 1;
      task.lastUpdateTime = Date.now();
      this.activeTasks.set(task.id, task);
      
      this.updateProgress(task.id, { currentChunk: chunkIndex + 1 });
    }
    
    // 3. Upload finalisieren
    const { data: finalData, error: finalError } = await supabase.functions.invoke(
      'finalize-upload',
      {
        body: {
          uploadId: task.uploadId,
          totalChunks: task.totalChunks,
        },
      }
    );
    
    if (finalError) {
      throw new Error('Failed to finalize upload: ' + finalError.message);
    }
    
    // 4. Async-Verarbeitung triggern
    this.updateProgress(task.id, { status: 'processing' });
    
    await supabase.functions.invoke('process-video', {
      body: {
        uploadId: task.uploadId,
        videoId: finalData.videoId,
      },
    });
    
    // 5. Fertig!
    this.updateProgress(task.id, { status: 'completed' });
    this.activeTasks.delete(task.id);
    this.progressCallbacks.delete(task.id);
  }
  
  /**
   * 📦 Chunk hochladen mit Retry-Logik
   */
  private async uploadChunkWithRetry(
    task: UploadTask,
    chunkIndex: number,
    retryCount: number = 0
  ): Promise<void> {
    
    try {
      // Chunk-Daten lesen
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, task.fileSize);
      const chunkSize = end - start;
      
      // Chunk als Base64 lesen (für React Native)
      const chunkData = await FileSystem.readAsStringAsync(task.videoUri, {
        encoding: 'base64',
        position: start,
        length: chunkSize,
      });
      
      // Upload-URL holen
      const { data: urlData, error: urlError } = await supabase.functions.invoke(
        'get-chunk-upload-url',
        {
          body: {
            uploadId: task.uploadId,
            chunkIndex,
          },
        }
      );
      
      if (urlError || !urlData) {
        throw new Error('Failed to get upload URL');
      }
      
      // Chunk hochladen mit Timeout
      const uploadPromise = fetch(urlData.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': chunkSize.toString(),
        },
        body: this.base64ToBlob(chunkData),
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Chunk upload timeout')), CHUNK_TIMEOUT_MS)
      );
      
      const response = await Promise.race([uploadPromise, timeoutPromise]) as Response;
      
      if (!response.ok) {
        throw new Error(`Chunk upload failed: ${response.statusText}`);
      }
      
      console.log(`✓ Chunk ${chunkIndex + 1}/${task.totalChunks} uploaded`);
      
    } catch (error) {
      console.error(`Chunk ${chunkIndex} upload error:`, error);
      
      // Retry mit exponentieller Wartezeit
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
        console.log(`Retrying chunk ${chunkIndex} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        await this.sleep(delay);
        return this.uploadChunkWithRetry(task, chunkIndex, retryCount + 1);
      }
      
      throw new Error(`Chunk ${chunkIndex} failed after ${MAX_RETRIES} retries`);
    }
  }
  
  /**
   * 📊 Progress aktualisieren
   */
  private updateProgress(taskId: string, updates: Partial<UploadProgress>) {
    const task = this.activeTasks.get(taskId);
    if (!task) return;
    
    const callback = this.progressCallbacks.get(taskId);
    if (!callback) return;
    
    const uploadedBytes = task.uploadedChunks * CHUNK_SIZE;
    const totalBytes = task.fileSize;
    const percentage = (uploadedBytes / totalBytes) * 100;
    
    const elapsedTime = (Date.now() - task.startTime) / 1000; // Sekunden
    const speed = uploadedBytes / elapsedTime; // Bytes/Sekunde
    const remainingBytes = totalBytes - uploadedBytes;
    const estimatedTimeRemaining = speed > 0 ? remainingBytes / speed : 0;
    
    const progress: UploadProgress = {
      uploadId: taskId,
      status: task.status,
      uploadedBytes,
      totalBytes,
      uploadedChunks: task.uploadedChunks,
      totalChunks: task.totalChunks,
      percentage,
      speed,
      estimatedTimeRemaining,
      ...updates,
    };
    
    callback(progress);
  }
  
  /**
   * ⏸️ Upload pausieren
   */
  pauseUpload(taskId: string) {
    const task = this.activeTasks.get(taskId);
    if (task) {
      task.status = 'paused';
      this.activeTasks.set(taskId, task);
      this.updateProgress(taskId, { status: 'paused' });
    }
  }
  
  /**
   * ▶️ Upload fortsetzen
   */
  resumeUpload(taskId: string) {
    const task = this.activeTasks.get(taskId);
    if (task && task.status === 'paused') {
      task.status = 'uploading';
      this.activeTasks.set(taskId, task);
      this.processUpload(task).catch(error => {
        console.error('Resume failed:', error);
        this.updateProgress(taskId, { status: 'failed', error: error.message });
      });
    }
  }
  
  /**
   * ❌ Upload abbrechen
   */
  cancelUpload(taskId: string) {
    this.activeTasks.delete(taskId);
    this.progressCallbacks.delete(taskId);
  }
  
  /**
   * 🔄 Alle pausierten Uploads fortsetzen
   */
  private resumePausedUploads() {
    for (const [taskId, task] of this.activeTasks) {
      if (task.status === 'paused') {
        this.resumeUpload(taskId);
      }
    }
  }
  
  /**
   * ⏸️ Alle Uploads pausieren
   */
  private pauseAllUploads() {
    for (const taskId of this.activeTasks.keys()) {
      this.pauseUpload(taskId);
    }
  }
  
  // Helper Functions
  
  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private base64ToBlob(base64: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: 'application/octet-stream' });
  }
}

export const advancedUploadService = new AdvancedVideoUploadService();
