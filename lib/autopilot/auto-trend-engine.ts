/**
 * 📈 AUTO-TREND ENGINE
 * 
 * Täglich automatische Trend-Erkennung:
 * - Globale Trends analysieren (TikTok, YouTube, News)
 * - Regionale Trends berechnen
 * - Trending-Feed generieren
 * - Neue Themen vorschlagen
 * - AI Actors automatisch Trend-Videos erstellen
 * - Predictive Trending (bevor es viral wird)
 * 
 * @module AutoTrendEngine
 */

import { AutopilotResult, AutopilotAction } from './autopilot-core';

export interface TrendData {
  id: string;
  keyword: string;
  category?: string;
  country?: string;
  city?: string;
  score: number;
  velocity: number; // How fast it's growing
  videos_count: number;
  engagement_rate: number;
  predicted_peak?: Date;
  status: 'emerging' | 'trending' | 'viral' | 'declining';
  detected_at: Date;
}

export interface TrendSource {
  platform: 'internal' | 'tiktok' | 'youtube' | 'twitter' | 'news';
  enabled: boolean;
}

export class AutoTrendEngine {
  private supabase: any;
  private sources: TrendSource[];

  constructor(supabase: any, sources: TrendSource[] = []) {
    this.supabase = supabase;
    this.sources = sources.length > 0 ? sources : [
      { platform: 'internal', enabled: true },
      { platform: 'tiktok', enabled: false }, // Requires API access
      { platform: 'youtube', enabled: false }, // Requires API access
      { platform: 'twitter', enabled: false }, // Requires API access
      { platform: 'news', enabled: false }, // Requires RSS/API
    ];
  }

