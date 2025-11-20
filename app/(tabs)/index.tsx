/**
 * FEED SCREEN - "For You" Seite (Hauptseite)
 * 
 * Zeigt hochgeladene Videos im Endlos-Feed (TikTok-Style)
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Platform, useWindowDimensions } from 'react-native';
import type { TextStyle } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import { router } from 'expo-router';

// Responsive Breakpoints
const MOBILE_MAX_WIDTH = 768;
const TABLET_MAX_WIDTH = 1366; // iPad Pro 12.9" landscape
const DESKTOP_VIDEO_WIDTH = 500;
const DESKTOP_VIDEO_HEIGHT = 888; // 9:16 aspect ratio

// iPad Video Dimensions (optimiert für alle iPad-Größen)
const IPAD_MINI_WIDTH = 440;          // iPad Mini (768×1024)
const IPAD_MINI_HEIGHT = 782;

const IPAD_AIR_WIDTH = 520;           // iPad Air/Pro 11" (820×1180)
const IPAD_AIR_HEIGHT = 924;

const IPAD_PRO_WIDTH = 600;           // iPad Pro 12.9" (1024×1366)
const IPAD_PRO_HEIGHT = 1066;

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

type TopTab = 'live' | 'following' | 'market' | 'visitors' | 'all';

export default function FeedScreen() {
  const { t } = useI18n();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TopTab>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Responsive Layout Detection
  const isMobile = windowWidth < MOBILE_MAX_WIDTH;
  const isTablet = windowWidth >= MOBILE_MAX_WIDTH && windowWidth < TABLET_MAX_WIDTH;
  const isDesktop = windowWidth >= TABLET_MAX_WIDTH;
  
  // Video Dimensions - optimiert für jede iPad-Größe
  let videoWidth = windowWidth;
  let videoHeight = windowHeight;
  
  if (isTablet) {
    // iPad-spezifische Größen basierend auf Bildschirmbreite
    if (windowWidth <= 834) {
      // iPad Mini (768×1024) oder iPad (810×1080)
      videoWidth = IPAD_MINI_WIDTH;
      videoHeight = IPAD_MINI_HEIGHT;
    } else if (windowWidth <= 1024) {
      // iPad Air (820×1180) oder iPad Pro 11" (834×1194)
      videoWidth = IPAD_AIR_WIDTH;
      videoHeight = IPAD_AIR_HEIGHT;
    } else {
      // iPad Pro 12.9" (1024×1366)
      videoWidth = IPAD_PRO_WIDTH;
      videoHeight = IPAD_PRO_HEIGHT;
    }
  } else if (isDesktop) {
    videoWidth = DESKTOP_VIDEO_WIDTH;
    videoHeight = DESKTOP_VIDEO_HEIGHT;
  }

  const loadVideos = async () => {
    try {
      console.log('📥 Lade Videos...', 'Tab:', activeTab);
      
      // Query basierend auf aktivem Tab
      let query = supabase
        .from('videos')
        .select('*')
        .eq('visibility', 'public');

      // Filter für Market Tab
      if (activeTab === 'market') {
        query = query.eq('is_market_item', true);
        console.log('🏪 Lade Market-Videos...');
      } else if (activeTab === 'all') {
        // Alle Videos anzeigen (normale + Market-Videos)
        console.log('📺 Lade alle Videos...');
      } else {
        // Für andere Tabs: nur normale Videos (keine Market-Items)
        query = query.eq('is_market_item', false);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('❌ Fehler beim Laden:', error);
        throw error;
      }

      console.log('✅ Videos geladen:', data?.length || 0);
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

  useEffect(() => {
    // Videos neu laden wenn Tab wechselt
    loadVideos();
  }, [activeTab]);

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

  const renderVideoItem = ({ item: video, index }: { item: Video; index: number }) => {
    const isActive = index === currentIndex;

    const handleVideoPress = () => {
      if (playingVideo === video.id) {
        setPlayingVideo(null);
      } else {
        setPlayingVideo(video.id);
      }
    };

    return (
      <View 
        style={[
          styles.videoContainer,
          { width: videoWidth, height: videoHeight },
          isDesktop && styles.desktopVideoContainer,
          isTablet && styles.tabletVideoContainer
        ]}
        key={video.id}
      >
        {/* Video Background Gradient */}
        <View style={styles.videoBackground} />
        
        {/* Video Player */}
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
        
        {/* Center Touch Area for Play/Pause */}
        <TouchableOpacity 
          style={styles.centerTouchArea}
          onPress={handleVideoPress}
          activeOpacity={1}
        >
          {playingVideo !== video.id && (
            <View style={styles.playIconContainer} pointerEvents="none">
              <Ionicons 
                name="play" 
                size={64} 
                color="rgba(255,255,255,0.9)"
              />
            </View>
          )}
        </TouchableOpacity>
      
        {/* Rechte Seitenleiste (TikTok-Style) */}
        <View style={styles.rightSidebar} pointerEvents="box-none">
        {/* Profilbild mit Follow Button */}
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => console.log('Profil besuchen', video.user_id)}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person-outline" size={32} color="#FFFFFF" />
          </View>
          <View style={styles.followButton}>
            <Ionicons name="add-circle-outline" size={22} color="#FFFFFF" />
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
      <View style={styles.videoInfo} pointerEvents="none">
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
  };

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
    <View style={[styles.container, isDesktop && styles.desktopContainer]}>
      {/* Top-Bar (transparent overlay) */}
      <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
        {/* Top Tabs - Mitte */}
        <View style={styles.topTabs}>
          {renderTopTab('live', 'radio-outline')}
          {renderTopTab('following', 'people-outline')}
          {renderTopTab('market', 'pricetag-outline')}
          {renderTopTab('visitors', 'footsteps-outline')}
          {renderTopTab('all', 'videocam-outline')}
        </View>

        {/* Sprachauswahl - Rechts */}
        <View style={styles.languageSwitcherContainer}>
          <LanguageSwitcher />
        </View>
      </View>

      {/* Video Feed - Responsive Layout */}
      {loading ? (
        <View style={[styles.loadingContainer, { height: videoHeight }]}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Typography variant="body" style={{ marginTop: Spacing.md, color: '#FFFFFF' }}>
            Videos werden geladen...
          </Typography>
        </View>
      ) : videos.length === 0 ? (
        <View style={[styles.emptyContainer, { height: videoHeight }]}>
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
        <View style={isDesktop ? styles.desktopFeedWrapper : styles.mobileFeedWrapper}>
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            pagingEnabled={isMobile}
            showsVerticalScrollIndicator={!isMobile}
            snapToInterval={isMobile ? videoHeight : undefined}
            snapToAlignment="start"
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            getItemLayout={(data, index) => ({
              length: videoHeight,
              offset: videoHeight * index,
              index,
            })}
            contentContainerStyle={isDesktop && styles.desktopFeedContent}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  desktopContainer: {
    backgroundColor: '#0a0a0a',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: 'transparent',
  },
  desktopTopBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
  },
  marketButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
  },
  languageSwitcherContainer: {
    padding: 4,
  },
  topTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: 24,
  },
  topTabButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTabIndicator: {
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    marginTop: 4,
  },
  mobileFeedWrapper: {
    flex: 1,
  },
  desktopFeedWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
  },
  desktopFeedContent: {
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000000',
  },
  desktopVideoContainer: {
    marginVertical: 16,
    borderRadius: 12,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  tabletVideoContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
    alignSelf: 'center',
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
  centerTouchArea: {
    position: 'absolute',
    top: '25%',
    left: '10%',
    right: '10%',
    bottom: '25%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  playIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 80,
    height: 80,
    borderRadius: 40,
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
  followButton: {
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
    left: 8,
    right: 90,
    zIndex: 5,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 10,
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
    fontSize: 10,
    fontWeight: '300',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
