/**
 * MIXKIT MUSIC BROWSER SCREEN
 * Route: /mixkit-music
 */

import React from 'react'
import { View, StyleSheet, SafeAreaView } from 'react-native'
import { MixkitBrowser } from '@/components/music/MixkitBrowser'

export default function MixkitMusicScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MixkitBrowser showPlayer={true} mode="browse" />
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
})
