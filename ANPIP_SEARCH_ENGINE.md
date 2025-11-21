# 🔍 ANPIP SEARCH ENGINE - Google-Level Video-Suche

## 🎯 Vision

**Die weltweit erste KI-basierte Sem antische Video-Suchmaschine.**

Nutzer können finden:
- Videos nach Inhalt (nicht nur Titel)
- Objekte in Videos ("rotes Auto", "Hund am Strand")
- Szenen & Momente
- Gesprochene Worte (Transkript-Suche)
- Stimmungen & Emotionen
- Orte & Zeiten
- **Alles, was in einem Video passiert**

---

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       ANPIP SEARCH ENGINE                               │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    INDEXING LAYER                                │  │
│  │                                                                  │  │
│  │  Jedes hochgeladene Video wird automatisch analysiert:           │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Video Analysis Pipeline                          │ │  │
│  │  │                                                            │ │  │
│  │  │  1️⃣ Visual Analysis (GPT-4 Vision)                        │ │  │
│  │  │     → Objekte: Person, Auto, Baum, Gebäude...            │ │  │
│  │  │     → Szenen: Strand, Stadt, Nacht, Regen...             │ │  │
│  │  │     → Aktivitäten: Tanzen, Kochen, Sprechen...           │ │  │
│  │  │     → Farben: Dominant colors                            │ │  │
│  │  │                                                            │ │  │
│  │  │  2️⃣ Audio Transcription (Whisper)                         │ │  │
│  │  │     → Vollständiges Transkript                           │ │  │
│  │  │     → Sprache erkannt                                     │ │  │
│  │  │     → Timestamps pro Satz                                 │ │  │
│  │  │                                                            │ │  │
│  │  │  3️⃣ Embedding Generation (OpenAI)                         │ │  │
│  │  │     → Semantic Embedding (1536 dimensions)                │ │  │
│  │  │     → Gespeichert in Vector DB                            │ │  │
│  │  │                                                            │ │  │
│  │  │  4️⃣ Metadata Extraction                                   │ │  │
│  │  │     → Ort, Zeit, Creator                                  │ │  │
│  │  │     → Kategorie, Tags                                     │ │  │
│  │  │     → Engagement-Metriken                                 │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Search Index (Multi-Layer)                       │ │  │
│  │  │                                                            │ │  │
│  │  │  Layer 1: Vector DB (Pinecone/Weaviate)                   │ │  │
│  │  │  → Semantic Search                                        │ │  │
│  │  │  → Similarity Matching                                     │ │  │
│  │  │                                                            │ │  │
│  │  │  Layer 2: Full-Text Search (ElasticSearch)                │ │  │
│  │  │  → Titel, Beschreibung, Transkript                        │ │  │
│  │  │  → Typo-tolerant                                          │ │  │
│  │  │  → Multilingual                                           │ │  │
│  │  │                                                            │ │  │
│  │  │  Layer 3: Structured Filters (PostgreSQL)                 │ │  │
│  │  │  → Kategorie, Ort, Datum                                  │ │  │
│  │  │  → Creator, Dauer, Qualität                               │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    QUERY PROCESSING LAYER                        │  │
│  │                                                                  │  │
│  │  User Query: "Hund spielt am Strand bei Sonnenuntergang"         │  │
│  │                          │                                       │  │
│  │                          ▼                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Query Understanding                              │ │  │
│  │  │                                                            │ │  │
│  │  │  1️⃣ Intent Detection                                      │ │  │
│  │  │     → Sucht nach: Objekt + Ort + Zeit                     │ │  │
│  │  │                                                            │ │  │
│  │  │  2️⃣ Entity Extraction                                     │ │  │
│  │  │     → Hund (Objekt)                                       │ │  │
│  │  │     → Strand (Ort)                                        │ │  │
│  │  │     → Sonnenuntergang (Zeit)                              │ │  │
│  │  │                                                            │ │  │
│  │  │  3️⃣ Query Expansion                                       │ │  │
│  │  │     → Synonyme: Hund = Welpe, Vierbeiner                 │ │  │
│  │  │     → Strand = Meer, Küste, Sand                          │ │  │
│  │  │     → Sonnenuntergang = Abend, Golden Hour               │ │  │
│  │  │                                                            │ │  │
│  │  │  4️⃣ Embedding Generation                                  │ │  │
│  │  │     → Query → Vector (1536D)                              │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    RETRIEVAL LAYER                               │  │
│  │                                                                  │  │
│  │  Parallel Search Across All Indices:                              │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Semantic Search (Vector DB)                      │ │  │
│  │  │  → Findet konzeptuell ähnliche Videos                     │ │  │
│  │  │  → Score: 0.85                                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          ↓                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Full-Text Search (ElasticSearch)                 │ │  │
│  │  │  → Findet exakte Keyword-Matches                          │ │  │
│  │  │  → Score: BM25                                            │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          ↓                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Visual Search (Object Detection)                 │ │  │
│  │  │  → Videos mit erkannten Objekten                          │ │  │
│  │  │  → Filter: has_object="dog" AND location="beach"          │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  │                          ↓                                       │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Hybrid Ranking                                   │ │  │
│  │  │                                                            │ │  │
│  │  │  Combined Score:                                           │ │  │
│  │  │  • Semantic Similarity (40%)                               │ │  │
│  │  │  • Text Relevance (30%)                                   │ │  │
│  │  │  • Visual Match (20%)                                      │ │  │
│  │  │  • Engagement (10%)                                        │ │  │
│  │  │                                                            │ │  │
│  │  │  Re-Ranking Factors:                                       │ │  │
│  │  │  • Freshness Boost                                         │ │  │
│  │  │  • Quality Score                                           │ │  │
│  │  │  • Personalization                                         │ │  │
│  │  │  • Diversity                                               │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    RESULT PRESENTATION                           │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐ │  │
│  │  │          Rich Results                                     │ │  │
│  │  │                                                            │ │  │
│  │  │  • Video Thumbnails                                        │ │  │
│  │  │  • Relevante Timestamps (Jump-to-Moment)                  │ │  │
│  │  │  • Highlighted Keywords                                    │ │  │
│  │  │  • AI-Summary                                              │ │  │
│  │  │  • Related Searches                                        │ │  │
│  │  └────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Datenbank-Schema Erweiterungen

