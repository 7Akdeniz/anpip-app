// Music Source Selector Component
// Wähle zwischen FMA und Pixabay für Video-Upload

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { FMAMusicBrowser } from './music/FMAMusicBrowser'
import { MusicBrowser } from './music/MusicBrowser'
import type { FMANormalizedTrack } from '../types/fma-music'
import type { PixabayMusicTrack } from '../types/pixabay-music'
import type { MusicSource } from '../types/fma-music'

interface MusicSourceSelectorProps {
  visible: boolean
  onClose: () => void
  onSelectFMA: (track: FMANormalizedTrack) => void
  onSelectPixabay: (track: PixabayMusicTrack) => void
  commercialUseOnly?: boolean
}

export function MusicSourceSelector({
  visible,
  onClose,
  onSelectFMA,
  onSelectPixabay,
  commercialUseOnly = false,
}: MusicSourceSelectorProps) {
  const [activeSource, setActiveSource] = useState<MusicSource>('fma')

  const handleSelectFMA = (track: FMANormalizedTrack) => {
    onSelectFMA(track)
    onClose()
  }

  const handleSelectPixabay = (track: PixabayMusicTrack) => {
    onSelectPixabay(track)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Select Music</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Source Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeSource === 'fma' && styles.tabActive]}
            onPress={() => setActiveSource('fma')}
          >
            <Text style={[styles.tabText, activeSource === 'fma' && styles.tabTextActive]}>
              🎵 Free Music Archive
            </Text>
            {commercialUseOnly && (
              <Text style={styles.tabSubtext}>All commercial-friendly</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeSource === 'pixabay' && styles.tabActive]}
            onPress={() => setActiveSource('pixabay')}
          >
            <Text style={[styles.tabText, activeSource === 'pixabay' && styles.tabTextActive]}>
              🎹 Pixabay Music
            </Text>
            <Text style={styles.tabSubtext}>Royalty-free</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeSource === 'fma' ? (
            <FMAMusicBrowser
              mode="selector"
              onSelect={handleSelectFMA}
              filterCommercialOnly={commercialUseOnly}
            />
          ) : (
            <MusicBrowser
              mode="selector"
              onSelect={handleSelectPixabay}
            />
          )}
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          {activeSource === 'fma' ? (
            <Text style={styles.footerText}>
              ⚖️ FMA tracks require attribution. Check license before commercial use.
            </Text>
          ) : (
            <Text style={styles.footerText}>
              ✅ Pixabay tracks are royalty-free for commercial use.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
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
  closeButton: {
    padding: 4,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 36,
  },
  tabs: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#1DB954',
  },
  tabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tabTextActive: {
    color: '#fff',
  },
  tabSubtext: {
    color: '#666',
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
    textAlign: 'center',
  },
})
