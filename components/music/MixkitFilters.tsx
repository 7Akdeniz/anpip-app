/**
 * MIXKIT FILTERS
 * Genre & Mood Filter Komponente
 */

import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import type { MixkitCategory } from '@/types/mixkit-music'

interface MixkitFiltersProps {
  genres: MixkitCategory[]
  moods: MixkitCategory[]
  selectedGenre: string | null
  selectedMood: string | null
  onGenreSelect: (genre: string | null) => void
  onMoodSelect: (mood: string | null) => void
}

export function MixkitFilters({
  genres,
  moods,
  selectedGenre,
  selectedMood,
  onGenreSelect,
  onMoodSelect,
}: MixkitFiltersProps) {
  const [showGenres, setShowGenres] = useState(true)
  const [showMoods, setShowMoods] = useState(true)

  return (
    <View style={styles.container}>
      {/* Genres */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowGenres(!showGenres)}
      >
        <Text style={styles.sectionTitle}>Genres ({genres.length})</Text>
        <Ionicons
          name={showGenres ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#999"
        />
      </TouchableOpacity>

      {showGenres && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedGenre === null && styles.filterChipActive,
            ]}
            onPress={() => onGenreSelect(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedGenre === null && styles.filterChipTextActive,
              ]}
            >
              Alle
            </Text>
          </TouchableOpacity>

          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.filterChip,
                selectedGenre === genre.slug && styles.filterChipActive,
              ]}
              onPress={() => onGenreSelect(genre.slug)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGenre === genre.slug && styles.filterChipTextActive,
                ]}
              >
                {genre.name} ({genre.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Moods */}
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setShowMoods(!showMoods)}
      >
        <Text style={styles.sectionTitle}>Stimmungen ({moods.length})</Text>
        <Ionicons
          name={showMoods ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#999"
        />
      </TouchableOpacity>

      {showMoods && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedMood === null && styles.filterChipActive,
            ]}
            onPress={() => onMoodSelect(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedMood === null && styles.filterChipTextActive,
              ]}
            >
              Alle
            </Text>
          </TouchableOpacity>

          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.filterChip,
                selectedMood === mood.slug && styles.filterChipActive,
              ]}
              onPress={() => onMoodSelect(mood.slug)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedMood === mood.slug && styles.filterChipTextActive,
                ]}
              >
                {mood.name} ({mood.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  filterScroll: {
    marginBottom: 8,
  },
  filterContent: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  filterChipActive: {
    backgroundColor: '#1DB954',
    borderColor: '#1DB954',
  },
  filterChipText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
})
