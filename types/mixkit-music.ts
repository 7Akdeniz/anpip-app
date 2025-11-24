/**
 * MIXKIT MUSIC TYPES
 * TypeScript Interfaces für Mixkit Integration
 */

export interface MixkitTrack {
  id: string
  mixkit_id: string
  title: string
  description?: string
  
  // Audio Details
  duration_seconds: number
  bpm?: number
  key?: string
  
  // Kategorisierung
  genre: string
  mood?: string
  tags: string[]
  
  // Storage
  storage_url: string
  storage_provider: 'supabase' | 'cloudflare-r2'
  cdn_url?: string
  file_size_bytes: number
  file_format: 'mp3' | 'wav' | 'ogg'
  
  // Metadaten
  artist: string
  album?: string
  year?: number
  
  // Lizenz
  license: string
  license_url: string
  attribution_required: boolean
  commercial_use_allowed: boolean
  original_url?: string
  
  // Audio Features
  quality: 'low' | 'medium' | 'high' | 'lossless'
  sample_rate: number
  bitrate_kbps: number
  
  // Stats
  status: 'active' | 'inactive' | 'deleted' | 'processing'
  download_count: number
  play_count: number
  favorite_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
  last_played_at?: string
}

export interface MixkitFavorite {
  id: string
  user_id: string
  track_id: string
  created_at: string
}

export interface MixkitAnalytics {
  id: string
  track_id: string
  user_id?: string
  action: 'play' | 'download' | 'favorite' | 'select_for_video' | 'share' | 'preview'
  duration_seconds?: number
  completion_percentage?: number
  source: 'app' | 'web' | 'api'
  metadata?: Record<string, any>
  created_at: string
}

export interface MixkitSearchParams {
  query?: string
  genre?: string
  mood?: string
  tags?: string[]
  minBpm?: number
  maxBpm?: number
  limit?: number
  offset?: number
}

export interface MixkitSearchResult {
  tracks: MixkitTrack[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface MixkitCategory {
  id: string
  name: string
  slug: string
  count: number
  icon?: string
}

// Normalized Track für Unified Music Context
export interface MixkitNormalizedTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  preview_url?: string
  genre?: string
  mood?: string
  bpm?: number
  license: {
    name: string
    url: string
    attribution_required: boolean
    commercial_use: boolean
  }
  artwork?: string
  source: 'mixkit'
}

// Wird in fma-music.ts definiert
// export type MusicSource = 'fma' | 'pixabay' | 'mixkit'
