// FMA Music Player Component
// Standalone Player für FMA Tracks mit Play/Pause, Progress, Volume

import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import type { FMANormalizedTrack } from '../../types/fma-music'
import { fmaService } from '../../lib/fma-service'

interface FMAMusicPlayerProps {
  track: FMANormalizedTrack | null
  autoPlay?: boolean
  onEnd?: () => void
  onError?: (error: Error) => void
  style?: any
}

export function FMAMusicPlayer({ 
  track, 
  autoPlay = false,
  onEnd,
  onError,
  style 
}: FMAMusicPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const progressAnim = useRef(new Animated.Value(0)).current

  // Setup Audio
  useEffect(() => {
    if (Platform.OS !== 'web') {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      })
    }

    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [])

  // Load Track
  useEffect(() => {
    if (track) {
      loadTrack()
    } else {
      unloadTrack()
    }
  }, [track])

  const loadTrack = async () => {
    try {
      setIsLoading(true)

      // Unload previous
      if (sound) {
        await sound.unloadAsync()
      }

      if (!track?.audioUrl) {
        throw new Error('No audio URL')
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.audioUrl },
        { shouldPlay: autoPlay, volume, isMuted },
        onPlaybackStatusUpdate
      )

      setSound(newSound)
      setIsPlaying(autoPlay)

      console.log('🎵 FMA Player loaded:', track.name)
    } catch (error) {
      console.error('Load Track Error:', error)
      if (onError) onError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const unloadTrack = async () => {
    if (sound) {
      await sound.unloadAsync()
      setSound(null)
      setIsPlaying(false)
      setProgress(0)
      setDuration(0)
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis / 1000)
      setDuration(status.durationMillis / 1000)
      setIsPlaying(status.isPlaying)

      // Animate progress bar
      const progressPercent = status.durationMillis > 0
        ? (status.positionMillis / status.durationMillis) * 100
        : 0
      
      Animated.timing(progressAnim, {
        toValue: progressPercent,
        duration: 100,
        useNativeDriver: false,
      }).start()

      // Handle end
      if (status.didJustFinish) {
        setIsPlaying(false)
        if (onEnd) onEnd()
      }
    } else if (status.error) {
      console.error('Playback Error:', status.error)
      if (onError) onError(new Error(status.error))
    }
  }

  const togglePlayPause = async () => {
    if (!sound) return

    try {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        await sound.playAsync()
      }
    } catch (error) {
      console.error('Toggle Play/Pause Error:', error)
    }
  }

  const seekTo = async (position: number) => {
    if (!sound) return

    try {
      await sound.setPositionAsync(position * 1000)
    } catch (error) {
      console.error('Seek Error:', error)
    }
  }

  const toggleMute = async () => {
    if (!sound) return

    try {
      const newMuted = !isMuted
      await sound.setIsMutedAsync(newMuted)
      setIsMuted(newMuted)
    } catch (error) {
      console.error('Mute Error:', error)
    }
  }

  const changeVolume = async (newVolume: number) => {
    if (!sound) return

    try {
      const clampedVolume = Math.max(0, Math.min(1, newVolume))
      await sound.setVolumeAsync(clampedVolume)
      setVolume(clampedVolume)
    } catch (error) {
      console.error('Volume Error:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!track) {
    return null
  }

  const license = fmaService.getLicenseInfo(track)

  return (
    <View style={[styles.container, style]}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        <View style={styles.trackTextContainer}>
          <Text style={styles.trackName} numberOfLines={1}>
            {track.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {track.artist} • {license.title}
          </Text>
        </View>
        
        {!license.commercial && (
          <View style={styles.licenseWarning}>
            <Ionicons name="warning" size={16} color="#ff9800" />
            <Text style={styles.licenseWarningText}>Non-Commercial</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(progress)}</Text>
        <View style={styles.progressBar}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMute}
        >
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayPause}
          disabled={isLoading}
        >
          {isLoading ? (
            <Ionicons name="hourglass" size={32} color="#fff" />
          ) : (
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={32}
              color="#fff"
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            // Show attribution
            console.log('Attribution:', fmaService.getAttributionText(track))
          }}
        >
          <Ionicons name="information-circle" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      {/* Attribution (Always visible for compliance) */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText} numberOfLines={1}>
          {fmaService.getAttributionText(track)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  trackInfo: {
    marginBottom: 12,
  },
  trackTextContainer: {
    marginBottom: 4,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#999',
    fontSize: 14,
  },
  licenseWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#ff980020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  licenseWarningText: {
    color: '#ff9800',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
    borderRadius: 2,
  },
  timeText: {
    color: '#999',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  controlButton: {
    padding: 12,
    marginHorizontal: 20,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attribution: {
    backgroundColor: '#0a0a0a',
    padding: 8,
    borderRadius: 6,
  },
  attributionText: {
    color: '#666',
    fontSize: 10,
    textAlign: 'center',
  },
})
