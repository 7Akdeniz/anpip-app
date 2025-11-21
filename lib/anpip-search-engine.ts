/**
 * 🔍 ANPIP SEARCH ENGINE
 * =====================
 * Google-Level Suche in Videos
 * Multimodale AI: Text, Sprache, Objekte, Szenen, Emotionen
 * Visual Search, Semantic Search, Advanced Filters
 */

import { supabase } from './supabase';

export interface SearchQuery {
  text?: string;
  visualQuery?: string; // "rotes Auto", "Hund", "Sonnenuntergang"
  filters?: {
    location?: { lat: number; lng: number; radius: number };
    duration?: { min: number; max: number };
    category?: string[];
    language?: string[];
    emotion?: string[];
    uploadedAfter?: string;
    uploadedBefore?: string;
  };
  sort?: 'relevance' | 'views' | 'recent' | 'trending';
}

export interface SearchResult {
  videoId: string;
  relevanceScore: number;
  matchedFeatures: string[];
  timestamp?: number; // Bei Szenen-Match
  thumbnailUrl: string;
  title: string;
  metadata: any;
}

export class AnpipSearchEngine {
  private static instance: AnpipSearchEngine;

  public static getInstance(): AnpipSearchEngine {
    if (!AnpipSearchEngine.instance) {
      AnpipSearchEngine.instance = new AnpipSearchEngine();
    }
    return AnpipSearchEngine.instance;
  }

  /**
   * 🔍 MULTIMODAL SEARCH
   */
  public async search(query: SearchQuery, limit: number = 50): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    // Text Search (Titel, Beschreibung, Transkript)
    if (query.text) {
      const textResults = await this.textSearch(query.text, query.filters);
      results.push(...textResults);
    }

    // Visual Search (Objekte, Szenen)
    if (query.visualQuery) {
      const visualResults = await this.visualSearch(query.visualQuery, query.filters);
      results.push(...visualResults);
    }

    // Combine & deduplicate
    const combined = this.deduplicateResults(results);

    // Apply filters
    const filtered = this.applyFilters(combined, query.filters);

    // Sort
    const sorted = this.sortResults(filtered, query.sort || 'relevance');

    return sorted.slice(0, limit);
  }

  /**
   * 📝 TEXT SEARCH
   */
  private async textSearch(text: string, filters?: any): Promise<SearchResult[]> {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .textSearch('fts', text)
      .limit(100);

    return (data || []).map(v => ({
      videoId: v.id,
      relevanceScore: this.calculateTextRelevance(v, text),
      matchedFeatures: ['title', 'description'],
      thumbnailUrl: v.thumbnail_url,
      title: v.title,
      metadata: v,
    }));
  }

  /**
   * 🖼️ VISUAL SEARCH
   */
  private async visualSearch(visualQuery: string, filters?: any): Promise<SearchResult[]> {
    // TODO: Integration mit Vision AI (Google Vision, OpenAI CLIP, etc.)
    const { data } = await supabase
      .from('video_objects')
      .select('*')
      .textSearch('objects', visualQuery)
      .limit(100);

    return (data || []).map((v: any) => ({
      videoId: v.video_id,
      relevanceScore: 90,
      matchedFeatures: ['visual'],
      timestamp: v.timestamp,
      thumbnailUrl: v.thumbnail_url,
      title: v.title,
      metadata: v,
    }));
  }

  private calculateTextRelevance(video: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (video.title?.toLowerCase().includes(lowerQuery)) score += 50;
    if (video.description?.toLowerCase().includes(lowerQuery)) score += 30;
    if (video.tags?.some((t: string) => t.toLowerCase().includes(lowerQuery))) score += 20;

    return Math.min(100, score);
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.videoId)) return false;
      seen.add(r.videoId);
      return true;
    });
  }

  private applyFilters(results: SearchResult[], filters?: any): SearchResult[] {
    if (!filters) return results;

    return results.filter(r => {
      if (filters.duration) {
        const duration = r.metadata.duration || 0;
        if (duration < filters.duration.min || duration > filters.duration.max) return false;
      }

      if (filters.category && !filters.category.includes(r.metadata.category)) return false;

      return true;
    });
  }

  private sortResults(results: SearchResult[], sort: string): SearchResult[] {
    const sorted = [...results];

    switch (sort) {
      case 'relevance':
        sorted.sort((a, b) => b.relevanceScore - a.relevanceScore);
        break;
      case 'views':
        sorted.sort((a, b) => (b.metadata.view_count || 0) - (a.metadata.view_count || 0));
        break;
      case 'recent':
        sorted.sort((a, b) => new Date(b.metadata.created_at).getTime() - new Date(a.metadata.created_at).getTime());
        break;
    }

    return sorted;
  }
}

export const anpipSearch = AnpipSearchEngine.getInstance();
