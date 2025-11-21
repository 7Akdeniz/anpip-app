# 🧠 PERSONAL AI FEED - Individuelle KI für jeden Nutzer

## 🎯 Vision

**Jeder Nutzer bekommt seine eigene persönliche KI.**

Die Personal AI:
- Lernt deine Interessen und Vorlieben
- Erstellt personalisierte Playlists
- Kuratiert perfekt zugeschnittene Inhalte
- Erstellt Zusammenfassungen & Highlights
- Schlägt die besten Videos vor
- Lernt jeden Tag besser

**= TikTok + ChatGPT + YouTube in einem Feed**

---

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       PERSONAL AI FEED SYSTEM                           │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    USER PROFILING LAYER                          │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Behavioral Tracking                              │ │  │
│  │  │                                                            │ │  │
│  │  │  Trackt:                                                   │ │  │
│  │  │  • Welche Videos angeschaut (und wie lange)               │ │  │
│  │  │  • Likes, Shares, Comments                                 │ │  │
│  │  │  • Übersprungene Videos (warum?)                          │ │  │
│  │  │  • Tageszeit der Nutzung                                  │ │  │
│  │  │  • Suchverläufe                                           │ │  │
│  │  │  • Kategorien-Präferenzen                                 │ │  │
│  │  │  • Creator-Follower-Beziehungen                           │ │  │
│  │  │  • Geo-Präferenzen                                        │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Interest Graph Builder                           │ │  │
│  │  │                                                            │ │  │
│  │  │  Erstellt:                                                 │ │  │
│  │  │  • Interessens-Vektoren (Embeddings)                      │ │  │
│  │  │  • Themen-Cluster                                         │ │  │
│  │  │  • Sentiment-Profil                                       │ │  │
│  │  │  • Zeitliche Präferenzen                                  │ │  │
│  │  │  • Mood-basierte Vorlieben                                │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    AI MEMORY LAYER                               │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Vector Database (Pinecone)                       │ │  │
│  │  │                                                            │ │  │
│  │  │  Speichert:                                                │ │  │
│  │  │  • User Interest Embeddings                                │ │  │
│  │  │  • Video Content Embeddings                                │ │  │
│  │  │  • Interaction History Embeddings                          │ │  │
│  │  │                                                            │ │  │
│  │  │  Features:                                                 │ │  │
│  │  │  ✓ Semantic Search                                        │ │  │
│  │  │  ✓ Similarity Matching                                     │ │  │
│  │  │  ✓ Real-time Updates                                      │ │  │
│  │  │  ✓ Multi-dimensional Filtering                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Long-term Memory Store                           │ │  │
│  │  │                                                            │ │  │
│  │  │  PostgreSQL Tables:                                        │ │  │
│  │  │  • user_interactions (raw events)                         │ │  │
│  │  │  • user_preferences (aggregiert)                          │ │  │
│  │  │  • watch_history (vollständig)                            │ │  │
│  │  │  • interest_evolution (zeitlich)                          │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                 RECOMMENDATION ENGINE                            │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Multi-Algorithm Hybrid System                    │ │  │
│  │  │                                                            │ │  │
│  │  │  Algorithmen (parallel):                                   │ │  │
│  │  │                                                            │ │  │
│  │  │  1️⃣ Collaborative Filtering (40%)                         │ │  │
│  │  │     → "User wie du mochten auch..."                       │ │  │
│  │  │                                                            │ │  │
│  │  │  2️⃣ Content-Based Filtering (30%)                         │ │  │
│  │  │     → AI-Analyse der Video-Inhalte                        │ │  │
│  │  │                                                            │ │  │
│  │  │  3️⃣ Deep Learning Model (20%)                             │ │  │
│  │  │     → Neural Network für Patterns                         │ │  │
│  │  │                                                            │ │  │
│  │  │  4️⃣ Trending Boost (10%)                                  │ │  │
│  │  │     → Virale Videos & Events                              │ │  │
│  │  │                                                            │ │  │
│  │  │  Re-Ranking:                                               │ │  │
│  │  │  • Freshness (neuere bevorzugt)                           │ │  │
│  │  │  • Diversity (nicht zu repetitiv)                         │ │  │
│  │  │  • Creator-Variety (verschiedene Creator)                 │ │  │
│  │  │  • Length-Mix (kurz & lang)                               │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                  AI ASSISTANT LAYER                              │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Personalized AI Chat                             │ │  │
│  │  │                                                            │ │  │
│  │  │  User fragt:                                               │ │  │
│  │  │  "Zeig mir Kochvideos"                                    │ │  │
│  │  │  "Was ist heute in meiner Stadt los?"                     │ │  │
│  │  │  "Fasse die News-Videos zusammen"                         │ │  │
│  │  │                                                            │ │  │
│  │  │  AI antwortet mit:                                         │ │  │
│  │  │  • Personalisierte Video-Liste                            │ │  │
│  │  │  • Zusammenfassungen                                       │ │  │
│  │  │  • Highlights                                              │ │  │
│  │  │  • Empfehlungen                                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Smart Playlist Generator                         │ │  │
│  │  │                                                            │ │  │
│  │  │  Auto-Playlists:                                           │ │  │
│  │  │  📺 "Dein Morgen-Briefing"                                │ │  │
│  │  │  🎭 "Comedy für dich"                                     │ │  │
│  │  │  🏙️ "Was ist los in Berlin?"                             │ │  │
│  │  │  🔥 "Trending in deiner Nische"                           │ │  │
│  │  │  💡 "Lerne etwas Neues"                                   │ │  │
│  │  │  😴 "Entspannung am Abend"                                │ │  │
│  │  │                                                            │ │  │
│  │  │  Dynamisch aktualisiert: Jede Stunde                       │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Auto-Summary Generator                           │ │  │
│  │  │                                                            │ │  │
│  │  │  Erstellt automatisch:                                     │ │  │
│  │  │  • "Deine Woche in 2 Minuten"                             │ │  │
│  │  │  • "Top 10 Videos für dich"                               │ │  │
│  │  │  • "Trending Topics erklärt"                              │ │  │
│  │  │  • "Neue Creator-Empfehlungen"                            │ │  │
│  │  │                                                            │ │  │
│  │  │  Format: AI-geschnittenes Highlight-Video                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    LEARNING LAYER                                │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Continuous Learning Engine                       │ │  │
│  │  │                                                            │ │  │
│  │  │  Feedback Loop:                                            │ │  │
│  │  │                                                            │ │  │
│  │  │  User Interaktion                                          │ │  │
│  │  │         ↓                                                  │ │  │
│  │  │  Tracke Feedback (Like/Skip/Share/Watch-Time)             │ │  │
│  │  │         ↓                                                  │ │  │
│  │  │  Update Interest Vectors                                   │ │  │
│  │  │         ↓                                                  │ │  │
│  │  │  Re-Train Model (täglich)                                 │ │  │
│  │  │         ↓                                                  │ │  │
│  │  │  Bessere Recommendations                                   │ │  │
│  │  │         ↓                                                  │ │  │
│  │  │  User Interaktion (Cycle continues)                        │ │  │
│  │  │                                                            │ │  │
│  │  │  Metrics:                                                  │ │  │
│  │  │  • Accuracy Score                                          │ │  │
│  │  │  • Engagement Rate                                         │ │  │
│  │  │  • Session Duration                                        │ │  │
│  │  │  • Satisfaction Score                                      │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Datenbank-Schema