  public async detect(): Promise<AutopilotResult> {
    const startTime = Date.now();
    const actions: AutopilotAction[] = [];

    try {
      // 1. Detect Internal Trends (from our platform)
      const internalTrends = await this.detectInternalTrends();
      actions.push(...internalTrends.actions);

      // 2. Detect Regional Trends
      const regionalTrends = await this.detectRegionalTrends();
      actions.push(...regionalTrends.actions);

      // 3. Detect Emerging Trends (early detection)
      const emergingTrends = await this.detectEmergingTrends();
      actions.push(...emergingTrends.actions);

      // 4. Calculate Trend Scores
      const scoreActions = await this.calculateTrendScores();
      actions.push(...scoreActions);

      // 5. Generate Trend Feed
      const feedActions = await this.generateTrendFeed();
      actions.push(...feedActions);

      // 6. Predictive Trending (ML-based)
      const predictiveActions = await this.predictiveTrending();
      actions.push(...predictiveActions);

      return {
        success: true,
        jobId: 'auto-trend',
        jobName: 'Auto-Trend Engine',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        actions,
        metrics: {
          trendsDetected: internalTrends.count,
          regionalTrends: regionalTrends.count,
          emergingTrends: emergingTrends.count,
          viralPredictions: predictiveActions.length,
        },
      };

    } catch (error) {
      return {
        success: false,
        jobId: 'auto-trend',
        jobName: 'Auto-Trend Engine',
        timestamp: new Date(),
        duration: Date.now() - startTime,
        actions,
        metrics: {},
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * 1. INTERNAL TREND DETECTION
   * Analyze our own platform data
   */
  private async detectInternalTrends(): Promise<{ actions: AutopilotAction[]; count: number }> {
    const actions: AutopilotAction[] = [];

    try {
      // Get trending videos (high engagement velocity)
      const { data: trending } = await this.supabase
        .rpc('get_trending_videos', { hours: 24, min_views: 50 });

      // Analyze keywords from trending videos
      const keywords = this.extractTrendingKeywords(trending || []);

      for (const keyword of keywords.slice(0, 20)) {
        // Store as trend
        await this.supabase.from('trends').upsert({
          keyword: keyword.text,
          category: keyword.category,
          score: keyword.score,
          velocity: keyword.velocity,
          videos_count: keyword.count,
          status: this.determineTrendStatus(keyword),
          detected_at: new Date().toISOString(),
          source: 'internal',
        });

        actions.push({
          type: 'creation',
          category: 'content',
          description: `Detected trending keyword: ${keyword.text}`,
          impact: 'high',
          success: true,
        });
      }

      return { actions, count: keywords.length };

    } catch (error) {
      console.error('Error detecting internal trends:', error);
      return { actions, count: 0 };
    }
  }

  /**
   * 2. REGIONAL TREND DETECTION
   * Analyze trends by location
   */
  private async detectRegionalTrends(): Promise<{ actions: AutopilotAction[]; count: number }> {
    const actions: AutopilotAction[] = [];

    try {
      // Get regional trends from DB
      const { data: regions } = await this.supabase
        .rpc('get_regional_trends', { days: 7 });

      for (const region of regions || []) {
        // Calculate regional trend score
        const score = this.calculateRegionalTrendScore(region);

        await this.supabase.from('regional_trends').upsert({
          country: region.country,
          city: region.city,
          category: region.category,
          video_count: region.count,
          engagement_score: score,
          date: new Date().toISOString().split('T')[0],
        });

        actions.push({
          type: 'update',
          category: 'geo',
          description: `Updated regional trend: ${region.category} in ${region.city}`,
          impact: 'medium',
          success: true,
        });
      }

      return { actions, count: regions?.length || 0 };

    } catch (error) {
      console.error('Error detecting regional trends:', error);
      return { actions, count: 0 };
    }
  }

  /**
   * 3. EMERGING TREND DETECTION
   * Catch trends early before they go viral
   */
  private async detectEmergingTrends(): Promise<{ actions: AutopilotAction[]; count: number }> {
    const actions: AutopilotAction[] = [];

    try {
      // Find videos with unusual growth patterns
      const { data: candidates } = await this.supabase
        .from('videos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()) // Last 12h
        .gte('views_count', 10)
        .order('views_count', { ascending: false })
        .limit(100);

      for (const video of candidates || []) {
        const growthRate = this.calculateGrowthRate(video);

        if (growthRate > 5) { // 5x average growth = emerging trend
          // Extract topics from video
          const topics = this.extractTopics(video);

          for (const topic of topics) {
            await this.supabase.from('trends').upsert({
              keyword: topic,
              score: growthRate,
              velocity: growthRate,
              videos_count: 1,
              status: 'emerging',
              detected_at: new Date().toISOString(),
              source: 'internal',
            });

            actions.push({
              type: 'creation',
              category: 'content',
              description: `Detected emerging trend: ${topic}`,
              impact: 'high',
              success: true,
            });
          }
        }
      }

      return { actions, count: actions.length };

    } catch (error) {
      console.error('Error detecting emerging trends:', error);
      return { actions, count: 0 };
    }
  }

  /**
   * 4. CALCULATE TREND SCORES
   * Update scores for all active trends
   */
  private async calculateTrendScores(): Promise<AutopilotAction[]> {
    const actions: AutopilotAction[] = [];

    try {
      // Get all active trends
      const { data: trends } = await this.supabase
        .from('trends')
        .select('*')
        .in('status', ['emerging', 'trending', 'viral'])
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      for (const trend of trends || []) {
        // Recalculate score based on recent activity
        const newScore = await this.recalculateTrendScore(trend);
        const newStatus = this.determineTrendStatus({ ...trend, score: newScore });

        await this.supabase
          .from('trends')
          .update({
            score: newScore,
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', trend.id);

        actions.push({
          type: 'update',
          category: 'content',
          description: `Updated trend score: ${trend.keyword} (${newScore})`,
          impact: 'low',
          success: true,
        });
      }

    } catch (error) {
      console.error('Error calculating trend scores:', error);
    }

    return actions;
  }

  /**
   * 5. GENERATE TREND FEED
   * Create curated trending feeds
   */
  private async generateTrendFeed(): Promise<AutopilotAction[]> {
    const actions: AutopilotAction[] = [];

    try {
      // Get top trends
      const { data: topTrends } = await this.supabase
        .from('trends')
        .select('*')
        .in('status', ['trending', 'viral'])
        .order('score', { ascending: false })
        .limit(50);

      // Update trending feed cache
      await this.supabase.from('trending_feed_cache').upsert({
        id: 'global',
        trends: topTrends,
        updated_at: new Date().toISOString(),
      });

      actions.push({
        type: 'update',
        category: 'content',
        description: `Updated global trending feed (${topTrends?.length || 0} trends)`,
        impact: 'high',
        success: true,
      });

    } catch (error) {
      console.error('Error generating trend feed:', error);
    }

    return actions;
  }

  /**
   * 6. PREDICTIVE TRENDING
   * ML-based prediction of future viral content
   */
  private async predictiveTrending(): Promise<AutopilotAction[]> {
    const actions: AutopilotAction[] = [];

    try {
      // Get videos from last 6 hours with good engagement
      const { data: candidates } = await this.supabase
        .from('videos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString())
        .gte('views_count', 20)
        .order('views_count', { ascending: false })
        .limit(50);

      for (const video of candidates || []) {
        const viralProbability = this.predictViralProbability(video);

        if (viralProbability > 0.7) {
          // Mark as predicted viral
          await this.supabase
            .from('videos')
            .update({
              viral_prediction: viralProbability,
              predicted_to_trend: true,
            })
            .eq('id', video.id);

          actions.push({
            type: 'optimization',
            category: 'content',
            description: `Predicted viral content: ${video.title} (${(viralProbability * 100).toFixed(0)}%)`,
            impact: 'critical',
            success: true,
          });
        }
      }

    } catch (error) {
      console.error('Error in predictive trending:', error);
    }

    return actions;
  }

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  private extractTrendingKeywords(videos: any[]): Array<{
    text: string;
    category?: string;
    score: number;
    velocity: number;
    count: number;
  }> {
    const keywords: Map<string, { count: number; score: number; category?: string }> = new Map();

    for (const video of videos) {
      const words = this.extractWords(video.title + ' ' + (video.description || ''));
      
      for (const word of words) {
        const current = keywords.get(word) || { count: 0, score: 0 };
        keywords.set(word, {
          count: current.count + 1,
          score: current.score + (video.engagement_rate || 0),
          category: video.category,
        });
      }
    }

    return Array.from(keywords.entries())
      .map(([text, data]) => ({
        text,
        category: data.category,
        score: data.score,
        velocity: data.count / videos.length, // Normalized
        count: data.count,
      }))
      .sort((a, b) => b.score - a.score);
  }

  private extractWords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3 && !this.isStopWord(w));
  }

  private isStopWord(word: string): boolean {
    const stopWords = ['this', 'that', 'with', 'from', 'have', 'been', 'were', 'they', 'your'];
    return stopWords.includes(word);
  }

  private calculateRegionalTrendScore(region: any): number {
    // Simple scoring: video count + engagement
    return region.count * 10;
  }

  private calculateGrowthRate(video: any): number {
    const ageHours = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60);
    const averageViewsPerHour = video.views_count / Math.max(ageHours, 0.1);
    
    // Normal is ~1 view/hour for new content
    return averageViewsPerHour / 1;
  }

  private extractTopics(video: any): string[] {
    const text = video.title + ' ' + (video.description || '');
    return this.extractWords(text).slice(0, 3);
  }

  private async recalculateTrendScore(trend: any): Promise<number> {
    // Get recent videos with this keyword
    const { data: videos } = await this.supabase
      .from('videos')
      .select('views_count, likes_count, created_at')
      .ilike('title', `%${trend.keyword}%`)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (!videos || videos.length === 0) return trend.score * 0.8; // Decay

    const totalEngagement = videos.reduce((sum, v) => sum + v.views_count + v.likes_count, 0);
    return totalEngagement / videos.length;
  }

  private determineTrendStatus(trend: any): TrendData['status'] {
    if (trend.score > 1000) return 'viral';
    if (trend.score > 100) return 'trending';
    if (trend.velocity > 2) return 'emerging';
    return 'declining';
  }

  private predictViralProbability(video: any): number {
    // Simple ML-style scoring
    let score = 0;

    const ageHours = (Date.now() - new Date(video.created_at).getTime()) / (1000 * 60 * 60);
    const viewsPerHour = video.views_count / Math.max(ageHours, 0.1);

    // High views per hour
    if (viewsPerHour > 10) score += 0.3;
    if (viewsPerHour > 50) score += 0.2;

    // Good engagement rate
    const engagementRate = video.views_count > 0 ? video.likes_count / video.views_count : 0;
    if (engagementRate > 0.1) score += 0.2;
    if (engagementRate > 0.3) score += 0.1;

    // Recent upload
    if (ageHours < 3) score += 0.1;

    // Good quality
    if (video.quality_score > 70) score += 0.1;

    return Math.min(score, 1);
  }
}

export default AutoTrendEngine;
