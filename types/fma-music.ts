// Free Music Archive (FMA) API TypeScript Types
// Vollständige Type-Definitionen für FMA Music Integration

// ==================== FMA API RESPONSE TYPES ====================

export interface FMATrack {
  track_id: string
  track_title: string
  track_duration: string // "MM:SS" format
  track_number?: number
  track_date_created: string // ISO 8601
  track_date_published?: string
  track_listens: number
  track_interest: number
  track_favorites: number
  track_comments: number
  track_file: string // MP3 download URL
  track_file_url?: string
  track_url: string // FMA page URL
  track_image_file?: string
  license_title: string
  license_url: string
  license_image_file?: string
  license_image_file_large?: string
  license_parent_id?: string
  artist_id: string
  artist_name: string
  artist_url: string
  artist_donation_url?: string
  artist_website?: string
  artist_wikipedia_page?: string
  album_id?: string
  album_title?: string
  album_url?: string
  album_image_file?: string
  tags?: FMATag[]
}

export interface FMATag {
  tag_id: string
  tag_title: string
  tag_url: string
}

export interface FMAGenre {
  genre_id: string
  genre_title: string
  genre_handle: string
  genre_color?: string
  genre_parent_id?: string
}

export interface FMAArtist {
  artist_id: string
  artist_handle: string
  artist_name: string
  artist_bio?: string
  artist_url: string
  artist_website?: string
  artist_donation_url?: string
  artist_contact?: string
  artist_active_year_begin?: string
  artist_active_year_end?: string
  artist_related_projects?: string
  artist_associated_labels?: string
  artist_image_file?: string
  artist_location?: string
  artist_latitude?: string
  artist_longitude?: string
}

export interface FMAAlbum {
  album_id: string
  album_title: string
  album_handle: string
  album_type?: string
  album_information?: string
  album_date_created: string
  album_date_released?: string
  album_comments: number
  album_favorites: number
  album_listens: number
  album_tracks: number
  album_image_file?: string
  album_url: string
  artist_id: string
  artist_name: string
  tags?: FMATag[]
}

export interface FMAPlaylist {
  playlist_id: string
  playlist_title: string
  playlist_handle: string
  playlist_url: string
  playlist_date_created: string
  playlist_listens: number
  playlist_tracks?: FMATrack[]
  curator_name?: string
}

// ==================== NORMALIZED TYPES (kompatibel mit bestehendem System) ====================

export interface FMANormalizedTrack {
  // Kompatibel mit PixabayMusicTrack
  id: string // FMA track_id
  name: string // track_title
  artist: string // artist_name
  genre: string // Aus Tags extrahiert
  tags: string // Comma-separated tags
  duration: number // in seconds (konvertiert von MM:SS)
  tempo: number // BPM (falls verfügbar, sonst 0)
  audioUrl: string // track_file (MP3)
  downloadUrl: string // track_file
  previewUrl: string // track_file (FMA hat kein Preview, wir nutzen full)
  thumbnail: string // album_image_file oder artist_image_file
  userImageUrl?: string // artist_image_file
  pageUrl: string // track_url
  
  // FMA-spezifische Felder
  fma_track_id: string
  fma_artist_id: string
  fma_album_id?: string
  license_title: string
  license_url: string
  track_listens: number
  track_favorites: number
  track_date_published?: string
}

export interface FMASearchResponse {
  total: number
  totalHits: number
  tracks: FMANormalizedTrack[]
  page: number
  per_page: number
  cached?: boolean
  source: 'fma'
}

// ==================== SEARCH & FILTER PARAMS ====================

export interface FMASearchParams {
  q?: string // Search query
  genre?: string // Genre ID or handle
  tag?: string // Tag filter
  artist?: string // Artist name or ID
  album?: string // Album ID
  playlist?: string // Playlist ID
  license?: string // License type (cc-by, cc-by-sa, cc-by-nc, etc.)
  sort?: 'track_title' | 'track_date_created' | 'track_listens' | 'track_interest'
  order?: 'asc' | 'desc'
  page?: number // Default: 1
  per_page?: number // Default: 20, Max: 100
}

export interface FMAGenreFilter {
  id: string
  name: string
  handle: string
  icon?: string
  color?: string
}

export interface FMAMoodFilter {
  id: string
  name: string
  emoji?: string
  tags: string[] // Related FMA tags
}

export interface FMALicenseFilter {
  id: string
  name: string
  shortName: string
  url: string
  commercial: boolean
  derivative: boolean
  attribution: boolean
}

// ==================== PREDEFINED FILTERS ====================

export const FMA_GENRES: FMAGenreFilter[] = [
  { id: 'all', name: 'All Genres', handle: 'all' },
  { id: '1', name: 'Blues', handle: 'blues', icon: '🎸' },
  { id: '2', name: 'Classical', handle: 'classical', icon: '🎻' },
  { id: '3', name: 'Country', handle: 'country', icon: '🤠' },
  { id: '4', name: 'Electronic', handle: 'electronic', icon: '🎹' },
  { id: '5', name: 'Experimental', handle: 'experimental', icon: '🔬' },
  { id: '6', name: 'Folk', handle: 'folk', icon: '🪕' },
  { id: '7', name: 'Hip-Hop', handle: 'hip-hop', icon: '🎤' },
  { id: '8', name: 'Instrumental', handle: 'instrumental', icon: '🎼' },
  { id: '9', name: 'International', handle: 'international', icon: '🌍' },
  { id: '10', name: 'Jazz', handle: 'jazz', icon: '🎺' },
  { id: '12', name: 'Pop', handle: 'pop', icon: '⭐' },
  { id: '13', name: 'Rock', handle: 'rock', icon: '🎸' },
  { id: '14', name: 'Soul-RnB', handle: 'soul-rnb', icon: '💿' },
  { id: '15', name: 'Spoken', handle: 'spoken', icon: '🗣️' },
]

