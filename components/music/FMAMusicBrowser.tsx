// FMA Music Browser Component
// Vollständige UI zum Suchen, Filtern und Auswählen von FMA Musik

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
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fmaService } from '../../lib/fma-service'
import type { 
  FMANormalizedTrack, 
  FMASearchParams,
} from '../../types/fma-music'
import { FMA_GENRES, FMA_MOODS, FMA_LICENSES } from '../../types/fma-music'

interface FMAMusicBrowserProps {
  mode?: 'browser' | 'selector' // Browser-Modus oder Auswahl-Modus für Video
  onSelect?: (track: FMANormalizedTrack) => void
  onPlay?: (track: FMANormalizedTrack) => void
  filterCommercialOnly?: boolean // Nur kommerzielle Lizenzen
  style?: any
}

export function FMAMusicBrowser({ 
  mode = 'browser', 
  onSelect, 
  onPlay,
  filterCommercialOnly = false,
  style 
}: FMAMusicBrowserProps) {
  const [tracks, setTracks] = useState<FMANormalizedTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<string | null>(
    filterCommercialOnly ? 'cc-by' : null
  )
  const [sortBy, setSortBy] = useState<'interest' | 'listens' | 'date'>('interest')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Search Music
  const searchMusic = useCallback(async (isLoadMore = false) => {
    if (loading) return

    try {
      setLoading(true)

      const params: FMASearchParams = {
        page: isLoadMore ? page + 1 : 1,
        per_page: 20,
        sort: sortBy === 'interest' ? 'track_interest' : 
              sortBy === 'listens' ? 'track_listens' : 
              'track_date_created',
        order: 'desc',
      }

      // Query
      if (searchQuery.trim()) {
        params.q = searchQuery
      }

      // Genre
      if (selectedGenre && selectedGenre !== 'all') {
        params.genre = selectedGenre
      }

      // Mood (als Tag)
      if (selectedMood) {
        const mood = FMA_MOODS.find(m => m.id === selectedMood)
        if (mood && mood.tags.length > 0) {
          params.tag = mood.tags[0] // Nutze ersten Tag
        }
      }

      // License
      if (selectedLicense) {
        params.license = selectedLicense
      } else if (filterCommercialOnly) {
        params.license = 'cc-by' // Default commercial
      }

      const response = await fmaService.searchMusic(params)

      if (isLoadMore) {
        setTracks(prev => [...prev, ...response.tracks])
        setPage(prev => prev + 1)
      } else {
        setTracks(response.tracks)
        setPage(1)
      }

      setHasMore(response.tracks.length === 20)
    } catch (error) {
      console.error('FMA Search Error:', error)
      Alert.alert('Error', 'Failed to search music. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedGenre, selectedMood, selectedLicense, sortBy, page, loading, filterCommercialOnly])

  // Load Favorites
  const loadFavorites = useCallback(async () => {
    try {
      const favs = await fmaService.getFavorites()
      setFavorites(new Set(favs.map(f => f.track_id)))
    } catch (error) {
      console.error('Load Favorites Error:', error)
    }
  }, [])

  // Initial Load
  useEffect(() => {
    searchMusic()
    loadFavorites()
  }, [selectedGenre, selectedMood, selectedLicense, sortBy])

  // Search Debounce
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) {
        searchMusic()
      }
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Handle Track Selection
  const handleTrackPress = (track: FMANormalizedTrack) => {
    if (mode === 'selector' && onSelect) {
      // Show license info in selector mode
      const license = fmaService.getLicenseInfo(track)
      Alert.alert(
        'Select This Track?',
        `${track.name} by ${track.artist}\n\nLicense: ${license.title}\nCommercial Use: ${license.commercial ? 'Yes' : 'No'}\nAttribution Required: ${license.attribution ? 'Yes' : 'No'}`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Select', onPress: () => onSelect(track) },
        ]
      )
    } else if (onPlay) {
      setCurrentlyPlaying(track.id)
      onPlay(track)
    }
  }

  // Handle Favorite Toggle
  const handleFavoriteToggle = async (track: FMANormalizedTrack) => {
    try {
      if (favorites.has(track.id)) {
        await fmaService.removeFromFavorites(track.id)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(track.id)
          return newSet
        })
      } else {
        await fmaService.addToFavorites(track)
        setFavorites(prev => new Set(prev).add(track.id))
      }
    } catch (error) {
      console.error('Favorite Toggle Error:', error)
    }
  }

  // Show License Info
  const showLicenseInfo = (track: FMANormalizedTrack) => {
    const license = fmaService.getLicenseInfo(track)
    const attribution = fmaService.getAttributionText(track)
    
    Alert.alert(
      'License Information',
      `Track: ${track.name}\nArtist: ${track.artist}\n\nLicense: ${license.title}\nCommercial Use: ${license.commercial ? '✅ Allowed' : '❌ Not Allowed'}\nAttribution: ${license.attribution ? '✅ Required' : '❌ Not Required'}\n\nAttribution Text:\n${attribution}\n\nListens: ${track.track_listens || 0}\nFavorites: ${track.track_favorites || 0}`,
      [{ text: 'OK' }]
    )
  }

  // Format Duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render Track Item
  const renderTrack = ({ item }: { item: FMANormalizedTrack }) => {
    const isPlaying = currentlyPlaying === item.id
    const isFav = favorites.has(item.id)
    const license = fmaService.getLicenseInfo(item)

    return (
      <TouchableOpacity
        style={[styles.trackItem, isPlaying && styles.trackItemPlaying]}
        onPress={() => handleTrackPress(item)}
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
              <Text style={styles.trackMetaText}>{formatDuration(item.duration)}</Text>
              <Text style={styles.trackMetaDot}>•</Text>
              <Text style={styles.trackMetaText}>{item.genre}</Text>
              <Text style={styles.trackMetaDot}>•</Text>
              <Text style={[
                styles.trackLicense, 
                !license.commercial && styles.trackLicenseNonCommercial
              ]}>
                {license.title}
              </Text>
            </View>
          </View>

          <View style={styles.trackActions}>
            <TouchableOpacity
              onPress={() => showLicenseInfo(item)}
              style={styles.actionButton}
            >
              <Ionicons name="information-circle-outline" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleFavoriteToggle(item)}
              style={styles.actionButton}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={24}
                color={isFav ? '#f44' : '#999'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  // Render Genre Filter
  const renderGenreFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
    >
      {FMA_GENRES.map(genre => (
        <TouchableOpacity
          key={genre.id}
          style={[
            styles.filterChip,
            selectedGenre === genre.id && styles.filterChipActive,
          ]}
          onPress={() => setSelectedGenre(genre.id)}
        >
          <Text style={styles.filterChipText}>
            {genre.icon} {genre.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  // Render Mood Filter
  const renderMoodFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          !selectedMood && styles.filterChipActive,
        ]}
        onPress={() => setSelectedMood(null)}
      >
        <Text style={styles.filterChipText}>All Moods</Text>
      </TouchableOpacity>
      {FMA_MOODS.map(mood => (
        <TouchableOpacity
          key={mood.id}
          style={[
            styles.filterChip,
            selectedMood === mood.id && styles.filterChipActive,
          ]}
          onPress={() => setSelectedMood(mood.id)}
        >
          <Text style={styles.filterChipText}>
            {mood.emoji} {mood.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  // Render License Filter
  const renderLicenseFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
    >
      <TouchableOpacity
        style={[
          styles.filterChip,
          !selectedLicense && styles.filterChipActive,
        ]}
        onPress={() => setSelectedLicense(null)}
      >
        <Text style={styles.filterChipText}>All Licenses</Text>
      </TouchableOpacity>
      {FMA_LICENSES.filter(l => !filterCommercialOnly || l.commercial).map(license => (
        <TouchableOpacity
          key={license.id}
          style={[
            styles.filterChip,
            selectedLicense === license.id && styles.filterChipActive,
          ]}
          onPress={() => setSelectedLicense(license.id)}
        >
          <Text style={styles.filterChipText}>
            {license.commercial ? '✅' : '⚠️'} {license.shortName}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )

  return (
    <View style={[styles.container, style]}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search FMA music..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Genre:</Text>
        {renderGenreFilter()}
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>Mood:</Text>
        {renderMoodFilter()}
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterLabel}>License:</Text>
        {renderLicenseFilter()}
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'interest' && styles.sortButtonActive]}
          onPress={() => setSortBy('interest')}
        >
          <Text style={styles.sortButtonText}>🔥 Popular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'listens' && styles.sortButtonActive]}
          onPress={() => setSortBy('listens')}
        >
          <Text style={styles.sortButtonText}>🎧 Most Played</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={styles.sortButtonText}>🆕 Latest</Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {tracks.length > 0 ? `${tracks.length} tracks found` : 'No tracks found'}
        </Text>
        <Text style={styles.sourceTag}>Free Music Archive</Text>
      </View>

      {/* Track List */}
      <FlatList
        data={tracks}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        onEndReached={() => {
          if (hasMore && !loading) {
            searchMusic(true)
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="musical-notes-outline" size={64} color="#444" />
              <Text style={styles.emptyText}>No music found</Text>
              <Text style={styles.emptySubtext}>Try different search terms or filters</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color="#1DB954" />
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
    borderRadius: 8,
    paddingHorizontal: 12,
    margin: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filterLabel: {
    color: '#999',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  filterScroll: {
    maxHeight: 40,
  },
  filterContent: {
    paddingHorizontal: 12,
    gap: 8,
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
    fontWeight: '500',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  sortButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#333',
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  resultsText: {
    color: '#999',
    fontSize: 12,
  },
  sourceTag: {
    color: '#1DB954',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  trackItem: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  trackItemPlaying: {
    backgroundColor: '#1a1a1a',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
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
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: '#999',
    fontSize: 14,
    marginBottom: 4,
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackMetaText: {
    color: '#666',
    fontSize: 12,
  },
  trackMetaDot: {
    color: '#666',
    fontSize: 12,
    marginHorizontal: 6,
  },
  trackLicense: {
    color: '#1DB954',
    fontSize: 11,
    fontWeight: '600',
  },
  trackLicenseNonCommercial: {
    color: '#ff9800',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#444',
    fontSize: 14,
    marginTop: 8,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
})
