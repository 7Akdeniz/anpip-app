/**
 * PROFILE SCREEN - iPhone 17 Futuristic Design
 * 
 * Transparenter Hintergrund mit vielen Icons wie im Feed
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui';
import { Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CustomRepeatIcon } from '@/components/CustomRepeatIcon';

// Dummy-Videos
const DUMMY_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
  id: `video-${i}`,
  views: Math.floor(Math.random() * 100000),
  likes: Math.floor(Math.random() * 10000),
}));

type TopTab = 'videos' | 'likes' | 'public';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<TopTab>('videos');

  return (
    <View style={styles.container}>
      {/* Top Bar mit Icons wie im Feed */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <TouchableOpacity style={styles.topBarButton}>
            <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={{ width: 40 }} />
          <TouchableOpacity style={styles.topBarButton}>
            <Ionicons name="menu-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profilkarte */}
        <View style={styles.profileCard}>
          {/* Profilbild mit Glow */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarIconContainer}>
                <Ionicons name="person-circle-outline" size={180} color="rgba(255, 255, 255, 0.8)" />
              </View>
            </View>

            {/* Camera Button */}
            <TouchableOpacity style={styles.cameraButtonContainer}>
              <View style={styles.cameraButton}>
                <Ionicons name="camera-outline" size={28} color="rgba(255, 255, 255, 0.9)" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Name & Bio */}
          <View style={styles.infoSection}>
            <Typography variant="h3" style={styles.fullName}>
              Vorname Nachname
            </Typography>
            
            <View style={styles.usernameRow}>
              <Typography variant="body" style={styles.username}>
                @deinusername
              </Typography>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={18} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            </View>
            
            <Typography variant="body" style={styles.bio}>
              Willkommen auf meinem Anpip-Profil! 🎬✨
            </Typography>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              <StatItem icon="person-add-outline" value="127" />
              <View style={styles.statDivider} />
              <StatItem icon="heart-outline" value="8.9K" />
              <View style={styles.statDivider} />
              <StatItem icon="people-outline" value="2.4K" />
            </View>
          </View>

          {/* Action Icons */}
          <View style={styles.actionIcons}>
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconButton}>
              <CustomRepeatIcon size={22} color="#FFFFFF" style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="lock-closed-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionIconButton}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Videos Grid */}
        <View style={styles.grid}>
          {DUMMY_VIDEOS.map((video, index) => (
            <TouchableOpacity key={video.id} style={styles.gridItem}>
              <View style={styles.videoCard}>
                <LinearGradient
                  colors={[
                    `rgba(${index % 3 === 0 ? '102, 126, 234' : index % 3 === 1 ? '237, 107, 157' : '18, 194, 233'}, 0.3)`,
                    'rgba(0, 0, 0, 0.5)'
                  ]}
                  style={styles.videoThumbnail}
                >
                  <Ionicons name="play-circle-outline" size={40} color="rgba(255, 255, 255, 0.9)" />
                </LinearGradient>
                
                <View style={styles.videoStats}>
                  <View style={styles.videoStat}>
                    <Ionicons name="play" size={12} color="rgba(255, 255, 255, 0.8)" />
                    <Typography variant="caption" style={styles.videoStatText}>
                      {formatNumber(video.views)}
                    </Typography>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// Stat Item Komponente
function StatItem({ icon, value }: { icon: keyof typeof Ionicons.glyphMap; value: string }) {
  return (
    <View style={styles.statItem}>
      <Ionicons name={icon} size={28} color="#FFFFFF" style={{ marginBottom: 6 }} />
      <Typography variant="h3" style={styles.statValue}>
        {value}
      </Typography>
    </View>
  );
}

// Tab Button Komponente
function TabButton({ 
  icon, 
  isActive, 
  onPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  isActive: boolean; 
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.tabButton} onPress={onPress}>
      <View style={styles.tabButtonContent}>
        {isActive && (
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.3)', 'rgba(118, 75, 162, 0.3)']}
            style={styles.tabActiveBackground}
          />
        )}
        <Ionicons 
          name={icon} 
          size={22} 
          color={isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'} 
        />
      </View>
      {isActive && (
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.tabIndicator}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      )}
    </TouchableOpacity>
  );
}

// Zahlen formatieren
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Top Bar (wie Feed)
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 45,
    paddingBottom: 8,
    paddingHorizontal: Spacing.lg,
    backgroundColor: 'transparent',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBarButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
    paddingBottom: 40,
  },
  
  // Profilkarte
  profileCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 0,
    paddingTop: Spacing.xxxl,
  },
  
  // Avatar
  avatarSection: {
    alignItems: 'center',
    marginBottom: 0,
  },
  avatarGlow: {
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.6,
        shadowRadius: 20,
      },
    }),
  },
  avatarIconContainer: {
    width: 190,
    height: 190,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGradientRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatarInnerRing: {
    width: '100%',
    height: '100%',
    borderRadius: 65,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 3,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  avatarBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonContainer: {
    position: 'absolute',
    bottom: 8,
    right: '32%',
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // Info
  infoSection: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fullName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  editButton: {
    padding: 4,
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  
  // Stats
  statsContainer: {
    marginBottom: Spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  
  // Action Icons
  actionIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: Spacing.xs,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  // Tabs
  tabsContainer: {
    marginTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabs: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    position: 'relative',
  },
  tabButtonContent: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  tabActiveBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabLabelActive: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tabLabelInactive: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    borderRadius: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 8,
      },
    }),
  },
  
  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
    paddingTop: 0,
  },
  gridItem: {
    width: '33.33%',
    padding: 2,
  },
  videoCard: {
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    aspectRatio: 9 / 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoStats: {
    position: 'absolute',
    bottom: 6,
    left: 6,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  videoStatText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 3,
    fontWeight: '600',
  },
});