```sql
-- ============================================
-- VIDEO SEARCH INDEX
-- ============================================
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS search_embedding VECTOR(1536), -- Semantic Embedding
ADD COLUMN IF NOT EXISTS transcript TEXT, -- Vollständiges Transkript
ADD COLUMN IF NOT EXISTS transcript_timestamps JSONB, -- [{text, start, end}, ...]
ADD COLUMN IF NOT EXISTS detected_objects TEXT[], -- ['dog', 'beach', 'sunset']
ADD COLUMN IF NOT EXISTS detected_scenes TEXT[], -- ['outdoor', 'daytime', 'nature']
ADD COLUMN IF NOT EXISTS detected_activities TEXT[], -- ['playing', 'running']
ADD COLUMN IF NOT EXISTS dominant_colors TEXT[], -- ['#FF5733', '#33FF57']
ADD COLUMN IF NOT EXISTS visual_features JSONB, -- Detailed visual analysis
ADD COLUMN IF NOT EXISTS search_indexed_at TIMESTAMPTZ;

-- Indizes für schnelle Suche
CREATE INDEX idx_videos_search_embedding ON videos USING ivfflat (search_embedding vector_cosine_ops);
CREATE INDEX idx_videos_transcript ON videos USING gin (to_tsvector('multilingual', transcript));
CREATE INDEX idx_videos_objects ON videos USING gin (detected_objects);
CREATE INDEX idx_videos_scenes ON videos USING gin (detected_scenes);

-- ============================================
-- SEARCH QUERIES (Analytics)
-- ============================================
CREATE TABLE search_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Query Info
  query_text TEXT NOT NULL,
  query_embedding VECTOR(1536),
  
  -- Context
  search_type TEXT, -- 'text', 'visual', 'voice', 'semantic'
  filters JSONB, -- Applied filters
  
  -- Results
  result_count INTEGER,
  top_result_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  clicked_result_ids UUID[],
  
  -- Performance
  search_time_ms INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_queries_user ON search_queries(user_id);
CREATE INDEX idx_search_queries_text ON search_queries USING gin (to_tsvector('multilingual', query_text));

-- ============================================
-- VIDEO MOMENTS (für Jump-to-Moment)
-- ============================================
CREATE TABLE video_moments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Moment Info
  start_time_seconds DECIMAL(10,2) NOT NULL,
  end_time_seconds DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  
  -- Classification
  moment_type TEXT, -- 'highlight', 'chapter', 'scene_change', 'key_object'
  confidence DECIMAL(3,2), -- 0-1
  
  -- Search
  moment_embedding VECTOR(1536),
  keywords TEXT[],
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_video_moments_video ON video_moments(video_id);
CREATE INDEX idx_video_moments_embedding ON video_moments USING ivfflat (moment_embedding vector_cosine_ops);
```

