// Music Browser Test Screen
// Route: /music-browser

import React from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { MusicBrowser } from '../components/music/MusicBrowser'
import { MusicPlayer } from '../components/music/MusicPlayer'

export default function MusicBrowserScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MusicBrowser />
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
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
})