```sql
-- ============================================
-- USER INTERACTIONS (Raw Events)
-- ============================================
CREATE TABLE user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Interaction Type
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'share', 'comment', 'skip', 'save'
  
  -- Watch Behavior
  watch_duration_seconds INTEGER, -- Wie lange geschaut?
  video_percentage_watched DECIMAL(5,2), -- 0-100%
  is_completed BOOLEAN DEFAULT FALSE, -- Video zu Ende geschaut?
  
  -- Context
  source TEXT, -- 'feed', 'search', 'playlist', 'profile'
  device_type TEXT, -- 'mobile', 'tablet', 'desktop'
  time_of_day INTEGER, -- 0-23
  
  -- Sentiment
  explicit_rating INTEGER, -- 1-5 (optional User-Rating)
  implicit_rating DECIMAL(3,2), -- 0-1 (calculated from behavior)
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partitionierung nach Monat für Performance
CREATE INDEX idx_user_interactions_user ON user_interactions(user_id, created_at DESC);
CREATE INDEX idx_user_interactions_video ON user_interactions(video_id);
CREATE INDEX idx_user_interactions_type ON user_interactions(interaction_type, created_at DESC);

-- ============================================
-- USER PREFERENCES (Aggregated)
-- ============================================
CREATE TABLE user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Interest Categories (weighted 0-1)
  interests JSONB DEFAULT '{}', -- { "sports": 0.8, "news": 0.5, ... }
  
  -- Creator Preferences
  favorite_creators UUID[], -- Top followed/liked creators
  blocked_creators UUID[],
  
  -- Content Preferences
  preferred_video_length TEXT, -- 'short' (<60s), 'medium' (1-5min), 'long' (>5min)
  preferred_languages TEXT[], -- ['de', 'en']
  preferred_locations TEXT[], -- ['Berlin', 'Munich']
  
  -- Temporal Patterns
  active_hours INTEGER[], -- [8, 9, 10, 18, 19, 20] (hours when active)
  active_days INTEGER[], -- [1, 2, 3, 4, 5] (Monday-Friday)
  
  -- Mood-based
  morning_mood TEXT, -- 'energetic', 'calm', 'informative'
  evening_mood TEXT,
  weekend_mood TEXT,
  
  -- Quality Preferences
  prefers_quality_over_quantity BOOLEAN DEFAULT TRUE,
  diversity_factor DECIMAL(3,2) DEFAULT 0.5, -- 0 (consistent) - 1 (very diverse)
  
  -- Embeddings (for semantic search)
  interest_embedding VECTOR(1536), -- OpenAI Embedding
  
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user ON user_preferences(user_id);

-- ============================================
-- WATCH HISTORY
-- ============================================
CREATE TABLE watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Watch Details
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  watch_duration_seconds INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  
  -- Context
  session_id TEXT, -- Group by viewing session
  
  UNIQUE(user_id, video_id, session_id)
);

CREATE INDEX idx_watch_history_user ON watch_history(user_id, watched_at DESC);
CREATE INDEX idx_watch_history_session ON watch_history(session_id);

-- ============================================
-- AI PLAYLISTS
-- ============================================
CREATE TABLE ai_playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Playlist Info
  title TEXT NOT NULL,
  description TEXT,
  playlist_type TEXT NOT NULL, -- 'morning_briefing', 'comedy', 'local', 'trending', 'learning', 'relaxing'
  
  -- Auto-Generation
  auto_generated BOOLEAN DEFAULT TRUE,
  generation_algorithm TEXT, -- 'collaborative', 'content_based', 'hybrid'
  
  -- Content
  video_ids UUID[], -- Sorted list of video IDs
  
  -- Metadata
  total_duration_seconds INTEGER,
  video_count INTEGER,
  
  -- Freshness
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  auto_refresh BOOLEAN DEFAULT TRUE,
  refresh_interval_hours INTEGER DEFAULT 1,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_playlists_user ON ai_playlists(user_id);
CREATE INDEX idx_ai_playlists_type ON ai_playlists(playlist_type);

-- ============================================
-- RECOMMENDATION CACHE
-- ============================================
CREATE TABLE recommendation_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Recommendations
  recommended_video_ids UUID[], -- Ordered list
  scores DECIMAL[], -- Confidence scores
  
  -- Algorithm Info
  algorithm_version TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  UNIQUE(user_id)
);

CREATE INDEX idx_recommendation_cache_user ON recommendation_cache(user_id, expires_at);

-- ============================================
-- AI SUMMARIES
-- ============================================
CREATE TABLE ai_summaries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  -- Summary Info
  summary_type TEXT NOT NULL, -- 'weekly', 'daily', 'topic', 'creator'
  title TEXT NOT NULL,
  content TEXT, -- AI-generierte Zusammenfassung
  
  -- Source Videos
  source_video_ids UUID[],
  
  -- Generated Video (optional)
  summary_video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  viewed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_ai_summaries_user ON ai_summaries(user_id, created_at DESC);
```

