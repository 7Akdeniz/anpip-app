# 🌍 WORLD TIMELINE ENGINE - Echtzeit-Video-Weltkarte

## 🎯 Vision

**Die weltweit erste Echtzeit-Video-Weltkarte mit KI-basierter Event-Erkennung.**

Anpip wird zur globalen Live-Informations-Plattform, die zeigt, was **jetzt gerade überall auf der Welt passiert**.

---

## 🏗️ System-Architektur

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      WORLD TIMELINE ENGINE                              │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   DATA COLLECTION LAYER                          │  │
│  │                                                                  │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                │  │
│  │  │   Videos   │  │  GPS Data  │  │ User Tags  │                │  │
│  │  │  (Upload)  │  │(Real-time) │  │ (Manual)   │                │  │
│  │  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │  │
│  │        └─────────────────┴──────────────┘                       │  │
│  └────────────────────────────┬─────────────────────────────────────┘  │
│                               │                                         │
│  ┌────────────────────────────▼─────────────────────────────────────┐  │
│  │                      AI PROCESSING LAYER                         │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │              AI Content Analyzer                         │   │  │
│  │  │  - OpenAI Vision API (GPT-4V)                           │   │  │
│  │  │  - Anthropic Claude Vision                              │   │  │
│  │  │  - Google Gemini Pro Vision                             │   │  │
│  │  │                                                          │   │  │
│  │  │  Erkennt:                                                │   │  │
│  │  │  ✓ Ereignis-Typ (Katastrophe, Feier, Protest, Sport)   │   │  │
│  │  │  ✓ Stimmung (positiv, neutral, negativ, dringend)       │   │  │
│  │  │  ✓ Objekte (Personen, Fahrzeuge, Gebäude)              │   │  │
│  │  │  ✓ Aktivitäten (was passiert?)                          │   │  │
│  │  │  ✓ Trendpotential (viral score 0-100)                   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │              AI Audio Analyzer                           │   │  │
│  │  │  - Whisper (Speech-to-Text)                             │   │  │
│  │  │  - Sentiment Analysis                                   │   │  │
│  │  │  - Language Detection                                   │   │  │
│  │  │  - Keyword Extraction                                   │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │              GEO Intelligence Engine                     │   │  │
│  │  │  - Location Verification (GPS vs IP)                    │   │  │
│  │  │  - City/Region/Country Detection                        │   │  │
│  │  │  - Weather Data Integration                             │   │  │
│  │  │  - Time Zone Awareness                                  │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                   EVENT CLUSTERING LAYER                        │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │           Real-Time Event Detector                       │   │  │
│  │  │                                                          │   │  │
│  │  │  Algorithmus:                                            │   │  │
│  │  │  1. Gruppiere Videos nach:                               │   │  │
│  │  │     - Ort (max 5km Radius)                              │   │  │
│  │  │     - Zeit (max 2h Fenster)                             │   │  │
│  │  │     - Ähnlichem Inhalt (AI Embedding Similarity)        │   │  │
│  │  │                                                          │   │  │
│  │  │  2. Bewerte Event-Score:                                │   │  │
│  │  │     Score = (Video Count × 0.3) +                       │   │  │
│  │  │             (Viral Score Avg × 0.4) +                   │   │  │
│  │  │             (Time Recency × 0.3)                         │   │  │
│  │  │                                                          │   │  │
│  │  │  3. Klassifiziere Event:                                │   │  │
│  │  │     - Breaking News (Score > 80)                         │   │  │
│  │  │     - Trending (Score 50-80)                            │   │  │
│  │  │     - Local Buzz (Score 30-50)                          │   │  │
│  │  │     - Normal (Score < 30)                               │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                     HEATMAP LAYER                               │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │           City-Level Trend Heatmap                       │   │  │
│  │  │                                                          │   │  │
│  │  │  Map Integration:                                        │   │  │
│  │  │  - Mapbox GL JS                                          │   │  │
│  │  │  - Deck.gl (für 3D-Visualisierung)                      │   │  │
│  │  │  - Custom Heatmap Layer                                  │   │  │
│  │  │                                                          │   │  │
│  │  │  Heatmap-Intensität:                                     │   │  │
│  │  │  🔵 Blau   = Wenig Aktivität (1-10 Videos)              │   │  │
│  │  │  🟢 Grün   = Normale Aktivität (11-50 Videos)           │   │  │
│  │  │  🟡 Gelb   = Erhöhte Aktivität (51-100 Videos)          │   │  │
│  │  │  🟠 Orange = Hohe Aktivität (101-500 Videos)            │   │  │
│  │  │  🔴 Rot    = Virale Aktivität (500+ Videos)             │   │  │
│  │  │                                                          │   │  │
│  │  │  Live-Updates: Alle 30 Sekunden                          │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐  │
│  │                    SPOTLIGHT FEED                               │  │
│  │                                                                  │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │          Global Spotlight Algorithm                      │   │  │
│  │  │                                                          │   │  │
│  │  │  Ranking-Faktoren:                                       │   │  │
│  │  │  1. Event Score (40%)                                    │   │  │
│  │  │  2. Geographic Diversity (20%)                           │   │  │
│  │  │  3. Content Quality (AI Score) (20%)                     │   │  │
│  │  │  4. User Engagement (Views/Likes) (20%)                  │   │  │
│  │  │                                                          │   │  │
│  │  │  Feed-Struktur:                                          │   │  │
│  │  │  📍 Top Event (Hero Video)                               │   │  │
│  │  │  🔥 Trending Events (5 Videos)                           │   │  │
│  │  │  🌍 Around the World (10 Videos)                         │   │  │
│  │  │  📈 Rising Stories (8 Videos)                            │   │  │
│  │  │                                                          │   │  │
│  │  │  Auto-Refresh: Alle 60 Sekunden                          │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Datenbank-Schema

