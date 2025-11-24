// Music Cache Manager
// Advanced Caching, Preloading und Performance-Optimierung

import AsyncStorage from '@react-native-async-storage/async-storage'
import type { PixabayMusicTrack, PixabayMusicResponse } from '../types/pixabay-music'

const CACHE_PREFIX = 'music_cache_'
const FAVORITES_CACHE_KEY = 'music_favorites_cache'
const PRELOAD_CACHE_KEY = 'music_preload_cache'
const CACHE_VERSION = 'v1'
const MAX_CACHE_SIZE = 50 // Max items in cache
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

interface CacheItem {
  data: any
  timestamp: number
  version: string
}

class MusicCacheManager {
  private memoryCache = new Map<string, CacheItem>()

  /**
   * Generate Cache Key
   */
  private getCacheKey(key: string): string {
    return `${CACHE_PREFIX}${key}_${CACHE_VERSION}`
  }

  /**
   * Check if cache is valid
   */
  private isCacheValid(item: CacheItem): boolean {
    const now = Date.now()
    const age = now - item.timestamp
    return age < CACHE_EXPIRY && item.version === CACHE_VERSION
  }

  /**
   * Get from Memory Cache
   */
  private getFromMemory(key: string): any | null {
    const cached = this.memoryCache.get(key)
    if (!cached) return null

    if (!this.isCacheValid(cached)) {
      this.memoryCache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set to Memory Cache
   */
  private setToMemory(key: string, data: any): void {
    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    })

    // Limit cache size
    if (this.memoryCache.size > MAX_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }
  }

  /**
   * Get from Persistent Storage
   */
  async getFromStorage(key: string): Promise<any | null> {
    try {
      const cacheKey = this.getCacheKey(key)
      const cached = await AsyncStorage.getItem(cacheKey)
      if (!cached) return null

      const item: CacheItem = JSON.parse(cached)
      if (!this.isCacheValid(item)) {
        await AsyncStorage.removeItem(cacheKey)
        return null
      }

      // Also set to memory cache
      this.setToMemory(key, item.data)

      return item.data
    } catch (error) {
      console.error('Storage Get Error:', error)
      return null
    }
  }

  /**
   * Set to Persistent Storage
   */
  async setToStorage(key: string, data: any): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(key)
      const item: CacheItem = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(item))
      this.setToMemory(key, data)
    } catch (error) {
      console.error('Storage Set Error:', error)
    }
  }

  /**
   * Get with auto-fallback (Memory -> Storage)
   */
  async get(key: string): Promise<any | null> {
    // Try memory first
    const memoryData = this.getFromMemory(key)
    if (memoryData) return memoryData

    // Fallback to storage
    return await this.getFromStorage(key)
  }

  /**
   * Set with dual write (Memory + Storage)
   */
  async set(key: string, data: any): Promise<void> {
    this.setToMemory(key, data)
    await this.setToStorage(key, data)
  }

  /**
   * Remove from cache
   */
  async remove(key: string): Promise<void> {
    this.memoryCache.delete(key)
    const cacheKey = this.getCacheKey(key)
    await AsyncStorage.removeItem(cacheKey)
  }

  /**
   * Clear all music cache
   */
  async clearAll(): Promise<void> {
    this.memoryCache.clear()
    
    try {
      const keys = await AsyncStorage.getAllKeys()
      const musicKeys = keys.filter(key => key.startsWith(CACHE_PREFIX))
      await AsyncStorage.multiRemove(musicKeys)
      console.log('✅ Music cache cleared')
    } catch (error) {
      console.error('Clear Cache Error:', error)
    }
  }

  /**
   * Preload Popular Tracks
   */
  async preloadPopularTracks(tracks: PixabayMusicTrack[]): Promise<void> {
    try {
      // Cache track data
      await this.set(PRELOAD_CACHE_KEY, tracks)

      // Preload audio files (first 5)
      const preloadPromises = tracks.slice(0, 5).map(async (track) => {
        try {
          // Create audio element to trigger browser cache
          if (typeof window !== 'undefined' && window.Audio) {
            const audio = new Audio()
            audio.preload = 'auto'
            audio.src = track.previewUrl || track.audioUrl
            await audio.load()
          }
        } catch (err) {
          console.warn('Preload track failed:', track.name)
        }
      })

      await Promise.allSettled(preloadPromises)
      console.log('✅ Popular tracks preloaded')
    } catch (error) {
      console.error('Preload Error:', error)
    }
  }

  /**
   * Get Preloaded Tracks
   */
  async getPreloadedTracks(): Promise<PixabayMusicTrack[] | null> {
    return await this.get(PRELOAD_CACHE_KEY)
  }

  /**
   * Cache Search Results
   */
  async cacheSearchResults(query: string, results: PixabayMusicResponse): Promise<void> {
    const key = `search_${query}`
    await this.set(key, results)
  }

  /**
   * Get Cached Search Results
   */
  async getCachedSearchResults(query: string): Promise<PixabayMusicResponse | null> {
    const key = `search_${query}`
    return await this.get(key)
  }

  /**
   * Cache Genre Results
   */
  async cacheGenreResults(genre: string, results: PixabayMusicResponse): Promise<void> {
    const key = `genre_${genre}`
    await this.set(key, results)
  }

  /**
   * Get Cached Genre Results
   */
  async getCachedGenreResults(genre: string): Promise<PixabayMusicResponse | null> {
    const key = `genre_${genre}`
    return await this.get(key)
  }

  /**
   * Cache Favorites
   */
  async cacheFavorites(favorites: any[]): Promise<void> {
    await this.set(FAVORITES_CACHE_KEY, favorites)
  }

  /**
   * Get Cached Favorites
   */
  async getCachedFavorites(): Promise<any[] | null> {
    return await this.get(FAVORITES_CACHE_KEY)
  }

  /**
   * Get Cache Stats
   */
  getCacheStats(): { memorySize: number; keys: string[] } {
    return {
      memorySize: this.memoryCache.size,
      keys: Array.from(this.memoryCache.keys()),
    }
  }

  /**
   * Warm Up Cache (für App Start)
   */
  async warmUpCache(): Promise<void> {
    try {
      // Load favorites into memory
      const favorites = await this.getFromStorage(FAVORITES_CACHE_KEY)
      if (favorites) {
        this.setToMemory(FAVORITES_CACHE_KEY, favorites)
      }

      // Load preloaded tracks into memory
      const preloaded = await this.getFromStorage(PRELOAD_CACHE_KEY)
      if (preloaded) {
        this.setToMemory(PRELOAD_CACHE_KEY, preloaded)
      }

      console.log('✅ Cache warmed up')
    } catch (error) {
      console.error('Warm Up Error:', error)
    }
  }
}

// Singleton Instance
export const musicCacheManager = new MusicCacheManager()
export default musicCacheManager
