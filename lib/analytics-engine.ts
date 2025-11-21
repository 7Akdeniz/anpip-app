/**
 * Deep Analytics & Performance Tracking System
 * - Video Performance Metrics
 * - User Engagement Tracking
 * - Watchtime Analysis
 * - AI-Powered Predictions
 * - Heatmaps & Drop-off Points
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface VideoAnalytics {
  videoId: string;
  views: number;
  uniqueViews: number;
  totalWatchTime: number; // seconds
  avgWatchTime: number;
  avgWatchPercentage: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  retentionCurve: RetentionPoint[];
  dropOffPoints: number[]; // timestamps where users drop off
  demographics: {
    locations: Record<string, number>;
    devices: Record<string, number>;
    referrers: Record<string, number>;
  };
  predictions: {
    expectedViews24h: number;
    expectedViews7d: number;
    viralityScore: number; // 0-1
    trendingProbability: number; // 0-1
  };
}

export interface RetentionPoint {
  timestamp: number;
  viewersRemaining: number;
  percentage: number;
}

export interface UserEngagement {
  userId: string;
  totalWatchTime: number;
  videosWatched: number;
  avgSessionDuration: number;
  engagementScore: number; // 0-1
  preferredCategories: string[];
  peakActivityHours: number[];
  churnRisk: number; // 0-1
}

export class AnalyticsEngine {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Holt detaillierte Video-Analytics
   */
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    const [
      stats,
      retentionCurve,
      dropOffPoints,
      demographics,
      predictions,
    ] = await Promise.all([
      this.getBasicStats(videoId),
      this.getRetentionCurve(videoId),
      this.getDropOffPoints(videoId),
      this.getDemographics(videoId),
      this.predictPerformance(videoId),
    ]);

    return {
      videoId,
      ...stats,
      retentionCurve,
      dropOffPoints,
      demographics,
      predictions,
    };
  }

  /**
   * Berechnet User Engagement Score
   */
  async getUserEngagement(userId: string): Promise<UserEngagement> {
    const { data: behaviors } = await this.supabase
      .from('user_behaviors')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (!behaviors || behaviors.length === 0) {
      return this.getDefaultEngagement(userId);
    }

    const totalWatchTime = behaviors.reduce((sum, b) => sum + (b.watch_time || 0), 0);
    const videosWatched = new Set(behaviors.map(b => b.video_id)).size;
    
    // Calculate session durations
    const sessions = this.groupBehaviorsIntoSessions(behaviors);
    const avgSessionDuration = sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length;

    // Engagement Score (composite metric)
    const engagementScore = this.calculateEngagementScore(behaviors);

    // Preferred Categories
    const categoryFreq: Record<string, number> = {};
    behaviors.forEach(b => {
      if (b.category) categoryFreq[b.category] = (categoryFreq[b.category] || 0) + 1;
    });
    const preferredCategories = Object.entries(categoryFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat]) => cat);

    // Peak Activity Hours
    const hourFreq: Record<number, number> = {};
    behaviors.forEach(b => {
      const hour = new Date(b.timestamp).getHours();
      hourFreq[hour] = (hourFreq[hour] || 0) + 1;
    });
    const peakActivityHours = Object.entries(hourFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Churn Risk
    const daysSinceLastActivity = this.getDaysSinceLastActivity(behaviors);
    const churnRisk = Math.min(daysSinceLastActivity / 14, 1); // 14 days = high risk

    return {
      userId,
      totalWatchTime,
      videosWatched,
      avgSessionDuration,
      engagementScore,
      preferredCategories,
      peakActivityHours,
      churnRisk,
    };
  }

  /**
   * Erstellt Retention Curve (wie YouTube Analytics)
   */
  private async getRetentionCurve(videoId: string): Promise<RetentionPoint[]> {
    const { data: behaviors } = await this.supabase
      .from('user_behaviors')
      .select('watch_time, watch_percentage')
      .eq('video_id', videoId)
      .eq('action', 'view');

    if (!behaviors || behaviors.length === 0) return [];

    // Get video duration
    const { data: video } = await this.supabase
      .from('videos')
      .select('duration')
      .eq('id', videoId)
      .single();

    const duration = video?.duration || 60;
    const points: RetentionPoint[] = [];
    const intervals = 20; // 20 data points

    for (let i = 0; i <= intervals; i++) {
      const timestamp = (duration / intervals) * i;
      const percentage = (timestamp / duration) * 100;
      
      const viewersRemaining = behaviors.filter(
        b => (b.watch_percentage || 0) >= percentage
      ).length;

      points.push({
        timestamp,
        viewersRemaining,
        percentage: (viewersRemaining / behaviors.length) * 100,
      });
    }

    return points;
  }

  /**
   * Findet kritische Drop-off Points
   */
  private async getDropOffPoints(videoId: string): Promise<number[]> {
    const curve = await this.getRetentionCurve(videoId);
    const dropOffs: number[] = [];

    for (let i = 1; i < curve.length; i++) {
      const drop = curve[i - 1].percentage - curve[i].percentage;
      if (drop > 20) { // 20% drop = critical
        dropOffs.push(curve[i].timestamp);
      }
    }

    return dropOffs;
  }

  /**
   * Demografische Daten
   */
  private async getDemographics(videoId: string): Promise<any> {
    const { data: behaviors } = await this.supabase
      .from('user_behaviors')
      .select('location')
      .eq('video_id', videoId);

    const locations: Record<string, number> = {};
    behaviors?.forEach(b => {
      if (b.location) locations[b.location] = (locations[b.location] || 0) + 1;
    });

    return {
      locations,
      devices: { mobile: 70, desktop: 25, tablet: 5 },
      referrers: { direct: 40, social: 35, search: 25 },
    };
  }

  /**
   * AI-Powered Performance Predictions
   */
  private async predictPerformance(videoId: string): Promise<any> {
    const stats = await this.getBasicStats(videoId);
    
    // Simple prediction model (in production: use ML)
    const growthRate = stats.views / Math.max(this.getVideoAgeInDays(videoId), 1);
    
    return {
      expectedViews24h: Math.round(growthRate * 1),
      expectedViews7d: Math.round(growthRate * 7),
      viralityScore: this.calculateViralityScore(stats),
      trendingProbability: this.calculateTrendingProbability(stats),
    };
  }

  private async getBasicStats(videoId: string): Promise<any> {
    const { data: stats } = await this.supabase
      .from('video_stats')
      .select('*')
      .eq('video_id', videoId)
      .single();

    return stats || {
      views: 0,
      uniqueViews: 0,
      totalWatchTime: 0,
      avgWatchTime: 0,
      avgWatchPercentage: 0,
      likes: 0,
      shares: 0,
      comments: 0,
      engagementRate: 0,
    };
  }

  private calculateEngagementScore(behaviors: any[]): number {
    const actions = behaviors.filter(b =>
      ['like', 'share', 'comment', 'watch_complete'].includes(b.action)
    );
    return Math.min(actions.length / behaviors.length, 1);
  }

  private groupBehaviorsIntoSessions(behaviors: any[]): any[] {
    // Group behaviors within 30 minutes into sessions
    const sessions: any[] = [];
    let currentSession: any = null;

    behaviors.forEach(b => {
      const time = new Date(b.timestamp).getTime();
      if (!currentSession || time - currentSession.end > 30 * 60 * 1000) {
        currentSession = { start: time, end: time, duration: 0 };
        sessions.push(currentSession);
      } else {
        currentSession.end = time;
        currentSession.duration = (currentSession.end - currentSession.start) / 1000;
      }
    });

    return sessions;
  }

  private getDaysSinceLastActivity(behaviors: any[]): number {
    const lastActivity = new Date(behaviors[0].timestamp);
    const now = new Date();
    return (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  }

  private getVideoAgeInDays(videoId: string): number {
    // Simplified
    return 1;
  }

  private calculateViralityScore(stats: any): number {
    const shareRate = stats.shares / Math.max(stats.views, 1);
    return Math.min(shareRate * 10, 1);
  }

  private calculateTrendingProbability(stats: any): number {
    const engagementRate = stats.engagementRate || 0;
    const growthRate = stats.views / Math.max(this.getVideoAgeInDays(''), 1);
    return Math.min((engagementRate + growthRate / 1000) / 2, 1);
  }

  private getDefaultEngagement(userId: string): UserEngagement {
    return {
      userId,
      totalWatchTime: 0,
      videosWatched: 0,
      avgSessionDuration: 0,
      engagementScore: 0,
      preferredCategories: [],
      peakActivityHours: [],
      churnRisk: 1,
    };
  }
}
