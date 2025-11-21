/**
 * Resilient Upload System
 * - Chunked Upload mit Wiederaufnahme
 * - Offline-Queue
 * - Auto-Reconnect
 * - Timeout-Protection für lange Videos (30-120 min)
 */

import { createClient } from '@supabase/supabase-js';
import NetInfo from '@react-native-community/netinfo';

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB Chunks
const MAX_RETRIES = 5;
const TIMEOUT_MS = 300000; // 5 Minuten pro Chunk

export interface UploadProgress {
  uploadedChunks: number;
  totalChunks: number;
  percentage: number;
  bytesUploaded: number;
  totalBytes: number;
  estimatedTimeRemaining: number; // in seconds
}

export interface ResilientUploadOptions {
  onProgress?: (progress: UploadProgress) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
  metadata?: any;
}

export class ResilientUploadSystem {
  private supabase;
  private uploadQueue: Map<string, UploadTask> = new Map();
  private isOnline: boolean = true;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.initializeNetworkMonitoring();
    this.loadOfflineQueue();
  }

  /**
   * Überwacht Netzwerkstatus
   */
  private initializeNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected || false;

      if (wasOffline && this.isOnline) {
        console.log('Network reconnected, resuming uploads...');
        this.resumeAllUploads();
      }
    });
  }

  /**
   * Lädt gespeicherte Offline-Queue
   */
  private async loadOfflineQueue() {
    // Load from AsyncStorage
    try {
      // const queue = await AsyncStorage.getItem('upload_queue');
      // if (queue) this.uploadQueue = new Map(JSON.parse(queue));
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Startet resilientes Chunked Upload
   */
  async uploadVideo(
    file: File | Blob,
    fileName: string,
    options: ResilientUploadOptions = {}
  ): Promise<string> {
    const taskId = this.generateTaskId();
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    const task: UploadTask = {
      id: taskId,
      file,
      fileName,
      totalChunks,
      uploadedChunks: 0,
      retryCount: 0,
      options,
      startTime: Date.now(),
    };

    this.uploadQueue.set(taskId, task);
    await this.saveQueue();

    try {
      const result = await this.processUpload(task);
      this.uploadQueue.delete(taskId);
      await this.saveQueue();
      options.onComplete?.(result);
      return result.videoUrl;
    } catch (error: any) {
      console.error('Upload failed:', error);
      options.onError?.(error);
      throw error;
    }
  }

  /**
   * Verarbeitet Upload mit Chunking & Retry
   */
  private async processUpload(task: UploadTask): Promise<any> {
    const { file, fileName, totalChunks, options } = task;
    const uploadId = await this.initializeMultipartUpload(fileName);

    const uploadedParts: any[] = [];

    for (let i = task.uploadedChunks; i < totalChunks; i++) {
      let retries = 0;
      let success = false;

      while (retries < MAX_RETRIES && !success) {
        try {
          // Warte auf Netzwerk wenn offline
          await this.waitForNetwork();

          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          // Upload Chunk mit Timeout
          const part = await this.uploadChunkWithTimeout(
            uploadId,
            chunk,
            i + 1,
            TIMEOUT_MS
          );

          uploadedParts.push(part);
          task.uploadedChunks = i + 1;
          success = true;

          // Progress Callback
          const progress = this.calculateProgress(task);
          options.onProgress?.(progress);

          // Save progress
          await this.saveQueue();
        } catch (error) {
          retries++;
          console.error(`Chunk ${i + 1} upload failed (retry ${retries}):`, error);

          if (retries >= MAX_RETRIES) {
            throw new Error(`Failed to upload chunk ${i + 1} after ${MAX_RETRIES} retries`);
          }

          // Exponential Backoff
          await this.sleep(Math.pow(2, retries) * 1000);
        }
      }
    }

    // Complete Multipart Upload
    const result = await this.completeMultipartUpload(uploadId, uploadedParts, fileName);
    return result;
  }

  /**
   * Upload Chunk mit Timeout
   */
  private async uploadChunkWithTimeout(
    uploadId: string,
    chunk: Blob,
    partNumber: number,
    timeout: number
  ): Promise<any> {
    return Promise.race([
      this.uploadChunk(uploadId, chunk, partNumber),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Upload timeout')), timeout)
      ),
    ]);
  }

  /**
   * Upload einzelnen Chunk
   */
  private async uploadChunk(
    uploadId: string,
    chunk: Blob,
    partNumber: number
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', chunk);
    formData.append('uploadId', uploadId);
    formData.append('partNumber', partNumber.toString());

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/upload-chunk`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) throw new Error('Chunk upload failed');
    return await response.json();
  }

  private async initializeMultipartUpload(fileName: string): Promise<string> {
    return 'upload-' + Date.now();
  }

  private async completeMultipartUpload(
    uploadId: string,
    parts: any[],
    fileName: string
  ): Promise<any> {
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/complete-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ uploadId, parts, fileName }),
      }
    );

    return await response.json();
  }

  /**
   * Berechnet Upload-Fortschritt
   */
  private calculateProgress(task: UploadTask): UploadProgress {
    const percentage = (task.uploadedChunks / task.totalChunks) * 100;
    const bytesUploaded = task.uploadedChunks * CHUNK_SIZE;
    const totalBytes = task.file.size;
    const elapsed = Date.now() - task.startTime;
    const bytesPerMs = bytesUploaded / elapsed;
    const remainingBytes = totalBytes - bytesUploaded;
    const estimatedTimeRemaining = remainingBytes / bytesPerMs / 1000;

    return {
      uploadedChunks: task.uploadedChunks,
      totalChunks: task.totalChunks,
      percentage,
      bytesUploaded,
      totalBytes,
      estimatedTimeRemaining: Math.ceil(estimatedTimeRemaining),
    };
  }

  /**
   * Wartet auf Netzwerk-Verbindung
   */
  private async waitForNetwork(): Promise<void> {
    while (!this.isOnline) {
      await this.sleep(1000);
    }
  }

  /**
   * Setzt alle Uploads fort
   */
  private async resumeAllUploads() {
    for (const task of this.uploadQueue.values()) {
      this.processUpload(task).catch(console.error);
    }
  }

  private async saveQueue() {
    // Save to AsyncStorage
    // await AsyncStorage.setItem('upload_queue', JSON.stringify(Array.from(this.uploadQueue)));
  }

  private generateTaskId(): string {
    return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

interface UploadTask {
  id: string;
  file: File | Blob;
  fileName: string;
  totalChunks: number;
  uploadedChunks: number;
  retryCount: number;
  options: ResilientUploadOptions;
  startTime: number;
}
