/**
 * ACTIVITY SCREEN
 * Zeigt Aktivitätsverlauf, gesehene Videos, Profilbesucher
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { useI18n } from '@/i18n/I18nContext';
import { getUserActivity, getRecentlyViewedVideos } from '@/lib/videoService';

interface ActivityItem {
  id: string;
  action_type: 'view' | 'like' | 'comment' | 'share' | 'gift';
  created_at: string;
  video?: {
    id: string;
    thumbnail_url: string;
    description: string;
  };
  target_user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  metadata?: any;
}

export default function ActivityScreen() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'activity' | 'viewed'>('activity');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = 'temp-user-id'; // TODO: Get from AuthContext

      if (activeTab === 'activity') {
        const data = await getUserActivity(userId, 100);
        setActivities(data);
      } else {
        const data = await getRecentlyViewedVideos(userId, 50);
        setRecentlyViewed(data);
      }
    } catch (error) {
      console.error('Load activity error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return 'eye-outline';
      case 'like':
        return 'heart-outline';
      case 'comment':
        return 'chatbubble-outline';
      case 'share':
        return 'share-outline';
      case 'gift':
        return 'gift-outline';
      default:
        return 'flash-outline';
    }
  };

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.action_type) {
      case 'view':
        return 'Video angesehen';
      case 'like':
        return 'Video geliked';
      case 'comment':
        return 'Kommentiert';
      case 'share':
        return 'Geteilt';
      case 'gift':
        return `Geschenk gesendet (${activity.metadata?.coins || 0} Coins)`;
      default:
        return 'Aktivität';
    }
  };

  const renderActivityItem = (activity: ActivityItem) => (
    <TouchableOpacity
      key={activity.id}
      style={styles.activityItem}
      onPress={() => {
        if (activity.video?.id) {
          router.push('/(tabs)' as any);
        }
      }}
    >
      <View style={styles.activityIcon}>
        <Ionicons
          name={getActivityIcon(activity.action_type) as any}
          size={20}
          color={Colors.primary}
        />
      </View>

      <View style={styles.activityContent}>
        <Typography variant="body" style={styles.activityText}>
          {getActivityText(activity)}
        </Typography>
        {activity.video && (
          <Typography variant="caption" style={styles.activityDescription} numberOfLines={1}>
            {activity.video.description}
          </Typography>
        )}
        <Typography variant="caption" style={styles.activityTime}>
          {new Date(activity.created_at).toLocaleString('de-DE')}
        </Typography>
      </View>

      {activity.video?.thumbnail_url && (
        <Image
          source={{ uri: activity.video.thumbnail_url }}
          style={styles.videoThumbnail}
        />
      )}
    </TouchableOpacity>
  );

  const renderVideoItem = (video: any) => (
    <TouchableOpacity
      key={video.id}
      style={styles.videoItem}
      onPress={() => router.push('/(tabs)' as any)}
    >
      <Image
        source={{ uri: video.thumbnail_url }}
        style={styles.videoThumbnailLarge}
      />
      <View style={styles.videoOverlay}>
        <Typography variant="caption" style={styles.videoDescription} numberOfLines={2}>
          {video.description}
        </Typography>
        <View style={styles.videoStats}>
          <Ionicons name="heart" size={14} color="#FFFFFF" />
          <Typography variant="caption" style={styles.videoStat}>
            {video.likes_count || 0}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Aktivität',
          headerStyle: { backgroundColor: Colors.background },
          headerTintColor: Colors.text,
        }}
      />

      <View style={styles.container}>
        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'activity' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('activity')}
          >
            <Ionicons
              name="footsteps-outline"
              size={20}
              color={activeTab === 'activity' ? Colors.primary : Colors.textSecondary}
            />
            <Typography
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'activity' ? styles.activeTabText : undefined,
              ]}
            >
              Aktivitäten
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'viewed' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('viewed')}
          >
            <Ionicons
              name="eye-outline"
              size={20}
              color={activeTab === 'viewed' ? Colors.primary : Colors.textSecondary}
            />
            <Typography
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'viewed' ? styles.activeTabText : undefined,
              ]}
            >
              Zuletzt gesehen
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {activeTab === 'activity' ? (
              activities.length > 0 ? (
                activities.map(renderActivityItem)
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="footsteps-outline" size={48} color={Colors.textSecondary} />
                  <Typography variant="body" style={styles.emptyText}>
                    Noch keine Aktivitäten
                  </Typography>
                </View>
              )
            ) : (
              <View style={styles.videoGrid}>
                {recentlyViewed.length > 0 ? (
                  recentlyViewed.map(renderVideoItem)
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="eye-outline" size={48} color={Colors.textSecondary} />
                    <Typography variant="body" style={styles.emptyText}>
                      Noch keine Videos gesehen
                    </Typography>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: Colors.text,
    fontWeight: '500',
  },
  activityDescription: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityTime: {
    color: Colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  videoThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: Colors.border,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 2,
  },
  videoItem: {
    width: '33.33%',
    aspectRatio: 9 / 16,
    padding: 2,
  },
  videoThumbnailLarge: {
    width: '100%',
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    padding: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  videoDescription: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  videoStat: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyText: {
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
});