### Neue Tabellen

```sql
-- ============================================
-- EVENT CLUSTERING TABLE
-- ============================================
CREATE TABLE world_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Event-Info
  event_type TEXT NOT NULL, -- 'breaking_news', 'trending', 'local_buzz', 'normal'
  title TEXT NOT NULL, -- AI-generiert
  description TEXT, -- AI-generiert
  event_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  
  -- Geo-Daten
  location_lat DECIMAL(10,8) NOT NULL,
  location_lon DECIMAL(11,8) NOT NULL,
  location_city TEXT NOT NULL,
  location_country TEXT NOT NULL,
  radius_km INTEGER DEFAULT 5, -- Event-Radius
  
  -- Zeitfenster
  event_start TIMESTAMPTZ NOT NULL,
  event_end TIMESTAMPTZ,
  
  -- AI-Analyse
  ai_summary TEXT, -- Zusammenfassung
  ai_sentiment TEXT, -- 'positive', 'neutral', 'negative', 'urgent'
  ai_keywords TEXT[], -- Extracted Keywords
  ai_category TEXT, -- 'disaster', 'celebration', 'protest', 'sports', 'entertainment'
  
  -- Statistiken
  video_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indizes
  CONSTRAINT valid_event_score CHECK (event_score >= 0 AND event_score <= 100)
);

-- Indizes für Performance
CREATE INDEX idx_world_events_location ON world_events(location_lat, location_lon);
CREATE INDEX idx_world_events_score ON world_events(event_score DESC);
CREATE INDEX idx_world_events_active ON world_events(is_active, event_start DESC);
CREATE INDEX idx_world_events_city ON world_events(location_city, location_country);
CREATE INDEX idx_world_events_type ON world_events(event_type, is_active);

-- ============================================
-- EVENT-VIDEO JUNCTION TABLE
-- ============================================
CREATE TABLE event_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES world_events(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
  
  -- Relevanz-Score
  relevance_score DECIMAL(5,2) DEFAULT 0, -- Wie relevant ist Video für Event?
  
  -- Position
  is_primary BOOLEAN DEFAULT FALSE, -- Haupt-Video des Events
  display_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(event_id, video_id)
);

CREATE INDEX idx_event_videos_event ON event_videos(event_id, relevance_score DESC);
CREATE INDEX idx_event_videos_video ON event_videos(video_id);

-- ============================================
-- CITY HEATMAP DATA
-- ============================================
CREATE TABLE city_heatmap (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Stadt-Info
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DECIMAL(10,8) NOT NULL,
  lon DECIMAL(11,8) NOT NULL,
  
  -- Heatmap-Daten (letzte 24h)
  video_count_24h INTEGER DEFAULT 0,
  view_count_24h INTEGER DEFAULT 0,
  trending_score DECIMAL(5,2) DEFAULT 0, -- 0-100
  intensity_level INTEGER DEFAULT 1, -- 1-5 (Blau bis Rot)
  
  -- Top-Kategorien
  top_categories TEXT[], -- Top 3 Kategorien in dieser Stadt
  
  -- Update-Tracking
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(city, country)
);

CREATE INDEX idx_city_heatmap_score ON city_heatmap(trending_score DESC);
CREATE INDEX idx_city_heatmap_country ON city_heatmap(country);

-- ============================================
-- VIDEO AI ANALYSIS (erweitert videos Tabelle)
-- ============================================
ALTER TABLE videos
ADD COLUMN IF NOT EXISTS ai_analyzed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_event_type TEXT,
ADD COLUMN IF NOT EXISTS ai_sentiment TEXT,
ADD COLUMN IF NOT EXISTS ai_viral_score DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS ai_keywords TEXT[],
ADD COLUMN IF NOT EXISTS ai_objects TEXT[],
ADD COLUMN IF NOT EXISTS ai_activities TEXT[],
ADD COLUMN IF NOT EXISTS ai_transcription TEXT,
ADD COLUMN IF NOT EXISTS ai_language_detected TEXT,
ADD COLUMN IF NOT EXISTS ai_analyzed_at TIMESTAMPTZ;

CREATE INDEX idx_videos_ai_viral_score ON videos(ai_viral_score DESC) WHERE ai_analyzed = TRUE;
CREATE INDEX idx_videos_ai_event_type ON videos(ai_event_type) WHERE ai_analyzed = TRUE;
```

