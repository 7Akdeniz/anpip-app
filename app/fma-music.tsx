// FMA Music Browser Screen
// Route: /fma-music

import React, { useState } from 'react'
import { View, StyleSheet, SafeAreaView, TouchableOpacity, Text } from 'react-native'
import { FMAMusicBrowser } from '../components/music/FMAMusicBrowser'
import { FMAMusicPlayer } from '../components/music/FMAMusicPlayer'
import type { FMANormalizedTrack } from '../types/fma-music'

export default function FMAMusicScreen() {
  const [currentTrack, setCurrentTrack] = useState<FMANormalizedTrack | null>(null)
  const [showCommercialOnly, setShowCommercialOnly] = useState(false)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 Free Music Archive</Text>
        <TouchableOpacity
          style={[
            styles.filterButton,
            showCommercialOnly && styles.filterButtonActive,
          ]}
          onPress={() => setShowCommercialOnly(!showCommercialOnly)}
        >
          <Text style={styles.filterButtonText}>
            {showCommercialOnly ? '✅ Commercial Only' : 'All Licenses'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FMAMusicBrowser
          mode="browser"
          onPlay={(track) => setCurrentTrack(track)}
          filterCommercialOnly={showCommercialOnly}
        />
        
        {currentTrack && (
          <View style={styles.playerContainer}>
            <FMAMusicPlayer
              track={currentTrack}
              autoPlay
              onEnd={() => console.log('Track ended')}
              style={styles.player}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a1a',
  },
  filterButtonActive: {
    backgroundColor: '#1DB954',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  playerContainer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 12,
  },
  player: {
    borderRadius: 12,
  },
})
