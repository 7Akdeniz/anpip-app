/**
 * ============================================================================
 * VIDEO PERFORMANCE ANALYTICS
 * ============================================================================
 * 
 * Track & Analyze Video Performance:
 * - Start Time (Time to First Frame)
 * - Buffering Rate
 * - Quality Switches
 * - Bandwidth Estimates
 * - Error Rates
 * - Geographic Performance
 * 
 * Integriert mit:
 * - Google Analytics 4
 * - Cloudflare Analytics
 * - Custom Dashboard
 */

import { getBandwidthEstimator } from './adaptive-bitrate';

// ============================================================================
// TYPES
// ============================================================================

export interface VideoPerformanceMetrics {
  // Video Info
  videoId: string;
  sessionId: string;
  
  // Timing
  videoStartTime: number;       // ms bis erstes Frame
  totalPlayTime: number;        // Gesamte Abspielzeit
  bufferTime: number;           // Zeit in Buffering
  seekTime: number;             // Zeit für Seeks
  
  // Quality
  initialQuality: number;       // Start-Qualität (height)
  averageQuality: number;       // Durchschnittliche Qualität
  qualitySwitches: number;      // Anzahl Quality Switches
  
  // Network
  averageBandwidth: number;     // Mbps
  minBandwidth: number;
  maxBandwidth: number;
  latency: number;              // ms
  
  // Playback
  bufferingEvents: number;
  droppedFrames: number;
  playbackErrors: number;
  stallCount: number;           // Komplette Playback-Stops
  
  // Device & Location
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'tv';
  platform: 'ios' | 'android' | 'web';
  country?: string;
  city?: string;
  
  // CDN
  cdnProvider: string;
  edgeLocation?: string;
  cacheHit: boolean;
  
  // User Engagement
  watchPercentage: number;      // % des Videos gesehen
  completed: boolean;
  dropped: boolean;              // Vorzeitig abgebrochen
}

export interface PerformanceThresholds {
  videoStartTime: number;       // Max acceptable (ms)
  bufferingRate: number;        // Max acceptable (0-1)
  errorRate: number;            // Max acceptable (0-1)
  minQuality: number;           // Min quality (height)
}

// ============================================================================
// DEFAULT THRESHOLDS (World-Class Performance)
// ============================================================================

export const WORLD_CLASS_THRESHOLDS: PerformanceThresholds = {
  videoStartTime: 1000,         // < 1 second
  bufferingRate: 0.02,          // < 2% buffering
  errorRate: 0.005,             // < 0.5% errors
  minQuality: 480,              // Min 480p
};

// ============================================================================
// VIDEO PERFORMANCE TRACKER
// ============================================================================

export class VideoPerformanceTracker {
  private sessionId: string;
  private videoId: string;
  private metrics: Partial<VideoPerformanceMetrics>;
  
  // Timestamps
  private loadStartTime: number = 0;
  private playStartTime: number = 0;
  private totalBufferStart: number = 0;
  private currentBufferStart: number = 0;
  
  // Quality Tracking
  private qualityHistory: number[] = [];
  private bandwidthHistory: number[] = [];

  constructor(videoId: string, sessionId?: string) {
    this.videoId = videoId;
    this.sessionId = sessionId || this.generateSessionId();
    this.metrics = {
      videoId,
      sessionId: this.sessionId,
      bufferingEvents: 0,
      qualitySwitches: 0,
      droppedFrames: 0,
      playbackErrors: 0,
      stallCount: 0,
      bufferTime: 0,
      totalPlayTime: 0,
      seekTime: 0,
      cacheHit: false,
    };
    
    this.loadStartTime = performance.now();
  }

  /**
   * Video Start Tracking
   */
  trackVideoStart(quality: number): void {
    const startTime = performance.now() - this.loadStartTime;
    
    this.metrics.videoStartTime = startTime;
    this.metrics.initialQuality = quality;
    this.qualityHistory.push(quality);
    this.playStartTime = performance.now();
    
    console.log(`📊 Video Start: ${startTime.toFixed(0)}ms @ ${quality}p`);
    
    // Send Event
    this.sendEvent('video_start', {
      start_time_ms: startTime,
      quality: quality,
    });
  }

