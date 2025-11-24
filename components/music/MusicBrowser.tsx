// Music Browser Component
// Vollständige UI zum Suchen, Filtern und Auswählen von Musik

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useMusic } from '../../contexts/MusicContext'
import { musicService } from '../../lib/music-service'
import type { PixabayMusicTrack, MusicSearchParams } from '../../types/pixabay-music'
import { MUSIC_GENRES, MUSIC_MOODS, DURATION_FILTERS } from '../../types/pixabay-music'

interface MusicBrowserProps {
  mode?: 'browser' | 'selector' // Browser-Modus oder Auswahl-Modus für Video
  onSelect?: (track: PixabayMusicTrack) => void
  style?: any
}

export function MusicBrowser({ mode = 'browser', onSelect, style }: MusicBrowserProps) {
  const { playTrack, playerState, addToFavorites, removeFromFavorites, isFavorite } = useMusic()

  const [tracks, setTracks] = useState<PixabayMusicTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(0)
  const [sortOrder, setSortOrder] = useState<'popular' | 'latest'>('popular')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Search Music
  const searchMusic = useCallback(async (isLoadMore = false) => {
    if (loading) return

    try {
      setLoading(true)

      const params: MusicSearchParams = {
        q: searchQuery || (selectedMood || ''),
        page: isLoadMore ? page + 1 : 1,
        per_page: 20,
        order: sortOrder,
      }

      if (selectedGenre && selectedGenre !== 'all') {
        params.music_type = selectedGenre
      }

      if (selectedDuration > 0) {
        const durationFilter = DURATION_FILTERS[selectedDuration]
        if (durationFilter.min > 0) params.min_duration = durationFilter.min
        if (durationFilter.max > 0) params.max_duration = durationFilter.max
      }

      const response = await musicService.searchMusic(params)

      if (isLoadMore) {
        setTracks(prev => [...prev, ...response.tracks])
        setPage(prev => prev + 1)
      } else {
        setTracks(response.tracks)
        setPage(1)
      }

      setHasMore(response.tracks.length === 20)
    } catch (error) {
      console.error('Search Error:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedGenre, selectedMood, selectedDuration, sortOrder, page, loading])

  // Initial Load
  useEffect(() => {
    searchMusic()
  }, [selectedGenre, selectedMood, selectedDuration, sortOrder])

  // Search Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) {
        searchMusic()
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Handle Track Play
  const handlePlay = (track: PixabayMusicTrack) => {
    if (mode === 'selector' && onSelect) {
      onSelect(track)
    } else {
      playTrack(track)
    }
  }

  // Handle Favorite Toggle
  const handleFavoriteToggle = async (track: PixabayMusicTrack) => {
    try {
      if (isFavorite(track.id)) {
        await removeFromFavorites(track.id)
      } else {
        await addToFavorites(track)
      }
    } catch (error) {
      console.error('Favorite Toggle Error:', error)
    }
  }

  // Format Duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render Track Item
  const renderTrack = ({ item }: { item: PixabayMusicTrack }) => {
    const isPlaying = playerState.currentTrack?.id === item.id && playerState.isPlaying
    const isFav = isFavorite(item.id)

    return (
      <TouchableOpacity
        style={[
          styles.trackItem,
          isPlaying && styles.trackItemPlaying,
        ]}
        onPress={() => handlePlay(item)}
      >
        <View style={styles.trackInfo}>
          <View style={styles.playIconContainer}>
            {isPlaying ? (
              <Ionicons name="pause-circle" size={40} color="#1DB954" />
            ) : (
              <Ionicons name="play-circle" size={40} color="#1DB954" />
            )}
          </View>

          <View style={styles.trackDetails}>
            <Text style={styles.trackName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.trackArtist} numberOfLines={1}>
              {item.artist}
            </Text>
            <View style={styles.trackMeta}>
              <Text style={styles.trackMetaText}>{item.genre}</Text>
              <Text style={styles.trackMetaText}>•</Text>
              <Text style={styles.trackMetaText}>{formatDuration(item.duration)}</Text>
              {item.tempo > 0 && (
                <>
                  <Text style={styles.trackMetaText}>•</Text>
                  <Text style={styles.trackMetaText}>{item.tempo} BPM</Text>
                </>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => handleFavoriteToggle(item)}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={24}
              color={isFav ? '#ff4444' : '#888'}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.container, style]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Musik suchen..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {/* Sort Order */}
        <TouchableOpacity
          style={[styles.filterChip, sortOrder === 'popular' && styles.filterChipActive]}
          onPress={() => setSortOrder('popular')}
        >
          <Text style={[styles.filterChipText, sortOrder === 'popular' && styles.filterChipTextActive]}>
            🔥 Popular
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, sortOrder === 'latest' && styles.filterChipActive]}
          onPress={() => setSortOrder('latest')}
        >
          <Text style={[styles.filterChipText, sortOrder === 'latest' && styles.filterChipTextActive]}>
            ⚡ Latest
          </Text>
        </TouchableOpacity>

        {/* Duration Filters */}
        {DURATION_FILTERS.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.filterChip, selectedDuration === index && styles.filterChipActive]}
            onPress={() => setSelectedDuration(index)}
          >
            <Text style={[styles.filterChipText, selectedDuration === index && styles.filterChipTextActive]}>
              ⏱️ {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Genres */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genresContainer}
      >
        {MUSIC_GENRES.slice(0, 10).map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[styles.genreChip, selectedGenre === genre.id && styles.genreChipActive]}
            onPress={() => setSelectedGenre(genre.id)}
          >
            <Text style={[styles.genreChipText, selectedGenre === genre.id && styles.genreChipTextActive]}>
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Moods */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.moodsContainer}
      >
        {MUSIC_MOODS.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={[styles.moodChip, selectedMood === mood.id && styles.moodChipActive]}
            onPress={() => setSelectedMood(mood.id === selectedMood ? null : mood.id)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[styles.moodChipText, selectedMood === mood.id && styles.moodChipTextActive]}>
              {mood.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tracks List */}
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.tracksList}
        onEndReached={() => {
          if (hasMore && !loading) {
            searchMusic(true)
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="large" color="#1DB954" style={styles.loader} />
          ) : null
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color="#888" />
              <Text style={styles.emptyText}>Keine Musik gefunden</Text>
              <Text style={styles.emptySubText}>Versuche andere Suchbegriffe</Text>
            </View>
          ) : null
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 4,
  },
  filtersContainer: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#1DB954',
  },
  filterChipText: {
    color: '#fff',
    fontSize: 14,
  },
  filterChipTextActive: {
    fontWeight: 'bold',
  },
  genresContainer: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  genreChip: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  genreChipActive: {
    backgroundColor: '#1DB954',
  },
  genreChipText: {
    color: '#fff',
    fontSize: 14,
  },
  genreChipTextActive: {
    fontWeight: 'bold',
  },
  moodsContainer: {
    maxHeight: 44,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  moodChipActive: {
    backgroundColor: '#1DB954',
  },
  moodEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  moodChipText: {
    color: '#fff',
    fontSize: 14,
  },
  moodChipTextActive: {
    fontWeight: 'bold',
  },
  tracksList: {
    paddingHorizontal: 12,
  },
  trackItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  trackItemPlaying: {
    borderWidth: 2,
    borderColor: '#1DB954',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIconContainer: {
    marginRight: 12,
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
    alignItems: 'center',
  },
  trackMetaText: {
    color: '#888',
    fontSize: 12,
    marginRight: 6,
  },
  favoriteButton: {
    padding: 8,
  },
  loader: {
    marginVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubText: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
  },
})