---

## 🤖 AI-Integration

### 1. Video-Analyse Pipeline

```typescript
// lib/world-timeline/ai-video-analyzer.ts

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface AIAnalysisResult {
  eventType: 'disaster' | 'celebration' | 'protest' | 'sports' | 'entertainment' | 'news' | 'other';
  sentiment: 'positive' | 'neutral' | 'negative' | 'urgent';
  viralScore: number; // 0-100
  keywords: string[];
  objects: string[];
  activities: string[];
  transcription?: string;
  language?: string;
  summary: string;
}

export class AIVideoAnalyzer {
  private openai: OpenAI;
  private anthropic: Anthropic;
  private gemini: GoogleGenerativeAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    this.gemini = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
  }

  /**
   * Haupt-Analysefunktion
   */
  async analyzeVideo(videoUrl: string, thumbnailUrl: string): Promise<AIAnalysisResult> {
    console.log('🤖 Starte AI-Video-Analyse...');

    // Parallel Analysis für Speed
    const [visionAnalysis, audioAnalysis] = await Promise.all([
      this.analyzeVisual(thumbnailUrl),
      this.analyzeAudio(videoUrl)
    ]);

    // Kombiniere Ergebnisse
    const result = this.combineAnalysis(visionAnalysis, audioAnalysis);
    
    console.log('✅ AI-Analyse abgeschlossen:', result);
    return result;
  }

  /**
   * Visuelle Analyse mit GPT-4 Vision
   */
  private async analyzeVisual(imageUrl: string) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this video thumbnail and provide:
1. Event type (disaster, celebration, protest, sports, entertainment, news, other)
2. Sentiment (positive, neutral, negative, urgent)
3. Viral potential score (0-100)
4. Key objects visible
5. Activities happening
6. Brief summary (max 50 words)

Return as JSON.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Audio-Analyse mit Whisper
   */
  private async analyzeAudio(videoUrl: string) {
    try {
      // Download Audio (first 30 seconds)
      const audioBuffer = await this.extractAudioSample(videoUrl, 30);

      // Transcribe mit Whisper
      const transcription = await this.openai.audio.transcriptions.create({
        file: audioBuffer,
        model: 'whisper-1',
        language: 'de' // Auto-detect möglich
      });

      // Sentiment Analysis des Textes
      const sentiment = await this.analyzeSentiment(transcription.text);

      // Keyword Extraction
      const keywords = await this.extractKeywords(transcription.text);

      return {
        transcription: transcription.text,
        language: transcription.language,
        sentiment,
        keywords
      };
    } catch (error) {
      console.error('Audio-Analyse fehlgeschlagen:', error);
      return null;
    }
  }

  /**
   * Sentiment Analysis
   */
  private async analyzeSentiment(text: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Analyze sentiment. Return only: positive, neutral, negative, or urgent.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 10
    });

    return response.choices[0].message.content?.toLowerCase() || 'neutral';
  }

  /**
   * Keyword Extraction
   */
  private async extractKeywords(text: string): Promise<string[]> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Extract max 10 important keywords. Return as comma-separated list.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      max_tokens: 100
    });

    const keywords = response.choices[0].message.content?.split(',').map(k => k.trim()) || [];
    return keywords.slice(0, 10);
  }

  /**
   * Kombiniere Visual + Audio Analysis
   */
  private combineAnalysis(visual: any, audio: any): AIAnalysisResult {
    return {
      eventType: visual.eventType || 'other',
      sentiment: audio?.sentiment || visual.sentiment || 'neutral',
      viralScore: visual.viralScore || 0,
      keywords: [...(visual.keywords || []), ...(audio?.keywords || [])].slice(0, 20),
      objects: visual.objects || [],
      activities: visual.activities || [],
      transcription: audio?.transcription,
      language: audio?.language,
      summary: visual.summary || ''
    };
  }

  /**
   * Helper: Extract Audio Sample
   */
  private async extractAudioSample(videoUrl: string, durationSeconds: number): Promise<Buffer> {
    // Implementation mit FFmpeg
    // Extrahiere erste X Sekunden als MP3
    // Return Buffer
    throw new Error('Not implemented - use FFmpeg');
  }
}
```