---

## 🤖 Recommendation Engine Implementation

```typescript
// lib/personal-ai/recommendation-engine.ts

import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

interface RecommendationParams {
  userId: string;
  limit?: number;
  context?: 'feed' | 'search' | 'playlist';
  timeOfDay?: number;
}

interface VideoScore {
  videoId: string;
  score: number;
  reason: string;
}

export class RecommendationEngine {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Haupt-Recommendation-Funktion
   */
  async getRecommendations(params: RecommendationParams): Promise<string[]> {
    const { userId, limit = 20, context = 'feed', timeOfDay } = params;

    console.log(`🎯 Generating recommendations for user ${userId}...`);

    // 1. Check Cache
    const cached = await this.getCachedRecommendations(userId);
    if (cached) {
      console.log('✅ Using cached recommendations');
      return cached.slice(0, limit);
    }

    // 2. Get User Preferences
    const preferences = await this.getUserPreferences(userId);

    // 3. Run Parallel Algorithms
    const [
      collaborativeRecs,
      contentBasedRecs,
      deepLearningRecs,
      trendingRecs
    ] = await Promise.all([
      this.collaborativeFiltering(userId, preferences),
      this.contentBasedFiltering(userId, preferences),
      this.deepLearningRecommendations(userId, preferences),
      this.getTrendingVideos(preferences)
    ]);

    // 4. Hybrid Scoring
    const hybridScores = this.hybridScoring({
      collaborative: collaborativeRecs,
      contentBased: contentBasedRecs,
      deepLearning: deepLearningRecs,
      trending: trendingRecs
    });

    // 5. Re-Ranking
    const reranked = await this.rerank(hybridScores, userId, preferences);

    // 6. Cache Results
    await this.cacheRecommendations(userId, reranked);

    console.log(`✅ Generated ${reranked.length} recommendations`);
    return reranked.slice(0, limit);
  }

  /**
   * Collaborative Filtering
   */
  private async collaborativeFiltering(userId: string, preferences: any): Promise<VideoScore[]> {
    // Finde ähnliche User
    const { data: similarUsers } = await supabase.rpc('find_similar_users', {
      target_user_id: userId,
      limit: 100
    });

    if (!similarUsers?.length) return [];

    // Finde Videos, die diese User mochten
    const { data: videos } = await supabase
      .from('user_interactions')
      .select('video_id, COUNT(*) as score')
      .in('user_id', similarUsers.map((u: any) => u.user_id))
      .eq('interaction_type', 'like')
      .group('video_id')
      .order('score', { ascending: false })
      .limit(100);

    return (videos || []).map((v: any) => ({
      videoId: v.video_id,
      score: v.score,
      reason: 'collaborative'
    }));
  }

  /**
   * Content-Based Filtering
   */
  private async contentBasedFiltering(userId: string, preferences: any): Promise<VideoScore[]> {
    // Get User's Interest Embedding
    const userEmbedding = preferences.interest_embedding;

    if (!userEmbedding) {
      return [];
    }

    // Semantic Search mit Vector DB
    const { data: videos } = await supabase.rpc('semantic_video_search', {
      query_embedding: userEmbedding,
      match_threshold: 0.7,
      match_count: 100
    });

    return (videos || []).map((v: any, index: number) => ({
      videoId: v.id,
      score: 100 - index, // Higher rank = higher score
      reason: 'content_based'
    }));
  }

  /**
   * Deep Learning Recommendations
   */
  private async deepLearningRecommendations(userId: string, preferences: any): Promise<VideoScore[]> {
    // TODO: Implement Neural Network Model
    // For now, use a simplified heuristic
    
    const { data: interactions } = await supabase
      .from('user_interactions')
      .select('video_id, interaction_type, watch_duration_seconds, video_percentage_watched')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);

    // Find patterns in user behavior
    const videoCategories = await this.extractCategoriesFromHistory(interactions || []);

    // Find similar videos
    const { data: videos } = await supabase
      .from('videos')
      .select('id')
      .in('category', videoCategories)
      .order('views_count', { ascending: false })
      .limit(100);

    return (videos || []).map((v: any, index: number) => ({
      videoId: v.id,
      score: 100 - index,
      reason: 'deep_learning'
    }));
  }

  /**
   * Trending Videos (with personalization)
   */
  private async getTrendingVideos(preferences: any): Promise<VideoScore[]> {
    const { data: videos } = await supabase
      .from('videos')
      .select('id, views_count, likes_count, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24h
      .order('views_count', { ascending: false })
      .limit(100);

    return (videos || []).map((v: any, index: number) => ({
      videoId: v.id,
      score: 100 - index,
      reason: 'trending'
    }));
  }

  /**
   * Hybrid Scoring (combine all algorithms)
   */
  private hybridScoring(algorithms: {
    collaborative: VideoScore[];
    contentBased: VideoScore[];
    deepLearning: VideoScore[];
    trending: VideoScore[];
  }): VideoScore[] {
    const weights = {
      collaborative: 0.4,
      contentBased: 0.3,
      deepLearning: 0.2,
      trending: 0.1
    };

    const videoScores = new Map<string, number>();

    // Combine scores
    Object.entries(algorithms).forEach(([algorithm, videos]) => {
      const weight = weights[algorithm as keyof typeof weights];
      videos.forEach(({ videoId, score }) => {
        const currentScore = videoScores.get(videoId) || 0;
        videoScores.set(videoId, currentScore + (score * weight));
      });
    });

    // Convert to array and sort
    return Array.from(videoScores.entries())
      .map(([videoId, score]) => ({
        videoId,
        score,
        reason: 'hybrid'
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Re-Ranking (diversity, freshness, etc.)
   */
  private async rerank(scores: VideoScore[], userId: string, preferences: any): Promise<string[]> {
    // Get recently watched to avoid duplicates
    const { data: recentlyWatched } = await supabase
      .from('watch_history')
      .select('video_id')
      .eq('user_id', userId)
      .gte('watched_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .limit(100);

    const watchedIds = new Set((recentlyWatched || []).map((w: any) => w.video_id));

    // Filter out watched videos
    let filtered = scores.filter(s => !watchedIds.has(s.videoId));

    // Apply diversity (don't show too many videos from same category)
    filtered = await this.ensureDiversity(filtered);

    return filtered.map(s => s.videoId);
  }

  /**
   * Ensure Diversity
   */
  private async ensureDiversity(scores: VideoScore[]): Promise<VideoScore[]> {
    const videoIds = scores.map(s => s.videoId);
    
    const { data: videos } = await supabase
      .from('videos')
      .select('id, category, user_id')
      .in('id', videoIds);

    const categoryCounts = new Map<string, number>();
    const creatorCounts = new Map<string, number>();
    
    const diversified: VideoScore[] = [];

    for (const score of scores) {
      const video = videos?.find((v: any) => v.id === score.videoId);
      if (!video) continue;

      const categoryCount = categoryCounts.get(video.category) || 0;
      const creatorCount = creatorCounts.get(video.user_id) || 0;

      // Limit: Max 3 videos per category, max 2 per creator (in top 20)
      if (diversified.length < 20) {
        if (categoryCount >= 3 || creatorCount >= 2) {
          continue; // Skip this video
        }
      }

      diversified.push(score);
      categoryCounts.set(video.category, categoryCount + 1);
      creatorCounts.set(video.user_id, creatorCount + 1);
    }

    return diversified;
  }

  /**
   * Get User Preferences
   */
  private async getUserPreferences(userId: string) {
    const { data } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data || {};
  }

  /**
   * Cache Recommendations
   */
  private async cacheRecommendations(userId: string, videoIds: string[]) {
    await supabase
      .from('recommendation_cache')
      .upsert({
        user_id: userId,
        recommended_video_ids: videoIds,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour
      });
  }

  /**
   * Get Cached Recommendations
   */
  private async getCachedRecommendations(userId: string): Promise<string[] | null> {
    const { data } = await supabase
      .from('recommendation_cache')
      .select('recommended_video_ids, expires_at')
      .eq('user_id', userId)
      .single();

    if (!data || new Date(data.expires_at) < new Date()) {
      return null;
    }

    return data.recommended_video_ids;
  }

  /**
   * Helper: Extract categories from watch history
   */
  private async extractCategoriesFromHistory(interactions: any[]): Promise<string[]> {
    const videoIds = interactions
      .filter(i => i.video_percentage_watched > 50) // Only well-watched videos
      .map(i => i.video_id);

    if (!videoIds.length) return [];

    const { data: videos } = await supabase
      .from('videos')
      .select('category')
      .in('id', videoIds);

    const categoryCounts = (videos || []).reduce((acc: any, v: any) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 5)
      .map(([cat]) => cat);
  }
}
```

