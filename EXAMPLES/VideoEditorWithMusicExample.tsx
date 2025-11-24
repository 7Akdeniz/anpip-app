// Example: Video Editor with Music
// Integration in Video Upload/Editor

import React, { useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { MusicSelector } from '../components/music/MusicSelector'
import type { PixabayMusicTrack } from '../types/pixabay-music'

export default function VideoEditorExample() {
  const [selectedMusic, setSelectedMusic] = useState<PixabayMusicTrack | null>(null)
  const [videoData, setVideoData] = useState({
    uri: 'video.mp4',
    music: null as PixabayMusicTrack | null,
  })

  const handleMusicSelect = (track: PixabayMusicTrack) => {
    setSelectedMusic(track)
    setVideoData(prev => ({
      ...prev,
      music: track,
    }))
    console.log('✅ Musik zu Video hinzugefügt:', track.name)
  }

  const handleUpload = async () => {
    // Upload Video mit Musik
    const uploadData = {
      video_uri: videoData.uri,
      music_id: selectedMusic?.id,
      music_url: selectedMusic?.audioUrl,
      music_name: selectedMusic?.name,
      music_artist: selectedMusic?.artist,
    }

    console.log('📤 Upload:', uploadData)
    // Hier dein Upload-Code
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video bearbeiten</Text>

      {/* Music Selector */}
      <MusicSelector
        onSelectMusic={handleMusicSelect}
        currentTrack={selectedMusic}
        style={styles.musicSelector}
      />

      {/* Preview Info */}
      {selectedMusic && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Gewählte Musik:</Text>
          <Text style={styles.previewText}>
            {selectedMusic.name} - {selectedMusic.artist}
          </Text>
          <Text style={styles.previewMeta}>
            {selectedMusic.genre} • {Math.floor(selectedMusic.duration / 60)}:
            {(selectedMusic.duration % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      )}

      {/* Weitere Editor-Features */}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  musicSelector: {
    marginBottom: 16,
  },
  preview: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  previewTitle: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  previewText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewMeta: {
    color: '#aaa',
    fontSize: 14,
  },
})
