/**
 * TIKTOK-STYLE VIDEO FEED
 * 
 * Features:
 * - One video per screen
 * - Auto-snap scrolling
 * - Instant play on visible
 * - Preload next video
 * - Swipe gestures
 * - Ultra-performance
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, FlatList, Dimensions, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-video';
import { useIntersectionObserver, preloadNextVideo } from '../lib/performance-enhanced';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoItem {
  id: string;
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  user: {
    username: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  views: number;
}

interface VideoFeedProps {
  videos: VideoItem[];
  onEndReached?: () => void;
}

export const TikTokStyleFeed: React.FC<VideoFeedProps> = ({ videos, onEndReached }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  });

  /**
   * Viewability Change Handler
   * Erkennt welches Video aktuell sichtbar ist
   */
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);

      // Preload nächstes Video
      if (index < videos.length - 1) {
        preloadNextVideo(videos[index + 1].videoUrl);
      }
    }
  });

  /**
   * Infinite Scroll
   */
  const handleEndReached = useCallback(() => {
    onEndReached?.();
  }, [onEndReached]);

  /**
   * Render einzelnes Video
   */
  const renderItem = ({ item, index }: { item: VideoItem; index: number }) => (
    <VideoCell
      video={item}
      isActive={index === currentIndex}
      index={index}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        removeClippedSubviews
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
};

/**
 * Einzelne Video-Cell
 */
const VideoCell: React.FC<{
  video: VideoItem;
  isActive: boolean;
  index: number;
}> = React.memo(({ video, isActive, index }) => {
  const videoRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  /**
   * Auto-Play wenn sichtbar
   */
  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.playAsync();
      setIsPlaying(true);
    } else if (videoRef.current) {
      videoRef.current.pauseAsync();
      setIsPlaying(false);
    }
  }, [isActive]);

  /**
   * Toggle Play/Pause
   */
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pauseAsync();
    } else {
      videoRef.current?.playAsync();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  /**
   * Toggle Mute
   */
  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  return (
    <View style={styles.videoCell}>
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: video.videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping
        isMuted={isMuted}
        shouldPlay={isActive}
        posterSource={{ uri: video.thumbnailUrl }}
        usePoster
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{video.user.username}</Text>
          <Text style={styles.title}>{video.title}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <ActionButton
            icon="heart"
            count={video.likes}
            onPress={() => console.log('Like')}
          />
          <ActionButton
            icon="chatbubble"
            count={video.comments}
            onPress={() => console.log('Comment')}
          />
          <ActionButton
            icon="share"
            onPress={() => console.log('Share')}
          />
          <ActionButton
            icon={isMuted ? 'volume-mute' : 'volume-high'}
            onPress={toggleMute}
          />
        </View>
      </View>
    </View>
  );
});

/**
 * Action Button Component
 */
const ActionButton: React.FC<{
  icon: string;
  count?: number;
  onPress: () => void;
}> = ({ icon, count, onPress }) => (
  <View style={styles.actionButton}>
    <TouchableOpacity onPress={onPress}>
      <Ionicons name={icon} size={32} color="#fff" />
      {count !== undefined && <Text style={styles.actionCount}>{formatCount(count)}</Text>}
    </TouchableOpacity>
  </View>
);

/**
 * Format große Zahlen
 */
function formatCount(count: number): string {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoCell: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 80,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actions: {
    justifyContent: 'flex-end',
    paddingBottom: 80,
    gap: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});

// Missing imports for example (add to actual implementation)
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