### 2. Event Clustering Algorithm

```typescript
// lib/world-timeline/event-clusterer.ts

interface VideoWithLocation {
  id: string;
  lat: number;
  lon: number;
  timestamp: Date;
  aiEventType: string;
  aiViralScore: number;
  aiKeywords: string[];
}

interface EventCluster {
  centerLat: number;
  centerLon: number;
  videos: VideoWithLocation[];
  eventScore: number;
  eventType: string;
}

export class EventClusterer {
  private readonly MAX_DISTANCE_KM = 5; // 5km Radius
  private readonly MAX_TIME_HOURS = 2; // 2h Fenster
  private readonly MIN_VIDEOS = 3; // Mind. 3 Videos für Event

  /**
   * Hauptfunktion: Clustere Videos zu Events
   */
  async clusterVideos(videos: VideoWithLocation[]): Promise<EventCluster[]> {
    console.log(`🔍 Clustere ${videos.length} Videos...`);

    const clusters: EventCluster[] = [];
    const processed = new Set<string>();

    for (const video of videos) {
      if (processed.has(video.id)) continue;

      // Finde ähnliche Videos in der Nähe
      const similarVideos = this.findSimilarVideos(video, videos, processed);

      if (similarVideos.length >= this.MIN_VIDEOS) {
        // Erstelle Event-Cluster
        const cluster = this.createCluster(similarVideos);
        clusters.push(cluster);

        // Markiere als verarbeitet
        similarVideos.forEach(v => processed.add(v.id));
      }
    }

    console.log(`✅ ${clusters.length} Events gefunden`);
    return clusters;
  }

  /**
   * Finde ähnliche Videos (gleicher Ort + Zeit + Inhalt)
   */
  private findSimilarVideos(
    baseVideo: VideoWithLocation,
    allVideos: VideoWithLocation[],
    processed: Set<string>
  ): VideoWithLocation[] {
    return allVideos.filter(video => {
      if (processed.has(video.id)) return false;

      // 1. Check: Distanz
      const distance = this.calculateDistance(
        baseVideo.lat,
        baseVideo.lon,
        video.lat,
        video.lon
      );
      if (distance > this.MAX_DISTANCE_KM) return false;

      // 2. Check: Zeit
      const timeDiff = Math.abs(video.timestamp.getTime() - baseVideo.timestamp.getTime());
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      if (hoursDiff > this.MAX_TIME_HOURS) return false;

      // 3. Check: Inhaltliche Ähnlichkeit
      const similarity = this.calculateContentSimilarity(baseVideo, video);
      if (similarity < 0.5) return false; // Mind. 50% ähnlich

      return true;
    });
  }

  /**
   * Berechne Content-Ähnlichkeit (Keyword-Overlap)
   */
  private calculateContentSimilarity(video1: VideoWithLocation, video2: VideoWithLocation): number {
    const keywords1 = new Set(video1.aiKeywords);
    const keywords2 = new Set(video2.aiKeywords);

    const intersection = new Set([...keywords1].filter(k => keywords2.has(k)));
    const union = new Set([...keywords1, ...keywords2]);

    return intersection.size / union.size; // Jaccard Similarity
  }

  /**
   * Erstelle Event-Cluster
   */
  private createCluster(videos: VideoWithLocation[]): EventCluster {
    // Berechne Zentrum (Durchschnitt aller Positionen)
    const centerLat = videos.reduce((sum, v) => sum + v.lat, 0) / videos.length;
    const centerLon = videos.reduce((sum, v) => sum + v.lon, 0) / videos.length;

    // Berechne Event-Score
    const avgViralScore = videos.reduce((sum, v) => sum + v.aiViralScore, 0) / videos.length;
    const recencyFactor = this.calculateRecencyFactor(videos);
    const eventScore = (videos.length * 0.3) + (avgViralScore * 0.4) + (recencyFactor * 0.3);

    // Bestimme Event-Type (häufigster Type)
    const eventType = this.getMostCommonEventType(videos);

    return {
      centerLat,
      centerLon,
      videos,
      eventScore: Math.min(100, eventScore),
      eventType
    };
  }

  /**
   * Recency Factor (neuere Videos = höherer Score)
   */
  private calculateRecencyFactor(videos: VideoWithLocation[]): number {
    const now = Date.now();
    const avgAge = videos.reduce((sum, v) => {
      const ageHours = (now - v.timestamp.getTime()) / (1000 * 60 * 60);
      return sum + ageHours;
    }, 0) / videos.length;

    // Score sinkt mit Alter: 100 (jetzt) -> 0 (24h alt)
    return Math.max(0, 100 - (avgAge * 4.17)); // 4.17 = 100/24
  }

  /**
   * Häufigster Event-Type
   */
  private getMostCommonEventType(videos: VideoWithLocation[]): string {
    const typeCounts = videos.reduce((acc, v) => {
      acc[v.aiEventType] = (acc[v.aiEventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'other';
  }

  /**
   * Haversine Distance Formula
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
```