---

## 🎓 Continuous Learning System

```typescript
// lib/personal-ai/learning-engine.ts

import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export class LearningEngine {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  /**
   * Update User Preferences based on new interaction
   */
  async updatePreferences(userId: string, videoId: string, interaction: {
    type: 'view' | 'like' | 'share' | 'skip';
    watchDuration?: number;
    videoPercentage?: number;
  }) {
    console.log(`🧠 Learning from interaction: ${interaction.type}`);

    // 1. Get video metadata
    const { data: video } = await supabase
      .from('videos')
      .select('*')
      .eq('id', videoId)
      .single();

    if (!video) return;

    // 2. Calculate implicit rating
    const implicitRating = this.calculateImplicitRating(interaction);

    // 3. Update interest weights
    await this.updateInterestWeights(userId, video, implicitRating);

    // 4. Update embeddings
    await this.updateInterestEmbedding(userId, video, implicitRating);

    // 5. Invalidate cache
    await this.invalidateCache(userId);

    console.log('✅ Preferences updated');
  }

  /**
   * Calculate Implicit Rating from behavior
   */
  private calculateImplicitRating(interaction: any): number {
    switch (interaction.type) {
      case 'like':
        return 1.0;
      case 'share':
        return 1.0;
      case 'view':
        // Rating based on watch percentage
        const percentage = interaction.videoPercentage || 0;
        if (percentage > 80) return 0.9;
        if (percentage > 50) return 0.7;
        if (percentage > 25) return 0.5;
        return 0.3;
      case 'skip':
        return 0.1;
      default:
        return 0.5;
    }
  }

  /**
   * Update Interest Weights
   */
  private async updateInterestWeights(userId: string, video: any, rating: number) {
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('interests')
      .eq('user_id', userId)
      .single();

    const interests = prefs?.interests || {};

    // Update category weight
    if (video.category) {
      const currentWeight = interests[video.category] || 0.5;
      const newWeight = (currentWeight * 0.9) + (rating * 0.1); // Moving average
      interests[video.category] = Math.max(0, Math.min(1, newWeight));
    }

    // Update AI-detected keywords
    if (video.ai_keywords) {
      for (const keyword of video.ai_keywords) {
        const currentWeight = interests[keyword] || 0.5;
        const newWeight = (currentWeight * 0.9) + (rating * 0.1);
        interests[keyword] = Math.max(0, Math.min(1, newWeight));
      }
    }

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        interests,
        last_updated: new Date().toISOString()
      });
  }

  /**
   * Update Interest Embedding
   */
  private async updateInterestEmbedding(userId: string, video: any, rating: number) {
    // Get video embedding
    if (!video.ai_embedding) {
      // Generate embedding if not exists
      const embedding = await this.generateEmbedding(video.description || video.title);
      await supabase
        .from('videos')
        .update({ ai_embedding: embedding })
        .eq('id', video.id);
    }

    // Get current user embedding
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('interest_embedding')
      .eq('user_id', userId)
      .single();

    let userEmbedding = prefs?.interest_embedding;

    if (!userEmbedding) {
      // Initialize with video embedding
      userEmbedding = video.ai_embedding;
    } else {
      // Update embedding (weighted average)
      userEmbedding = this.updateEmbedding(userEmbedding, video.ai_embedding, rating);
    }

    await supabase
      .from('user_preferences')
      .update({
        interest_embedding: userEmbedding
      })
      .eq('user_id', userId);
  }

  /**
   * Generate Embedding
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });

    return response.data[0].embedding;
  }

  /**
   * Update Embedding with new data
   */
  private updateEmbedding(current: number[], new_emb: number[], weight: number): number[] {
    const alpha = 0.1 * weight; // Learning rate
    return current.map((val, i) => val * (1 - alpha) + new_emb[i] * alpha);
  }

  /**
   * Invalidate Recommendation Cache
   */
  private async invalidateCache(userId: string) {
    await supabase
      .from('recommendation_cache')
      .delete()
      .eq('user_id', userId);
  }
}
```

