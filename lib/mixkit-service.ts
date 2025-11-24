/**
 * MIXKIT MUSIC SERVICE
 * 
 * Service für Mixkit-Musik Funktionen:
 * - Tracks suchen & filtern
 * - Favoriten verwalten
 * - Analytics tracken
 * - Caching
 */

import { supabase } from './supabase'
import type {
  MixkitTrack,
  MixkitFavorite,
  MixkitSearchParams,
  MixkitSearchResult,
  MixkitCategory,
  MixkitNormalizedTrack,
  MixkitAnalytics,
} from '../types/mixkit-music'

class MixkitService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  // ============================================
  // SEARCH & FILTER
  // ============================================

  async searchTracks(params: MixkitSearchParams = {}): Promise<MixkitSearchResult> {
    const {
      query,
      genre,
      mood,
      tags,
      minBpm,
      maxBpm,
      limit = 50,
      offset = 0,
    } = params

    const cacheKey = `search:${JSON.stringify(params)}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .rpc('search_mixkit_tracks', {
          p_query: query || null,
          p_genre: genre || null,
          p_mood: mood || null,
          p_tags: tags || null,
          p_min_bpm: minBpm || null,
          p_max_bpm: maxBpm || null,
          p_limit: limit,
          p_offset: offset,
        })

      if (error) throw error

      const result: MixkitSearchResult = {
        tracks: data || [],
        total: data?.length || 0,
        limit,
        offset,
        hasMore: (data?.length || 0) === limit,
      }

      this.setCache(cacheKey, result)
      return result

    } catch (error) {
      console.error('Mixkit Search Error:', error)
      throw error
    }
  }

  async getTrackById(id: string): Promise<MixkitTrack | null> {
    const cacheKey = `track:${id}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('mixkit_tracks')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single()

      if (error) throw error

      this.setCache(cacheKey, data)
      return data as MixkitTrack

    } catch (error) {
      console.error('Get Track Error:', error)
      return null
    }
  }

  async getAllTracks(limit = 100, offset = 0): Promise<MixkitTrack[]> {
    try {
      const { data, error } = await supabase
        .from('mixkit_tracks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error
      return (data || []) as MixkitTrack[]

    } catch (error) {
      console.error('Get All Tracks Error:', error)
      return []
    }
  }

  // ============================================
  // CATEGORIES & GENRES
  // ============================================

  async getGenres(): Promise<MixkitCategory[]> {
    const cacheKey = 'genres'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('mixkit_tracks')
        .select('genre')
        .eq('status', 'active')

      if (error) throw error

      // Count by genre
      const genreMap = new Map<string, number>()
      data?.forEach((row) => {
        const count = genreMap.get(row.genre) || 0
        genreMap.set(row.genre, count + 1)
      })

      const genres: MixkitCategory[] = Array.from(genreMap.entries()).map(
        ([genre, count]) => ({
          id: genre,
          name: genre.charAt(0).toUpperCase() + genre.slice(1),
          slug: genre,
          count,
        })
      )

      this.setCache(cacheKey, genres)
      return genres

    } catch (error) {
      console.error('Get Genres Error:', error)
      return []
    }
  }

  async getMoods(): Promise<MixkitCategory[]> {
    const cacheKey = 'moods'
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('mixkit_tracks')
        .select('mood')
        .eq('status', 'active')
        .not('mood', 'is', null)

      if (error) throw error

      const moodMap = new Map<string, number>()
      data?.forEach((row) => {
        if (row.mood) {
          const count = moodMap.get(row.mood) || 0
          moodMap.set(row.mood, count + 1)
        }
      })

      const moods: MixkitCategory[] = Array.from(moodMap.entries()).map(
        ([mood, count]) => ({
          id: mood,
          name: mood.charAt(0).toUpperCase() + mood.slice(1),
          slug: mood,
          count,
        })
      )

      this.setCache(cacheKey, moods)
      return moods

    } catch (error) {
      console.error('Get Moods Error:', error)
      return []
    }
  }

  // ============================================
  // FAVORITES
  // ============================================

  async getFavorites(userId?: string): Promise<MixkitTrack[]> {
    try {
      let query = supabase
        .from('user_mixkit_favorites')
        .select(`
          track_id,
          created_at,
          mixkit_tracks (*)
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      return (
        data?.map((fav: any) => fav.mixkit_tracks).filter(Boolean) || []
      ) as MixkitTrack[]

    } catch (error) {
      console.error('Get Favorites Error:', error)
      return []
    }
  }

  async addToFavorites(track: MixkitTrack): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('user_mixkit_favorites').insert({
        user_id: user.id,
        track_id: track.id,
      })

      if (error && error.code !== '23505') {
        // Ignore duplicate key error
        throw error
      }

      console.log(`✅ Added to favorites: ${track.title}`)
    } catch (error) {
      console.error('Add Favorite Error:', error)
      throw error
    }
  }

  async removeFromFavorites(trackId: string): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('user_mixkit_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('track_id', trackId)

      if (error) throw error

      console.log(`✅ Removed from favorites: ${trackId}`)
    } catch (error) {
      console.error('Remove Favorite Error:', error)
      throw error
    }
  }

  async isFavorite(trackId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error } = await supabase
        .from('user_mixkit_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('track_id', trackId)
        .single()

      if (error) return false
      return !!data

    } catch (error) {
      return false
    }
  }

  // ============================================
  // POPULAR & TRENDING
  // ============================================

  async getPopularTracks(limit = 20, days = 30): Promise<MixkitTrack[]> {
    const cacheKey = `popular:${limit}:${days}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase.rpc('get_popular_mixkit_tracks', {
        p_limit: limit,
        p_days: days,
      })

      if (error) throw error

      // Get full track data
      const trackIds = data?.map((t: any) => t.id) || []
      if (trackIds.length === 0) return []

      const { data: tracks, error: tracksError } = await supabase
        .from('mixkit_tracks')
        .select('*')
        .in('id', trackIds)

      if (tracksError) throw tracksError

      this.setCache(cacheKey, tracks || [])
      return (tracks || []) as MixkitTrack[]

    } catch (error) {
      console.error('Get Popular Tracks Error:', error)
      return []
    }
  }

  async getRecentlyAdded(limit = 20): Promise<MixkitTrack[]> {
    const cacheKey = `recent:${limit}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('mixkit_tracks')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error

      this.setCache(cacheKey, data || [])
      return (data || []) as MixkitTrack[]

    } catch (error) {
      console.error('Get Recently Added Error:', error)
      return []
    }
  }

  // ============================================
  // ANALYTICS
  // ============================================

  async trackAction(
    trackId: string,
    action: MixkitAnalytics['action'],
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const { error } = await supabase.from('mixkit_track_analytics').insert({
        track_id: trackId,
        user_id: user?.id || null,
        action,
        source: 'app',
        metadata: metadata || {},
      })

      if (error) throw error

      // Update play count if action is 'play'
      if (action === 'play') {
        await supabase.rpc('increment_mixkit_play_count', {
          p_track_id: trackId,
        })
      }

    } catch (error) {
      console.error('Track Action Error:', error)
      // Don't throw - analytics shouldn't block user actions
    }
  }

  // ============================================
  // NORMALIZATION (for Unified Music Context)
  // ============================================

  normalizeTrack(track: MixkitTrack): MixkitNormalizedTrack {
    return {
      id: track.id,
      title: track.title,
      artist: track.artist || 'Mixkit',
      duration: track.duration_seconds,
      url: track.cdn_url || track.storage_url,
      preview_url: track.cdn_url || track.storage_url,
      genre: track.genre,
      mood: track.mood,
      bpm: track.bpm,
      license: {
        name: track.license,
        url: track.license_url,
        attribution_required: track.attribution_required,
        commercial_use: track.commercial_use_allowed,
      },
      source: 'mixkit',
    }
  }

  // ============================================
  // CACHE MANAGEMENT
  // ============================================

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > this.CACHE_TTL
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clearCache(): void {
    this.cache.clear()
  }
}

export const mixkitService = new MixkitService()