---

## 🗺️ Frontend: Interactive World Map

### React Component

```tsx
// components/world-timeline/WorldMap.tsx

import React, { useEffect, useState, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/lib/supabase';

interface WorldEvent {
  id: string;
  title: string;
  eventType: string;
  eventScore: number;
  lat: number;
  lon: number;
  videoCount: number;
  city: string;
  country: string;
}

export function WorldMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize Mapbox
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      projection: 'globe'
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

    // Load events
    loadEvents();

    // Refresh every 30 seconds
    const interval = setInterval(loadEvents, 30000);

    return () => {
      clearInterval(interval);
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !events.length) return;

    // Add event markers
    events.forEach(event => {
      const color = getEventColor(event.eventScore);
      const size = getEventSize(event.videoCount);

      // Create marker
      const el = document.createElement('div');
      el.className = 'event-marker';
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = color;
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.cursor = 'pointer';
      el.style.boxShadow = `0 0 20px ${color}`;

      // Add pulse animation
      el.style.animation = 'pulse 2s infinite';

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 10px; min-width: 200px;">
          <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: bold;">
            ${event.title}
          </h3>
          <p style="margin: 0 0 8px; font-size: 14px; color: #666;">
            📍 ${event.city}, ${event.country}
          </p>
          <p style="margin: 0 0 8px; font-size: 14px;">
            🎬 ${event.videoCount} Videos
          </p>
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            <button onclick="viewEvent('${event.id}')" style="flex: 1; padding: 8px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Videos ansehen
            </button>
          </div>
        </div>
      `);

      // Add marker to map
      new mapboxgl.Marker(el)
        .setLngLat([event.lon, event.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Add heatmap layer
    addHeatmapLayer(events);
  }, [events]);

  /**
   * Load events from database
   */
  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('world_events')
        .select('*')
        .eq('is_active', true)
        .order('event_score', { ascending: false })
        .limit(100);

      if (error) throw error;

      setEvents(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  /**
   * Add heatmap layer
   */
  const addHeatmapLayer = (events: WorldEvent[]) => {
    if (!map.current) return;

    const geojson = {
      type: 'FeatureCollection',
      features: events.map(event => ({
        type: 'Feature',
        properties: {
          intensity: event.eventScore
        },
        geometry: {
          type: 'Point',
          coordinates: [event.lon, event.lat]
        }
      }))
    };

    // Remove existing layer if exists
    if (map.current.getLayer('events-heat')) {
      map.current.removeLayer('events-heat');
      map.current.removeSource('events');
    }

    // Add source
    map.current.addSource('events', {
      type: 'geojson',
      data: geojson as any
    });

    // Add heatmap layer
    map.current.addLayer({
      id: 'events-heat',
      type: 'heatmap',
      source: 'events',
      paint: {
        'heatmap-weight': ['get', 'intensity'],
        'heatmap-intensity': 1,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(33,102,172,0)',
          0.2, 'rgb(103,169,207)',
          0.4, 'rgb(209,229,240)',
          0.6, 'rgb(253,219,199)',
          0.8, 'rgb(239,138,98)',
          1, 'rgb(178,24,43)'
        ],
        'heatmap-radius': 50,
        'heatmap-opacity': 0.6
      }
    });
  };

  /**
   * Get event color based on score
   */
  const getEventColor = (score: number): string => {
    if (score >= 80) return '#dc3545'; // Red - Breaking
    if (score >= 50) return '#fd7e14'; // Orange - Trending
    if (score >= 30) return '#ffc107'; // Yellow - Local Buzz
    return '#0dcaf0'; // Cyan - Normal
  };

  /**
   * Get event size based on video count
   */
  const getEventSize = (count: number): number => {
    if (count >= 100) return 40;
    if (count >= 50) return 32;
    if (count >= 20) return 24;
    return 16;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '20px',
          borderRadius: '8px',
          color: 'white'
        }}>
          Lade Events...
        </div>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 20,
        right: 20,
        background: 'rgba(0,0,0,0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white'
      }}>
        <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>Event-Intensität</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: '#dc3545', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px' }}>Breaking News (80+)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: '#fd7e14', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px' }}>Trending (50-80)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: '#ffc107', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px' }}>Local Buzz (30-50)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 20, height: 20, background: '#0dcaf0', borderRadius: '50%' }} />
            <span style={{ fontSize: '12px' }}>Normal (&lt;30)</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
