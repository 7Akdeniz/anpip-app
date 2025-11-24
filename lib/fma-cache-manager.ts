// FMA Music Cache Manager
// Intelligentes Caching, Preloading und Offline-Support

import AsyncStorage from '@react-native-async-storage/async-storage'
import type {
  FMANormalizedTrack,
  FMASearchResponse,
  FMACacheEntry,
  FMAPreloadQueue,
} from '../types/fma-music'

const CACHE_PREFIX = 'fma_cache:'
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 Stunden
const MAX_CACHE_SIZE = 100 // Max gecachte Searches
const PRELOAD_COUNT = 10 // Anzahl vorgeladener Tracks

class FMACacheManager {
  private memoryCache = new Map<string, FMACacheEntry>()
  private preloadQueue: FMAPreloadQueue = {
    tracks: [],
    currentIndex: 0,
    preloadCount: PRELOAD_COUNT,
    status: 'idle',
  }

  // ==================== MEMORY CACHE ====================

  /**
   * Get from Memory Cache
   */
  getMemoryCache(key: string): FMASearchResponse | null {
    const entry = this.memoryCache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > entry.ttl) {
      this.memoryCache.delete(key)
      return null
    }

    console.log('🎵 FMA Memory Cache Hit:', key)
    return entry.data
  }

  /**
   * Set Memory Cache
   */
  setMemoryCache(key: string, data: FMASearchResponse, ttl = CACHE_TTL): void {
    const entry: FMACacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
    }

    this.memoryCache.set(key, entry)

    // Limit cache size
    if (this.memoryCache.size > MAX_CACHE_SIZE) {
      const firstKey = this.memoryCache.keys().next().value
      if (firstKey) {
        this.memoryCache.delete(firstKey)
      }
    }

    console.log('💾 FMA Memory Cache Set:', key)
  }

  /**
   * Clear Memory Cache
   */
  clearMemoryCache(): void {
    this.memoryCache.clear()
    console.log('🗑️ FMA Memory Cache Cleared')
  }

  // ==================== PERSISTENT CACHE (AsyncStorage) ====================

  /**
   * Get from Persistent Cache
   */
  async getPersistentCache(key: string): Promise<FMASearchResponse | null> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`
      const cached = await AsyncStorage.getItem(cacheKey)
      
      if (!cached) return null

      const entry: FMACacheEntry = JSON.parse(cached)
      const now = Date.now()

      if (now - entry.timestamp > entry.ttl) {
        await AsyncStorage.removeItem(cacheKey)
        return null
      }

      console.log('💾 FMA Persistent Cache Hit:', key)
      return entry.data
    } catch (error) {
      console.error('Persistent Cache Get Error:', error)
      return null
    }
  }

  /**
   * Set Persistent Cache
   */
  async setPersistentCache(key: string, data: FMASearchResponse, ttl = CACHE_TTL): Promise<void> {
    try {
      const cacheKey = `${CACHE_PREFIX}${key}`
      const entry: FMACacheEntry = {
        key,
        data,
        timestamp: Date.now(),
        ttl,
      }

      await AsyncStorage.setItem(cacheKey, JSON.stringify(entry))
      console.log('💾 FMA Persistent Cache Set:', key)
    } catch (error) {
      console.error('Persistent Cache Set Error:', error)
    }
  }

  /**
   * Clear Persistent Cache
   */
  async clearPersistentCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const fmaKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
      await AsyncStorage.multiRemove(fmaKeys)
      console.log(`🗑️ FMA Persistent Cache Cleared (${fmaKeys.length} items)`)
    } catch (error) {
      console.error('Clear Persistent Cache Error:', error)
    }
  }

  /**
   * Get Cache Stats
   */
  async getCacheStats(): Promise<{
    memorySize: number
    persistentSize: number
    totalSize: number
  }> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const fmaKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))

      return {
        memorySize: this.memoryCache.size,
        persistentSize: fmaKeys.length,
        totalSize: this.memoryCache.size + fmaKeys.length,
      }
    } catch (error) {
      console.error('Get Cache Stats Error:', error)
      return { memorySize: 0, persistentSize: 0, totalSize: 0 }
    }
  }

  // ==================== PRELOADING ====================

  /**
   * Initialize Preload Queue
   */
  initPreloadQueue(tracks: FMANormalizedTrack[], currentIndex = 0): void {
    this.preloadQueue = {
      tracks,
      currentIndex,
      preloadCount: PRELOAD_COUNT,
      status: 'idle',
    }
    console.log(`🎵 FMA Preload Queue initialized with ${tracks.length} tracks`)
  }

  /**
   * Preload Next Tracks
   */
  async preloadNext(count = PRELOAD_COUNT): Promise<void> {
    if (this.preloadQueue.status === 'loading') {
      console.log('⏳ Preload already in progress')
      return
    }

    const { tracks, currentIndex } = this.preloadQueue
    const nextTracks = tracks.slice(currentIndex + 1, currentIndex + 1 + count)

    if (nextTracks.length === 0) {
      console.log('✅ No more tracks to preload')
      return
    }

    try {
      this.preloadQueue.status = 'loading'
      console.log(`🎵 Preloading ${nextTracks.length} tracks...`)

      // Preload Audio URLs (nur Prefetch-Hints, kein Download)
      if (typeof document !== 'undefined') {
        nextTracks.forEach((track, index) => {
          if (track.audioUrl) {
            const link = document.createElement('link')
            link.rel = 'prefetch'
            link.href = track.audioUrl
            link.as = 'audio'
            document.head.appendChild(link)
            
            console.log(`  ✓ Prefetched track ${currentIndex + index + 2}: ${track.name}`)
          }
        })
      }

      this.preloadQueue.status = 'ready'
      console.log('✅ Preload completed')
    } catch (error) {
      console.error('Preload Error:', error)
      this.preloadQueue.status = 'error'
    }
  }

  /**
   * Update Current Track Index
   */
  updatePreloadIndex(index: number): void {
    this.preloadQueue.currentIndex = index
    
    // Auto-preload next batch
    const remaining = this.preloadQueue.tracks.length - index - 1
    if (remaining > 0 && remaining <= this.preloadQueue.preloadCount / 2) {
      this.preloadNext()
    }
  }

  // ==================== OFFLINE SUPPORT ====================

  /**
   * Download Track for Offline Use
   */
  async downloadTrackOffline(track: FMANormalizedTrack): Promise<void> {
    try {
      console.log('📥 Downloading track for offline:', track.name)
      
      // Store track metadata
      const offlineKey = `${CACHE_PREFIX}offline:${track.id}`
      await AsyncStorage.setItem(offlineKey, JSON.stringify(track))

      // Note: Actual audio download würde FileSystem.downloadAsync benötigen
      // Dies ist nur Metadaten-Speicherung für Demo
      
      console.log('✅ Track metadata saved for offline')
    } catch (error) {
      console.error('Download Offline Error:', error)
      throw error
    }
  }

  /**
   * Get Offline Tracks
   */
  async getOfflineTracks(): Promise<FMANormalizedTrack[]> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const offlineKeys = keys.filter(k => k.includes('offline:'))
      
      const tracks: FMANormalizedTrack[] = []
      for (const key of offlineKeys) {
        const data = await AsyncStorage.getItem(key)
        if (data) {
          tracks.push(JSON.parse(data))
        }
      }

      console.log(`📥 Found ${tracks.length} offline tracks`)
      return tracks
    } catch (error) {
      console.error('Get Offline Tracks Error:', error)
      return []
    }
  }

  /**
   * Remove Offline Track
   */
  async removeOfflineTrack(trackId: string): Promise<void> {
    try {
      const offlineKey = `${CACHE_PREFIX}offline:${trackId}`
      await AsyncStorage.removeItem(offlineKey)
      console.log('🗑️ Offline track removed:', trackId)
    } catch (error) {
      console.error('Remove Offline Track Error:', error)
    }
  }

  // ==================== UTILITY ====================

  /**
   * Clear All Caches
   */
  async clearAll(): Promise<void> {
    this.clearMemoryCache()
    await this.clearPersistentCache()
    this.preloadQueue = {
      tracks: [],
      currentIndex: 0,
      preloadCount: PRELOAD_COUNT,
      status: 'idle',
    }
    console.log('🗑️ All FMA caches cleared')
  }

  /**
   * Get Storage Size (estimated)
   */
  async getStorageSize(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const fmaKeys = keys.filter(k => k.startsWith(CACHE_PREFIX))
      
      let totalSize = 0
      for (const key of fmaKeys) {
        const value = await AsyncStorage.getItem(key)
        if (value) {
          totalSize += value.length
        }
      }

      return totalSize // bytes
    } catch (error) {
      console.error('Get Storage Size Error:', error)
      return 0
    }
  }
}

export const fmaCacheManager = new FMACacheManager()
