/**
 * ============================================================================
 * VIDEO PRELOADER - INTELLIGENT PREFETCHING
 * ============================================================================
 * 
 * Lädt Videos im Voraus für instant playback:
 * - Metadaten (Dauer, Größe)
 * - Thumbnails (First-Frame)
 * - Erste HLS-Segmente (2-5 Sekunden)
 * - Netzwerk-adaptiv (4G vs 3G)
 * 
 * Features:
 * - Intelligent Lookahead (1-3 Videos ahead)
 * - Priority Queue
 * - Bandwidth Monitoring
 * - Cancelable Requests
 */

import { PRELOAD_CONFIG, getPreloadStrategy } from './cdn-config';

// ============================================================================
// TYPES
// ============================================================================

interface PreloadJob {
  videoId: string;
  priority: number;
  types: PreloadType[];
  status: 'pending' | 'loading' | 'completed' | 'error';
  abortController?: AbortController;
}

type PreloadType = 'metadata' | 'thumbnail' | 'firstSegment' | 'audio';

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  bitrate: number;
  format: string;
  hasAudio: boolean;
}

interface PreloadResult {
  videoId: string;
  metadata?: VideoMetadata;
  thumbnail?: string;
  firstSegment?: ArrayBuffer;
}

// ============================================================================
// VIDEO PRELOADER CLASS
// ============================================================================

export class VideoPreloader {
  private queue: Map<string, PreloadJob> = new Map();
  private cache: Map<string, PreloadResult> = new Map();
  private currentBandwidth: number = 10; // Mbps (default optimistic)
  private maxConcurrent: number = 2;
  private activeJobs: Set<string> = new Set();

  /**
   * Preload videos für schnelleren Start
   */
  async preloadVideos(
    currentIndex: number,
    videoIds: string[],
    accountId: string
  ): Promise<void> {
    const strategy = getPreloadStrategy();
    const lookahead = strategy.lookahead;

    // Bestimme welche Videos preloaded werden sollen
    const videosToPreload = videoIds.slice(
      currentIndex + 1,
      currentIndex + 1 + lookahead
    );

    console.log(`🔄 Preloading ${videosToPreload.length} videos (lookahead: ${lookahead})`);

    // Erstelle Preload-Jobs
    for (let i = 0; i < videosToPreload.length; i++) {
      const videoId = videosToPreload[i];
      const priority = lookahead - i; // Näher = höhere Priorität

      await this.addPreloadJob(videoId, priority, accountId, strategy);
    }

    // Starte Preloading
    this.processQueue();
  }

  /**
   * Fügt einen Preload-Job zur Queue hinzu
   */
  private async addPreloadJob(
    videoId: string,
    priority: number,
    accountId: string,
    strategy: ReturnType<typeof getPreloadStrategy>
  ): Promise<void> {
    // Prüfe ob bereits im Cache
    if (this.cache.has(videoId)) {
      console.log(`✅ Video ${videoId} bereits im Cache`);
      return;
    }

    // Prüfe ob bereits in Queue
    if (this.queue.has(videoId)) {
      // Update Priority falls höher
      const existingJob = this.queue.get(videoId)!;
      if (priority > existingJob.priority) {
        existingJob.priority = priority;
      }
      return;
    }

    // Bestimme was preloaded werden soll
    const types: PreloadType[] = [];
    
    if (PRELOAD_CONFIG.PRELOAD_TYPES.metadata) types.push('metadata');
    if (PRELOAD_CONFIG.PRELOAD_TYPES.thumbnail) types.push('thumbnail');
    if (strategy.firstSegment && PRELOAD_CONFIG.PRELOAD_TYPES.firstSegment) {
      types.push('firstSegment');
    }

    // Erstelle Job
    const job: PreloadJob = {
      videoId,
      priority,
      types,
      status: 'pending',
      abortController: new AbortController(),
    };

    this.queue.set(videoId, job);
  }

  /**
   * Verarbeitet die Preload-Queue
   */
  private async processQueue(): Promise<void> {
    // Sortiere Queue nach Priorität
    const sortedJobs = Array.from(this.queue.values())
      .filter(job => job.status === 'pending')
      .sort((a, b) => b.priority - a.priority);

    // Starte Jobs parallel (bis maxConcurrent)
    for (const job of sortedJobs) {
      if (this.activeJobs.size >= this.maxConcurrent) {
        break;
      }

      this.activeJobs.add(job.videoId);
      job.status = 'loading';

      // Preload asynchron
      this.executePreload(job).finally(() => {
        this.activeJobs.delete(job.videoId);
        this.processQueue(); // Nächsten Job starten
      });
    }
  }

