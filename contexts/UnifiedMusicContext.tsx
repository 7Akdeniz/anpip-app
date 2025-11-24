// Unified Music Context (FMA + Pixabay)
// Erweiterung des MusicContext um Multi-Source Support

import React, { createContext, useContext, useState, useCallback } from 'react'
import type {
  FMANormalizedTrack,
  UnifiedMusicTrack,
  MusicSource,
} from '../types/fma-music'
import type { PixabayMusicTrack } from '../types/pixabay-music'
import { fmaService } from '../lib/fma-service'
import { musicService } from '../lib/music-service'

interface UnifiedMusicContextType {
  // Source Selection
  activeSource: MusicSource
  setActiveSource: (source: MusicSource) => void
  
  // Favorites (beide Sources)
  fmaFavorites: Set<string>
  pixabayFavorites: Set<number>
  
  // FMA Actions
  addFMAFavorite: (track: FMANormalizedTrack) => Promise<void>
  removeFMAFavorite: (trackId: string) => Promise<void>
  isFMAFavorite: (trackId: string) => boolean
  
  // Pixabay Actions
  addPixabayFavorite: (track: PixabayMusicTrack) => Promise<void>
  removePixabayFavorite: (trackId: number) => Promise<void>
  isPixabayFavorite: (trackId: number) => boolean
  
  // Selection (für Video-Editor)
  selectedTrack: FMANormalizedTrack | PixabayMusicTrack | null
  selectedSource: MusicSource | null
  selectTrack: (track: FMANormalizedTrack | PixabayMusicTrack, source: MusicSource) => void
  clearSelection: () => void
  
  // Attribution Helper
  getAttribution: (track: FMANormalizedTrack | PixabayMusicTrack, source: MusicSource) => string
}

const UnifiedMusicContext = createContext<UnifiedMusicContextType | undefined>(undefined)

export function UnifiedMusicProvider({ children }: { children: React.ReactNode }) {
  const [activeSource, setActiveSource] = useState<MusicSource>('fma')
  const [fmaFavorites, setFMAFavorites] = useState<Set<string>>(new Set())
  const [pixabayFavorites, setPixabayFavorites] = useState<Set<number>>(new Set())
  const [selectedTrack, setSelectedTrack] = useState<FMANormalizedTrack | PixabayMusicTrack | null>(null)
  const [selectedSource, setSelectedSource] = useState<MusicSource | null>(null)

  // Load Favorites
  const loadFavorites = useCallback(async () => {
    try {
      // FMA Favorites
      const fmaFavs = await fmaService.getFavorites()
      setFMAFavorites(new Set(fmaFavs.map(f => f.track_id)))

      // Pixabay Favorites
      const pixabayFavs = await musicService.getFavorites()
      setPixabayFavorites(new Set(pixabayFavs.map(f => f.track_id)))

      console.log(`🎵 Loaded ${fmaFavs.length} FMA favorites, ${pixabayFavs.length} Pixabay favorites`)
    } catch (error) {
      console.error('Load Favorites Error:', error)
    }
  }, [])

  // FMA Favorites
  const addFMAFavorite = useCallback(async (track: FMANormalizedTrack) => {
    try {
      await fmaService.addToFavorites(track)
      setFMAFavorites(prev => new Set(prev).add(track.id))
    } catch (error) {
      console.error('Add FMA Favorite Error:', error)
      throw error
    }
  }, [])

  const removeFMAFavorite = useCallback(async (trackId: string) => {
    try {
      await fmaService.removeFromFavorites(trackId)
      setFMAFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(trackId)
        return newSet
      })
    } catch (error) {
      console.error('Remove FMA Favorite Error:', error)
      throw error
    }
  }, [])

  const isFMAFavorite = useCallback((trackId: string) => {
    return fmaFavorites.has(trackId)
  }, [fmaFavorites])

  // Pixabay Favorites
  const addPixabayFavorite = useCallback(async (track: PixabayMusicTrack) => {
    try {
      await musicService.addToFavorites(track)
      setPixabayFavorites(prev => new Set(prev).add(track.id))
    } catch (error) {
      console.error('Add Pixabay Favorite Error:', error)
      throw error
    }
  }, [])

  const removePixabayFavorite = useCallback(async (trackId: number) => {
    try {
      await musicService.removeFromFavorites(trackId)
      setPixabayFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(trackId)
        return newSet
      })
    } catch (error) {
      console.error('Remove Pixabay Favorite Error:', error)
      throw error
    }
  }, [])

  const isPixabayFavorite = useCallback((trackId: number) => {
    return pixabayFavorites.has(trackId)
  }, [pixabayFavorites])

  // Track Selection
  const selectTrack = useCallback((track: FMANormalizedTrack | PixabayMusicTrack, source: MusicSource) => {
    setSelectedTrack(track)
    setSelectedSource(source)
    console.log(`🎵 Selected ${source} track:`, 'name' in track ? track.name : (track as any).track_title)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTrack(null)
    setSelectedSource(null)
  }, [])

  // Attribution Helper
  const getAttribution = useCallback((track: FMANormalizedTrack | PixabayMusicTrack, source: MusicSource): string => {
    if (source === 'fma') {
      return fmaService.getAttributionText(track as FMANormalizedTrack)
    } else {
      // Pixabay Attribution
      return `Music by ${(track as PixabayMusicTrack).artist} from Pixabay`
    }
  }, [])

  // Initialize
  React.useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const value: UnifiedMusicContextType = {
    activeSource,
    setActiveSource,
    fmaFavorites,
    pixabayFavorites,
    addFMAFavorite,
    removeFMAFavorite,
    isFMAFavorite,
    addPixabayFavorite,
    removePixabayFavorite,
    isPixabayFavorite,
    selectedTrack,
    selectedSource,
    selectTrack,
    clearSelection,
    getAttribution,
  }

  return <UnifiedMusicContext.Provider value={value}>{children}</UnifiedMusicContext.Provider>
}

export function useUnifiedMusic() {
  const context = useContext(UnifiedMusicContext)
  if (!context) {
    throw new Error('useUnifiedMusic must be used within UnifiedMusicProvider')
  }
  return context
}
