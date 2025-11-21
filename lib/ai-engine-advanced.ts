/**
 * 🤖 ADVANCED AI ENGINE 2025
 * 
 * Features:
 * - Auto-Titel, Beschreibungen, Hashtags
 * - Auto-Thumbnails (KI-generiert)
 * - Entity-SEO & NLP
 * - Video-Kapitel-Erkennung
 * - Content-Moderation
 * - Sentiment-Analyse
 * - Auto-Übersetzung (50 Sprachen)
 */

import { supabase } from './supabase';

export interface AIContentSuggestions {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  category: string;
  thumbnailTimestamp?: number; // Beste Sekunde für Thumbnail
  chapters?: VideoChapter[];
  entities?: string[]; // Erkannte Entitäten (Personen, Orte, Marken)
  sentiment?: 'positive' | 'neutral' | 'negative';
  language: string;
}

export interface VideoChapter {
  timestamp: number; // Sekunden
  title: string;
  description?: string;
  thumbnail?: string;
}

export interface TranslationResult {
  [language: string]: {
    title: string;
    description: string;
    tags: string[];
  };
}

export class AdvancedAIEngine {
  
  /**
   * 🎬 Video analysieren & Content generieren
   */
  async analyzeVideo(
    videoUrl: string,
    videoId: string,
    userLanguage: string = 'de'
  ): Promise<AIContentSuggestions> {
    
    try {
      // Edge Function aufrufen (nutzt OpenAI/Anthropic)
      const { data, error } = await supabase.functions.invoke('ai-content-generator', {
        body: {
          videoUrl,
          videoId,
          userLanguage,
          features: [
            'title',
            'description',
            'tags',
            'category',
            'thumbnail',
            'chapters',
            'entities',
            'sentiment',
          ],
        },
      });
      
      if (error) throw error;
      
      return data as AIContentSuggestions;
      
    } catch (error) {
      console.error('AI analysis failed:', error);
      
      // Fallback: Basis-Vorschläge
      return this.generateFallbackSuggestions(userLanguage);
    }
  }
  
