/**
 * PROFILE SCREEN - Benutzerprofil
 * 
 * Profilbild, Stats, Bio, Videos, Likes
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, PrimaryButton, IconButton, Card } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

// Dummy-Videos
const DUMMY_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
  id: `video-${i}`,
  views: Math.floor(Math.random() * 100000),
  likes: Math.floor(Math.random() * 10000),
}));

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'videos' | 'likes'>('videos');

  return (
    <ScrollView style={styles.container}>
      {/* Header mit Einstellungen */}
      <View style={styles.header}>
        <Typography variant="h3">Mein Profil</Typography>
        <IconButton
          icon="settings-outline"
          onPress={() => console.log('Einstellungen')}
          size={36}
          backgroundColor="transparent"
          color={Colors.text}
        />
      </View>

      {/* Profilbild & Benutzername */}
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={60} color={Colors.primary} />
          </View>
          <IconButton
            icon="camera"
            onPress={() => console.log('Profilbild ändern')}
            size={32}
            backgroundColor={Colors.primary}
            color={Colors.background}
            style={styles.cameraButton}
          />
        </View>

        <Typography variant="h2" align="center" style={styles.username}>
          @deinusername
        </Typography>
        
        <Typography variant="body" align="center" color={Colors.textSecondary} style={styles.bio}>
          Willkommen auf meinem Anpip-Profil! 🎬✨
        </Typography>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <StatItem label="Follower" value="1.2k" />
        <View style={styles.statDivider} />
        <StatItem label="Following" value="234" />
        <View style={styles.statDivider} />
        <StatItem label="Likes" value="5.4k" />
      </View>

      {/* Profil bearbeiten Button */}
      <View style={styles.actions}>
        <PrimaryButton
          title="Profil bearbeiten"
          onPress={() => console.log('Profil bearbeiten')}
          variant="outlined"
          fullWidth
        />
      </View>

      {/* Tabs: Videos / Likes */}
      <View style={styles.tabs}>
        <TabButton
          icon="grid-outline"
          label="Videos"
          isActive={activeTab === 'videos'}
          onPress={() => setActiveTab('videos')}
        />
        <TabButton
          icon="heart-outline"
          label="Likes"
          isActive={activeTab === 'likes'}
          onPress={() => setActiveTab('likes')}
        />
      </View>

      {/* Videos Grid */}
      <View style={styles.grid}>
        {DUMMY_VIDEOS.map((video) => (
          <View key={video.id} style={styles.gridItem}>
            <View style={styles.videoThumbnail}>
              <Ionicons name="play" size={32} color={Colors.background} />
            </View>
            <View style={styles.videoStats}>
              <View style={styles.videoStat}>
                <Ionicons name="play" size={12} color={Colors.background} />
                <Typography variant="caption" color={Colors.background} style={{ marginLeft: 4 }}>
                  {formatNumber(video.views)}
                </Typography>
              </View>
            </View>
          </View>
        ))}
      </View>

      {activeTab === 'videos' && DUMMY_VIDEOS.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-outline" size={80} color={Colors.textSecondary} />
          <Typography variant="h3" align="center" color={Colors.textSecondary} style={{ marginTop: Spacing.md }}>
            Noch keine Videos
          </Typography>
          <Typography variant="caption" align="center" color={Colors.textSecondary}>
            Erstelle dein erstes Video!
          </Typography>
        </View>
      )}
    </ScrollView>
  );
}

// Stat Item Komponente
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Typography variant="h3" align="center">{value}</Typography>
      <Typography variant="caption" align="center" color={Colors.textSecondary}>
        {label}
      </Typography>
    </View>
  );
}

// Tab Button Komponente
function TabButton({ 
  icon, 
  label, 
  isActive, 
  onPress 
}: { 
  icon: keyof typeof Ionicons.glyphMap; 
  label: string; 
  isActive: boolean; 
  onPress: () => void;
}) {
  return (
    <View style={styles.tabButton} onTouchEnd={onPress}>
      <Ionicons 
        name={icon} 
        size={24} 
        color={isActive ? Colors.primary : Colors.textSecondary} 
      />
      <Typography 
        variant="caption" 
        color={isActive ? Colors.primary : Colors.textSecondary}
        style={{ marginTop: 4 }}
      >
        {label}
      </Typography>
      {isActive && <View style={styles.tabIndicator} />}
    </View>
  );
}

// Zahlen formatieren (z.B. 1200 -> 1.2k)
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  username: {
    marginBottom: Spacing.sm,
  },
  bio: {
    paddingHorizontal: Spacing.xl,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.divider,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.xs,
  },
  gridItem: {
    width: '33.33%',
    padding: Spacing.xs,
  },
  videoThumbnail: {
    aspectRatio: 9 / 16,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoStats: {
    position: 'absolute',
    bottom: Spacing.xs,
    left: Spacing.xs,
  },
  videoStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
});
