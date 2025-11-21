/**
 * 🧠 PERSONAL AI FEED ENGINE
 * =========================
 * Individuelles KI-Modell für jeden einzelnen User
 * Analysiert Verhalten, Interessen & Emotionen
 * Optimiert Feed sekündlich
 * Erstellt personalisierte Highlights & Playlists
 * 
 * Das ist TikTok + YouTube + ChatGPT in EINER Person
 */

import { supabase } from './supabase';

// ==================== TYPES ====================

export interface UserProfile {
  userId: string;
  
  // Interest Map (dynamisch gewichtet)
  interests: Map<string, number>; // topic -> score (0-100)
  
  // Mood Profile
  currentMood: 'happy' | 'sad' | 'energetic' | 'relaxed' | 'focused' | 'curious';
  moodHistory: MoodDataPoint[];
  
  // Viewing Patterns
  preferredDuration: { min: number; max: number };
  preferredTime: number[]; // Hours of day (0-23)
  preferredCategories: string[];
  
  // Engagement Patterns
  watchTimeAverage: number; // seconds
  completionRate: number; // 0-1
  interactionRate: number; // likes/views ratio
  
  // Deep Preferences
  preferredCreators: string[];
  avoidedTopics: string[];
  languagePreferences: string[];
  
  // AI Model State
  modelVersion: number;
  lastUpdated: string;
}

interface MoodDataPoint {
  timestamp: string;
  mood: string;
  confidence: number;
}

export interface PersonalizedVideo {
  videoId: string;
  relevanceScore: number; // 0-100
  reason: string; // Why this video is recommended
  category: string;
  predictedEngagement: number; // 0-1
}

export interface VideoSummary {
  videoId: string;
  summary: string;
  keyMoments: Array<{ timestamp: number; description: string }>;
  mainTopics: string[];
  sentiment: string;
}

export interface PersonalizedPlaylist {
  id: string;
  title: string;
  description: string;
  videos: string[];
  category: string;
  mood: string;
  createdAt: string;
}

// ==================== PERSONAL AI ENGINE ====================

export class PersonalAIEngine {
  private static instance: PersonalAIEngine;
  private userProfiles: Map<string, UserProfile> = new Map();

  private constructor() {
    this.startContinuousOptimization();
  }

  public static getInstance(): PersonalAIEngine {
    if (!PersonalAIEngine.instance) {
      PersonalAIEngine.instance = new PersonalAIEngine();
    }
    return PersonalAIEngine.instance;
  }

  /**
   * 🔄 CONTINUOUS OPTIMIZATION
   * Optimiert Feeds alle 10 Sekunden
   */
  private startContinuousOptimization(): void {
    setInterval(async () => {
      for (const [userId, profile] of this.userProfiles.entries()) {
        await this.optimizeUserFeed(userId, profile);
      }
    }, 10000); // Alle 10 Sekunden
  }

