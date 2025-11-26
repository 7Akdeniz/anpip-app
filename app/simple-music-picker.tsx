import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

// Demo Musik-Tracks
const DEMO_TRACKS = [
  { id: '1', name: 'Summer Vibes', artist: 'Beach Music', duration: '2:45', genre: 'Pop' },
  { id: '2', name: 'Night Drive', artist: 'Neon Sounds', duration: '3:20', genre: 'Electronic' },
  { id: '3', name: 'Happy Days', artist: 'Sunny Tunes', duration: '2:15', genre: 'Pop' },
  { id: '4', name: 'Chill Beats', artist: 'Lo-Fi Master', duration: '3:00', genre: 'Lo-Fi' },
  { id: '5', name: 'Energy Boost', artist: 'Workout Mix', duration: '2:30', genre: 'Dance' },
  { id: '6', name: 'Acoustic Dreams', artist: 'Guitar Hero', duration: '3:45', genre: 'Acoustic' },
  { id: '7', name: 'Urban Flow', artist: 'Street Beats', duration: '2:55', genre: 'Hip-Hop' },
  { id: '8', name: 'Tropical Sunset', artist: 'Island Vibes', duration: '3:10', genre: 'Reggae' },
  { id: '9', name: 'Jazz Lounge', artist: 'Smooth Jazz', duration: '4:20', genre: 'Jazz' },
  { id: '10', name: 'Rock Energy', artist: 'Power Chords', duration: '3:35', genre: 'Rock' },
];

export default function SimpleMusicPickerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const handleSelectTrack = (track: typeof DEMO_TRACKS[0]) => {
    setSelectedTrack(track.id);
    
    // Navigate back to video editor with selected music
    router.push({
      pathname: '/video-editor',
      params: {
        videoUri: params.videoUri,
        selectedMusic: track.name,
      }
    });
  };

  const renderTrack = ({ item }: { item: typeof DEMO_TRACKS[0] }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => handleSelectTrack(item)}
      activeOpacity={0.7}
    >
      <BlurView intensity={20} style={styles.trackBlur}>
        <View style={styles.trackIcon}>
          <Ionicons name="musical-notes" size={24} color="#00D9FF" />
        </View>
        
        <View style={styles.trackInfo}>
          <Text style={styles.trackName}>{item.name}</Text>
          <Text style={styles.trackArtist}>{item.artist}</Text>
        </View>
        
        <View style={styles.trackMeta}>
          <Text style={styles.trackGenre}>{item.genre}</Text>
          <Text style={styles.trackDuration}>{item.duration}</Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
      </BlurView>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#1a1a1a', '#000000']}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.headerTitle}>Musik auswählen</Text>
            
            <View style={styles.headerRight} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Music List */}
      <FlatList
        data={DEMO_TRACKS}
        renderItem={renderTrack}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  trackItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  trackBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  trackIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,217,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  trackMeta: {
    alignItems: 'flex-end',
  },
  trackGenre: {
    color: '#00D9FF',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackDuration: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
  },
});