  /**
   * Buffering Event
   */
  trackBufferingStart(): void {
    this.currentBufferStart = performance.now();
    this.metrics.bufferingEvents = (this.metrics.bufferingEvents || 0) + 1;
    
    console.log(`⏸️ Buffering Event #${this.metrics.bufferingEvents}`);
  }

  trackBufferingEnd(): void {
    if (this.currentBufferStart > 0) {
      const bufferDuration = performance.now() - this.currentBufferStart;
      this.metrics.bufferTime = (this.metrics.bufferTime || 0) + bufferDuration;
      this.currentBufferStart = 0;
      
      console.log(`▶️ Buffering ended after ${bufferDuration.toFixed(0)}ms`);
    }
  }

  /**
   * Quality Switch
   */
  trackQualitySwitch(oldQuality: number, newQuality: number): void {
    this.qualityHistory.push(newQuality);
    this.metrics.qualitySwitches = (this.metrics.qualitySwitches || 0) + 1;
    
    console.log(`🔄 Quality Switch: ${oldQuality}p → ${newQuality}p`);
    
    this.sendEvent('quality_switch', {
      old_quality: oldQuality,
      new_quality: newQuality,
      switch_count: this.metrics.qualitySwitches,
    });
  }

  /**
   * Bandwidth Update
   */
  trackBandwidth(bandwidthMbps: number): void {
    this.bandwidthHistory.push(bandwidthMbps);
    
    // Calculate Stats
    if (this.bandwidthHistory.length > 0) {
      this.metrics.averageBandwidth = 
        this.bandwidthHistory.reduce((a, b) => a + b, 0) / this.bandwidthHistory.length;
      this.metrics.minBandwidth = Math.min(...this.bandwidthHistory);
      this.metrics.maxBandwidth = Math.max(...this.bandwidthHistory);
    }
  }

  /**
   * Playback Error
   */
  trackError(error: string): void {
    this.metrics.playbackErrors = (this.metrics.playbackErrors || 0) + 1;
    
    console.error(`❌ Playback Error #${this.metrics.playbackErrors}:`, error);
    
    this.sendEvent('playback_error', {
      error_message: error,
      error_count: this.metrics.playbackErrors,
    });
  }

  /**
   * Video Ende
   */
  trackVideoEnd(completed: boolean, watchPercentage: number): void {
    const totalTime = performance.now() - this.playStartTime;
    
    this.metrics.totalPlayTime = totalTime;
    this.metrics.completed = completed;
    this.metrics.watchPercentage = watchPercentage;
    this.metrics.dropped = !completed && watchPercentage < 0.9;
    
    // Calculate Average Quality
    if (this.qualityHistory.length > 0) {
      this.metrics.averageQuality = 
        this.qualityHistory.reduce((a, b) => a + b, 0) / this.qualityHistory.length;
    }
    
    console.log(`🏁 Video End:`, {
      completed,
      watchPercentage: `${(watchPercentage * 100).toFixed(1)}%`,
      totalTime: `${(totalTime / 1000).toFixed(1)}s`,
      avgQuality: `${this.metrics.averageQuality?.toFixed(0)}p`,
    });
    
    // Send Final Metrics
    this.sendFinalMetrics();
  }

  /**
   * Get Performance Score (0-100)
   */
  getPerformanceScore(): number {
    let score = 100;
    
    // Video Start Time (max 20 points penalty)
    if (this.metrics.videoStartTime) {
      const startPenalty = Math.min(20, (this.metrics.videoStartTime / 1000) * 10);
      score -= startPenalty;
    }
    
    // Buffering Rate (max 30 points penalty)
    if (this.metrics.totalPlayTime && this.metrics.bufferTime) {
      const bufferRate = this.metrics.bufferTime / this.metrics.totalPlayTime;
      const bufferPenalty = Math.min(30, bufferRate * 500);
      score -= bufferPenalty;
    }
    
    // Quality Switches (max 20 points penalty)
    if (this.metrics.qualitySwitches) {
      const switchPenalty = Math.min(20, this.metrics.qualitySwitches * 3);
      score -= switchPenalty;
    }
    
    // Errors (max 30 points penalty)
    if (this.metrics.playbackErrors) {
      const errorPenalty = Math.min(30, this.metrics.playbackErrors * 15);
      score -= errorPenalty;
    }
    
    return Math.max(0, Math.round(score));
  }