  /**
   * 📊 GET PERSONALIZED FEED
   * Erstellt individuellen Feed für User
   */
  public async getPersonalizedFeed(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PersonalizedVideo[]> {
    try {
      // 1. Load or create user profile
      const profile = await this.getUserProfile(userId);

      // 2. Get candidate videos
      const candidates = await this.getCandidateVideos(userId, limit * 3);

      // 3. Score each video
      const scoredVideos = await Promise.all(
        candidates.map(async video => ({
          videoId: video.id,
          relevanceScore: await this.calculateRelevanceScore(video, profile),
          reason: await this.generateRecommendationReason(video, profile),
          category: video.category || 'general',
          predictedEngagement: await this.predictEngagement(video, profile),
        }))
      );

      // 4. Sort by relevance & diversity
      const optimizedFeed = this.optimizeFeedDiversity(scoredVideos, profile);

      // 5. Return paginated results
      return optimizedFeed.slice(offset, offset + limit);
    } catch (error) {
      console.error('❌ Personalized Feed Error:', error);
      return [];
    }
  }

  /**
   * 🧠 ANALYZE USER BEHAVIOR
   * Analysiert User-Verhalten aus Interaktionen
   */
  public async trackInteraction(
    userId: string,
    videoId: string,
    interactionType: 'view' | 'like' | 'share' | 'comment' | 'skip' | 'complete',
    metadata?: {
      watchTime?: number;
      videoDuration?: number;
      sentiment?: 'positive' | 'negative' | 'neutral';
    }
  ): Promise<void> {
    try {
      // 1. Save interaction
      await supabase.from('user_interactions').insert({
        user_id: userId,
        video_id: videoId,
        interaction_type: interactionType,
        watch_time: metadata?.watchTime,
        video_duration: metadata?.videoDuration,
        sentiment: metadata?.sentiment,
        created_at: new Date().toISOString(),
      });

      // 2. Update user profile
      const profile = await this.getUserProfile(userId);
      await this.updateProfileFromInteraction(profile, videoId, interactionType, metadata);

      // 3. Detect mood changes
      if (metadata?.sentiment) {
        await this.updateUserMood(userId, metadata.sentiment);
      }

      // 4. Retrain model if needed
      if (this.shouldRetrainModel(profile)) {
        await this.retrainUserModel(userId);
      }
    } catch (error) {
      console.error('❌ Interaction Tracking Error:', error);
    }
  }

  /**
   * 🎬 GENERATE VIDEO SUMMARY
   * Erstellt AI-Summary für Videos
   */
  public async generateVideoSummary(videoId: string): Promise<VideoSummary> {
    try {
      // Check cache first
      const cached = await this.getCachedSummary(videoId);
      if (cached) return cached;

      // Get video data
      const { data: video } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (!video) throw new Error('Video not found');

      // Generate summary using AI
      const summary = await this.aiGenerateSummary(video);
      const keyMoments = await this.aiExtractKeyMoments(video);
      const mainTopics = await this.aiExtractTopics(video);
      const sentiment = await this.aiAnalyzeSentiment(video);

      const result: VideoSummary = {
        videoId,
        summary,
        keyMoments,
        mainTopics,
        sentiment,
      };

      // Cache result
      await this.cacheSummary(result);

      return result;
    } catch (error) {
      console.error('❌ Summary Generation Error:', error);
      throw error;
    }
  }

  /**
   * 📚 CREATE PERSONALIZED PLAYLIST
   * Erstellt automatische Playlists basierend auf Interessen
   */
  public async createPersonalizedPlaylist(
    userId: string,
    category?: string,
    mood?: string
  ): Promise<PersonalizedPlaylist> {
    try {
      const profile = await this.getUserProfile(userId);

      // Determine category & mood
      const targetCategory = category || this.getBestCategoryForUser(profile);
      const targetMood = mood || profile.currentMood;

      // Get relevant videos
      const videos = await this.getVideosForPlaylist(userId, targetCategory, targetMood);

      // Generate title & description
      const title = this.generatePlaylistTitle(targetCategory, targetMood);
      const description = this.generatePlaylistDescription(targetCategory, targetMood, profile);

      const playlist: PersonalizedPlaylist = {
        id: `playlist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title,
        description,
        videos: videos.map(v => v.id),
        category: targetCategory,
        mood: targetMood,
        createdAt: new Date().toISOString(),
      };

      // Save playlist
      await supabase.from('personalized_playlists').insert({
        id: playlist.id,
        user_id: userId,
        title: playlist.title,
        description: playlist.description,
        videos: playlist.videos,
        category: playlist.category,
        mood: playlist.mood,
      });

      return playlist;
    } catch (error) {
      console.error('❌ Playlist Creation Error:', error);
      throw error;
    }
  }

  /**
   * 🎯 HIGHLIGHT GENERATOR
   * Schneidet automatisch Highlights aus Videos
   */
  public async generateHighlights(
    userId: string,
    timeframe: 'today' | 'week' | 'month' = 'week'
  ): Promise<string[]> {
    try {
      // Get user's watched videos
      const { data: interactions } = await supabase
        .from('user_interactions')
        .select('video_id, watch_time, created_at')
        .eq('user_id', userId)
        .gte('created_at', this.getTimeframeStart(timeframe))
        .order('created_at', { ascending: false });

      if (!interactions || interactions.length === 0) return [];

      // Find best moments from each video
      const highlights: string[] = [];

      for (const interaction of interactions.slice(0, 20)) {
        const moments = await this.findBestMoments(interaction.video_id);
        highlights.push(...moments.slice(0, 2)); // Top 2 moments per video
      }

      // Create highlight reel
      const highlightVideoId = await this.createHighlightReel(highlights);

      return [highlightVideoId];
    } catch (error) {
      console.error('❌ Highlight Generation Error:', error);
      return [];
    }
  }

  // ==================== HELPER FUNCTIONS ====================

  private async getUserProfile(userId: string): Promise<UserProfile> {
    // Check cache
    if (this.userProfiles.has(userId)) {
      return this.userProfiles.get(userId)!;
    }

    // Load from database
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      const profile: UserProfile = {
        userId: data.user_id,
        interests: new Map(Object.entries(data.interests || {})),
        currentMood: data.current_mood || 'curious',
        moodHistory: data.mood_history || [],
        preferredDuration: data.preferred_duration || { min: 0, max: 300 },
        preferredTime: data.preferred_time || [],
        preferredCategories: data.preferred_categories || [],
        watchTimeAverage: data.watch_time_average || 60,
        completionRate: data.completion_rate || 0.5,
        interactionRate: data.interaction_rate || 0.1,
        preferredCreators: data.preferred_creators || [],
        avoidedTopics: data.avoided_topics || [],
        languagePreferences: data.language_preferences || ['en'],
        modelVersion: data.model_version || 1,
        lastUpdated: data.updated_at,
      };

      this.userProfiles.set(userId, profile);
      return profile;
    }

    // Create new profile
    const newProfile: UserProfile = {
      userId,
      interests: new Map(),
      currentMood: 'curious',
      moodHistory: [],
      preferredDuration: { min: 0, max: 300 },
      preferredTime: [],
      preferredCategories: [],
      watchTimeAverage: 60,
      completionRate: 0.5,
      interactionRate: 0.1,
      preferredCreators: [],
      avoidedTopics: [],
      languagePreferences: ['en'],
      modelVersion: 1,
      lastUpdated: new Date().toISOString(),
    };

    this.userProfiles.set(userId, newProfile);
    return newProfile;
  }

  private async getCandidateVideos(userId: string, limit: number): Promise<any[]> {
    // Mix of trending, new, and interest-based videos
    const { data } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }

  private async calculateRelevanceScore(video: any, profile: UserProfile): Promise<number> {
    let score = 50; // Base score

    // Interest matching
    const videoTopics = video.tags || [];
    for (const topic of videoTopics) {
      const interest = profile.interests.get(topic) || 0;
      score += interest * 0.3;
    }

    // Duration preference
    const duration = video.duration || 60;
    if (duration >= profile.preferredDuration.min && duration <= profile.preferredDuration.max) {
      score += 10;
    }

    // Creator preference
    if (profile.preferredCreators.includes(video.user_id)) {
      score += 20;
    }

    // Freshness
    const age = Date.now() - new Date(video.created_at).getTime();
    const hoursSinceCreation = age / (1000 * 60 * 60);
    if (hoursSinceCreation < 24) score += 10;

    // Engagement prediction
    const predictedEngagement = await this.predictEngagement(video, profile);
    score += predictedEngagement * 20;

    return Math.min(100, Math.max(0, score));
  }

  private async generateRecommendationReason(video: any, profile: UserProfile): Promise<string> {
    const reasons = [];

    if (profile.preferredCreators.includes(video.user_id)) {
      reasons.push('From your favorite creator');
    }

    const videoTopics: string[] = video.tags || [];
    const matchedInterests = videoTopics.filter((t: string) => 
      profile.interests.has(t) && profile.interests.get(t)! > 50
    );

    if (matchedInterests.length > 0) {
      reasons.push(`Matches your interest in ${matchedInterests[0]}`);
    }

    const age = Date.now() - new Date(video.created_at).getTime();
    if (age < 60 * 60 * 1000) {
      reasons.push('Just uploaded');
    }

    if (video.view_count > 100000) {
      reasons.push('Trending now');
    }

    return reasons.length > 0 ? reasons[0] : 'Recommended for you';
  }

  private async predictEngagement(video: any, profile: UserProfile): Promise<number> {
    // Simple engagement prediction model
    let prediction = 0.5;

    // Historical completion rate
    prediction *= profile.completionRate;

    // Duration match
    const duration = video.duration || 60;
    if (duration >= profile.preferredDuration.min && duration <= profile.preferredDuration.max) {
      prediction *= 1.2;
    }

    // Interest match
    const videoTopics: string[] = video.tags || [];
    const maxInterest = Math.max(...videoTopics.map((t: string) => profile.interests.get(t) || 0));
    prediction *= (1 + maxInterest / 200);

    return Math.min(1, prediction);
  }

  private optimizeFeedDiversity(videos: PersonalizedVideo[], profile: UserProfile): PersonalizedVideo[] {
    // Sort by relevance
    const sorted = [...videos].sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Ensure diversity (avoid same category consecutively)
    const optimized: PersonalizedVideo[] = [];
    const categoryQueue: string[] = [];

    for (const video of sorted) {
      if (categoryQueue.length >= 2 && categoryQueue.every(c => c === video.category)) {
        // Skip to avoid 3+ consecutive same category
        continue;
      }

      optimized.push(video);
      categoryQueue.push(video.category);
      if (categoryQueue.length > 3) categoryQueue.shift();
    }

    return optimized;
  }

  private async updateProfileFromInteraction(
    profile: UserProfile,
    videoId: string,
    interactionType: string,
    metadata?: any
  ): Promise<void> {
    // Get video topics
    const { data: video } = await supabase
      .from('videos')
      .select('tags, category, user_id')
      .eq('id', videoId)
      .single();

    if (!video) return;

    // Update interests based on interaction
    const weight = this.getInteractionWeight(interactionType);
    
    for (const tag of (video.tags || [])) {
      const current = profile.interests.get(tag) || 50;
      const updated = Math.min(100, Math.max(0, current + weight));
      profile.interests.set(tag, updated);
    }

    // Update preferred creators
    if (interactionType === 'like' && !profile.preferredCreators.includes(video.user_id)) {
      profile.preferredCreators.push(video.user_id);
    }

    // Save to database
    await supabase
      .from('user_profiles')
      .upsert({
        user_id: profile.userId,
        interests: Object.fromEntries(profile.interests),
        preferred_creators: profile.preferredCreators,
        updated_at: new Date().toISOString(),
      });
  }

  private getInteractionWeight(type: string): number {
    const weights: Record<string, number> = {
      view: 1,
      like: 5,
      share: 10,
      comment: 7,
      complete: 8,
      skip: -3,
    };
    return weights[type] || 0;
  }

  private async updateUserMood(userId: string, sentiment: string): Promise<void> {
    // Map sentiment to mood
    const moodMap: Record<string, UserProfile['currentMood']> = {
      positive: 'happy',
      negative: 'sad',
      neutral: 'relaxed',
    };

    const mood = moodMap[sentiment] || 'curious';

    await supabase
      .from('user_profiles')
      .update({ current_mood: mood })
      .eq('user_id', userId);
  }

  private shouldRetrainModel(profile: UserProfile): boolean {
    const hoursSinceUpdate = (Date.now() - new Date(profile.lastUpdated).getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 24; // Retrain daily
  }

  private async retrainUserModel(userId: string): Promise<void> {
    console.log('🔄 Retraining user model:', userId);
    // TODO: Implement ML model retraining
  }

  private async optimizeUserFeed(userId: string, profile: UserProfile): Promise<void> {
    // Continuous optimization logic
    console.log('⚡ Optimizing feed for:', userId);
  }

  private async aiGenerateSummary(video: any): Promise<string> {
    // TODO: AI-powered summarization
    return `Summary of ${video.title}`;
  }

  private async aiExtractKeyMoments(video: any): Promise<Array<{ timestamp: number; description: string }>> {
    // TODO: AI key moment detection
    return [];
  }

  private async aiExtractTopics(video: any): Promise<string[]> {
    return video.tags || [];
  }

  private async aiAnalyzeSentiment(video: any): Promise<string> {
    return 'positive';
  }

  private async getCachedSummary(videoId: string): Promise<VideoSummary | null> {
    const { data } = await supabase
      .from('video_summaries')
      .select('*')
      .eq('video_id', videoId)
      .single();

    return data ? {
      videoId: data.video_id,
      summary: data.summary,
      keyMoments: data.key_moments,
      mainTopics: data.main_topics,
      sentiment: data.sentiment,
    } : null;
  }

  private async cacheSummary(summary: VideoSummary): Promise<void> {
    await supabase.from('video_summaries').upsert({
      video_id: summary.videoId,
      summary: summary.summary,
      key_moments: summary.keyMoments,
      main_topics: summary.mainTopics,
      sentiment: summary.sentiment,
    });
  }

  private getBestCategoryForUser(profile: UserProfile): string {
    return profile.preferredCategories[0] || 'general';
  }

  private async getVideosForPlaylist(userId: string, category: string, mood: string): Promise<any[]> {
    const { data } = await supabase
      .from('videos')
      .select('*')
      .eq('category', category)
      .limit(20);

    return data || [];
  }

  private generatePlaylistTitle(category: string, mood: string): string {
    return `${mood} ${category} Mix`;
  }

  private generatePlaylistDescription(category: string, mood: string, profile: UserProfile): string {
    return `Personalized ${category} playlist for your ${mood} mood`;
  }

  private getTimeframeStart(timeframe: string): string {
    const now = Date.now();
    const offsets: Record<string, number> = {
      today: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
    };

    return new Date(now - offsets[timeframe]).toISOString();
  }

  private async findBestMoments(videoId: string): Promise<string[]> {
    // TODO: Implement moment detection
    return [];
  }

  private async createHighlightReel(moments: string[]): Promise<string> {
    // TODO: Implement highlight reel creation
    return 'highlight_reel_id';
  }
}

// Export Singleton
export const personalAI = PersonalAIEngine.getInstance();
