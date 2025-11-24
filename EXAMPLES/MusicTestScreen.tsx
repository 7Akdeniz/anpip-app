// Example: Music Test Screen
// Vollständiges Beispiel für Music Integration

import React from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { MusicBrowser } from '../components/music/MusicBrowser'
import { MusicPlayer } from '../components/music/MusicPlayer'

export default function MusicTestScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Music Browser mit Search & Filter */}
        <MusicBrowser />
        
        {/* Sticky Player am Bottom */}
        <MusicPlayer style={styles.player} />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
  },
  player: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
})