---

## 📱 Frontend Integration

```tsx
// components/personal-ai/PersonalFeed.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '@/lib/supabase';
import { RecommendationEngine } from '@/lib/personal-ai/recommendation-engine';
import { VideoCard } from '@/components/VideoCard';

export function PersonalFeed({ userId }: { userId: string }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPersonalizedFeed();
  }, []);

  const loadPersonalizedFeed = async () => {
    try {
      // Get recommendations from AI
      const engine = new RecommendationEngine();
      const videoIds = await engine.getRecommendations({
        userId,
        limit: 50
      });

      // Load video data
      const { data } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);

      // Sort by recommendation order
      const sorted = videoIds
        .map(id => data?.find(v => v.id === id))
        .filter(Boolean);

      setVideos(sorted);
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧠 Dein persönlicher Feed</Text>
      
      <FlatList
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VideoCard video={item} />}
        refreshing={loading}
        onRefresh={loadPersonalizedFeed}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16
  }
});
```

---

## ✅ Success Metrics

**Ziel: Beste Personalisierung der Welt**

- 🎯 95%+ Recommendation Accuracy
- ⏱️ 30+ Minuten durchschnittliche Session-Dauer
- 📈 80%+ Watch-Through-Rate
- 🔄 70%+ User kehren täglich zurück
- 💡 AI lernt < 5 Tage pro User
- 🚀 < 100ms Recommendation Response Time

---

**Personal AI Feed ist bereit für weltweite Dominanz! 🧠🔥**