  /**
   * 📝 JSON-LD für SEO generieren
   */
  generateJSONLD(video: any): string {
    const jsonld: any = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: video.title,
      description: video.description,
      thumbnailUrl: video.thumbnail_url,
      uploadDate: video.created_at,
      duration: `PT${video.duration}S`,
      contentUrl: video.video_url,
      embedUrl: `https://anpip.com/embed/${video.id}`,
      interactionStatistic: [
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/WatchAction',
          userInteractionCount: video.views_count,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: video.likes_count,
        },
        {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/CommentAction',
          userInteractionCount: video.comments_count,
        },
      ],
      author: {
        '@type': 'Person',
        name: video.username,
        url: `https://anpip.com/user/${video.user_id}`,
      },
      keywords: video.tags?.join(', '),
      inLanguage: video.language,
    };
    
    // Location hinzufügen
    if (video.location) {
      jsonld.contentLocation = {
        '@type': 'Place',
        name: `${video.location.city}, ${video.location.country}`,
        address: {
          '@type': 'PostalAddress',
          addressLocality: video.location.city,
          addressCountry: video.location.country,
        },
      };
    }
    
    return JSON.stringify(jsonld, null, 2);
  }
  
  /**
   * 🌍 Auto-Übersetzung (50 Sprachen)
   */
  async translateContent(
    content: {
      title: string;
      description: string;
      tags: string[];
    },
    sourceLanguage: string,
    targetLanguages: string[]
  ): Promise<TranslationResult> {
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-content', {
        body: {
          content,
          sourceLanguage,
          targetLanguages,
        },
      });
      
      if (error) throw error;
      
      return data as TranslationResult;
      
    } catch (error) {
      console.error('Translation failed:', error);
      return {};
    }
  }
  
  /**
   * 🏷️ Entity-Extraction (NLP)
   */
  async extractEntities(text: string, language: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.functions.invoke('extract-entities', {
        body: { text, language },
      });
      
      if (error) throw error;
      
      return data.entities || [];
      
    } catch (error) {
      console.error('Entity extraction failed:', error);
      return [];
    }
  }
  
  /**
   * 🛡️ Content-Moderation (KI-basiert)
   */
  async moderateContent(
    videoUrl: string,
    metadata: {
      title: string;
      description: string;
      tags: string[];
    }
  ): Promise<{
    approved: boolean;
    reason?: string;
    flags?: string[];
    confidence: number;
  }> {
    
    try {
      const { data, error } = await supabase.functions.invoke('moderate-content', {
        body: {
          videoUrl,
          metadata,
        },
      });
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('Moderation failed:', error);
      
      // Fallback: Approve (manuell überprüfen)
      return {
        approved: true,
        reason: 'Moderation service unavailable',
        confidence: 0,
      };
    }
  }
  
  /**
   * 📊 Sentiment-Analyse
   */
  async analyzeSentiment(text: string, language: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number; // -1 bis +1
    confidence: number; // 0-1
  }> {
    
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: { text, language },
      });
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      
      return {
        sentiment: 'neutral',
        score: 0,
        confidence: 0,
      };
    }
  }
  
  /**
   * 🎯 Auto-Hashtag-Generator
   */
  generateHashtags(
    title: string,
    description: string,
    category: string,
    tags: string[]
  ): string[] {
    const hashtags = new Set<string>();
    
    // Category
    hashtags.add(`#${category.replace(/\s+/g, '')}`);
    
    // Tags
    tags.forEach(tag => {
      hashtags.add(`#${tag.replace(/\s+/g, '')}`);
    });
    
    // Wichtige Wörter aus Titel
    const titleWords = title.split(' ').filter(w => w.length > 4);
    titleWords.slice(0, 3).forEach(word => {
      hashtags.add(`#${word.replace(/[^a-zA-Z0-9]/g, '')}`);
    });
    
    // Trending Hashtags (könnte von DB kommen)
    hashtags.add('#Anpip');
    hashtags.add('#ForYou');
    
    return Array.from(hashtags).slice(0, 15); // Max 15 Hashtags
  }
  
  /**
   * 🎨 Beste Thumbnail-Sekunde finden
   */
  async findBestThumbnailMoment(videoUrl: string, duration: number): Promise<number> {
    try {
      const { data, error } = await supabase.functions.invoke('find-thumbnail-moment', {
        body: { videoUrl, duration },
      });
      
      if (error) throw error;
      
      return data.timestamp || Math.floor(duration * 0.3); // Fallback: 30%
      
    } catch (error) {
      console.error('Thumbnail detection failed:', error);
      
      // Fallback: 30% der Video-Länge
      return Math.floor(duration * 0.3);
    }
  }
  
  /**
   * 📖 Video-Kapitel automatisch erkennen
   */
  async detectChapters(videoUrl: string, duration: number): Promise<VideoChapter[]> {
    try {
      const { data, error } = await supabase.functions.invoke('detect-chapters', {
        body: { videoUrl, duration },
      });
      
      if (error) throw error;
      
      return data.chapters || [];
      
    } catch (error) {
      console.error('Chapter detection failed:', error);
      return [];
    }
  }
  
  /**
   * 🔤 Video-Transkription (Speech-to-Text)
   */
  async transcribeVideo(videoUrl: string, language: string): Promise<{
    text: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  }> {
    
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-video', {
        body: { videoUrl, language },
      });
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('Transcription failed:', error);
      
      return {
        text: '',
        segments: [],
      };
    }
  }
  
  /**
   * 🎯 Engagement-Score berechnen
   */
  calculateEngagementScore(video: {
    views_count: number;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    watch_time_avg: number; // %
  }): number {
    
    // Likes-Rate
    const likeRate = video.views_count > 0 
      ? (video.likes_count / video.views_count) * 100 
      : 0;
    
    // Comment-Rate
    const commentRate = video.views_count > 0 
      ? (video.comments_count / video.views_count) * 100 
      : 0;
    
    // Share-Rate
    const shareRate = video.views_count > 0 
      ? (video.shares_count / video.views_count) * 100 
      : 0;
    
    // Gewichteter Score
    const score = 
      (likeRate * 0.3) +
      (commentRate * 0.2) +
      (shareRate * 0.15) +
      (video.watch_time_avg * 0.35);
    
    return Math.min(100, Math.max(0, score));
  }
  
  /**
   * 🔄 Fallback-Vorschläge
   */
  private generateFallbackSuggestions(language: string): AIContentSuggestions {
    return {
      title: 'Neues Video',
      description: 'Beschreibe dein Video...',
      tags: ['video', 'anpip'],
      hashtags: ['#Anpip', '#Video', '#ForYou'],
      category: 'general',
      sentiment: 'neutral',
      language,
    };
  }
}

export const aiEngine = new AdvancedAIEngine();
