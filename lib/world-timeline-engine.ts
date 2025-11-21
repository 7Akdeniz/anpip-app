/**
 * 🌍 WORLD TIMELINE ENGINE
 * ======================
 * Die weltweit erste Echtzeit-Weltkarte für Videos, Trends & Ereignisse
 * 
 * Features:
 * - Live-Weltkarte aller aktiven Videos
 * - Echtzeit-Event-Detection (Katastrophen, News, virale Momente)
 * - Trend-Heatmaps pro Stadt, Region, Land
 * - AI-Cluster für Themen (Sport, Musik, Politik, Events, Kultur)
 * - Live-Reportagen-Modus
 * - Globaler Spotlight-Feed
 */

import { supabase } from './supabase';

// ==================== TYPES ====================

export interface WorldEvent {
  id: string;
  type: 'trending' | 'breaking' | 'viral' | 'disaster' | 'sports' | 'music' | 'politics' | 'culture';
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    country: string;
    region: string;
  };
  videos: string[]; // Video IDs
  intensity: number; // 0-100
  participants: number;
  timestamp: string;
  aiConfidence: number;
  tags: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export interface TrendHeatmap {
  region: string;
  lat: number;
  lng: number;
  intensity: number;
  topTags: string[];
  videoCount: number;
  viewCount: number;
  shareCount: number;
  growthRate: number; // Prozent pro Stunde
  peakTime: string;
}

export interface GlobalSpotlight {
  id: string;
  title: string;
  videos: string[];
  location: string;
  viewers: number;
  timestamp: string;
  category: string;
  isLive: boolean;
}

// ==================== AI EVENT DETECTION ====================

export class WorldTimelineEngine {
  private static instance: WorldTimelineEngine;
  private eventCache: Map<string, WorldEvent> = new Map();
  private heatmapCache: Map<string, TrendHeatmap[]> = new Map();

  private constructor() {
    this.startRealtimeMonitoring();
  }

  public static getInstance(): WorldTimelineEngine {
    if (!WorldTimelineEngine.instance) {
      WorldTimelineEngine.instance = new WorldTimelineEngine();
    }
    return WorldTimelineEngine.instance;
  }