export const FMA_MOODS: FMAMoodFilter[] = [
  { id: 'upbeat', name: 'Upbeat', emoji: '🎉', tags: ['upbeat', 'happy', 'energetic', 'bright'] },
  { id: 'calm', name: 'Calm', emoji: '😌', tags: ['calm', 'peaceful', 'ambient', 'relaxing'] },
  { id: 'energetic', name: 'Energetic', emoji: '⚡', tags: ['energetic', 'fast', 'driving', 'intense'] },
  { id: 'dark', name: 'Dark', emoji: '🌙', tags: ['dark', 'atmospheric', 'melancholic', 'moody'] },
  { id: 'happy', name: 'Happy', emoji: '😊', tags: ['happy', 'cheerful', 'joyful', 'positive'] },
  { id: 'sad', name: 'Sad', emoji: '😢', tags: ['sad', 'melancholic', 'emotional', 'slow'] },
  { id: 'dramatic', name: 'Dramatic', emoji: '🎭', tags: ['dramatic', 'epic', 'cinematic', 'powerful'] },
  { id: 'romantic', name: 'Romantic', emoji: '❤️', tags: ['romantic', 'love', 'emotional', 'soft'] },
  { id: 'epic', name: 'Epic', emoji: '🔥', tags: ['epic', 'orchestral', 'cinematic', 'grand'] },
  { id: 'chill', name: 'Chill', emoji: '🎧', tags: ['chill', 'lofi', 'downtempo', 'mellow'] },
]

export const FMA_LICENSES: FMALicenseFilter[] = [
  {
    id: 'cc-by',
    name: 'Creative Commons Attribution',
    shortName: 'CC BY',
    url: 'https://creativecommons.org/licenses/by/4.0/',
    commercial: true,
    derivative: true,
    attribution: true,
  },
  {
    id: 'cc-by-sa',
    name: 'Creative Commons Attribution-ShareAlike',
    shortName: 'CC BY-SA',
    url: 'https://creativecommons.org/licenses/by-sa/4.0/',
    commercial: true,
    derivative: true,
    attribution: true,
  },
  {
    id: 'cc-by-nc',
    name: 'Creative Commons Attribution-NonCommercial',
    shortName: 'CC BY-NC',
    url: 'https://creativecommons.org/licenses/by-nc/4.0/',
    commercial: false,
    derivative: true,
    attribution: true,
  },
  {
    id: 'cc-by-nc-sa',
    name: 'Creative Commons Attribution-NonCommercial-ShareAlike',
    shortName: 'CC BY-NC-SA',
    url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    commercial: false,
    derivative: true,
    attribution: true,
  },
  {
    id: 'cc-by-nd',
    name: 'Creative Commons Attribution-NoDerivatives',
    shortName: 'CC BY-ND',
    url: 'https://creativecommons.org/licenses/by-nd/4.0/',
    commercial: true,
    derivative: false,
    attribution: true,
  },
  {
    id: 'cc-by-nc-nd',
    name: 'Creative Commons Attribution-NonCommercial-NoDerivatives',
    shortName: 'CC BY-NC-ND',
    url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
    commercial: false,
    derivative: false,
    attribution: true,
  },
]

// ==================== UNIFIED MUSIC TYPES (FMA + Pixabay) ====================

export type MusicSource = 'fma' | 'pixabay'

export interface UnifiedMusicTrack {
  id: string
  name: string
  artist: string
  genre: string
  tags: string
  duration: number
  tempo: number
  audioUrl: string
  downloadUrl: string
  previewUrl: string
  thumbnail: string
  userImageUrl?: string
  pageUrl: string
  source: MusicSource
  license?: {
    title: string
    url: string
    commercial: boolean
    attribution: boolean
  }
  metadata?: {
    listens?: number
    favorites?: number
    date_published?: string
  }
}

export interface UnifiedMusicResponse {
  total: number
  totalHits: number
  tracks: UnifiedMusicTrack[]
  page: number
  per_page: number
  source: MusicSource
  cached?: boolean
}

// ==================== USER PREFERENCES ====================

export interface UserMusicPreferences {
  user_id: string
  preferred_source: MusicSource // 'fma' | 'pixabay' | 'both'
  preferred_licenses: string[] // License IDs
  preferred_genres: string[]
  auto_attribution: boolean // Automatisch Attributierung hinzufügen
  commercial_use: boolean // Nur kommerzielle Lizenzen
  created_at: string
  updated_at: string
}

export interface UserFMAFavorite {
  id: string
  user_id: string
  track_id: string
  track_data: FMANormalizedTrack
  created_at: string
}

// ==================== CACHE TYPES ====================

export interface FMACacheEntry {
  key: string
  data: FMASearchResponse
  timestamp: number
  ttl: number
}

export interface FMAPreloadQueue {
  tracks: FMANormalizedTrack[]
  currentIndex: number
  preloadCount: number
  status: 'idle' | 'loading' | 'ready' | 'error'
}
