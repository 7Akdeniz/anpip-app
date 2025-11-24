/**
 * MIXKIT TRACK ITEM
 * Liste einzelner Track-Komponente
 */

import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MixkitTrack } from '@/types/mixkit-music'

interface MixkitTrackItemProps {
  track: MixkitTrack
  isFavorite: boolean
  isPlaying: boolean
  onPress: () => void
  onFavoritePress: () => void
  mode?: 'browse' | 'select'
}

export function MixkitTrackItem({
  track,
  isFavorite,
  isPlaying,
  onPress,
  onFavoritePress,
  mode = 'browse',
}: MixkitTrackItemProps) {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <TouchableOpacity
      style={[styles.container, isPlaying && styles.containerPlaying]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Play Icon */}
      <View style={[styles.iconContainer, isPlaying && styles.iconContainerPlaying]}>
        <Ionicons
          name={isPlaying ? 'pause' : 'play'}
          size={20}
          color={isPlaying ? '#1DB954' : '#fff'}
        />
      </View>

      {/* Track Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{track.artist}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{track.genre}</Text>
          {track.bpm && (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{track.bpm} BPM</Text>
            </>
          )}
        </View>
        {track.mood && (
          <View style={styles.tagsRow}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{track.mood}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Duration */}
      <Text style={styles.duration}>{formatDuration(track.duration_seconds)}</Text>

      {/* Favorite Button */}
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={onFavoritePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={24}
          color={isFavorite ? '#1DB954' : '#666'}
        />
      </TouchableOpacity>

      {/* Select Mode Indicator */}
      {mode === 'select' && (
        <View style={styles.selectIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#1DB954" />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  containerPlaying: {
    backgroundColor: '#1a1a1a',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerPlaying: {
    backgroundColor: '#1DB95420',
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    color: '#999',
    fontSize: 13,
  },
  metaDot: {
    color: '#666',
    marginHorizontal: 6,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: '#1DB95420',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '600',
  },
  duration: {
    color: '#999',
    fontSize: 13,
    marginRight: 12,
  },
  favoriteButton: {
    padding: 4,
  },
  selectIndicator: {
    marginLeft: 8,
  },
})