---

## 🔍 Search Engine Implementation

```typescript
// lib/search/search-engine.ts

import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';
import Pinecone from '@pinecone-database/pinecone';

interface SearchParams {
  query: string;
  filters?: {
    category?: string;
    location?: string;
    dateRange?: { from: Date; to: Date };
    creator?: string;
    duration?: { min: number; max: number };
  };
  limit?: number;
  userId?: string;
}

interface SearchResult {
  videoId: string;
  score: number;
  relevance: {
    semantic: number;
    textual: number;
    visual: number;
  };
  highlights?: {
    field: string;
    text: string;
  }[];
  moments?: {
    timestamp: number;
    description: string;
  }[];
}

export class SearchEngine {
  private openai: OpenAI;
  private pinecone: Pinecone;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  }

  /**
   * Haupt-Suchfunktion
   */
  async search(params: SearchParams): Promise<SearchResult[]> {
    console.log(`🔍 Searching for: "${params.query}"`);
    const startTime = Date.now();

    try {
      // 1. Query Understanding
      const queryAnalysis = await this.analyzeQuery(params.query);

      // 2. Generate Query Embedding
      const queryEmbedding = await this.generateEmbedding(params.query);

      // 3. Parallel Search across all indices
      const [semanticResults, textResults, visualResults] = await Promise.all([
        this.semanticSearch(queryEmbedding, params.filters),
        this.textSearch(params.query, params.filters),
        this.visualSearch(queryAnalysis.objects, params.filters)
      ]);

      // 4. Hybrid Ranking
      const rankedResults = this.hybridRanking({
        semantic: semanticResults,
        text: textResults,
        visual: visualResults
      });

      // 5. Personalization (if user logged in)
      const personalizedResults = params.userId
        ? await this.personalizeResults(rankedResults, params.userId)
        : rankedResults;

      // 6. Add Highlights & Moments
      const enrichedResults = await this.enrichResults(personalizedResults, params.query);

      // 7. Log Search
      await this.logSearch({
        userId: params.userId,
        query: params.query,
        resultCount: enrichedResults.length,
        searchTimeMs: Date.now() - startTime
      });

      console.log(`✅ Found ${enrichedResults.length} results in ${Date.now() - startTime}ms`);
      return enrichedResults.slice(0, params.limit || 20);

    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Analyze Query mit GPT-4
   */
  private async analyzeQuery(query: string): Promise<{
    intent: string;
    entities: string[];
    objects: string[];
    locations: string[];
    timeframes: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `Analyze this search query and extract:
1. Intent (what is the user looking for?)
2. Entities (people, places, things)
3. Objects (physical items)
4. Locations (places)
5. Timeframes (when)