  /**
   * Check if Performance meets World-Class Standards
   */
  isWorldClass(): boolean {
    if (!this.metrics.videoStartTime || !this.metrics.totalPlayTime) {
      return false;
    }
    
    const bufferRate = (this.metrics.bufferTime || 0) / this.metrics.totalPlayTime;
    const errorRate = (this.metrics.playbackErrors || 0) / 100; // per 100 plays
    
    return (
      this.metrics.videoStartTime <= WORLD_CLASS_THRESHOLDS.videoStartTime &&
      bufferRate <= WORLD_CLASS_THRESHOLDS.bufferingRate &&
      errorRate <= WORLD_CLASS_THRESHOLDS.errorRate &&
      (this.metrics.averageQuality || 0) >= WORLD_CLASS_THRESHOLDS.minQuality
    );
  }

  /**
   * Get Current Metrics
   */
  getMetrics(): Partial<VideoPerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Send Event to Analytics
   */
  private sendEvent(eventName: string, params: Record<string, any>): void {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, {
        video_id: this.videoId,
        session_id: this.sessionId,
        ...params,
      });
    }
    
    // Cloudflare Analytics (würde hier implementiert werden)
    // fetch('/api/analytics/video', { ... })
  }

  /**
   * Send Final Metrics
   */
  private sendFinalMetrics(): void {
    const score = this.getPerformanceScore();
    const isWorldClass = this.isWorldClass();
    
    this.sendEvent('video_session_complete', {
      ...this.metrics,
      performance_score: score,
      world_class: isWorldClass,
    });
    
    // Log to Console
    console.log('📊 Final Video Performance:', {
      score: `${score}/100`,
      worldClass: isWorldClass ? '🏆 YES' : '❌ NO',
      metrics: this.metrics,
    });
  }

  /**
   * Generate Session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================================================
// ANALYTICS AGGREGATOR (für Dashboard)
// ============================================================================

export class VideoAnalyticsAggregator {
  private sessions: VideoPerformanceMetrics[] = [];

  addSession(metrics: VideoPerformanceMetrics): void {
    this.sessions.push(metrics);
  }

  /**
   * Get Aggregated Stats
   */
  getAggregatedStats() {
    if (this.sessions.length === 0) {
      return null;
    }

    const total = this.sessions.length;
    
    return {
      totalSessions: total,
      
      // Average Start Time
      avgStartTime: this.average(this.sessions.map(s => s.videoStartTime)),
      
      // Buffering Stats
      avgBufferingEvents: this.average(this.sessions.map(s => s.bufferingEvents)),
      bufferingRate: this.average(this.sessions.map(s => 
        s.bufferTime / s.totalPlayTime
      )),
      
      // Quality Stats
      avgQuality: this.average(this.sessions.map(s => s.averageQuality)),
      avgQualitySwitches: this.average(this.sessions.map(s => s.qualitySwitches)),
      
      // Network Stats
      avgBandwidth: this.average(this.sessions.map(s => s.averageBandwidth)),
      
      // Error Rate
      errorRate: this.sessions.filter(s => s.playbackErrors > 0).length / total,
      
      // Completion Rate
      completionRate: this.sessions.filter(s => s.completed).length / total,
      
      // World-Class Performance Rate
      worldClassRate: this.sessions.filter(s => {
        const bufferRate = s.bufferTime / s.totalPlayTime;
        return (
          s.videoStartTime <= WORLD_CLASS_THRESHOLDS.videoStartTime &&
          bufferRate <= WORLD_CLASS_THRESHOLDS.bufferingRate
        );
      }).length / total,
    };
  }

  /**
   * Get Performance by Region
   */
  getPerformanceByRegion() {
    const byRegion: Record<string, VideoPerformanceMetrics[]> = {};
    
    this.sessions.forEach(session => {
      const country = session.country || 'unknown';
      if (!byRegion[country]) {
        byRegion[country] = [];
      }
      byRegion[country].push(session);
    });
    
    return Object.entries(byRegion).map(([country, sessions]) => ({
      country,
      count: sessions.length,
      avgStartTime: this.average(sessions.map(s => s.videoStartTime)),
      avgBandwidth: this.average(sessions.map(s => s.averageBandwidth)),
    }));
  }

  private average(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b, 0) / numbers.length;
  }
}

export default VideoPerformanceTracker;
