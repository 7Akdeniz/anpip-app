/**
 * MIXKIT BROWSER COMPONENT
 * 
 * Hauptkomponente für Mixkit Musik-Bibliothek:
 * - Suche & Filter
 * - Genre/Mood Navigation
 * - Track-Liste mit Player
 * - Favoriten-Management
 * - Video-Editor Integration
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { mixkitService } from '@/lib/mixkit-service'
import type { MixkitTrack, MixkitCategory } from '@/types/mixkit-music'
import { MixkitTrackItem } from '@/components/music/MixkitTrackItem'
import { MixkitPlayer } from '@/components/music/MixkitPlayer'
import { MixkitFilters } from '@/components/music/MixkitFilters'

interface MixkitBrowserProps {
  onSelectTrack?: (track: MixkitTrack) => void
  showPlayer?: boolean
  mode?: 'browse' | 'select' // browse = normal, select = für Video-Editor
}

export function MixkitBrowser({
  onSelectTrack,
  showPlayer = true,
  mode = 'browse',
}: MixkitBrowserProps) {
  // State
  const [tracks, setTracks] = useState<MixkitTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [genres, setGenres] = useState<MixkitCategory[]>([])
  const [moods, setMoods] = useState<MixkitCategory[]>([])
  const [currentTrack, setCurrentTrack] = useState<MixkitTrack | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const ITEMS_PER_PAGE = 20

  // Load Categories
  useEffect(() => {
    loadCategories()
  }, [])

  // Load Tracks
  useEffect(() => {
    loadTracks(true)
  }, [searchQuery, selectedGenre, selectedMood])

  // Load Favorites
  useEffect(() => {
    loadFavorites()
  }, [])

  const loadCategories = async () => {
    try {
      const [genreData, moodData] = await Promise.all([
        mixkitService.getGenres(),
        mixkitService.getMoods(),
      ])
      setGenres(genreData)
      setMoods(moodData)
    } catch (error) {
      console.error('Load Categories Error:', error)
    }
  }

  const loadTracks = async (reset = false) => {
    if (loading) return

    try {
      const currentPage = reset ? 0 : page
      setLoading(true)

      const result = await mixkitService.searchTracks({
        query: searchQuery || undefined,
        genre: selectedGenre || undefined,
        mood: selectedMood || undefined,
        limit: ITEMS_PER_PAGE,
        offset: currentPage * ITEMS_PER_PAGE,
      })

      if (reset) {
        setTracks(result.tracks)
        setPage(0)
      } else {
        setTracks((prev) => [...prev, ...result.tracks])
      }

      setHasMore(result.hasMore)
      setPage((prev) => (reset ? 1 : prev + 1))

    } catch (error) {
      console.error('Load Tracks Error:', error)
      Alert.alert('Fehler', 'Tracks konnten nicht geladen werden')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const loadFavorites = async () => {
    try {
      const favTracks = await mixkitService.getFavorites()
      setFavorites(new Set(favTracks.map((t) => t.id)))
    } catch (error) {
      console.error('Load Favorites Error:', error)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    loadTracks(true)
  }

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTracks(false)
    }
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text)
    setPage(0)
  }

  const handleGenreSelect = (genre: string | null) => {
    setSelectedGenre(genre)
    setPage(0)
  }

  const handleMoodSelect = (mood: string | null) => {
    setSelectedMood(mood)
    setPage(0)
  }

  const handleTrackPress = (track: MixkitTrack) => {
    if (mode === 'select' && onSelectTrack) {
      onSelectTrack(track)
    } else {
      setCurrentTrack(track)
      mixkitService.trackAction(track.id, 'play')
    }
  }

  const handleFavoriteToggle = async (track: MixkitTrack) => {
    try {
      const isFav = favorites.has(track.id)

      if (isFav) {
        await mixkitService.removeFromFavorites(track.id)
        setFavorites((prev) => {
          const next = new Set(prev)
          next.delete(track.id)
          return next
        })
      } else {
        await mixkitService.addToFavorites(track)
        setFavorites((prev) => new Set(prev).add(track.id))
      }

    } catch (error) {
      console.error('Favorite Toggle Error:', error)
      Alert.alert('Fehler', 'Favorit konnte nicht gespeichert werden')
    }
  }

  const renderTrackItem = ({ item }: { item: MixkitTrack }) => (
    <MixkitTrackItem
      track={item}
      isFavorite={favorites.has(item.id)}
      isPlaying={currentTrack?.id === item.id}
      onPress={() => handleTrackPress(item)}
      onFavoritePress={() => handleFavoriteToggle(item)}
      mode={mode}
    />
  )

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Musik suchen..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <MixkitFilters
        genres={genres}
        moods={moods}
        selectedGenre={selectedGenre}
        selectedMood={selectedMood}
        onGenreSelect={handleGenreSelect}
        onMoodSelect={handleMoodSelect}
      />

      {/* Active Filters Display */}
      {(selectedGenre || selectedMood) && (
        <View style={styles.activeFilters}>
          {selectedGenre && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Genre: {selectedGenre}</Text>
              <TouchableOpacity onPress={() => handleGenreSelect(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          {selectedMood && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>Mood: {selectedMood}</Text>
              <TouchableOpacity onPress={() => handleMoodSelect(null)}>
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Results Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
        </Text>
        {mode === 'select' && (
          <Text style={styles.selectModeText}>Wähle einen Track für dein Video</Text>
        )}
      </View>
    </View>
  )

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1DB954" />
      </View>
    )
  }

  const renderEmpty = () => {
    if (loading) return null
    return (
      <View style={styles.empty}>
        <Ionicons name="musical-notes-outline" size={64} color="#333" />
        <Text style={styles.emptyText}>Keine Tracks gefunden</Text>
        <Text style={styles.emptySubtext}>
          Versuche eine andere Suche oder Filter
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={renderTrackItem}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />

      {/* Player */}
      {showPlayer && currentTrack && (
        <MixkitPlayer
          track={currentTrack}
          onClose={() => setCurrentTrack(null)}
          onFavoriteToggle={() => handleFavoriteToggle(currentTrack)}
          isFavorite={favorites.has(currentTrack.id)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#fff',
    fontSize: 16,
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1DB954',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resultsText: {
    color: '#999',
    fontSize: 14,
  },
  selectModeText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
})
