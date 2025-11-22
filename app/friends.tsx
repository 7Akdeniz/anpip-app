/**
 * FRIENDS & NEARBY SCREEN
 * Freunde-Vorschläge und Personen in der Nähe
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { useI18n } from '@/i18n/I18nContext';
import { useLocation } from '@/contexts/LocationContext';
import { getFriendSuggestions, getNearbyUsers, followUser } from '@/lib/videoService';

interface User {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  followers_count?: number;
  distance?: number;
}

export default function FriendsScreen() {
  const { t } = useI18n();
  const { userLocation } = useLocation();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [nearbyUsers, setNearbyUsers] = useState<User[]>([]);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'suggestions' | 'nearby'>('suggestions');

  useEffect(() => {
    loadData();
  }, [activeTab, userLocation]);

  const loadData = async () => {
    setLoading(true);
    try {
      const currentUserId = 'temp-user-id'; // TODO: Get from AuthContext

      if (activeTab === 'suggestions') {
        const data = await getFriendSuggestions(currentUserId, 50);
        setSuggestions(data);
      } else {
        // Nearby users
        if (!userLocation) {
          Alert.alert(
            'Standort benötigt',
            'Bitte aktiviere den Standortzugriff in den Einstellungen, um Personen in deiner Nähe zu finden.'
          );
          setLoading(false);
          return;
        }

        if (userLocation) {
          const data = await getNearbyUsers(
            userLocation.lat,
            userLocation.lon,
            50 // 50km radius
          );
          setNearbyUsers(data);
        }
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Fehler', 'Daten konnten nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string) => {
    const currentUserId = 'temp-user-id'; // TODO: Get from AuthContext
    
    try {
      const nowFollowing = await followUser(currentUserId, userId);
      
      if (nowFollowing) {
        setFollowedUsers(prev => new Set(prev).add(userId));
      } else {
        setFollowedUsers(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    } catch (error) {
      console.error('Follow error:', error);
      Alert.alert('Fehler', 'Aktion fehlgeschlagen');
    }
  };

  const renderUser = (user: User) => (
    <View key={user.id} style={styles.userCard}>
      <TouchableOpacity
        style={styles.userInfo}
        onPress={() => router.push('/(tabs)/profile' as any)}
      >
        <View style={styles.avatar}>
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              style={{ width: 50, height: 50, borderRadius: 25 }}
              alt={user.username}
            />
          ) : (
            <Ionicons name="person" size={24} color={Colors.textSecondary} />
          )}
        </View>
        
        <View style={styles.userDetails}>
          <Typography variant="body" style={styles.username}>
            @{user.username}
          </Typography>
          {user.bio && (
            <Typography variant="caption" style={styles.bio} numberOfLines={1}>
              {user.bio}
            </Typography>
          )}
          <View style={styles.stats}>
            {user.followers_count !== undefined && (
              <Typography variant="caption" style={styles.stat}>
                {user.followers_count} Follower
              </Typography>
            )}
            {user.distance !== undefined && (
              <Typography variant="caption" style={styles.stat}>
                • {user.distance.toFixed(1)} km
              </Typography>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.followButton,
          followedUsers.has(user.id) && styles.followingButton,
        ]}
        onPress={() => handleFollow(user.id)}
      >
        <Typography
          variant="caption"
          style={[
            styles.followButtonText,
            followedUsers.has(user.id) && styles.followingButtonText,
          ]}
        >
          {followedUsers.has(user.id) ? 'Folge ich' : 'Folgen'}
        </Typography>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Freunde & Personen',
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
              activeTab === 'suggestions' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('suggestions')}
          >
            <Ionicons
              name="people-outline"
              size={20}
              color={activeTab === 'suggestions' ? Colors.primary : Colors.textSecondary}
            />
            <Typography
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'suggestions' ? styles.activeTabText : undefined,
              ]}
            >
              Vorschläge
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'nearby' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('nearby')}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={activeTab === 'nearby' ? Colors.primary : Colors.textSecondary}
            />
            <Typography
              variant="body"
              style={[
                styles.tabText,
                activeTab === 'nearby' ? styles.activeTabText : undefined,
              ]}
            >
              In der Nähe
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
            {activeTab === 'suggestions' ? (
              suggestions.length > 0 ? (
                suggestions.map(renderUser)
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="people-outline" size={48} color={Colors.textSecondary} />
                  <Typography variant="body" style={styles.emptyText}>
                    Keine Vorschläge verfügbar
                  </Typography>
                </View>
              )
            ) : (
              nearbyUsers.length > 0 ? (
                nearbyUsers.map(renderUser)
              ) : (
                <View style={styles.emptyContainer}>
                  <Ionicons name="location-outline" size={48} color={Colors.textSecondary} />
                  <Typography variant="body" style={styles.emptyText}>
                    Keine Personen in der Nähe gefunden
                  </Typography>
                </View>
              )
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
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.card,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontWeight: '600',
    color: Colors.text,
  },
  bio: {
    color: Colors.textSecondary,
    marginTop: 2,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  stat: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  followButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    marginLeft: Spacing.sm,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  followButtonText: {
    color: Colors.textInverse,
    fontWeight: '600',
  },
  followingButtonText: {
    color: Colors.textSecondary,
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
