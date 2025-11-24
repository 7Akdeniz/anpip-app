/**
 * FEED SCREEN - "For You" Seite (Hauptseite)
 * 
 * Zeigt hochgeladene Videos im Endlos-Feed (TikTok-Style)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform, View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { Video as ExpoVideo, ResizeMode, Audio } from 'expo-av';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { getUserFollows } from '@/lib/videoService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

function resolveAppBaseUrl() {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return process.env.EXPO_PUBLIC_APP_URL || 'https://www.anpip.com';
}

interface VideoType {
  id: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  user_id?: string;
  username?: string;
}

type TopTab = 'live' | 'following' | 'ads' | 'all';

export default function FeedScreen() {
  const { requireAuth, user } = useRequireAuth();
  const { state: authState } = useAuth();
  const accessToken = authState.session?.access_token;
  const followApiUrl = useMemo(() => `${resolveAppBaseUrl()}/api/follow`, []);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TopTab>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [followedUsers, setFollowedUsers] = useState<Record<string, boolean>>({});
  const [pendingFollowIds, setPendingFollowIds] = useState<Record<string, boolean>>({});
  const badgeScales = useRef<Record<string, Animated.Value>>({});
  const flatListRef = useRef<FlatList>(null);

  const fetchVideosFromServer = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.anpip.com';
    const feedUrl = new URL('/api/videos/feed', origin);

    const response = await fetch(feedUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Feed-API antwortet mit ' + response.status);
    }

    const payload = await response.json();
    return payload.videos || [];
  };

  const loadVideos = async () => {
    try {
      console.log('📥 Lade Videos...');

      let data: VideoType[] | null = null;

      if (Platform.OS === 'web') {
        data = await fetchVideosFromServer();
      } else {
        const { data: supabaseData, error } = await supabase
          .from('videos')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('❌ Fehler beim Laden über Supabase:', error);
          throw error;
        }

        data = supabaseData || [];
      }

      console.log('✅ Videos geladen:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('🎥 Erstes Video:', {
          id: data[0].id,
          video_url: data[0].video_url,
          description: data[0].description,
        });
      }

      setVideos(data || []);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Audio für Video-Wiedergabe aktivieren
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    loadVideos();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos();
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setCurrentIndex(visibleItem.index || 0);
      setPlayingVideo(visibleItem.item.id);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  useEffect(() => {
    if (!user?.id) {
      setFollowedUsers({});
      setPendingFollowIds({});
      return;
    }

    let active = true;
    (async () => {
      try {
        const ids = await getUserFollows(user.id);
        if (!active) return;
        const followState: Record<string, boolean> = {};
        ids.forEach((id) => {
          followState[id] = true;
        });
        setFollowedUsers(followState);
      } catch (error) {
        console.error('Fehler beim Laden der Follow-Liste:', error);
      }
    })();

    return () => { active = false; };
  }, [user?.id]);

  const getBadgeScaleValue = useCallback((userId: string) => {
    if (!badgeScales.current[userId]) {
      badgeScales.current[userId] = new Animated.Value(1);
    }
    return badgeScales.current[userId];
  }, []);

  const animateFollowBadge = useCallback((targetUserId: string) => {
    const scale = getBadgeScaleValue(targetUserId);
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 140,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start();
  }, [getBadgeScaleValue]);

  const toggleFollow = useCallback(async (targetUserId: string) => {
    if (!targetUserId || !user) return;

    const currentlyFollowing = Boolean(followedUsers[targetUserId]);
    const nextState = !currentlyFollowing;
    setFollowedUsers((prev) => ({ ...prev, [targetUserId]: nextState }));
    setPendingFollowIds((prev) => ({ ...prev, [targetUserId]: true }));
    animateFollowBadge(targetUserId);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(followApiUrl, {
        method: nextState ? 'POST' : 'DELETE',
        headers,
        body: JSON.stringify({ followingId: targetUserId }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok || payload?.error) {
        throw new Error(payload?.error || 'Follow-API Fehler');
      }
    } catch (error) {
      console.error('Follow toggle failed:', error);
      setFollowedUsers((prev) => ({ ...prev, [targetUserId]: currentlyFollowing }));
    } finally {
      setPendingFollowIds((prev) => {
        const next = { ...prev };
        delete next[targetUserId];
        return next;
      });
    }
  }, [accessToken, animateFollowBadge, followApiUrl, followedUsers, user]);

  const handleFollowPress = useCallback((targetUserId: string) => {
    if (!targetUserId) return;
    requireAuth({
      actionName: 'follow',
      message: 'Melde dich an, um Creator:innen zu folgen',
      onAuthSuccess: () => toggleFollow(targetUserId),
    });
  }, [requireAuth, toggleFollow]);

  const renderVideoItem = ({ item: video, index }: { item: VideoType; index: number }) => (
    <View style={styles.videoContainer}>
      {/* Video-Hintergrund (Vollbild 9:16) */}
      <TouchableOpacity 
        style={styles.videoBackground}
        onPress={() => {
          if (playingVideo === video.id) {
            setPlayingVideo(null);
          } else {
            setPlayingVideo(video.id);
          }
        }}
        activeOpacity={1}
      >
        <ExpoVideo
          source={{ uri: video.video_url }}
          style={styles.videoPlayer}
          resizeMode={ResizeMode.COVER}
          shouldPlay={playingVideo === video.id}
          isLooping
          useNativeControls={false}
          isMuted={false}
          volume={1.0}
        />
        {playingVideo !== video.id && (
          <View style={styles.playIconContainer}>
            <Ionicons 
              name="play" 
              size={48} 
              color="rgba(255,255,255,0.25)"
            />
          </View>
        )}
      </TouchableOpacity>
      
      {/* Rechte Seitenleiste (TikTok-Style) */}
      <View style={styles.rightSidebar}>
        {/* Profilbild mit Follow Button */}
        <TouchableOpacity 
          style={styles.profileButton}
          activeOpacity={0.8}
          onPress={() => handleFollowPress(video.user_id || '')}
          disabled={!video.user_id || Boolean(pendingFollowIds[video.user_id || ''])}
        >
          <View
            style={[
              styles.profileCircle,
              video.user_id && followedUsers[video.user_id] && styles.profileCircleFollowing,
              video.user_id && pendingFollowIds[video.user_id] && styles.profileCirclePending,
            ]}
          >
            <Ionicons name="person-outline" size={32} color="#FFFFFF" />
            {video.user_id && !followedUsers[video.user_id] && (
              <Animated.View
                style={[
                  styles.followBadge,
                  { transform: [{ scale: getBadgeScaleValue(video.user_id) }] },
                ]}
              >
                <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
              </Animated.View>
            )}
          </View>
        </TouchableOpacity>
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Like', video.id)}
        >
          <Ionicons name="heart-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Kommentar Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Comment', video.id)}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Teilen Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Share', video.id)}
        >
          <Ionicons name="share-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Speichern Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Save', video.id)}
        >
          <Ionicons name="bookmark-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Gift Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Gift', video.id)}
        >
          <Ionicons name="gift-outline" size={24} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Last Gift Sender Profile */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => console.log('Last gift sender', video.id)}
        >
          <View style={styles.sidebarCircle}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        {/* Musik Button 2 */}
        <TouchableOpacity 
          style={[styles.sidebarButton, { marginTop: 8 }]}
          onPress={() => console.log('Sound 2', video.id)}
        >
          <Ionicons name="musical-notes-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Video-Info (unten links) */}
      <View style={styles.videoInfo}>
        <Typography variant="body" style={styles.username}>
          @{video.username || 'user'}
        </Typography>
        <Typography variant="body" style={styles.description} numberOfLines={2}>
          {video.description || 'Keine Beschreibung'}
        </Typography>
        <Typography variant="caption" style={styles.hashtags}>
          #anpip #video {new Date(video.created_at).toLocaleDateString('de-DE')}
        </Typography>
      </View>
    </View>
  );

  const renderTopTab = (tab: TopTab, iconName: string) => {
    const isActive = activeTab === tab;

    return (
      <TouchableOpacity 
        key={tab}
        onPress={() => setActiveTab(tab)}
        style={styles.topTabButton}
      >
        <Ionicons 
          name={iconName as any}
          size={24}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
          style={{
            textShadowColor: 'rgba(0, 0, 0, 0.8)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 4,
          }}
        />
        {isActive && <View style={styles.topTabIndicator} />}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Top-Bar (transparent overlay) */}
      <View style={styles.topBar}>
        <View style={styles.topTabs}>
          {renderTopTab('live', 'radio-outline')}
          {renderTopTab('following', 'people-outline')}
          {renderTopTab('ads', 'pricetag-outline')}
          {renderTopTab('all', 'videocam-outline')}
        </View>
      </View>

      {/* Video Feed - Vollbild mit Paging */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Typography variant="body" style={{ marginTop: Spacing.md, color: '#FFFFFF' }}>
            Videos werden geladen...
          </Typography>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.videoBackground} />
          <Ionicons name="videocam-outline" size={80} color="rgba(255,255,255,0.7)" />
          <Typography variant="h3" align="center" style={{ marginTop: Spacing.md, color: '#FFFFFF' }}>
            Noch keine Videos
          </Typography>
          <Typography variant="caption" align="center" style={{ marginTop: Spacing.sm, color: 'rgba(255,255,255,0.7)' }}>
            Lade dein erstes Video hoch!
          </Typography>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          getItemLayout={(data, index) => ({
            length: SCREEN_HEIGHT,
            offset: SCREEN_HEIGHT * index,
            index,
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 32,
    paddingBottom: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTabButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  topTabIndicator: {
    width: 28,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginTop: 4,
  },
  loadingContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  emptyContainer: {
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'relative',
    backgroundColor: '#000000',
  },
  videoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  videoPlayer: {
    width: '100%',
    height: '100%',
  },
  playIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  rightSidebar: {
    position: 'absolute',
    right: 0,
    bottom: 55,
    alignItems: 'center',
    zIndex: 5,
  },
  profileButton: {
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  profileCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profileCircleFollowing: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  profileCirclePending: {
    opacity: 0.6,
  },
  followBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF3B5C',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -11,
  },
  sidebarButton: {
    alignItems: 'center',
    marginBottom: 0,
  },
  sidebarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  sidebarText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '600',
    marginTop: -5,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  videoInfo: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 90,
    zIndex: 5,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '300',
    lineHeight: 12,
    marginBottom: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hashtags: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
