/**
 * 🌍 WORLD TIMELINE MAP
 * ===================
 * Live-Weltkarte mit allen aktiven Videos, Events & Trends
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { worldTimeline, WorldEvent, TrendHeatmap, GlobalSpotlight } from '@/lib/world-timeline-engine';

const { width, height } = Dimensions.get('window');

interface WorldTimelineMapProps {
  onEventSelect?: (event: WorldEvent) => void;
  onVideoSelect?: (videoId: string) => void;
}

export function WorldTimelineMap({ onEventSelect, onVideoSelect }: WorldTimelineMapProps) {
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [heatmaps, setHeatmaps] = useState<TrendHeatmap[]>([]);
  const [spotlight, setSpotlight] = useState<GlobalSpotlight[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);
  const [filter, setFilter] = useState<'all' | WorldEvent['type']>('all');

  useEffect(() => {
    loadData();
    
    // Update alle 10 Sekunden
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadData = async () => {
    try {
      const [eventsData, heatmapData, spotlightData] = await Promise.all([
        worldTimeline.getGlobalEvents(100),
        worldTimeline.getHeatmap(),
        worldTimeline.getGlobalSpotlight(20),
      ]);

      setEvents(filter === 'all' ? eventsData : eventsData.filter(e => e.type === filter));
      setHeatmaps(heatmapData);
      setSpotlight(spotlightData);
    } catch (error) {
      console.error('❌ Failed to load world timeline data:', error);
    }
  };

  const getEventColor = (type: WorldEvent['type']): string => {
    const colors: Record<WorldEvent['type'], string> = {
      disaster: '#FF0000',
      breaking: '#FF6B00',
      viral: '#FF00FF',
      sports: '#00FF00',
      music: '#9D00FF',
      politics: '#0066FF',
      trending: '#FFD700',
      culture: '#FF69B4',
    };
    return colors[type] || '#FFFFFF';
  };

  const getEventIcon = (type: WorldEvent['type']): string => {
    const icons: Record<WorldEvent['type'], string> = {
      disaster: '🚨',
      breaking: '📰',
      viral: '🔥',
      sports: '⚽',
      music: '🎵',
      politics: '🏛️',
      trending: '📈',
      culture: '🎭',
    };
    return icons[type] || '📍';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🌍 World Timeline</Text>
        <Text style={styles.subtitle}>
          {events.length} Live Events · {heatmaps.length} Hot Regions
        </Text>
      </View>

      {/* Filter Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        
        {(['disaster', 'breaking', 'viral', 'sports', 'music', 'politics', 'trending', 'culture'] as const).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive,
              { borderColor: getEventColor(type) }
            ]}
            onPress={() => setFilter(type)}
          >
            <Text style={styles.filterText}>
              {getEventIcon(type)} {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Container (Placeholder - kann mit react-native-maps ersetzt werden) */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapText}>
            🗺️ Interactive Map
          </Text>
          <Text style={styles.mapSubtext}>
            (Integration mit react-native-maps oder Mapbox)
          </Text>
        </View>

        {/* Event Markers Overlay */}
        <View style={styles.markersOverlay}>
          {events.slice(0, 20).map((event, index) => (
            <TouchableOpacity
              key={event.id}
              style={[
                styles.eventMarker,
                {
                  backgroundColor: getEventColor(event.type),
                  left: `${((event.location.lng + 180) / 360) * 100}%`,
                  top: `${((90 - event.location.lat) / 180) * 100}%`,
                  opacity: event.intensity / 100,
                }
              ]}
              onPress={() => {
                setSelectedEvent(event);
                onEventSelect?.(event);
              }}
            >
              <Text style={styles.markerIcon}>{getEventIcon(event.type)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Heatmap Overlay */}
        <View style={styles.heatmapOverlay}>
          {heatmaps.map((heatmap, index) => (
            <View
              key={index}
              style={[
                styles.heatmapCircle,
                {
                  left: `${((heatmap.lng + 180) / 360) * 100}%`,
                  top: `${((90 - heatmap.lat) / 180) * 100}%`,
                  width: heatmap.intensity,
                  height: heatmap.intensity,
                  opacity: heatmap.intensity / 200,
                }
              ]}
            />
          ))}
        </View>
      </View>

      {/* Global Spotlight Feed */}
      <View style={styles.spotlightContainer}>
        <Text style={styles.spotlightTitle}>🌟 Global Spotlight</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {spotlight.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.spotlightCard}
              onPress={() => {
                if (item.videos.length > 0) {
                  onVideoSelect?.(item.videos[0]);
                }
              }}
            >
              <View style={[styles.liveIndicator, !item.isLive && styles.liveIndicatorInactive]}>
                <Text style={styles.liveText}>{item.isLive ? 'LIVE' : 'ENDED'}</Text>
              </View>
              
              <Text style={styles.spotlightCardTitle} numberOfLines={2}>
                {item.title}
              </Text>
              
              <Text style={styles.spotlightCardLocation} numberOfLines={1}>
                📍 {item.location}
              </Text>
              
              <View style={styles.spotlightCardStats}>
                <Text style={styles.spotlightCardStat}>
                  👁️ {item.viewers.toLocaleString()}
                </Text>
                <Text style={styles.spotlightCardStat}>
                  🎬 {item.videos.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Event Details Panel */}
      {selectedEvent && (
        <View style={styles.detailsPanel}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>{selectedEvent.title}</Text>
            <TouchableOpacity onPress={() => setSelectedEvent(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.detailsDescription}>{selectedEvent.description}</Text>

          <View style={styles.detailsStats}>
            <View style={styles.detailsStat}>
              <Text style={styles.detailsStatLabel}>Intensity</Text>
              <Text style={styles.detailsStatValue}>{selectedEvent.intensity}%</Text>
            </View>
            
            <View style={styles.detailsStat}>
              <Text style={styles.detailsStatLabel}>Participants</Text>
              <Text style={styles.detailsStatValue}>{selectedEvent.participants}</Text>
            </View>
            
            <View style={styles.detailsStat}>
              <Text style={styles.detailsStatLabel}>Videos</Text>
              <Text style={styles.detailsStatValue}>{selectedEvent.videos.length}</Text>
            </View>
            
            <View style={styles.detailsStat}>
              <Text style={styles.detailsStatLabel}>AI Confidence</Text>
              <Text style={styles.detailsStatValue}>{selectedEvent.aiConfidence}%</Text>
            </View>
          </View>

          <View style={styles.detailsLocation}>
            <Text style={styles.detailsLocationText}>
              📍 {selectedEvent.location.city}, {selectedEvent.location.country}
            </Text>
          </View>

          <View style={styles.detailsTags}>
            {selectedEvent.tags.slice(0, 5).map(tag => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.viewVideosButton}
            onPress={() => {
              if (selectedEvent.videos.length > 0) {
                onVideoSelect?.(selectedEvent.videos[0]);
              }
            }}
          >
            <Text style={styles.viewVideosButtonText}>
              View {selectedEvent.videos.length} Videos
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    backgroundColor: '#111',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  filterBar: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#222',
  },
  filterButtonActive: {
    backgroundColor: '#444',
    borderColor: '#FFF',
  },
  filterText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 32,
    color: '#666',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#444',
  },
  markersOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  eventMarker: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  markerIcon: {
    fontSize: 20,
  },
  heatmapOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  heatmapCircle: {
    position: 'absolute',
    backgroundColor: '#FF0000',
    borderRadius: 1000,
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  spotlightContainer: {
    backgroundColor: '#111',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  spotlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  spotlightCard: {
    width: 200,
    padding: 12,
    marginRight: 12,
    backgroundColor: '#222',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  liveIndicator: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  liveIndicatorInactive: {
    backgroundColor: '#666',
  },
  liveText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  spotlightCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  spotlightCardLocation: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  spotlightCardStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotlightCardStat: {
    fontSize: 11,
    color: '#AAA',
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.6,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
  closeButton: {
    fontSize: 24,
    color: '#888',
    padding: 8,
  },
  detailsDescription: {
    fontSize: 14,
    color: '#AAA',
    marginBottom: 16,
  },
  detailsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  detailsStat: {
    alignItems: 'center',
  },
  detailsStatLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
  },
  detailsStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  detailsLocation: {
    marginBottom: 16,
  },
  detailsLocationText: {
    fontSize: 14,
    color: '#AAA',
  },
  detailsTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#FFF',
  },
  viewVideosButton: {
    backgroundColor: '#FF0066',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewVideosButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