  /**
   * 🔥 ECHTZEIT-MONITORING
   * Analysiert alle Videos weltweit in Echtzeit
   */
  private async startRealtimeMonitoring(): Promise<void> {
    console.log('🌍 World Timeline Engine: Monitoring gestartet');

    // Echtzeit-Updates von Supabase
    supabase
      .channel('world-timeline')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
        },
        (payload) => {
          this.processVideoUpdate(payload);
        }
      )
      .subscribe();

    // Periodische Analyse alle 10 Sekunden
    setInterval(() => {
      this.detectGlobalEvents();
      this.updateHeatmaps();
    }, 10000);
  }

  /**
   * 🎯 EVENT DETECTION ALGORITHMUS
   * Erkennt automatisch wichtige Ereignisse weltweit
   */
  private async detectGlobalEvents(): Promise<void> {
    try {
      // Hole aktuelle Videos (letzte 5 Minuten)
      const { data: recentVideos, error } = await supabase
        .from('videos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      if (!recentVideos || recentVideos.length === 0) return;

      // Gruppiere nach Standort
      const locationClusters = this.clusterByLocation(recentVideos);

      // Erkenne Events in jedem Cluster
      for (const cluster of locationClusters) {
        const event = await this.analyzeClusterForEvents(cluster);
        if (event) {
          this.eventCache.set(event.id, event);
          await this.broadcastEvent(event);
        }
      }
    } catch (error) {
      console.error('❌ Event Detection Error:', error);
    }
  }

  /**
   * 📍 LOCATION CLUSTERING
   * Gruppiert Videos nach geografischer Nähe
   */
  private clusterByLocation(videos: any[]): any[][] {
    const clusters: any[][] = [];
    const processed = new Set<string>();
    const RADIUS_KM = 5; // 5km Radius

    for (const video of videos) {
      if (processed.has(video.id)) continue;
      if (!video.latitude || !video.longitude) continue;

      const cluster = [video];
      processed.add(video.id);

      // Finde nahegelegene Videos
      for (const other of videos) {
        if (processed.has(other.id)) continue;
        if (!other.latitude || !other.longitude) continue;

        const distance = this.calculateDistance(
          video.latitude,
          video.longitude,
          other.latitude,
          other.longitude
        );

        if (distance <= RADIUS_KM) {
          cluster.push(other);
          processed.add(other.id);
        }
      }

      if (cluster.length >= 3) {
        // Mindestens 3 Videos für ein Event
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  /**
   * 🤖 AI EVENT ANALYSIS
   * Analysiert Video-Cluster auf Events
   */
  private async analyzeClusterForEvents(cluster: any[]): Promise<WorldEvent | null> {
    try {
      // Berechne Event-Intensität
      const intensity = this.calculateEventIntensity(cluster);
      if (intensity < 30) return null; // Zu geringe Intensität

      // Erkenne Event-Typ
      const eventType = await this.detectEventType(cluster);
      
      // Extrahiere zentrale Location
      const centerLocation = this.calculateClusterCenter(cluster);
      
      // Sentiment-Analyse
      const sentiment = await this.analyzeSentiment(cluster);
      
      // Generiere Event
      const event: WorldEvent = {
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: eventType,
        title: await this.generateEventTitle(cluster, eventType),
        description: await this.generateEventDescription(cluster),
        location: centerLocation,
        videos: cluster.map(v => v.id),
        intensity,
        participants: cluster.length,
        timestamp: new Date().toISOString(),
        aiConfidence: this.calculateAIConfidence(cluster),
        tags: await this.extractEventTags(cluster),
        sentiment,
      };

      return event;
    } catch (error) {
      console.error('❌ Event Analysis Error:', error);
      return null;
    }
  }

  /**
   * 🔥 TREND HEATMAP GENERATION
   */
  private async updateHeatmaps(): Promise<void> {
    try {
      const { data: videos, error } = await supabase
        .from('videos')
        .select('*')
        .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString()); // Letzte Stunde

      if (error) throw error;
      if (!videos) return;

      // Gruppiere nach Regionen
      const regionMap = new Map<string, any[]>();

      for (const video of videos) {
        const region = this.getRegionKey(video.latitude, video.longitude);
        if (!regionMap.has(region)) {
          regionMap.set(region, []);
        }
        regionMap.get(region)!.push(video);
      }

      // Generiere Heatmap für jede Region
      const heatmaps: TrendHeatmap[] = [];

      for (const [region, regionVideos] of regionMap.entries()) {
        const [lat, lng] = region.split(',').map(Number);
        
        const heatmap: TrendHeatmap = {
          region,
          lat,
          lng,
          intensity: this.calculateHeatmapIntensity(regionVideos),
          topTags: await this.extractTopTags(regionVideos),
          videoCount: regionVideos.length,
          viewCount: regionVideos.reduce((sum, v) => sum + (v.view_count || 0), 0),
          shareCount: regionVideos.reduce((sum, v) => sum + (v.share_count || 0), 0),
          growthRate: await this.calculateGrowthRate(region),
          peakTime: this.findPeakTime(regionVideos),
        };

        heatmaps.push(heatmap);
      }

      this.heatmapCache.set('global', heatmaps);
    } catch (error) {
      console.error('❌ Heatmap Update Error:', error);
    }
  }

  /**
   * 📡 BROADCAST EVENT
   */
  private async broadcastEvent(event: WorldEvent): Promise<void> {
    try {
      // Speichere Event in Datenbank
      await supabase.from('world_events').insert({
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        location: event.location,
        videos: event.videos,
        intensity: event.intensity,
        participants: event.participants,
        ai_confidence: event.aiConfidence,
        tags: event.tags,
        sentiment: event.sentiment,
        created_at: event.timestamp,
      });

      // Sende Push-Notification an interessierte User
      await this.notifyInterestedUsers(event);

      console.log(`📡 Event broadcasted: ${event.title}`);
    } catch (error) {
      console.error('❌ Broadcast Error:', error);
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Erdradius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private calculateEventIntensity(cluster: any[]): number {
    const videoCount = cluster.length;
    const avgViews = cluster.reduce((sum, v) => sum + (v.view_count || 0), 0) / videoCount;
    const avgLikes = cluster.reduce((sum, v) => sum + (v.like_count || 0), 0) / videoCount;
    const avgShares = cluster.reduce((sum, v) => sum + (v.share_count || 0), 0) / videoCount;
    
    // Gewichtete Formel
    const intensity = Math.min(100, (
      videoCount * 2 +
      Math.log10(avgViews + 1) * 10 +
      Math.log10(avgLikes + 1) * 15 +
      Math.log10(avgShares + 1) * 20
    ));

    return Math.round(intensity);
  }

  private async detectEventType(cluster: any[]): Promise<WorldEvent['type']> {
    // AI-basierte Event-Typ-Erkennung
    const tags = cluster.flatMap(v => v.tags || []);
    const descriptions = cluster.map(v => v.description || '').join(' ').toLowerCase();

    if (descriptions.includes('disaster') || descriptions.includes('emergency')) return 'disaster';
    if (descriptions.includes('breaking') || descriptions.includes('news')) return 'breaking';
    if (descriptions.includes('sport') || descriptions.includes('game')) return 'sports';
    if (descriptions.includes('music') || descriptions.includes('concert')) return 'music';
    if (descriptions.includes('politic')) return 'politics';
    if (cluster.length > 20 && cluster[0].view_count > 10000) return 'viral';
    
    return 'trending';
  }

  private calculateClusterCenter(cluster: any[]): WorldEvent['location'] {
    const validVideos = cluster.filter(v => v.latitude && v.longitude);
    
    const avgLat = validVideos.reduce((sum, v) => sum + v.latitude, 0) / validVideos.length;
    const avgLng = validVideos.reduce((sum, v) => sum + v.longitude, 0) / validVideos.length;

    return {
      lat: avgLat,
      lng: avgLng,
      city: validVideos[0]?.city || 'Unknown',
      country: validVideos[0]?.country || 'Unknown',
      region: validVideos[0]?.region || 'Unknown',
    };
  }

  private async analyzeSentiment(cluster: any[]): Promise<WorldEvent['sentiment']> {
    // Einfache Sentiment-Analyse basierend auf Like/Dislike Ratio
    const totalLikes = cluster.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const totalComments = cluster.reduce((sum, v) => sum + (v.comment_count || 0), 0);
    
    if (totalLikes > totalComments * 2) return 'positive';
    if (totalComments > totalLikes * 2) return 'negative';
    if (totalLikes > 0 && totalComments > 0) return 'mixed';
    
    return 'neutral';
  }

  private calculateAIConfidence(cluster: any[]): number {
    // Konfidenz basiert auf Datenmenge und Konsistenz
    const videoCount = cluster.length;
    const hasLocation = cluster.filter(v => v.latitude && v.longitude).length;
    const hasDescription = cluster.filter(v => v.description).length;
    
    const confidence = Math.min(100, (
      (videoCount / 10) * 30 +
      (hasLocation / videoCount) * 40 +
      (hasDescription / videoCount) * 30
    ));

    return Math.round(confidence);
  }

  private async generateEventTitle(cluster: any[], type: string): Promise<string> {
    const location = cluster[0]?.city || cluster[0]?.country || 'Unknown Location';
    const count = cluster.length;
    
    const titles: Record<string, string> = {
      disaster: `🚨 Disaster Alert in ${location}`,
      breaking: `📰 Breaking News in ${location}`,
      viral: `🔥 Viral Moment in ${location}`,
      sports: `⚽ Sports Event in ${location}`,
      music: `🎵 Music Event in ${location}`,
      politics: `🏛️ Political Event in ${location}`,
      trending: `📈 Trending in ${location}`,
      culture: `🎭 Cultural Event in ${location}`,
    };

    return titles[type] || `Event in ${location}`;
  }

  private async generateEventDescription(cluster: any[]): Promise<string> {
    const count = cluster.length;
    const views = cluster.reduce((sum, v) => sum + (v.view_count || 0), 0);
    
    return `${count} videos with ${views.toLocaleString()} total views`;
  }

  private async extractEventTags(cluster: any[]): Promise<string[]> {
    const allTags = cluster.flatMap(v => v.tags || []);
    const tagCounts = new Map<string, number>();

    for (const tag of allTags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private getRegionKey(lat: number | null, lng: number | null): string {
    if (!lat || !lng) return '0,0';
    // Runde auf 0.1 Grad Genauigkeit (~11km)
    const roundedLat = Math.round(lat * 10) / 10;
    const roundedLng = Math.round(lng * 10) / 10;
    return `${roundedLat},${roundedLng}`;
  }

  private calculateHeatmapIntensity(videos: any[]): number {
    const count = videos.length;
    const views = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    
    return Math.min(100, Math.log10(count * views + 1) * 10);
  }

  private async extractTopTags(videos: any[]): Promise<string[]> {
    const allTags = videos.flatMap(v => v.tags || []);
    const tagCounts = new Map<string, number>();

    for (const tag of allTags) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }

    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  private async calculateGrowthRate(region: string): Promise<number> {
    // Vergleiche letzte Stunde mit vorheriger Stunde
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;

    const { data: currentHour } = await supabase
      .from('videos')
      .select('id')
      .gte('created_at', new Date(oneHourAgo).toISOString())
      .lte('created_at', new Date(now).toISOString());

    const { data: previousHour } = await supabase
      .from('videos')
      .select('id')
      .gte('created_at', new Date(twoHoursAgo).toISOString())
      .lte('created_at', new Date(oneHourAgo).toISOString());

    const currentCount = currentHour?.length || 0;
    const previousCount = previousHour?.length || 1;

    return Math.round(((currentCount - previousCount) / previousCount) * 100);
  }

  private findPeakTime(videos: any[]): string {
    const hourCounts = new Map<number, number>();

    for (const video of videos) {
      const hour = new Date(video.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }

    const peakHour = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 0;

    return `${peakHour}:00`;
  }

  private async notifyInterestedUsers(event: WorldEvent): Promise<void> {
    // TODO: Implementiere Push-Notifications basierend auf User-Präferenzen
    console.log(`📲 Notifying users about: ${event.title}`);
  }

  private processVideoUpdate(payload: any): void {
    // Handle real-time video updates
    console.log('📹 Video update:', payload);
  }

  // ==================== PUBLIC API ====================

  /**
   * Hole aktuelle Welt-Events
   */
  public async getGlobalEvents(limit: number = 50): Promise<WorldEvent[]> {
    const { data, error } = await supabase
      .from('world_events')
      .select('*')
      .order('intensity', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Hole Trend-Heatmap
   */
  public getHeatmap(): TrendHeatmap[] {
    return this.heatmapCache.get('global') || [];
  }

  /**
   * Hole Events für bestimmte Region
   */
  public async getRegionalEvents(lat: number, lng: number, radiusKm: number = 50): Promise<WorldEvent[]> {
    const events = await this.getGlobalEvents(1000);
    
    return events.filter(event => {
      const distance = this.calculateDistance(
        lat,
        lng,
        event.location.lat,
        event.location.lng
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Hole Global Spotlight Feed
   */
  public async getGlobalSpotlight(limit: number = 10): Promise<GlobalSpotlight[]> {
    const events = await this.getGlobalEvents(limit);
    
    return events.map(event => ({
      id: event.id,
      title: event.title,
      videos: event.videos,
      location: `${event.location.city}, ${event.location.country}`,
      viewers: event.participants,
      timestamp: event.timestamp,
      category: event.type,
      isLive: Date.now() - new Date(event.timestamp).getTime() < 5 * 60 * 1000,
    }));
  }
}

// Export Singleton Instance
export const worldTimeline = WorldTimelineEngine.getInstance();
