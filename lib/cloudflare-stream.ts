/**
 * ============================================================================
 * CLOUDFLARE STREAM CLIENT
 * ============================================================================
 * 
 * Service-Layer für die Integration mit Cloudflare Stream.
 * Ermöglicht Upload, Verwaltung und Streaming von Videos bis 2 Stunden.
 * 
 * Features:
 * - Direct Upload (Client → Cloudflare, kein Proxy über unsere Server)
 * - Automatisches Transcoding in mehrere Qualitäten
 * - HLS/DASH Adaptive Streaming
 * - Globales CDN inklusive
 * 
 * Setup:
 * 1. Cloudflare Account erstellen: https://dash.cloudflare.com
 * 2. Stream aktivieren: https://dash.cloudflare.com/stream
 * 3. API Token erstellen mit "Stream: Edit" Berechtigung
 * 4. .env konfigurieren (siehe unten)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface CloudflareStreamVideo {
  uid: string;
  status: {
    state: 'pendingupload' | 'downloading' | 'queued' | 'inprogress' | 'ready' | 'error';
    pctComplete?: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  meta: {
    name?: string;
  };
  created: string;
  modified: string;
  size?: number;
  preview?: string;
  allowedOrigins?: string[];
  requireSignedURLs: boolean;
  uploaded?: string;
  uploadExpiry?: string;
  maxSizeSeconds?: number;
  maxDurationSeconds?: number;
  duration?: number;
  input?: {
    width?: number;
    height?: number;
  };
  playback?: {
    hls: string;
    dash: string;
  };
  watermark?: {
    uid: string;
  };
  nft?: {
    contract?: string;
    token?: string;
  };
  thumbnail?: string;
  thumbnailTimestampPct?: number;
}

export interface DirectUploadResponse {
  result: {
    uid: string;
    uploadURL: string;
    watermark?: {
      uid: string;
    };
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface VideoDetailsResponse {
  result: CloudflareStreamVideo;
  success: boolean;
  errors: any[];
  messages: any[];
}

export interface VideoListResponse {
  result: CloudflareStreamVideo[];
  success: boolean;
  errors: any[];
  messages: any[];
  total: string;
  range: string;
}

// ============================================================================
// CLOUDFLARE STREAM CLIENT
// ============================================================================

export class CloudflareStreamClient {
  private accountId: string;
  private apiToken: string;
  private baseUrl: string;

  constructor(accountId?: string, apiToken?: string) {
    this.accountId = accountId || process.env.CLOUDFLARE_ACCOUNT_ID || '';
    this.apiToken = apiToken || process.env.CLOUDFLARE_STREAM_API_TOKEN || '';
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;

    if (!this.accountId || !this.apiToken) {
      console.warn(
        '⚠️ CLOUDFLARE STREAM NICHT KONFIGURIERT!\n' +
        'Benötigte .env Variablen:\n' +
        'CLOUDFLARE_ACCOUNT_ID=...\n' +
        'CLOUDFLARE_STREAM_API_TOKEN=...\n\n' +
        'Setup-Anleitung: https://developers.cloudflare.com/stream'
      );
    }
  }

  /**
   * Prüft ob der Client korrekt konfiguriert ist
   */
  isConfigured(): boolean {
    return !!(this.accountId && this.apiToken);
  }

  /**
   * Erstellt eine Direct Upload URL für den Client
   * 
   * Der Client lädt dann direkt zu Cloudflare hoch (ohne unseren Server zu belasten)
   * 
   * @param maxDurationSeconds - Maximale Videolänge in Sekunden (default: 7200 = 2 Stunden)
   * @param metadata - Optionale Metadaten (Name, etc.)
   * @param requireSignedURLs - Ob signierte URLs für Playback benötigt werden (default: false)
   */
  async createDirectUpload(options?: {
    maxDurationSeconds?: number;
    metadata?: { name?: string };
    requireSignedURLs?: boolean;
    allowedOrigins?: string[];
  }): Promise<DirectUploadResponse> {
    const response = await fetch(`${this.baseUrl}/direct_upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        maxDurationSeconds: options?.maxDurationSeconds || 7200, // 2 Stunden default
        meta: options?.metadata || {},
        requireSignedURLs: options?.requireSignedURLs || false,
        allowedOrigins: options?.allowedOrigins,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Stream API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Holt Details zu einem Video
   */
  async getVideo(videoId: string): Promise<VideoDetailsResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Stream API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Löscht ein Video
   */
  async deleteVideo(videoId: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Stream API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Listet alle Videos auf
   */
  async listVideos(options?: {
    limit?: number;
    after?: string;
    before?: string;
    search?: string;
  }): Promise<VideoListResponse> {
    const params = new URLSearchParams();
    
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.after) params.append('after', options.after);
    if (options?.before) params.append('before', options.before);
    if (options?.search) params.append('search', options.search);

    const url = `${this.baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Stream API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Aktualisiert Video-Metadaten
   */
  async updateVideo(videoId: string, metadata: {
    name?: string;
    requireSignedURLs?: boolean;
    allowedOrigins?: string[];
    thumbnailTimestampPct?: number;
  }): Promise<VideoDetailsResponse> {
    const response = await fetch(`${this.baseUrl}/${videoId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        meta: metadata.name ? { name: metadata.name } : undefined,
        requireSignedURLs: metadata.requireSignedURLs,
        allowedOrigins: metadata.allowedOrigins,
        thumbnailTimestampPct: metadata.thumbnailTimestampPct,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Cloudflare Stream API Error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Generiert eine Embed-URL für ein Video
   */
  getEmbedUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/iframe`;
  }

  /**
   * Generiert eine Thumbnail-URL
   */
  getThumbnailUrl(videoId: string, options?: {
    time?: string; // z.B. "1s", "50%"
    width?: number;
    height?: number;
    fit?: 'crop' | 'clip' | 'scale';
  }): string {
    const params = new URLSearchParams();
    
    if (options?.time) params.append('time', options.time);
    if (options?.width) params.append('width', options.width.toString());
    if (options?.height) params.append('height', options.height.toString());
    if (options?.fit) params.append('fit', options.fit);

    const queryString = params.toString();
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg${queryString ? '?' + queryString : ''}`;
  }

  /**
   * Generiert HLS Playback URL
   */
  getPlaybackUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }

  /**
   * Generiert DASH Playback URL
   */
  getDashUrl(videoId: string): string {
    return `https://customer-${this.accountId}.cloudflarestream.com/${videoId}/manifest/video.mpd`;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const cloudflareStream = new CloudflareStreamClient();
