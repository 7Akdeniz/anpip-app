/**
 * ANPIP.COM - OPTIMIERTER FEED SCREEN (BEISPIEL)
 * 
 * Demonstriert alle Optimierungen:
 * - Responsive Design
 * - Performance Optimierung
 * - Touch-Optimierung
 * - Browser-Kompatibilität
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Typography } from '@/components/ui';
import { ResponsiveVideoPlayer } from '@/components/ui/ResponsiveVideoPlayer';
import { ResponsiveButton } from '@/components/ui/ResponsiveButton';
import { ResponsiveCard } from '@/components/ui/ResponsiveCard';
import { Colors, Spacing } from '@/constants/Theme';
import { responsive, VideoSizes } from '@/constants/Responsive';
import { useResponsive } from '@/hooks/useResponsive';
import {
  debounce,
  throttle,
  performanceMonitor,
  ListOptimization,
} from '@/constants/Performance';
import { supabase } from '@/lib/supabase';
import { runAfterInteractions } from '@/constants/Performance';

interface Video {
  id: string;
  video_url: string;
  thumbnail_url?: string;
  description: string;
  views_count: number;
  likes_count: number;
  created_at: string;
  username?: string;
}

export default function OptimizedFeedScreen() {
  // ============================
  // HOOKS
  // ============================
  
  const {
    isPhone,
    isTablet,
    isDesktop,
    responsive: responsiveValue,
    safeAreaInsets,
  } = useResponsive();
  
  // ============================
  // STATE
  // ============================
  
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // ============================
  // PERFORMANCE MONITORING
  // ============================
  
  const loadVideos = useCallback(async () => {
    performanceMonitor.start('load-videos');
    
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      performanceMonitor.end('load-videos');
    }
  }, []);
  
  // ============================
  // EFFECTS
  // ============================
  
  useEffect(() => {
    // Lade Videos nach Interaktionen (verhindert Ruckeln)
    runAfterInteractions(() => {
      loadVideos();
    });
  }, [loadVideos]);
  
  // ============================
  // HANDLERS
  // ============================
  
  // Throttle Scroll Events für bessere Performance
  const handleViewableItemsChanged = useRef(
    throttle(({ viewableItems }: any) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index || 0);
      }
    }, 100)
  ).current;
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVideos();
  }, [loadVideos]);
  
  // ============================
  // RENDER FUNCTIONS
  // ============================
  
  const renderVideo = useCallback(({ item, index }: { item: Video; index: number }) => {
    const isVisible = index === currentIndex;
    
    return (
      <View
        style={[
          styles.videoContainer,
          {
            width: responsive.screenWidth,
            height: responsiveValue({
              phone: responsive.screenHeight * 0.85,
              tablet: responsive.screenHeight * 0.75,
              desktop: 800,
              default: responsive.screenHeight * 0.85,
            }),
          },
        ]}
      >
        {/* Video Player */}
        <ResponsiveVideoPlayer
          uri={item.video_url}
          thumbnailUri={item.thumbnail_url}
          shouldPlay={isVisible}
          isLooping={true}
          showControls={true}
          autoQuality={true}
        />
        
        {/* Video Info Overlay */}
        <View
          style={[
            styles.infoOverlay,
            {
              bottom: safeAreaInsets.bottom + Spacing.md,
              left: Spacing.md,
              right: Spacing.md,
            },
          ]}
        >
          <ResponsiveCard variant="filled" style={styles.infoCard}>
            {/* Username */}
            {item.username && (
              <Typography variant="caption" style={styles.username}>
                @{item.username}
              </Typography>
            )}
            
            {/* Description */}
            <Typography variant="body" style={styles.description}>
              {item.description}
            </Typography>
            
            {/* Stats */}
            <View style={styles.stats}>
              <Typography variant="caption">
                👁️ {formatNumber(item.views_count)} Views
              </Typography>
              <Typography variant="caption">
                ❤️ {formatNumber(item.likes_count)} Likes
              </Typography>
            </View>
          </ResponsiveCard>
        </View>
        
        {/* Action Buttons (nur Mobile) */}
        {isPhone && (
          <View
            style={[
              styles.actionButtons,
              {
                right: Spacing.md,
                bottom: safeAreaInsets.bottom + 100,
              },
            ]}
          >
            <ActionButton icon="heart-outline" count={item.likes_count} />
            <ActionButton icon="chatbubble-outline" count={0} />
            <ActionButton icon="share-outline" count={0} />
          </View>
        )}
      </View>
    );
  }, [currentIndex, isPhone, safeAreaInsets, responsiveValue]);
  
  const renderHeader = () => (
    <View style={styles.header}>
      <Typography variant="h1">Feed</Typography>
      
      {/* Tabs (nur Desktop/Tablet) */}
      {(isTablet || isDesktop) && (
        <View style={styles.tabs}>
          <ResponsiveButton title="Für dich" variant="primary" size="small" onPress={() => {}} />
          <ResponsiveButton title="Following" variant="text" size="small" onPress={() => {}} />
          <ResponsiveButton title="Live" variant="text" size="small" onPress={() => {}} />
        </View>
      )}
    </View>
  );
  
  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Typography variant="h2">Keine Videos gefunden</Typography>
      <ResponsiveButton
        title="Jetzt hochladen"
        variant="primary"
        onPress={() => {}}
      />
    </View>
  );
  
  // ============================
  // LOADING STATE
  // ============================
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Typography variant="body" style={styles.loadingText}>
          Lade Videos...
        </Typography>
      </View>
    );
  }
  
  // ============================
  // MAIN RENDER
  // ============================
  
  return (
    <View style={styles.container}>
      {renderHeader()}
      
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderVideo}
        keyExtractor={ListOptimization.keyExtractor}
        // Performance Optimierungen
        {...ListOptimization.getOptimalFlatListProps(videos.length)}
        // Pagination
        pagingEnabled={isPhone}
        snapToAlignment="start"
        snapToInterval={responsive.screenHeight}
        decelerationRate="fast"
        // Viewability
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        // Refresh
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        // Empty State
        ListEmptyComponent={renderEmpty}
        // Styling
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: safeAreaInsets.top,
        }}
      />
    </View>
  );
}

// ============================
// HELPER COMPONENTS
// ============================

function ActionButton({
  icon,
  count,
}: {
  icon: string;
  count: number;
}) {
  const { scale } = useResponsive();
  
  return (
    <View style={styles.actionButton}>
      <ResponsiveButton
        title=""
        variant="text"
        size="large"
        onPress={() => {}}
        icon={
          <View style={{ width: scale(40), height: scale(40) }}>
            {/* Icon here */}
          </View>
        }
      />
      {count > 0 && (
        <Typography variant="caption" style={styles.actionCount}>
          {formatNumber(count)}
        </Typography>
      )}
    </View>
  );
}

// ============================
// HELPER FUNCTIONS
// ============================

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

// ============================
// STYLES
// ============================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  videoContainer: {
    position: 'relative',
  },
  infoOverlay: {
    position: 'absolute',
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  username: {
    color: Colors.textOnPrimary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },
  description: {
    color: Colors.textOnPrimary,
    marginBottom: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButtons: {
    position: 'absolute',
    gap: Spacing.md,
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: Colors.textOnPrimary,
    marginTop: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
});
