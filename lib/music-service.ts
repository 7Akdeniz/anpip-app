// Pixabay Music Service
// Zentrale Service-Schicht für alle Music-API-Calls

import { supabase } from './supabase'
import type {
  PixabayMusicTrack,
  PixabayMusicResponse,
  MusicSearchParams,
  UserMusicFavorite,
} from '../types/pixabay-music'

const MUSIC_API_ENDPOINT = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/pixabay-music'

// In-Memory Cache für Client-seitige Performance
const musicCache = new Map<string, { data: PixabayMusicResponse; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 Minuten

class MusicService {
  private getCacheKey(params: MusicSearchParams): string {
    return JSON.stringify(params)
  }

  private getCachedData(key: string): PixabayMusicResponse | null {
    const cached = musicCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > CACHE_TTL) {
      musicCache.delete(key)
      return null
    }

    return cached.data
  }

  private setCachedData(key: string, data: PixabayMusicResponse): void {
    musicCache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Musik suchen mit umfangreichen Filtern
   */
  async searchMusic(params: MusicSearchParams = {}): Promise<PixabayMusicResponse> {
    try {
      const cacheKey = this.getCacheKey(params)
      const cached = this.getCachedData(cacheKey)
      if (cached) {
        console.log('🎵 Music Search - Cache Hit')
        return cached
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const queryParams = new URLSearchParams({
        action: 'search',
        ...Object.fromEntries(
          Object.entries(params).map(([k, v]) => [k, String(v)])
        ),
      })

      const response = await fetch(`${MUSIC_API_ENDPOINT}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to search music')
      }

      const data: PixabayMusicResponse = await response.json()
      
      // Cache speichern
      this.setCachedData(cacheKey, data)

      console.log(`🎵 Music Search - Found ${data.totalHits} tracks`)
      return data
    } catch (error) {
      console.error('Music Search Error:', error)
      throw error
    }
  }

  /**
   * Einzelnen Track abrufen
   */
  async getTrack(trackId: number): Promise<PixabayMusicTrack> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${MUSIC_API_ENDPOINT}?action=get_track&id=${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Track not found')
      }

      return await response.json()
    } catch (error) {
      console.error('Get Track Error:', error)
      throw error
    }
  }

  /**
   * Nach Genre suchen
   */
  async searchByGenre(genre: string, page = 1): Promise<PixabayMusicResponse> {
    return this.searchMusic({
      music_type: genre,
      page,
      per_page: 20,
      order: 'popular',
    })
  }

  /**
   * Nach Mood/Stimmung suchen
   */
  async searchByMood(mood: string, page = 1): Promise<PixabayMusicResponse> {
    return this.searchMusic({
      q: mood,
      page,
      per_page: 20,
      order: 'popular',
    })
  }

  /**
   * Trending/Popular Musik
   */
  async getTrendingMusic(page = 1): Promise<PixabayMusicResponse> {
    return this.searchMusic({
      page,
      per_page: 20,
      order: 'popular',
    })
  }

  /**
   * Neueste Musik
   */
  async getLatestMusic(page = 1): Promise<PixabayMusicResponse> {
    return this.searchMusic({
      page,
      per_page: 20,
      order: 'latest',
    })
  }

  /**
   * Nach Dauer filtern
   */
  async searchByDuration(
    minDuration: number,
    maxDuration: number,
    page = 1
  ): Promise<PixabayMusicResponse> {
    return this.searchMusic({
      min_duration: minDuration,
      max_duration: maxDuration,
      page,
      per_page: 20,
    })
  }

  /**
   * Favoriten-Management
   */
  async addToFavorites(track: PixabayMusicTrack): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('user_music_favorites').insert({
        user_id: user.id,
        track_id: track.id,
        track_data: track,
      })

      if (error) throw error
      console.log('✅ Track added to favorites:', track.name)
    } catch (error) {
      console.error('Add to Favorites Error:', error)
      throw error
    }
  }

  async removeFromFavorites(trackId: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_music_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId)

      if (error) throw error
      console.log('✅ Track removed from favorites')
    } catch (error) {
      console.error('Remove from Favorites Error:', error)
      throw error
    }
  }

  async getFavorites(): Promise<UserMusicFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_music_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get Favorites Error:', error)
      throw error
    }
  }

  async isFavorite(trackId: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_music_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return !!data
    } catch (error) {
      console.error('Is Favorite Error:', error)
      return false
    }
  }

  /**
   * Download Track (für Offline-Nutzung oder Video-Editor)
   */
  async downloadTrack(track: PixabayMusicTrack): Promise<string> {
    try {
      // Download von Pixabay URL
      const response = await fetch(track.audioUrl)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      
      // Blob URL erstellen für lokale Nutzung
      const blobUrl = URL.createObjectURL(blob)
      
      console.log('✅ Track downloaded:', track.name)
      return blobUrl
    } catch (error) {
      console.error('Download Track Error:', error)
      throw error
    }
  }

  /**
   * Preload Tracks für bessere Performance
   */
  async preloadTracks(tracks: PixabayMusicTrack[]): Promise<void> {
    try {
      // Parallel Preload der ersten 5 Tracks
      const preloadPromises = tracks.slice(0, 5).map(async (track) => {
        try {
          const audio = new Audio(track.previewUrl || track.audioUrl)
          audio.preload = 'auto'
          await audio.load()
        } catch (err) {
          console.warn('Preload failed for:', track.name)
        }
      })

      await Promise.allSettled(preloadPromises)
      console.log('✅ Tracks preloaded')
    } catch (error) {
      console.error('Preload Error:', error)
    }
  }

  /**
   * Cache löschen
   */
  clearCache(): void {
    musicCache.clear()
    console.log('✅ Music cache cleared')
  }
}

// Singleton Instance
export const musicService = new MusicService()
export default musicService
