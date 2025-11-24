/**
 * MIXKIT PLAYER
 * Audio Player für Mixkit-Tracks
 */

import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Audio } from 'expo-av'
import type { MixkitTrack } from '@/types/mixkit-music'

interface MixkitPlayerProps {
  track: MixkitTrack
  onClose: () => void
  onFavoriteToggle: () => void
  isFavorite: boolean
}

export function MixkitPlayer({
  track,
  onClose,
  onFavoriteToggle,
  isFavorite,
}: MixkitPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(track.duration_seconds * 1000)
  const slideAnim = useRef(new Animated.Value(100)).current

  useEffect(() => {
    // Slide up animation
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start()

    loadSound()

    return () => {
      unloadSound()
    }
  }, [track.id])

  const loadSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      })

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: track.cdn_url || track.storage_url },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      )

      setSound(newSound)
      setIsPlaying(true)
    } catch (error) {
      console.error('Load Sound Error:', error)
    }
  }

  const unloadSound = async () => {
    if (sound) {
      await sound.unloadAsync()
      setSound(null)
    }
  }

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis)
      setDuration(status.durationMillis || duration)
      setIsPlaying(status.isPlaying)

      if (status.didJustFinish) {
        // Replay
        sound?.replayAsync()
      }
    }
  }

  const togglePlayPause = async () => {
    if (!sound) return

    if (isPlaying) {
      await sound.pauseAsync()
    } else {
      await sound.playAsync()
    }
  }

  const handleSeek = async (value: number) => {
    if (!sound) return
    await sound.setPositionAsync(value)
  }

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 100,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  const formatTime = (millis: number): string => {
    const totalSeconds = Math.floor(millis / 1000)
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? position / duration : 0

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-down" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jetzt läuft</Text>
        <TouchableOpacity onPress={onFavoriteToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? '#1DB954' : '#fff'}
          />
        </TouchableOpacity>
      </View>

      {/* Track Info */}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>
          {track.title}
        </Text>
        <Text style={styles.artist}>{track.artist}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{track.genre}</Text>
          {track.bpm && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{track.bpm} BPM</Text>
            </>
          )}
          {track.mood && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{track.mood}</Text>
            </>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={togglePlayPause}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={48}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* License Info */}
      <View style={styles.license}>
        <Ionicons name="information-circle-outline" size={16} color="#666" />
        <Text style={styles.licenseText}>
          Mixkit License - Kostenlos für kommerzielle Nutzung
        </Text>
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  artist: {
    color: '#999',
    fontSize: 18,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    fontSize: 14,
  },
  metaDot: {
    color: '#666',
    marginHorizontal: 8,
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    color: '#999',
    fontSize: 12,
  },
  controls: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  controlButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  license: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 6,
  },
  licenseText: {
    color: '#666',
    fontSize: 12,
  },
})