```

---

## 📱 Mobile Integration

```tsx
// app/(tabs)/world.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WorldMap } from '@/components/world-timeline/WorldMap';

export default function WorldTimelineScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🌍 World Timeline</Text>
        <Text style={styles.subtitle}>Live Events Around the World</Text>
      </View>
      
      <WorldMap />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.9)'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: '#999'
  }
});
```

---

## 🚀 Deployment & Scaling

### Background Job (Auto-Processing)

```typescript
// workers/world-timeline-processor.ts

import { supabase } from '../lib/supabase';
import { AIVideoAnalyzer } from '../lib/world-timeline/ai-video-analyzer';
import { EventClusterer } from '../lib/world-timeline/event-clusterer';

export async function processWorldTimeline() {
  console.log('🌍 [World Timeline] Starte Verarbeitung...');

  try {
    // 1. Finde nicht analysierte Videos
    const { data: unanalyzedVideos } = await supabase
      .from('videos')
      .select('*')
      .eq('ai_analyzed', false)
      .not('location_lat', 'is', null)
      .limit(50);

    if (!unanalyzedVideos?.length) {
      console.log('✅ Keine neuen Videos zu analysieren');
      return;
    }

    console.log(`🎬 Analysiere ${unanalyzedVideos.length} Videos...`);

    // 2. AI-Analyse für jedes Video
    const analyzer = new AIVideoAnalyzer();
    
    for (const video of unanalyzedVideos) {
      try {
        const analysis = await analyzer.analyzeVideo(video.video_url, video.thumbnail_url);

        // Update Video mit AI-Daten
        await supabase
          .from('videos')
          .update({
            ai_analyzed: true,
            ai_event_type: analysis.eventType,
            ai_sentiment: analysis.sentiment,
            ai_viral_score: analysis.viralScore,
            ai_keywords: analysis.keywords,
            ai_objects: analysis.objects,
            ai_activities: analysis.activities,
            ai_transcription: analysis.transcription,
            ai_language_detected: analysis.language,
            ai_analyzed_at: new Date().toISOString()
          })
          .eq('id', video.id);

        console.log(`✅ Video ${video.id} analysiert`);
      } catch (error) {
        console.error(`❌ Fehler bei Video ${video.id}:`, error);
      }
    }

    // 3. Event Clustering
    const { data: recentVideos } = await supabase
      .from('videos')
      .select('*')
      .eq('ai_analyzed', true)
      .not('location_lat', 'is', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Letzte 24h
      .limit(1000);

    if (recentVideos?.length) {
      const clusterer = new EventClusterer();
      const clusters = await clusterer.clusterVideos(recentVideos as any);

      // Speichere Events
      for (const cluster of clusters) {
        await saveEvent(cluster);
      }

      console.log(`✅ ${clusters.length} Events erstellt`);
    }

    // 4. Update City Heatmap
    await updateCityHeatmap();

  } catch (error) {
    console.error('❌ World Timeline Processor Fehler:', error);
  }
}

/**
 * Speichere Event in Datenbank
 */
async function saveEvent(cluster: any) {
  // Generiere Titel mit AI
  const title = await generateEventTitle(cluster);

  const { data: event } = await supabase
    .from('world_events')
    .insert({
      event_type: getEventType(cluster.eventScore),
      title,
      event_score: cluster.eventScore,
      location_lat: cluster.centerLat,
      location_lon: cluster.centerLon,
      location_city: cluster.videos[0].location_city,
      location_country: cluster.videos[0].location_country,
      video_count: cluster.videos.length,
      event_start: cluster.videos[0].created_at,
      ai_category: cluster.eventType
    })
    .select()
    .single();

  if (event) {
    // Link Videos zu Event
    for (const video of cluster.videos) {
      await supabase.from('event_videos').insert({
        event_id: event.id,
        video_id: video.id,
        relevance_score: video.ai_viral_score
      });
    }
  }
}

/**
 * Generiere Event-Titel mit AI
 */
async function generateEventTitle(cluster: any): Promise<string> {
  // Use most common keywords
  const keywords = cluster.videos.flatMap((v: any) => v.ai_keywords || []);
  const keywordCounts = keywords.reduce((acc: any, k: string) => {
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const topKeywords = Object.entries(keywordCounts)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3)
    .map(([k]) => k);

  const city = cluster.videos[0].location_city;
  return `${topKeywords.join(' + ')} in ${city}`;
}

function getEventType(score: number): string {
  if (score >= 80) return 'breaking_news';
  if (score >= 50) return 'trending';
  if (score >= 30) return 'local_buzz';
  return 'normal';
}

/**
 * Update City Heatmap
 */
async function updateCityHeatmap() {
  // Aggregiere Stats pro Stadt
  const { data: cityStats } = await supabase.rpc('calculate_city_heatmap');

  if (cityStats) {
    for (const stat of cityStats) {
      await supabase
        .from('city_heatmap')
        .upsert(stat, { onConflict: 'city,country' });
    }
  }
}

// Führe alle 5 Minuten aus
setInterval(processWorldTimeline, 5 * 60 * 1000);
```

---

## 📈 Monitoring & Analytics

```sql
-- Analytics View
CREATE OR REPLACE VIEW world_timeline_analytics AS
SELECT
  DATE(event_start) as date,
  event_type,
  COUNT(*) as event_count,
  AVG(event_score) as avg_score,
  SUM(video_count) as total_videos,
  location_country
FROM world_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(event_start), event_type, location_country
ORDER BY date DESC;
```

---

## ✅ Success Metrics

**Ziel: Weltweit führend in Echtzeit-Event-Erkennung**

- ⚡ Event-Erkennung < 5 Minuten nach Upload
- 🎯 95%+ Accuracy bei Event-Classification
- 🌍 100+ Städte mit aktiven Heatmaps
- 📊 10.000+ Events/Monat erkannt
- 🚀 < 2 Sekunden Map Load Time

---

**Das World Timeline Engine System ist bereit für Weltklasse-Level! 🌍🔥**