  /**
   * Führt Preload für einen Job aus
   */
  private async executePreload(job: PreloadJob): Promise<void> {
    const accountId = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';
    const result: PreloadResult = { videoId: job.videoId };

    try {
      console.log(`🔄 Preloading video ${job.videoId} (${job.types.join(', ')})`);

      // Parallel Preloading
      const promises: Promise<void>[] = [];

      // Metadata
      if (job.types.includes('metadata')) {
        promises.push(
          this.preloadMetadata(job.videoId, accountId, job.abortController!.signal)
            .then(metadata => { result.metadata = metadata; })
        );
      }

      // Thumbnail
      if (job.types.includes('thumbnail')) {
        promises.push(
          this.preloadThumbnail(job.videoId, accountId, job.abortController!.signal)
            .then(thumbnail => { result.thumbnail = thumbnail; })
        );
      }

      // First Segment
      if (job.types.includes('firstSegment')) {
        promises.push(
          this.preloadFirstSegment(job.videoId, accountId, job.abortController!.signal)
            .then(segment => { result.firstSegment = segment; })
        );
      }

      await Promise.all(promises);

      // Speichere im Cache
      this.cache.set(job.videoId, result);
      job.status = 'completed';

      console.log(`✅ Preload completed: ${job.videoId}`);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log(`⏸️ Preload aborted: ${job.videoId}`);
      } else {
        console.error(`❌ Preload error: ${job.videoId}`, error);
        job.status = 'error';
      }
    }
  }

  /**
   * Lädt Video-Metadaten
   */
  private async preloadMetadata(
    videoId: string,
    accountId: string,
    signal: AbortSignal
  ): Promise<VideoMetadata> {
    // Hole HLS Manifest
    const manifestUrl = `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    
    const response = await fetch(manifestUrl, { signal });
    const manifestText = await response.text();

    // Parse Manifest für Metadaten
    const lines = manifestText.split('\n');
    const durationMatch = manifestText.match(/#EXT-X-TARGETDURATION:(\d+)/);
    const bandwidthMatch = manifestText.match(/BANDWIDTH=(\d+)/);

    return {
      duration: durationMatch ? parseInt(durationMatch[1]) : 0,
      width: 1920, // Default (wird später durch Video-Info ersetzt)
      height: 1080,
      bitrate: bandwidthMatch ? parseInt(bandwidthMatch[1]) / 1000 : 0,
      format: 'hls',
      hasAudio: manifestText.includes('TYPE=AUDIO'),
    };
  }

  /**
   * Lädt Thumbnail (First-Frame)
   */
  private async preloadThumbnail(
    videoId: string,
    accountId: string,
    signal: AbortSignal
  ): Promise<string> {
    const thumbnailUrl = `https://customer-${accountId}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg?time=0s&width=640`;
    
    const response = await fetch(thumbnailUrl, { signal });
    const blob = await response.blob();
    
    // Convert to Data URL für schnellen Zugriff
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Lädt erstes HLS-Segment (erste 2-5 Sekunden)
   */
  private async preloadFirstSegment(
    videoId: string,
    accountId: string,
    signal: AbortSignal
  ): Promise<ArrayBuffer> {
    // Hole HLS Manifest
    const manifestUrl = `https://customer-${accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    const manifestResponse = await fetch(manifestUrl, { signal });
    const manifestText = await manifestResponse.text();

    // Parse Manifest für erstes Segment
    const lines = manifestText.split('\n');
    let firstSegmentUrl = '';

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].endsWith('.ts') || lines[i].endsWith('.m4s')) {
        firstSegmentUrl = lines[i];
        break;
      }
    }

    if (!firstSegmentUrl) {
      throw new Error('No segment found in manifest');
    }

    // Resolve relative URL
    const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));
    const segmentUrl = firstSegmentUrl.startsWith('http') 
      ? firstSegmentUrl 
      : `${baseUrl}/${firstSegmentUrl}`;

    // Download Segment
    const segmentResponse = await fetch(segmentUrl, { signal });
    return segmentResponse.arrayBuffer();
  }

  /**
   * Holt preloaded Data aus Cache
   */
  getPreloaded(videoId: string): PreloadResult | null {
    return this.cache.get(videoId) || null;
  }

  /**
   * Bricht Preload für ein Video ab
   */
  cancelPreload(videoId: string): void {
    const job = this.queue.get(videoId);
    if (job && job.abortController) {
      job.abortController.abort();
      this.queue.delete(videoId);
      this.activeJobs.delete(videoId);
    }
  }

  /**
   * Cleared alte Cache-Einträge
   */
  clearOldCache(currentIndex: number, videoIds: string[]): void {
    const keepRange = 5; // Behalte aktuelle ± 5 Videos
    const minIndex = Math.max(0, currentIndex - keepRange);
    const maxIndex = Math.min(videoIds.length - 1, currentIndex + keepRange);

    const keepIds = new Set(videoIds.slice(minIndex, maxIndex + 1));

    // Lösche alte Cache-Einträge
    for (const videoId of this.cache.keys()) {
      if (!keepIds.has(videoId)) {
        this.cache.delete(videoId);
        console.log(`🗑️ Removed old cache: ${videoId}`);
      }
    }
  }

  /**
   * Update Bandwidth Estimate
   */
  updateBandwidth(bandwidthMbps: number): void {
    this.currentBandwidth = bandwidthMbps;
    console.log(`📊 Bandwidth updated: ${bandwidthMbps.toFixed(2)} Mbps`);
  }

  /**
   * Get Cache Stats
   */
  getCacheStats() {
    return {
      cacheSize: this.cache.size,
      queueSize: this.queue.size,
      activeJobs: this.activeJobs.size,
      bandwidth: this.currentBandwidth,
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let preloaderInstance: VideoPreloader | null = null;

export function getVideoPreloader(): VideoPreloader {
  if (!preloaderInstance) {
    preloaderInstance = new VideoPreloader();
  }
  return preloaderInstance;
}

export default VideoPreloader;