Return as JSON.`
        },
        {
          role: 'user',
          content: query
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0
    });

    return JSON.parse(response.choices[0].message.content || '{}');
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
   * Semantic Search (Vector DB)
   */
  private async semanticSearch(
    queryEmbedding: number[],
    filters?: any
  ): Promise<SearchResult[]> {
    // Option 1: Pinecone
    const index = this.pinecone.Index('anpip-videos');
    const results = await index.query({
      vector: queryEmbedding,
      topK: 100,
      includeMetadata: true,
      filter: this.buildPineconeFilter(filters)
    });

    return results.matches.map(match => ({
      videoId: match.id,
      score: match.score || 0,
      relevance: {
        semantic: match.score || 0,
        textual: 0,
        visual: 0
      }
    }));

    // Option 2: Supabase with pgvector
    // const { data } = await supabase.rpc('semantic_video_search', {
    //   query_embedding: queryEmbedding,
    //   match_threshold: 0.7,
    //   match_count: 100
    // });
    // return data || [];
  }

  /**
   * Text Search (Full-Text)
   */
  private async textSearch(query: string, filters?: any): Promise<SearchResult[]> {
    let supabaseQuery = supabase
      .from('videos')
      .select('id, title, description, transcript')
      .textSearch('description', query, { type: 'websearch', config: 'multilingual' });

    // Apply filters
    if (filters?.category) {
      supabaseQuery = supabaseQuery.eq('category', filters.category);
    }
    if (filters?.location) {
      supabaseQuery = supabaseQuery.eq('location_city', filters.location);
    }

    const { data } = await supabaseQuery.limit(100);

    return (data || []).map((video, index) => ({
      videoId: video.id,
      score: 100 - index, // Simple ranking
      relevance: {
        semantic: 0,
        textual: 1,
        visual: 0
      }
    }));
  }

  /**
   * Visual Search (Object-based)
   */
  private async visualSearch(objects: string[], filters?: any): Promise<SearchResult[]> {
    if (!objects?.length) return [];

    let query = supabase
      .from('videos')
      .select('id, detected_objects');

    // Search for videos containing any of the objects
    query = query.overlaps('detected_objects', objects);

    // Apply filters
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    const { data } = await query.limit(100);

    return (data || []).map((video, index) => {
      // Calculate how many objects match
      const matchCount = video.detected_objects?.filter((obj: string) =>
        objects.includes(obj)
      ).length || 0;

      return {
        videoId: video.id,
        score: matchCount * 25, // Higher score for more matches
        relevance: {
          semantic: 0,
          textual: 0,
          visual: matchCount / objects.length
        }
      };
    });
  }

  /**
   * Hybrid Ranking
   */
  private hybridRanking(results: {
    semantic: SearchResult[];
    text: SearchResult[];
    visual: SearchResult[];
  }): SearchResult[] {
    const weights = {
      semantic: 0.4,
      text: 0.3,
      visual: 0.2,
      engagement: 0.1
    };

    // Merge all results
    const videoScores = new Map<string, SearchResult>();

    // Combine scores
    [results.semantic, results.text, results.visual].forEach((resultSet, index) => {
      const key = ['semantic', 'text', 'visual'][index];
      const weight = weights[key as keyof typeof weights];

      resultSet.forEach(result => {
        const existing = videoScores.get(result.videoId);
        if (existing) {
          existing.score += result.score * weight;
          existing.relevance.semantic += result.relevance.semantic * weights.semantic;
          existing.relevance.textual += result.relevance.textual * weights.text;
          existing.relevance.visual += result.relevance.visual * weights.visual;
        } else {
          videoScores.set(result.videoId, {
            ...result,
            score: result.score * weight
          });
        }
      });
    });

    // Convert to array and sort
    return Array.from(videoScores.values())
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Personalize Results based on user preferences
   */
  private async personalizeResults(
    results: SearchResult[],
    userId: string
  ): Promise<SearchResult[]> {
    // Get user preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('interests, favorite_creators')
      .eq('user_id', userId)
      .single();

    if (!prefs) return results;

    // Boost videos from favorite creators or matching interests
    return results.map(result => {
      let boost = 1;

      // TODO: Check if video is from favorite creator
      // TODO: Check if video matches user interests

      return {
        ...result,
        score: result.score * boost
      };
    }).sort((a, b) => b.score - a.score);
  }

  /**
   * Enrich Results with Highlights & Moments
   */
  private async enrichResults(
    results: SearchResult[],
    query: string
  ): Promise<SearchResult[]> {
    const videoIds = results.map(r => r.videoId);

    // Get video details
    const { data: videos } = await supabase
      .from('videos')
      .select('id, title, description, transcript')
      .in('id', videoIds);

    // Get moments
    const { data: moments } = await supabase
      .from('video_moments')
      .select('*')
      .in('video_id', videoIds);

    return results.map(result => {
      const video = videos?.find(v => v.id === result.videoId);
      const videoMoments = moments?.filter(m => m.video_id === result.videoId);

      // Generate highlights
      const highlights = this.generateHighlights(video, query);

      return {
        ...result,
        highlights,
        moments: videoMoments?.map(m => ({
          timestamp: m.start_time_seconds,
          description: m.description
        }))
      };
    });
  }

  /**
   * Generate Highlights
   */
  private generateHighlights(video: any, query: string): any[] {
    const highlights = [];
    const queryWords = query.toLowerCase().split(' ');

    // Highlight in title
    if (video.title) {
      const titleLower = video.title.toLowerCase();
      if (queryWords.some(word => titleLower.includes(word))) {
        highlights.push({
          field: 'title',
          text: video.title
        });
      }
    }

    // Highlight in description
    if (video.description) {
      const descLower = video.description.toLowerCase();
      if (queryWords.some(word => descLower.includes(word))) {
        // Extract relevant snippet
        const snippet = this.extractSnippet(video.description, queryWords);
        highlights.push({
          field: 'description',
          text: snippet
        });
      }
    }

    return highlights;
  }

  /**
   * Extract Relevant Snippet
   */
  private extractSnippet(text: string, keywords: string[]): string {
    const sentences = text.split(/[.!?]+/);
    
    // Find sentence containing most keywords
    let bestSentence = sentences[0];
    let maxMatches = 0;

    sentences.forEach(sentence => {
      const matches = keywords.filter(keyword =>
        sentence.toLowerCase().includes(keyword)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestSentence = sentence;
      }
    });

    return bestSentence.trim().substring(0, 150) + '...';
  }

  /**
   * Build Pinecone Filter
   */
  private buildPineconeFilter(filters?: any): any {
    const filter: any = {};

    if (filters?.category) {
      filter.category = { $eq: filters.category };
    }

    if (filters?.location) {
      filter.location_city = { $eq: filters.location };
    }

    // Add more filters as needed

    return Object.keys(filter).length > 0 ? filter : undefined;
  }

  /**
   * Log Search Query
   */
  private async logSearch(params: {
    userId?: string;
    query: string;
    resultCount: number;
    searchTimeMs: number;
  }) {
    await supabase.from('search_queries').insert({
      user_id: params.userId,
      query_text: params.query,
      result_count: params.resultCount,
      search_time_ms: params.searchTimeMs
    });
  }
}
```

