// Free Music Archive (FMA) Service
// Zentrale Service-Schicht für alle FMA Music API Calls
// Kompatibel mit bestehendem MusicContext und Pixabay-Service

import { supabase } from './supabase'
import type {
  FMANormalizedTrack,
  FMASearchResponse,
  FMASearchParams,
  UnifiedMusicTrack,
  UnifiedMusicResponse,
  UserFMAFavorite,
  FMA_LICENSES,
} from '../types/fma-music'

const FMA_API_ENDPOINT = process.env.EXPO_PUBLIC_SUPABASE_URL + '/functions/v1/fma-music'

// In-Memory Cache für Client-seitige Performance
const fmaCache = new Map<string, { data: FMASearchResponse; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 Minuten

class FMAService {
  private getCacheKey(params: FMASearchParams): string {
    return `fma:${JSON.stringify(params)}`
  }

  private getCachedData(key: string): FMASearchResponse | null {
    const cached = fmaCache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > CACHE_TTL) {
      fmaCache.delete(key)
      return null
    }

    console.log('🎵 FMA Cache Hit (Client):', key)
    return cached.data
  }

  private setCachedData(key: string, data: FMASearchResponse): void {
    fmaCache.set(key, { data, timestamp: Date.now() })
  }

  /**
   * Musik suchen mit umfangreichen Filtern
   */
  async searchMusic(params: FMASearchParams = {}): Promise<FMASearchResponse> {
    try {
      const cacheKey = this.getCacheKey(params)
      const cached = this.getCachedData(cacheKey)
      if (cached) {
        return cached
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const queryParams = new URLSearchParams({
        action: 'search',
        ...Object.fromEntries(
          Object.entries(params)
            .filter(([_, v]) => v !== undefined && v !== null && v !== '')
            .map(([k, v]) => [k, String(v)])
        ),
      })

      const response = await fetch(`${FMA_API_ENDPOINT}?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to search FMA music')
      }

      const data: FMASearchResponse = await response.json()
      
      // Cache speichern
      this.setCachedData(cacheKey, data)

      console.log(`🎵 FMA Search - Found ${data.totalHits} tracks`)
      return data
    } catch (error) {
      console.error('FMA Search Error:', error)
      throw error
    }
  }

  /**
   * Einzelnen Track abrufen
   */
  async getTrack(trackId: string): Promise<FMANormalizedTrack> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${FMA_API_ENDPOINT}?action=get_track&track_id=${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Track not found')
      }

      const track = await response.json()
      console.log('🎵 FMA Track fetched:', track.name)
      return track
    } catch (error) {
      console.error('Get FMA Track Error:', error)
      throw error
    }
  }

  /**
   * Nach Genre suchen
   */
  async searchByGenre(genre: string, page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      genre,
      page,
      per_page: 20,
      sort: 'track_interest',
      order: 'desc',
    })
  }

  /**
   * Nach Tag/Mood suchen
   */
  async searchByTag(tag: string, page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      tag,
      page,
      per_page: 20,
      sort: 'track_interest',
      order: 'desc',
    })
  }

  /**
   * Nach Artist suchen
   */
  async searchByArtist(artist: string, page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      artist,
      page,
      per_page: 20,
      sort: 'track_date_created',
      order: 'desc',
    })
  }

  /**
   * Trending/Popular Musik (basierend auf Listens & Interest)
   */
  async getTrendingMusic(page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      page,
      per_page: 20,
      sort: 'track_interest',
      order: 'desc',
    })
  }

  /**
   * Neueste Musik
   */
  async getLatestMusic(page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      page,
      per_page: 20,
      sort: 'track_date_created',
      order: 'desc',
    })
  }

  /**
   * Musik nach Lizenz filtern (wichtig für kommerzielle Nutzung!)
   */
  async searchByLicense(license: string, page = 1): Promise<FMASearchResponse> {
    return this.searchMusic({
      license,
      page,
      per_page: 20,
      sort: 'track_interest',
      order: 'desc',
    })
  }

  /**
   * Nur kommerzielle Lizenzen (CC BY, CC BY-SA)
   */
  async getCommercialMusic(page = 1): Promise<FMASearchResponse> {
    // FMA API unterstützt nur eine Lizenz per Request, daher mehrfache Calls
    const ccBy = await this.searchByLicense('cc-by', page)
    const ccBySa = await this.searchByLicense('cc-by-sa', page)
    
    // Merge results
    return {
      total: ccBy.total + ccBySa.total,
      totalHits: ccBy.totalHits + ccBySa.totalHits,
      tracks: [...ccBy.tracks, ...ccBySa.tracks].slice(0, 20),
      page,
      per_page: 20,
      source: 'fma',
    }
  }

  /**
   * Genres abrufen
   */
  async getGenres(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${FMA_API_ENDPOINT}?action=get_genres`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get genres')
      }

      return await response.json()
    } catch (error) {
      console.error('Get FMA Genres Error:', error)
      throw error
    }
  }

  /**
   * Favoriten-Management
   */
  async addToFavorites(track: FMANormalizedTrack): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('user_fma_favorites').insert({
        user_id: user.id,
        track_id: track.id,
        track_data: track,
      })

      if (error) throw error
      console.log('✅ FMA Track added to favorites:', track.name)
    } catch (error) {
      console.error('Add to FMA Favorites Error:', error)
      throw error
    }
  }

  async removeFromFavorites(trackId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_fma_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId)

      if (error) throw error
      console.log('❌ FMA Track removed from favorites')
    } catch (error) {
      console.error('Remove from FMA Favorites Error:', error)
      throw error
    }
  }

  async getFavorites(): Promise<UserFMAFavorite[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('user_fma_favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Get FMA Favorites Error:', error)
      throw error
    }
  }

  /**
   * Lizenz-Info für Track abrufen
   */
  getLicenseInfo(track: FMANormalizedTrack): {
    title: string
    url: string
    commercial: boolean
    attribution: boolean
  } {
    const licenseMap: Record<string, any> = {
      'CC BY': { commercial: true, attribution: true },
      'CC BY-SA': { commercial: true, attribution: true },
      'CC BY-NC': { commercial: false, attribution: true },
      'CC BY-NC-SA': { commercial: false, attribution: true },
      'CC BY-ND': { commercial: true, attribution: true },
      'CC BY-NC-ND': { commercial: false, attribution: true },
    }

    const license = licenseMap[track.license_title] || { commercial: false, attribution: true }

    return {
      title: track.license_title,
      url: track.license_url,
      commercial: license.commercial,
      attribution: license.attribution,
    }
  }

  /**
   * Attribution-Text generieren (wichtig für Legal Compliance!)
   */
  getAttributionText(track: FMANormalizedTrack): string {
    return `"${track.name}" by ${track.artist} (${track.license_title}) - freemusicarchive.org`
  }

  /**
   * Prüfen ob Track kommerziell nutzbar ist
   */
  isCommercialUse(track: FMANormalizedTrack): boolean {
    const license = this.getLicenseInfo(track)
    return license.commercial
  }

  /**
   * Track-Metadaten für Video-Upload vorbereiten
   */
  prepareTrackMetadata(track: FMANormalizedTrack): {
    track_id: string
    track_name: string
    artist_name: string
    license: string
    attribution: string
    source: 'fma'
  } {
    return {
      track_id: track.id,
      track_name: track.name,
      artist_name: track.artist,
      license: track.license_title,
      attribution: this.getAttributionText(track),
      source: 'fma',
    }
  }

  /**
   * Konvertiere FMA Track zu Unified Format (für Multi-Source Support)
   */
  toUnifiedTrack(track: FMANormalizedTrack): UnifiedMusicTrack {
    const license = this.getLicenseInfo(track)
    
    return {
      id: track.id,
      name: track.name,
      artist: track.artist,
      genre: track.genre,
      tags: track.tags,
      duration: track.duration,
      tempo: track.tempo,
      audioUrl: track.audioUrl,
      downloadUrl: track.downloadUrl,
      previewUrl: track.previewUrl,
      thumbnail: track.thumbnail,
      userImageUrl: track.userImageUrl,
      pageUrl: track.pageUrl,
      source: 'fma',
      license,
      metadata: {
        listens: track.track_listens,
        favorites: track.track_favorites,
        date_published: track.track_date_published,
      },
    }
  }

  /**
   * Preload nächste Tracks für bessere Performance
   */
  async preloadTracks(tracks: FMANormalizedTrack[], currentIndex: number, preloadCount = 3): Promise<void> {
    const nextTracks = tracks.slice(currentIndex + 1, currentIndex + 1 + preloadCount)
    
    console.log(`🎵 FMA Preloading ${nextTracks.length} tracks...`)
    
    // Preload Audio (nur URLs vorbereiten, kein Download)
    nextTracks.forEach((track, index) => {
      if (track.audioUrl) {
        // Hint für Browser-Preload
        const link = document.createElement('link')
        link.rel = 'prefetch'
        link.href = track.audioUrl
        link.as = 'audio'
        document.head.appendChild(link)
        
        console.log(`  ✓ Preloaded track ${currentIndex + index + 2}: ${track.name}`)
      }
    })
  }

  /**
   * Cache löschen
   */
  clearCache(): void {
    fmaCache.clear()
    console.log('🗑️ FMA Cache cleared')
  }

  /**
   * Cache-Statistiken
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: fmaCache.size,
      keys: Array.from(fmaCache.keys()),
    }
  }
}

export const fmaService = new FMAService()
