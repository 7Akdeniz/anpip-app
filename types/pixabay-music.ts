// Pixabay Music API TypeScript Types
// Vollständige Type-Definitionen für die Music Integration

export interface PixabayMusicTrack {
  id: number
  name: string
  artist: string
  genre: string
  tags: string
  duration: number // in seconds
  tempo: number // BPM
  audioUrl: string // Full quality audio
  downloadUrl: string // Download link
  previewUrl: string // Preview/stream URL
  thumbnail: string // Cover/thumbnail image
  userImageUrl?: string // Artist image
  pageUrl?: string // Pixabay page URL
}

export interface PixabayMusicResponse {
  total: number
  totalHits: number
  tracks: PixabayMusicTrack[]
  cached?: boolean
}

export interface MusicSearchParams {
  q?: string // Search query
  lang?: string // Language (en, de, es, fr, etc.)
  page?: number // Page number (default: 1)
  per_page?: number // Results per page (3-200, default: 20)
  music_type?: string // Genre, mood, or artist
  order?: 'popular' | 'latest' // Sort order
  min_duration?: number // Min duration in seconds
  max_duration?: number // Max duration in seconds
}

export interface MusicGenre {
  id: string
  name: string
  icon?: string
}

export interface MusicMood {
  id: string
  name: string
  emoji?: string
}

export interface UserMusicFavorite {
  id: string
  user_id: string
  track_id: number
  track_data: PixabayMusicTrack
  created_at: string
}

export interface MusicPlayerState {
  currentTrack: PixabayMusicTrack | null
  isPlaying: boolean
  progress: number // 0-1
  duration: number
  volume: number // 0-1
  isMuted: boolean
  isLoading: boolean
}

export interface MusicSelectionState {
  selectedTrack: PixabayMusicTrack | null
  selectionMode: 'editor' | 'background' | 'preview' | null
}

// Predefined Genres (basierend auf Pixabay)
export const MUSIC_GENRES: MusicGenre[] = [
  { id: 'all', name: 'All Genres' },
  { id: 'acoustic', name: 'Acoustic' },
  { id: 'ambient', name: 'Ambient' },
  { id: 'beats', name: 'Beats' },
  { id: 'blues', name: 'Blues' },
  { id: 'children', name: 'Children' },
  { id: 'cinematic', name: 'Cinematic' },
  { id: 'classical', name: 'Classical' },
  { id: 'country', name: 'Country' },
  { id: 'dance', name: 'Dance' },
  { id: 'dramatic', name: 'Dramatic' },
  { id: 'electronic', name: 'Electronic' },
  { id: 'folk', name: 'Folk' },
  { id: 'funk', name: 'Funk' },
  { id: 'happy', name: 'Happy' },
  { id: 'hip_hop', name: 'Hip Hop' },
  { id: 'indie', name: 'Indie' },
  { id: 'jazz', name: 'Jazz' },
  { id: 'latin', name: 'Latin' },
  { id: 'lounge', name: 'Lounge' },
  { id: 'metal', name: 'Metal' },
  { id: 'orchestral', name: 'Orchestral' },
  { id: 'pop', name: 'Pop' },
  { id: 'reggae', name: 'Reggae' },
  { id: 'rnb', name: 'R&B' },
  { id: 'rock', name: 'Rock' },
  { id: 'soul', name: 'Soul' },
  { id: 'soundtrack', name: 'Soundtrack' },
  { id: 'world', name: 'World' },
]

// Predefined Moods
export const MUSIC_MOODS: MusicMood[] = [
  { id: 'upbeat', name: 'Upbeat', emoji: '🎉' },
  { id: 'calm', name: 'Calm', emoji: '😌' },
  { id: 'energetic', name: 'Energetic', emoji: '⚡' },
  { id: 'dark', name: 'Dark', emoji: '🌙' },
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'sad', name: 'Sad', emoji: '😢' },
  { id: 'dramatic', name: 'Dramatic', emoji: '🎭' },
  { id: 'romantic', name: 'Romantic', emoji: '❤️' },
  { id: 'epic', name: 'Epic', emoji: '🔥' },
  { id: 'chill', name: 'Chill', emoji: '🎧' },
]

// Duration Filters
export const DURATION_FILTERS = [
  { label: 'Any', min: 0, max: 0 },
  { label: '< 1 min', min: 0, max: 60 },
  { label: '1-3 min', min: 60, max: 180 },
  { label: '3-5 min', min: 180, max: 300 },
  { label: '> 5 min', min: 300, max: 0 },
]

// BPM Ranges
export const BPM_RANGES = [
  { label: 'Any', min: 0, max: 0 },
  { label: 'Slow (< 90)', min: 0, max: 90 },
  { label: 'Medium (90-120)', min: 90, max: 120 },
  { label: 'Fast (120-140)', min: 120, max: 140 },
  { label: 'Very Fast (> 140)', min: 140, max: 0 },
]

export interface MusicCache {
  key: string
  data: PixabayMusicResponse
  timestamp: number
}
