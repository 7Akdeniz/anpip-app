/**
 * 📍 REAL-TIME REGION TREND ENGINE
 * ================================
 * Hyper-lokale Trends auf Stadt/Viertel-Ebene
 * Local Event Detection, Geo-Creator-Rankings
 */

import { supabase } from './supabase';

export interface RegionTrend {
  region: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  topVideos: string[];
  topHashtags: string[];
  topCreators: string[];
  trendScore: number;
  growthRate: number;
}

export class RegionTrendEngine {
  private static instance: RegionTrendEngine;

  public static getInstance(): RegionTrendEngine {
    if (!RegionTrendEngine.instance) {
      RegionTrendEngine.instance = new RegionTrendEngine();
    }
    return RegionTrendEngine.instance;
  }

  /**
   * 📍 GET CITY TRENDS
   */
  public async getCityTrends(city: string, limit: number = 20): Promise<RegionTrend[]> {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('city', city)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(limit);

    return this.analyzeTrends(data || []);
  }

  /**
   * 🗺️ GET NEARBY TRENDS
   */
  public async getNearbyTrends(lat: number, lng: number, radiusKm: number = 10): Promise<RegionTrend[]> {
    // TODO: Geo-spatial query
    return [];
  }

  private analyzeTrends(videos: any[]): RegionTrend[] {
    const trends: RegionTrend[] = [];
    
    // Group by region
    const regions = new Map<string, any[]>();
    
    for (const video of videos) {
      const key = `${video.city}_${video.country}`;
      if (!regions.has(key)) regions.set(key, []);
      regions.get(key)!.push(video);
    }

    // Analyze each region
    for (const [key, regionVideos] of regions.entries()) {
      trends.push({
        region: key,
        city: regionVideos[0].city,
        country: regionVideos[0].country,
        lat: regionVideos[0].latitude,
        lng: regionVideos[0].longitude,
        topVideos: regionVideos.slice(0, 10).map((v: any) => v.id),
        topHashtags: this.extractTopHashtags(regionVideos),
        topCreators: this.extractTopCreators(regionVideos),
        trendScore: this.calculateTrendScore(regionVideos),
        growthRate: 100,
      });
    }

    return trends.sort((a, b) => b.trendScore - a.trendScore);
  }

  private extractTopHashtags(videos: any[]): string[] {
    const tags = videos.flatMap(v => v.tags || []);
    const counts = new Map<string, number>();
    
    tags.forEach(tag => counts.set(tag, (counts.get(tag) || 0) + 1));
    
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private extractTopCreators(videos: any[]): string[] {
    const creators = new Map<string, number>();
    
    videos.forEach(v => {
      const count = creators.get(v.user_id) || 0;
      creators.set(v.user_id, count + v.view_count || 0);
    });
    
    return Array.from(creators.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
  }

  private calculateTrendScore(videos: any[]): number {
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    return Math.min(100, Math.log10(totalViews + 1) * 10);
  }
}

export const regionTrends = RegionTrendEngine.getInstance();