---

## 📱 Frontend Search Component

```tsx
// components/search/AdvancedSearch.tsx

import React, { useState } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { SearchEngine } from '@/lib/search/search-engine';
import { VideoCard } from '@/components/VideoCard';

export function AdvancedSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const engine = new SearchEngine();
      const searchResults = await engine.search({
        query,
        filters,
        limit: 50
      });

      // Load video details
      const videoIds = searchResults.map(r => r.videoId);
      const { data } = await supabase
        .from('videos')
        .select('*')
        .in('id', videoIds);

      // Sort by search ranking
      const sorted = videoIds
        .map(id => data?.find(v => v.id === id))
        .filter(Boolean);

      setResults(sorted);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Suche Videos, Objekte, Orte..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
          <Text>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {/* Add filter chips here */}
      </View>

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <VideoCard video={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {query ? 'Keine Ergebnisse gefunden' : 'Gib einen Suchbegriff ein'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 8
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999'
  }
});
```

---

## ✅ Success Metrics

**Ziel: Beste Video-Suchmaschine der Welt**

- 🎯 95%+ Search Accuracy
- ⚡ < 200ms Search Response Time
- 📊 90%+ User findet gewünschtes Video
- 🔍 Semantic Understanding > 85%
- 🎬 Jump-to-Moment Feature > 70% Nutzung
- 🌍 50+ Sprachen unterstützt

---

**Anpip Search Engine ist bereit, Google Konkurrenz zu machen! 🔍🔥**
