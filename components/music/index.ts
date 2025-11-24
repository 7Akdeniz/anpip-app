// Music Components - Central Export
// Einfacher Import aller Music-Komponenten

export { MusicBrowser } from './MusicBrowser'
export { MusicPlayer } from './MusicPlayer'
export { MusicSelector } from './MusicSelector'

// Re-export Types
export type {
  PixabayMusicTrack,
  PixabayMusicResponse,
  MusicSearchParams,
  MusicPlayerState,
  MusicSelectionState,
  UserMusicFavorite,
} from '../../types/pixabay-music'

// Re-export Constants
export {
  MUSIC_GENRES,
  MUSIC_MOODS,
  DURATION_FILTERS,
  BPM_RANGES,
} from '../../types/pixabay-music'

// Re-export Context
export { MusicProvider, useMusic } from '../../contexts/MusicContext'

// Re-export Services
export { musicService } from '../../lib/music-service'
export { musicCacheManager } from '../../lib/music-cache'
