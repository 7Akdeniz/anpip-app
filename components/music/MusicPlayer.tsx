// Music Player Component
// Sticky Player mit Controls, Progress Bar, Volume

import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMusic } from '../../contexts/MusicContext'

interface MusicPlayerProps {
  style?: any
  compact?: boolean // Kompakt-Modus für Video-Editor
}

export function MusicPlayer({ style, compact = false }: MusicPlayerProps) {
  const {
    playerState,
    pauseTrack,
    resumeTrack,
    stopTrack,
    seekTo,
    setVolume,
    toggleMute,
  } = useMusic()

  const { currentTrack, isPlaying, progress, duration, volume, isMuted, isLoading } = playerState

  if (!currentTrack) {
    return null
  }

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const currentTime = progress * duration
  const remainingTime = duration - currentTime

  if (compact) {
    // Compact Mode für Video-Editor
    return (
      <View style={[styles.compactContainer, style]}>
        <TouchableOpacity
          style={styles.compactPlayButton}
          onPress={() => (isPlaying ? pauseTrack() : resumeTrack())}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        <View style={styles.compactInfo}>
          <Text style={styles.compactTrackName} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.compactArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        <TouchableOpacity onPress={stopTrack} style={styles.compactCloseButton}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  }

  // Full Player
  return (
    <View style={[styles.container, style]}>
      {/* Track Info */}
      <View style={styles.trackInfo}>
        {currentTrack.thumbnail && (
          <Image source={{ uri: currentTrack.thumbnail }} style={styles.thumbnail} />
        )}
        
        <View style={styles.trackDetails}>
          <Text style={styles.trackName} numberOfLines={1}>
            {currentTrack.name}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
          <View style={styles.trackMeta}>
            <Text style={styles.trackMetaText}>{currentTrack.genre}</Text>
            {currentTrack.tempo > 0 && (
              <>
                <Text style={styles.trackMetaText}> • </Text>
                <Text style={styles.trackMetaText}>{currentTrack.tempo} BPM</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>-{formatTime(remainingTime)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Volume */}
        <View style={styles.volumeContainer}>
          <TouchableOpacity onPress={toggleMute} style={styles.volumeButton}>
            <Ionicons
              name={isMuted ? 'volume-mute' : volume > 0.5 ? 'volume-high' : 'volume-low'}
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* Play/Pause */}
        <View style={styles.playbackControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(Math.max(0, progress - 0.05))}
          >
            <Ionicons name="play-back" size={32} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.playButton}
            onPress={() => (isPlaying ? pauseTrack() : resumeTrack())}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.playButtonIcon}>
                <Ionicons name="hourglass" size={32} color="#000" />
              </View>
            ) : (
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#000"
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => seekTo(Math.min(1, progress + 0.05))}
          >
            <Ionicons name="play-forward" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stop Button */}
        <TouchableOpacity onPress={stopTrack} style={styles.stopButton}>
          <Ionicons name="stop" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tags */}
      {currentTrack && currentTrack.tags && (
        <View style={styles.tagsContainer}>
          {currentTrack.tags.split(',').slice(0, 5).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag.trim()}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#333',
  },
  trackDetails: {
    flex: 1,
  },
  trackName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 4,
  },
  trackMeta: {
    flexDirection: 'row',
  },
  trackMetaText: {
    color: '#888',
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    marginHorizontal: 8,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#1DB954',
  },
  timeText: {
    color: '#aaa',
    fontSize: 12,
    width: 45,
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  volumeButton: {
    padding: 8,
  },
  volumeSlider: {
    flex: 1,
    maxWidth: 100,
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  playButtonIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButton: {
    padding: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    backgroundColor: '#333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: '#aaa',
    fontSize: 12,
  },
  // Compact Mode
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
  },
  compactPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactTrackName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  compactArtist: {
    color: '#aaa',
    fontSize: 12,
  },
  compactCloseButton: {
    padding: 8,
  },
})
