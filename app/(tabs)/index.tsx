/**
 * FEED SCREEN - "For You" Seite (Hauptseite)
 * 
 * Zeigt hochgeladene Videos im Endlos-Feed (TikTok-Style)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Platform, useWindowDimensions, Alert } from 'react-native';
import type { TextStyle } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/i18n/I18nContext';
import { supabase } from '@/lib/supabase';
import { Video as ExpoVideo, ResizeMode, AVPlaybackStatus, Audio } from 'expo-av';
import { router } from 'expo-router';
import { useLocation } from '@/contexts/LocationContext';
import { calculateDistance } from '@/lib/locationService';
import { ShareModal } from '@/components/modals/ShareModal';
import { CommentModal } from '@/components/modals/CommentModal';
import { MusicModal } from '@/components/modals/MusicModal';
import { GiftModal } from '@/components/modals/GiftModal';
import * as Clipboard from 'expo-clipboard';
import { 
  likeVideo, 
  followUser, 
  saveVideo, 
  getUserLikes, 
  getUserFollows, 
  getUserSavedVideos,
  getLiveVideos,
  getFollowingFeed,
  trackView,
  trackShare
} from '@/lib/videoService';
import { getLastGiftSender, getVideoGiftCount } from '@/lib/giftService';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// Web Video Component
const WebVideo = Platform.OS === 'web' ? require('react').createElement : null;

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
  is_market_item?: boolean;
  is_live?: boolean;
  location_city?: string;
  location_country?: string;
  location_lat?: number;
  location_lon?: number;
  location_display_name?: string;
  market_category?: string;
  market_subcategory?: string;
  distance?: number; // Distanz zum Nutzer in km
  gifts_count?: number;
  last_gift_sender?: any;
}

type TopTab = 'live' | 'following' | 'market' | 'activity' | 'all';

export default function FeedScreen() {
  const { t } = useI18n();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { userLocation } = useLocation(); // Nutzer-Standort
  const { requireAuth } = useRequireAuth(); // Auth-Gating
  
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TopTab>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localOnly, setLocalOnly] = useState(true);
  const [currentUserId] = useState('temp-user-id');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const loadingMoreRef = useRef(false);
  
  // Modal States
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [musicModalVisible, setMusicModalVisible] = useState(false);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const [selectedVideoForModal, setSelectedVideoForModal] = useState<VideoType | null>(null);
  
  // Video Interaction States (optimistic updates)
  const [likedVideos, setLikedVideos] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [savedVideos, setSavedVideos] = useState<Set<string>>(new Set());
  
  // Responsive Layout Detection mit useMemo
  const videoDimensions = useMemo(() => {
    const isMobile = windowWidth < MOBILE_MAX_WIDTH;
    const isTablet = windowWidth >= MOBILE_MAX_WIDTH && windowWidth < TABLET_MAX_WIDTH;
    const isDesktop = windowWidth >= TABLET_MAX_WIDTH;
    
    let videoWidth = windowWidth;
    let videoHeight = windowHeight;
    
    if (isTablet) {
      if (windowWidth <= 834) {
        videoWidth = IPAD_MINI_WIDTH;
        videoHeight = IPAD_MINI_HEIGHT;
      } else if (windowWidth <= 1024) {
        videoWidth = IPAD_AIR_WIDTH;
        videoHeight = IPAD_AIR_HEIGHT;
      } else {
        videoWidth = IPAD_PRO_WIDTH;
        videoHeight = IPAD_PRO_HEIGHT;
      }
    } else if (isDesktop) {
      videoWidth = DESKTOP_VIDEO_WIDTH;
      videoHeight = DESKTOP_VIDEO_HEIGHT;
    }
    
    return { videoWidth, videoHeight, isMobile, isTablet, isDesktop };
  }, [windowWidth, windowHeight]);
  
  const { videoWidth, videoHeight, isMobile, isTablet, isDesktop } = videoDimensions;

  const loadVideos = useCallback(async (loadMore = false) => {
    if (loadingMoreRef.current) return;
    
    loadingMoreRef.current = true;
    const currentPage = loadMore ? page : 0;
    const BATCH_SIZE = 20; // Kleinere Batches für schnelleres Laden
    
    try {
      console.log('📥 Lade Videos...', 'Tab:', activeTab, 'Seite:', currentPage);
      
      let processedVideos: VideoType[] = [];

      // TAB-BASIERTE FILTERUNG
      if (activeTab === 'live') {
        // Nur Live-Videos
        const liveVideos = await getLiveVideos(100);
        processedVideos = liveVideos;
        console.log('🔴 Live-Videos geladen:', processedVideos.length);
        
      } else if (activeTab === 'following') {
        // Videos von Personen denen der User folgt
        const followingVideos = await getFollowingFeed(currentUserId, 100);
        processedVideos = followingVideos;
        console.log('👥 Following-Feed geladen:', processedVideos.length);
        
      } else if (activeTab === 'market') {
        // Market/Kleinanzeigen-Videos
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('visibility', 'public')
          .eq('is_market_item', true)
          .order('created_at', { ascending: false })
          .range(currentPage * BATCH_SIZE, (currentPage + 1) * BATCH_SIZE - 1)
          .limit(BATCH_SIZE);

        if (error) throw error;
        processedVideos = data || [];
        console.log('🏪 Market-Videos geladen:', processedVideos.length);
        
      } else if (activeTab === 'activity') {
        // Aktivität - wird über separate Route gehandhabt
        router.push('/activity');
        return;
        
      } else {
        // 'all' - ALLE Videos (normale + Market)
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('visibility', 'public')
          .order('created_at', { ascending: false })
          .range(currentPage * BATCH_SIZE, (currentPage + 1) * BATCH_SIZE - 1)
          .limit(BATCH_SIZE);

        if (error) throw error;
        processedVideos = data || [];
        console.log('📺 Alle Videos geladen:', processedVideos.length);
      }

      // Standortbasierte Sortierung für Market-Tab
      if (activeTab === 'market' && userLocation && processedVideos.length > 0) {
        console.log('📍 Sortiere Market-Videos nach Standort...');
        
        // Berechne Distanz für jedes Video
        processedVideos = processedVideos.map(video => {
          if (video.location_lat && video.location_lon) {
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              video.location_lat,
              video.location_lon
            );
            return { ...video, distance };
          }
          return { ...video, distance: 99999 }; // Videos ohne Standort ans Ende
        });

        // Filtern nach lokalem Standort (wenn aktiviert)
        if (localOnly) {
          // Zeige nur Videos aus gleicher Stadt oder max 50km Umkreis
          processedVideos = processedVideos.filter(video => {
            if (video.location_city === userLocation.city) {
              return true; // Gleiche Stadt
            }
            return video.distance !== undefined && video.distance <= 50; // Max 50km
          });
          
          console.log(`📍 Lokale Filter: ${processedVideos.length} Videos in ${userLocation.city} oder <50km`);
        }

        // Sortiere nach Distanz (nächste zuerst)
        processedVideos.sort((a, b) => {
          const distA = a.distance ?? 99999;
          const distB = b.distance ?? 99999;
          return distA - distB;
        });

        console.log('📍 Videos nach Distanz sortiert:', processedVideos.slice(0, 5).map(v => ({
          city: v.location_city,
          distance: v.distance,
        })));
      }

      // Gift-Daten PARALLEL laden (viel schneller!)
      if (processedVideos.length > 0) {
        const giftDataPromises = processedVideos.map(video =>
          Promise.all([
            getVideoGiftCount(video.id),
            getLastGiftSender(video.id)
          ]).then(([giftCount, lastGiftSender]) => ({
            id: video.id,
            giftCount,
            lastGiftSender
          }))
        );
        
        const giftData = await Promise.all(giftDataPromises);
        
        // Gift-Daten zu Videos hinzufügen
        processedVideos.forEach(video => {
          const data = giftData.find(d => d.id === video.id);
          if (data) {
            video.gifts_count = data.giftCount;
            video.last_gift_sender = data.lastGiftSender;
          }
        });
      }

      if (processedVideos.length > 0) {
        console.log('🎥 Erstes Video:', {
          id: processedVideos[0].id,
          video_url: processedVideos[0].video_url,
          description: processedVideos[0].description,
          is_market_item: processedVideos[0].is_market_item,
          is_live: processedVideos[0].is_live,
          location: processedVideos[0].location_city,
          distance: processedVideos[0].distance,
        });
      }
      
      if (loadMore) {
        setVideos(prev => [...prev, ...processedVideos]);
        setPage(currentPage + 1);
      } else {
        setVideos(processedVideos);
        setPage(1);
      }
      
      setHasMore(processedVideos.length === BATCH_SIZE);
    } catch (error) {
      console.error('Fehler:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      loadingMoreRef.current = false;
    }
  }, [activeTab, localOnly, userLocation, page]);

  useEffect(() => {
    // Audio für Video-Wiedergabe aktivieren
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    // Lade User-Daten (Likes, Follows, Saved Videos)
    loadUserData();
    loadVideos();
  }, []);

  useEffect(() => {
    // Videos neu laden wenn Tab wechselt oder Filter sich ändert
    setPage(0);
    setVideos([]);
    loadVideos(false);
  }, [activeTab, localOnly]);

  const loadUserData = useCallback(async () => {
    try {
      const [likes, follows, saved] = await Promise.all([
        getUserLikes(currentUserId),
        getUserFollows(currentUserId),
        getUserSavedVideos(currentUserId),
      ]);

      setLikedVideos(new Set(likes));
      setFollowedUsers(new Set(follows));
      setSavedVideos(new Set(saved));
    } catch (error) {
      console.error('Load user data error:', error);
    }
  }, [currentUserId]);

  // Autoplay: Erstes Video automatisch starten und View tracken
  useEffect(() => {
    if (videos.length > 0 && !playingVideo) {
      const firstVideo = videos[0];
      setPlayingVideo(firstVideo.id);
      
      // Track view
      trackView(currentUserId, firstVideo.id).catch(console.error);
      
      // Für Web: Video direkt abspielen
      if (Platform.OS === 'web') {
        setTimeout(() => {
          const firstVideoEl = document.getElementById(`video-${firstVideo.id}`) as HTMLVideoElement;
          if (firstVideoEl) {
            firstVideoEl.play().catch((error) => {
              console.log('Autoplay blocked, waiting for user interaction');
            });
          }
        }, 300);
      }
    }
  }, [videos]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(0);
    setVideos([]);
    loadVideos(false);
  }, [loadVideos]);

  const onEndReached = useCallback(() => {
    if (hasMore && !loading && !loadingMoreRef.current) {
      console.log('📜 Lade mehr Videos...');
      loadVideos(true);
    }
  }, [hasMore, loading, loadVideos]);

  /**
   * INTERAKTIONS-FUNKTIONEN
   */
  
  // Like Video
  const handleLikeVideo = useCallback(async (video: VideoType) => {
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'like',
      onAuthSuccess: async () => {
        const isLiked = likedVideos.has(video.id);
        
        // Optimistic update
        if (isLiked) {
          setLikedVideos(prev => {
            const next = new Set(prev);
            next.delete(video.id);
            return next;
          });
        } else {
          setLikedVideos(prev => new Set(prev).add(video.id));
        }
        
        // Update local state
        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { ...v, likes_count: v.likes_count + (isLiked ? -1 : 1) }
            : v
        ));
        
        try {
          await likeVideo(currentUserId, video.id);
        } catch (error) {
          console.error('Like failed:', error);
          // Revert on error
          if (isLiked) {
            setLikedVideos(prev => new Set(prev).add(video.id));
          } else {
            setLikedVideos(prev => {
              const next = new Set(prev);
              next.delete(video.id);
              return next;
            });
          }
          setVideos(prev => prev.map(v => 
            v.id === video.id 
              ? { ...v, likes_count: v.likes_count + (isLiked ? 1 : -1) }
              : v
          ));
        }
      },
    });
  }, [likedVideos, currentUserId, requireAuth]);
  
  // Follow User
  const handleFollowUser = useCallback(async (userId?: string) => {
    if (!userId) return;
    
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'follow',
      onAuthSuccess: async () => {
        const isFollowing = followedUsers.has(userId);
        
        // Optimistic update
        if (isFollowing) {
          setFollowedUsers(prev => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
          });
        } else {
          setFollowedUsers(prev => new Set(prev).add(userId));
        }
        
        try {
          await followUser(currentUserId, userId);
        } catch (error) {
          console.error('Follow failed:', error);
          // Revert on error
          if (isFollowing) {
            setFollowedUsers(prev => new Set(prev).add(userId));
          } else {
            setFollowedUsers(prev => {
              const next = new Set(prev);
              next.delete(userId);
              return next;
            });
          }
        }
      },
    });
  }, [followedUsers, currentUserId, requireAuth]);
  
  // Open Comment Modal
  const handleOpenComments = useCallback((video: VideoType) => {
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'comment',
      onAuthSuccess: () => {
        setSelectedVideoForModal(video);
        setCommentModalVisible(true);
      },
    });
  }, [requireAuth]);
  
  // Open Share Modal
  const handleOpenShare = useCallback(async (video: VideoType) => {
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'share',
      onAuthSuccess: async () => {
        setSelectedVideoForModal(video);
        setShareModalVisible(true);
        
        // Track share
        await trackShare(currentUserId, video.id).catch(console.error);
      },
    });
  }, [currentUserId, requireAuth]);
  
  // Save/Bookmark Video
  const handleSaveVideo = useCallback(async (video: VideoType) => {
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'save',
      onAuthSuccess: async () => {
        const isSaved = savedVideos.has(video.id);
        
        // Optimistic update
        if (isSaved) {
          setSavedVideos(prev => {
            const next = new Set(prev);
            next.delete(video.id);
            return next;
          });
        } else {
          setSavedVideos(prev => new Set(prev).add(video.id));
        }
        
        try {
          await saveVideo(currentUserId, video.id);
          
          Alert.alert(
            isSaved ? 'Entfernt' : 'Gespeichert',
            isSaved ? 'Video aus Sammlung entfernt' : 'Video gespeichert'
          );
        } catch (error) {
          console.error('Save failed:', error);
          // Revert on error
          if (isSaved) {
            setSavedVideos(prev => new Set(prev).add(video.id));
          } else {
            setSavedVideos(prev => {
              const next = new Set(prev);
              next.delete(video.id);
              return next;
            });
          }
          Alert.alert('Fehler', 'Video konnte nicht gespeichert werden');
        }
      },
    });
  }, [savedVideos, currentUserId, requireAuth]);
  
  // Open Gift Modal
  const handleOpenGift = useCallback((video: VideoType) => {
    // Auth-Check: User muss angemeldet sein
    requireAuth({
      actionName: 'gift',
      onAuthSuccess: () => {
        setSelectedVideoForModal(video);
        setGiftModalVisible(true);
      },
    });
  }, [requireAuth]);
  
  // Open Music Modal
  const handleOpenMusic = useCallback((video: VideoType) => {
    setSelectedVideoForModal(video);
    setMusicModalVisible(true);
  }, []);
  
  // View Profile (last gift sender)
  const handleViewLastGiftSender = useCallback((video: VideoType) => {
    if (video.last_gift_sender?.sender?.id) {
      // Navigate to profile
      router.push(`/(tabs)/profile?userId=${video.last_gift_sender.sender.id}` as any);
    } else {
      Alert.alert('Info', 'Noch keine Geschenke für dieses Video');
    }
  }, []);

  const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const visibleItem = viewableItems[0];
      setCurrentIndex(visibleItem.index || 0);
      const newVideoId = visibleItem.item.id;
      setPlayingVideo(newVideoId);
      
      // Track view
      trackView(currentUserId, newVideoId).catch(console.error);
      
      // Für Web: Video abspielen
      if (Platform.OS === 'web') {
        setTimeout(() => {
          const videoElements = document.querySelectorAll('video');
          videoElements.forEach((video) => {
            if (video.src.includes(newVideoId)) {
              video.play().catch(() => {
                // Autoplay blocked
              });
            } else {
              video.pause();
            }
          });
        }, 100);
      }
    }
  }, [currentUserId]);

  const onViewableItemsChangedRef = useRef({ onViewableItemsChanged });

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80, // Video muss 80% sichtbar sein
    minimumViewTime: 100,
    waitForInteraction: false,
  }).current;

  const snapToOffsets = useMemo(() => videos.map((_, index) => index * videoHeight), [videos.length, videoHeight]);

  const renderVideoItem = useCallback(({ item: video, index }: { item: VideoType; index: number }) => {
    const isActive = index === currentIndex;

    const handleVideoPress = () => {
      if (Platform.OS === 'web') {
        const videoElement = document.getElementById(`video-${video.id}`) as HTMLVideoElement;
        if (videoElement) {
          if (playingVideo === video.id) {
            videoElement.pause();
            setPlayingVideo(null);
          } else {
            videoElement.play().catch(() => {
              // Autoplay blocked
            });
            setPlayingVideo(video.id);
          }
        }
      } else {
        if (playingVideo === video.id) {
          setPlayingVideo(null);
        } else {
          setPlayingVideo(video.id);
        }
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
        
        {/* Video Player - Web vs Native */}
        {Platform.OS === 'web' ? (
          <video
            id={`video-${video.id}`}
            src={video.video_url}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
            }}
            autoPlay={playingVideo === video.id}
            loop
            playsInline
            muted={false}
            controls={false}
            webkit-playsinline="true"
            onLoadedData={(e: any) => {
              if (playingVideo === video.id) {
                e.target.play().catch(() => {
                  // Autoplay blocked - user interaction needed
                });
              }
            }}
          />
        ) : (
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
        )}
        
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
          onPress={() => handleFollowUser(video.user_id)}
        >
          <View style={styles.profileCircle}>
            <Ionicons name="person-outline" size={32} color="#FFFFFF" />
          </View>
          <View style={[
            styles.followButton,
            video.user_id && followedUsers.has(video.user_id) && styles.followButtonActive
          ]}>
            <Ionicons 
              name={video.user_id && followedUsers.has(video.user_id) ? "checkmark" : "add-circle-outline"} 
              size={22} 
              color="#FFFFFF" 
            />
          </View>
        </TouchableOpacity>
        
        {/* Like Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleLikeVideo(video)}
        >
          <Ionicons 
            name={likedVideos.has(video.id) ? "heart" : "heart-outline"} 
            size={28} 
            color={likedVideos.has(video.id) ? "#FF3B5C" : "#FFFFFF"} 
          />
          <Typography variant="caption" style={styles.sidebarText}>
            {video.likes_count || 0}
          </Typography>
        </TouchableOpacity>
        
        {/* Kommentar Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleOpenComments(video)}
        >
          <Ionicons name="chatbubble-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            {video.comments_count || 0}
          </Typography>
        </TouchableOpacity>
        
        {/* Teilen Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleOpenShare(video)}
        >
          <Ionicons name="share-outline" size={28} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            {video.shares_count || 0}
          </Typography>
        </TouchableOpacity>
        
        {/* Speichern Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleSaveVideo(video)}
        >
          <Ionicons 
            name={savedVideos.has(video.id) ? "bookmark" : "bookmark-outline"} 
            size={28} 
            color={savedVideos.has(video.id) ? Colors.primary : "#FFFFFF"}
          />
          <Typography variant="caption" style={styles.sidebarText}>
            {savedVideos.has(video.id) ? '✓' : ''}
          </Typography>
        </TouchableOpacity>
        
        {/* Gift Button */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleOpenGift(video)}
        >
          <Ionicons name="gift-outline" size={24} color="#FFFFFF" />
          <Typography variant="caption" style={styles.sidebarText}>
            0
          </Typography>
        </TouchableOpacity>
        
        {/* Last Gift Sender Profile */}
        <TouchableOpacity 
          style={styles.sidebarButton}
          onPress={() => handleViewLastGiftSender(video)}
        >
          <View style={styles.sidebarCircle}>
            <Ionicons name="person-outline" size={20} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        
        {/* Musik Button */}
        <TouchableOpacity 
          style={[styles.sidebarButton, { marginTop: 8 }]}
          onPress={() => handleOpenMusic(video)}
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
  }, [currentIndex, playingVideo, likedVideos, followedUsers, savedVideos, videoWidth, videoHeight, isDesktop, isTablet, handleLikeVideo, handleFollowUser, handleOpenComments, handleOpenShare, handleSaveVideo, handleOpenGift, handleViewLastGiftSender, handleOpenMusic]);

  const renderTopTab = useCallback((tab: TopTab, iconName: string, label?: string) => {
    const isActive = activeTab === tab;

    const handlePress = () => {
      if (tab === 'activity') {
        // Navigate to activity screen
        router.push('/activity');
      } else {
        setActiveTab(tab);
      }
    };

    return (
      <TouchableOpacity 
        key={tab}
        onPress={handlePress}
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
  }, [activeTab]);
  
  return (
    <View style={[styles.container, isDesktop && styles.desktopContainer]}>
      {/* Top-Bar (transparent overlay) */}
      <View style={[styles.topBar, isDesktop && styles.desktopTopBar]}>
        {/* Top Tabs - Mitte */}
        <View style={styles.topTabs}>
          {renderTopTab('live', 'radio-outline', 'Live')}
          {renderTopTab('following', 'people-outline', 'Freunde')}
          {renderTopTab('market', 'pricetag-outline', 'Markt')}
          {renderTopTab('activity', 'footsteps-outline', 'Aktivität')}
          {renderTopTab('all', 'videocam-outline', 'Alle')}
        </View>
      </View>

      {/* Standort-Filter für Market-Tab - DEAKTIVIERT */}
      {false && activeTab === 'market' && userLocation && (
        <View style={styles.locationFilterBar}>
          <View style={styles.locationInfo}>
            <Ionicons name="location" size={14} color={Colors.primary} />
            <Typography variant="caption" style={styles.locationText}>
              {userLocation?.city}, {userLocation?.country}
            </Typography>
          </View>
          
          <TouchableOpacity
            style={styles.locationToggle}
            onPress={() => setLocalOnly(!localOnly)}
          >
            <Ionicons 
              name={localOnly ? 'location' : 'globe-outline'} 
              size={14} 
              color={localOnly ? Colors.primary : 'rgba(255,255,255,0.6)'} 
            />
            <Typography 
              variant="caption" 
              style={localOnly ? styles.locationToggleTextActive : styles.locationToggleText}
            >
              {localOnly ? 'Lokal' : 'Global'}
            </Typography>
          </TouchableOpacity>
        </View>
      )}

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
          <View style={styles.emptyContentBox}>
            {/* Großes visuelles Element - KEIN Icon, nur CSS */}
            <View style={styles.emptyIconPlaceholder}>
              <View style={styles.cameraShape} />
            </View>
            
            <Typography variant="h3" align="center" style={styles.emptyTitle}>
              Noch keine Videos
            </Typography>
            
            <Typography variant="body" align="center" style={styles.emptySubtitle}>
              Sei der Erste und teile dein Video!
            </Typography>
            
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={() => router.push('/upload')}
            >
              <Typography variant="body" style={styles.uploadButtonText}>
                + Video hochladen
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={isDesktop ? styles.desktopFeedWrapper : styles.mobileFeedWrapper}>
          <FlatList
            ref={flatListRef}
            data={videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            pagingEnabled={true}
            showsVerticalScrollIndicator={false}
            snapToInterval={videoHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            disableIntervalMomentum={true}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChangedRef.current.onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListFooterComponent={
              hasMore && !loading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              ) : null
            }
            getItemLayout={(data, index) => ({
              length: videoHeight,
              offset: videoHeight * index,
              index,
            })}
            contentContainerStyle={isDesktop && styles.desktopFeedContent}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={3}
            windowSize={5}
            initialNumToRender={2}
            updateCellsBatchingPeriod={50}
          />
        </View>
      )}

      {/* Modals */}
      {selectedVideoForModal && (
        <>
          <ShareModal
            visible={shareModalVisible}
            onClose={() => setShareModalVisible(false)}
            videoId={selectedVideoForModal.id}
            videoUrl={`https://www.anpip.com/v/${selectedVideoForModal.id}`}
            videoTitle={selectedVideoForModal.description || 'Schau dir dieses Video an!'}
          />
          
          <CommentModal
            visible={commentModalVisible}
            onClose={() => setCommentModalVisible(false)}
            videoId={selectedVideoForModal.id}
            commentsCount={selectedVideoForModal.comments_count}
          />
          
          <MusicModal
            visible={musicModalVisible}
            onClose={() => setMusicModalVisible(false)}
            videoId={selectedVideoForModal.id}
            soundName={selectedVideoForModal.description || 'Original-Sound'}
          />
          
          <GiftModal
            visible={giftModalVisible}
            onClose={() => setGiftModalVisible(false)}
            videoId={selectedVideoForModal.id}
            creatorId={selectedVideoForModal.user_id}
            creatorName={selectedVideoForModal.username}
          />
        </>
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
  topBarRightButton: {
    position: 'absolute',
    right: 16,
    top: 48,
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
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
  locationFilterBar: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  locationToggleText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  locationToggleTextActive: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600' as const,
  },
  mobileFeedWrapper: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      scrollSnapType: 'y mandatory',
      overflowY: 'scroll',
    } as any),
  },
  desktopFeedWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    ...(Platform.OS === 'web' && {
      scrollSnapType: 'y mandatory',
      overflowY: 'scroll',
    } as any),
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
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  emptyContentBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 40,
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  emptyIconPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#0ea5e9',
  },
  cameraShape: {
    width: 60,
    height: 45,
    backgroundColor: '#0ea5e9',
    borderRadius: 8,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptySubtitle: {
    color: '#999999',
    fontSize: 16,
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 8,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  videoContainer: {
    position: 'relative',
    backgroundColor: '#000000',
    ...(Platform.OS === 'web' && {
      scrollSnapAlign: 'start',
      scrollSnapStop: 'always',
    } as any),
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
  followButtonActive: {
    backgroundColor: Colors.primary,
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
