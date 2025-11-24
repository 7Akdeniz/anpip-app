// Music Context
// Globales State-Management für Musik-Player, Favoriten und Auswahl

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { Audio } from 'expo-av'
import { Platform } from 'react-native'
import type {
  PixabayMusicTrack,
  MusicPlayerState,
  MusicSelectionState,
  UserMusicFavorite,
} from '../types/pixabay-music'
import { musicService } from '../lib/music-service'

interface MusicContextType {
  // Player State
  playerState: MusicPlayerState
  playTrack: (track: PixabayMusicTrack) => Promise<void>
  pauseTrack: () => Promise<void>
  resumeTrack: () => Promise<void>
  stopTrack: () => Promise<void>
  seekTo: (position: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  toggleMute: () => Promise<void>

  // Selection State (für Video-Editor)
  selectionState: MusicSelectionState
  selectTrack: (track: PixabayMusicTrack, mode: 'editor' | 'background' | 'preview') => void
  clearSelection: () => void

  // Favorites
  favorites: UserMusicFavorite[]
  addToFavorites: (track: PixabayMusicTrack) => Promise<void>
  removeFromFavorites: (trackId: number) => Promise<void>
  isFavorite: (trackId: number) => boolean
  loadFavorites: () => Promise<void>
}

const MusicContext = createContext<MusicContextType | undefined>(undefined)

export function MusicProvider({ children }: { children: React.ReactNode }) {
  // Player State
  const [playerState, setPlayerState] = useState<MusicPlayerState>({
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
  })

  // Selection State
  const [selectionState, setSelectionState] = useState<MusicSelectionState>({
    selectedTrack: null,
    selectionMode: null,
  })

  // Favorites
  const [favorites, setFavorites] = useState<UserMusicFavorite[]>([])

  // Audio Instance (nur Native)
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  
  // Web Audio (nur Web)
  const [webAudio, setWebAudio] = useState<HTMLAudioElement | null>(null)

  // Audio Setup
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      })
    }

    return () => {
      // Cleanup
      if (sound) {
        sound.unloadAsync()
      }
      if (webAudio) {
        webAudio.pause()
        webAudio.src = ''
      }
    }
  }, [])

  // Play Track
  const playTrack = useCallback(async (track: PixabayMusicTrack) => {
    try {
      setPlayerState(prev => ({ ...prev, isLoading: true }))

      // Stop current track
      if (sound) {
        await sound.unloadAsync()
      }
      if (webAudio) {
        webAudio.pause()
        webAudio.src = ''
      }

      if (Platform.OS === 'web') {
        // Web Audio
        const audio = new window.Audio(track.audioUrl)
        audio.volume = playerState.volume
        audio.muted = playerState.isMuted

        audio.addEventListener('loadedmetadata', () => {
          setPlayerState(prev => ({
            ...prev,
            currentTrack: track,
            duration: audio.duration,
            isLoading: false,
          }))
        })

        audio.addEventListener('timeupdate', () => {
          setPlayerState(prev => ({
            ...prev,
            progress: audio.currentTime / audio.duration,
          }))
        })

        audio.addEventListener('ended', () => {
          setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            progress: 0,
          }))
        })

        audio.addEventListener('error', (e) => {
          console.error('Web Audio Error:', e)
          setPlayerState(prev => ({
            ...prev,
            isLoading: false,
            isPlaying: false,
          }))
        })

        await audio.play()
        setWebAudio(audio)

        setPlayerState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: true,
          isLoading: false,
        }))
      } else {
        // Native Audio (Expo AV)
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.audioUrl },
          { shouldPlay: true, volume: playerState.volume, isMuted: playerState.isMuted }
        )

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded) {
            setPlayerState(prev => ({
              ...prev,
              isPlaying: status.isPlaying,
              progress: status.positionMillis / status.durationMillis,
              duration: status.durationMillis / 1000,
            }))

            if (status.didJustFinish) {
              setPlayerState(prev => ({
                ...prev,
                isPlaying: false,
                progress: 0,
              }))
            }
          }
        })

        setSound(newSound)
        setPlayerState(prev => ({
          ...prev,
          currentTrack: track,
          isPlaying: true,
          isLoading: false,
        }))
      }

      console.log('🎵 Playing:', track.name)
    } catch (error) {
      console.error('Play Track Error:', error)
      setPlayerState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
      }))
    }
  }, [sound, webAudio, playerState.volume, playerState.isMuted])

  // Pause Track
  const pauseTrack = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && webAudio) {
        webAudio.pause()
      } else if (sound) {
        await sound.pauseAsync()
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false }))
    } catch (error) {
      console.error('Pause Error:', error)
    }
  }, [sound, webAudio])

  // Resume Track
  const resumeTrack = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && webAudio) {
        await webAudio.play()
      } else if (sound) {
        await sound.playAsync()
      }
      setPlayerState(prev => ({ ...prev, isPlaying: true }))
    } catch (error) {
      console.error('Resume Error:', error)
    }
  }, [sound, webAudio])

  // Stop Track
  const stopTrack = useCallback(async () => {
    try {
      if (Platform.OS === 'web' && webAudio) {
        webAudio.pause()
        webAudio.currentTime = 0
      } else if (sound) {
        await sound.stopAsync()
      }
      setPlayerState(prev => ({
        ...prev,
        isPlaying: false,
        progress: 0,
      }))
    } catch (error) {
      console.error('Stop Error:', error)
    }
  }, [sound, webAudio])

  // Seek To Position
  const seekTo = useCallback(async (position: number) => {
    try {
      if (Platform.OS === 'web' && webAudio) {
        webAudio.currentTime = position * webAudio.duration
      } else if (sound) {
        await sound.setPositionAsync(position * playerState.duration * 1000)
      }
    } catch (error) {
      console.error('Seek Error:', error)
    }
  }, [sound, webAudio, playerState.duration])

  // Set Volume
  const setVolume = useCallback(async (volume: number) => {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume))
      if (Platform.OS === 'web' && webAudio) {
        webAudio.volume = clampedVolume
      } else if (sound) {
        await sound.setVolumeAsync(clampedVolume)
      }
      setPlayerState(prev => ({ ...prev, volume: clampedVolume }))
    } catch (error) {
      console.error('Set Volume Error:', error)
    }
  }, [sound, webAudio])

  // Toggle Mute
  const toggleMute = useCallback(async () => {
    try {
      const newMuted = !playerState.isMuted
      if (Platform.OS === 'web' && webAudio) {
        webAudio.muted = newMuted
      } else if (sound) {
        await sound.setIsMutedAsync(newMuted)
      }
      setPlayerState(prev => ({ ...prev, isMuted: newMuted }))
    } catch (error) {
      console.error('Toggle Mute Error:', error)
    }
  }, [sound, webAudio, playerState.isMuted])

  // Select Track (für Video-Editor)
  const selectTrack = useCallback(
    (track: PixabayMusicTrack, mode: 'editor' | 'background' | 'preview') => {
      setSelectionState({
        selectedTrack: track,
        selectionMode: mode,
      })
      console.log('🎵 Track selected for:', mode, track.name)
    },
    []
  )

  // Clear Selection
  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedTrack: null,
      selectionMode: null,
    })
  }, [])

  // Favorites Management
  const loadFavorites = useCallback(async () => {
    try {
      const favs = await musicService.getFavorites()
      setFavorites(favs)
      console.log(`🎵 Loaded ${favs.length} favorites`)
    } catch (error) {
      console.error('Load Favorites Error:', error)
    }
  }, [])

  const addToFavorites = useCallback(async (track: PixabayMusicTrack) => {
    try {
      await musicService.addToFavorites(track)
      await loadFavorites()
    } catch (error) {
      console.error('Add Favorite Error:', error)
      throw error
    }
  }, [loadFavorites])

  const removeFromFavorites = useCallback(async (trackId: number) => {
    try {
      await musicService.removeFromFavorites(trackId)
      await loadFavorites()
    } catch (error) {
      console.error('Remove Favorite Error:', error)
      throw error
    }
  }, [loadFavorites])

  const isFavorite = useCallback(
    (trackId: number) => {
      return favorites.some(fav => fav.track_id === trackId)
    },
    [favorites]
  )

  // Load favorites on mount
  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  const value: MusicContextType = {
    playerState,
    playTrack,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seekTo,
    setVolume,
    toggleMute,
    selectionState,
    selectTrack,
    clearSelection,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    loadFavorites,
  }

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) {
    throw new Error('useMusic must be used within MusicProvider')
  }
  return context
}
