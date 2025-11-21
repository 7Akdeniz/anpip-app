/**
 * 🔴 LIVE-STREAMING PAGE
 * 
 * Übersicht aller Live-Streams:
 * - Aktuell Live
 * - Geplante Streams
 * - Nach Kategorien
 * - Nach Standort
 * - Nach Sprache
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { liveStreamingService, LiveStream } from '@/lib/live-streaming-advanced';

export default function LivePage() {
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>([]);
  const [scheduledStreams, setScheduledStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'category' | 'location' | 'language'>('all');

  useEffect(() => {
    loadStreams();
  }, []);

  const loadStreams = async () => {
    setLoading(true);
    try {
      const [live, scheduled] = await Promise.all([
        liveStreamingService.searchLiveStreams({ status: 'live', limit: 50 }),
        liveStreamingService.searchLiveStreams({ status: 'scheduled', limit: 20 }),
      ]);
      setLiveStreams(live);
      setScheduledStreams(scheduled);
    } catch (error) {
      console.error('Error loading streams:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStreamCard = (stream: LiveStream) => (
    <TouchableOpacity
      key={stream.id}
      style={styles.streamCard}
      onPress={() => router.push(`/live/${stream.id}`)}
    >
      {/* Thumbnail */}
      <View style={styles.thumbnailContainer}>
        <Image
          source={{ uri: stream.userAvatar || 'https://via.placeholder.com/300x200' }}
          style={styles.thumbnail}
        />
        
        {/* Live-Badge */}
        {stream.status === 'live' && (
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
        
        {/* Viewer Count */}
        <View style={styles.viewerCount}>
          <Text style={styles.viewerText}>👁️ {stream.viewerCount.toLocaleString()}</Text>
        </View>
      </View>

      {/* Stream Info */}
      <View style={styles.streamInfo}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: stream.userAvatar }}
            style={styles.avatar}
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {stream.title}
          </Text>
          <Text style={styles.username}>{stream.username}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{stream.category}</Text>
            {stream.location && (
              <Text style={styles.location}>📍 {stream.location.city}</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadStreams} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔴 Live Streams</Text>
        <TouchableOpacity
          style={styles.goLiveButton}
          onPress={() => router.push('/live/create')}
        >
          <Text style={styles.goLiveText}>+ Go Live</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'category', 'location', 'language'].map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f as any)}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Live Now */}
      {liveStreams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔴 Live Now ({liveStreams.length})</Text>
          <View style={styles.streamGrid}>
            {liveStreams.map(renderStreamCard)}
          </View>
        </View>
      )}

      {/* Scheduled */}
      {scheduledStreams.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Coming Up ({scheduledStreams.length})</Text>
          <View style={styles.streamGrid}>
            {scheduledStreams.map(renderStreamCard)}
          </View>
        </View>
      )}

      {/* Empty State */}
      {liveStreams.length === 0 && scheduledStreams.length === 0 && !loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>🎥 No live streams at the moment</Text>
          <TouchableOpacity
            style={styles.startStreamButton}
            onPress={() => router.push('/live/create')}
          >
            <Text style={styles.startStreamText}>Start Your First Stream</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  goLiveButton: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goLiveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#222',
  },
  filterTabActive: {
    backgroundColor: '#ff0000',
  },
  filterText: {
    color: '#888',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  streamGrid: {
    gap: 16,
  },
  streamCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  thumbnailContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewerCount: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  viewerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamInfo: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  username: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  category: {
    color: '#ff0000',
    fontSize: 12,
    fontWeight: '600',
  },
  location: {
    color: '#888',
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  startStreamButton: {
    backgroundColor: '#ff0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startStreamText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
