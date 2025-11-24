// Music Selector for Video Editor
// Integration zum Auswählen von Musik für Videos

import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MusicBrowser } from './MusicBrowser'
import { MusicPlayer } from './MusicPlayer'
import { useMusic } from '../../contexts/MusicContext'
import type { PixabayMusicTrack } from '../../types/pixabay-music'

interface MusicSelectorProps {
  onSelectMusic: (track: PixabayMusicTrack) => void
  currentTrack?: PixabayMusicTrack | null
  style?: any
}

export function MusicSelector({ onSelectMusic, currentTrack, style }: MusicSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const { selectTrack, clearSelection, playerState } = useMusic()

  const handleSelectTrack = (track: PixabayMusicTrack) => {
    selectTrack(track, 'editor')
    onSelectMusic(track)
    setModalVisible(false)
  }

  const handleRemoveMusic = () => {
    clearSelection()
    onSelectMusic(null as any) // Clear music from video
  }

  return (
    <View style={[styles.container, style]}>
      {currentTrack ? (
        // Selected Music Display
        <View style={styles.selectedContainer}>
          <View style={styles.selectedInfo}>
            <Ionicons name="musical-notes" size={24} color="#1DB954" />
            <View style={styles.selectedDetails}>
              <Text style={styles.selectedName} numberOfLines={1}>
                {currentTrack.name}
              </Text>
              <Text style={styles.selectedArtist} numberOfLines={1}>
                {currentTrack.artist}
              </Text>
            </View>
          </View>

          <View style={styles.selectedActions}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="swap-horizontal" size={20} color="#fff" />
              <Text style={styles.buttonText}>Ändern</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.removeButton}
              onPress={handleRemoveMusic}
            >
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Add Music Button
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="musical-notes" size={24} color="#1DB954" />
          <Text style={styles.addButtonText}>Musik hinzufügen</Text>
          <Ionicons name="chevron-forward" size={20} color="#888" />
        </TouchableOpacity>
      )}

      {/* Music Browser Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Musik auswählen</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Music Browser */}
          <MusicBrowser
            mode="selector"
            onSelect={handleSelectTrack}
            style={styles.musicBrowser}
          />

          {/* Current Player (if playing) */}
          {playerState.currentTrack && (
            <MusicPlayer compact style={styles.compactPlayer} />
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addButtonText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  selectedContainer: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDetails: {
    flex: 1,
    marginLeft: 12,
  },
  selectedName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedArtist: {
    color: '#aaa',
    fontSize: 14,
  },
  selectedActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1DB954',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  musicBrowser: {
    flex: 1,
  },
  compactPlayer: {
    marginHorizontal: 12,
    marginBottom: 12,
  },
})
