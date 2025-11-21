/**
 * 💰 CREATOR ÖKOSYSTEM
 * ===================
 * Creator-Fonds, AI-Coach, Live-Shopping
 * Monetarisierung, Analytics, Collaboration
 */

import { supabase } from './supabase';

export interface CreatorStats {
  totalVideos: number;
  totalViews: number;
  totalLikes: number;
  totalRevenue: number;
  averageEngagement: number;
  topVideos: any[];
}

export class CreatorEcosystem {
  private static instance: CreatorEcosystem;

  public static getInstance(): CreatorEcosystem {
    if (!CreatorEcosystem.instance) {
      CreatorEcosystem.instance = new CreatorEcosystem();
    }
    return CreatorEcosystem.instance;
  }

  /**
   * 📊 GET CREATOR STATS
   */
  public async getCreatorStats(userId: string): Promise<CreatorStats> {
    const { data: videos } = await supabase
      .from('videos')
      .select('*')
      .eq('user_id', userId);

    const totalViews = videos?.reduce((sum, v) => sum + (v.view_count || 0), 0) || 0;
    const totalLikes = videos?.reduce((sum, v) => sum + (v.like_count || 0), 0) || 0;

    return {
      totalVideos: videos?.length || 0,
      totalViews,
      totalLikes,
      totalRevenue: totalViews * 0.001, // Beispiel: $0.001 pro View
      averageEngagement: totalLikes / Math.max(1, totalViews),
      topVideos: videos?.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 10) || [],
    };
  }

  /**
   * 🤖 AI COACH
   */
  public async getAICoachAdvice(userId: string): Promise<string[]> {
    const stats = await this.getCreatorStats(userId);

    const advice: string[] = [];

    if (stats.totalVideos < 10) {
      advice.push('Upload more videos to grow your audience');
    }

    if (stats.averageEngagement < 0.05) {
      advice.push('Improve engagement by adding more calls-to-action');
    }

    advice.push('Post during peak hours (6-9 PM) for better reach');

    return advice;
  }

  /**
   * 💵 CALCULATE EARNINGS
   */
  public async calculateEarnings(userId: string): Promise<number> {
    const stats = await this.getCreatorStats(userId);
    return stats.totalRevenue;
  }
}

export const creatorEcosystem = CreatorEcosystem.getInstance();
