/**
 * EXPLORE SCREEN - Entdecken & Suche
 * 
 * Suchleiste, Trends, Hashtags, Videos in Grid-Ansicht
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, FlatList, Image } from 'react-native';
import { Typography, Card, IconButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

// Dummy-Daten für Videos
const DUMMY_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
  id: `video-${i}`,
  title: `Video ${i + 1}`,
  views: Math.floor(Math.random() * 10000),
}));

const TRENDING_HASHTAGS = [
  '#anpip', '#trending', '#viral', '#foryou', 
  '#musik', '#dance', '#comedy', '#diy'
];

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'videos' | 'hashtags' | 'sounds' | 'creator'>('videos');

  return (
    <View style={styles.container}>
      {/* Suchleiste */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Suche Videos, Hashtags, Creator..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <IconButton
              icon="close-circle"
              onPress={() => setSearchQuery('')}
              size={24}
              color={Colors.textSecondary}
              backgroundColor="transparent"
            />
          )}
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TabButton 
          title="Videos" 
          isActive={activeTab === 'videos'} 
          onPress={() => setActiveTab('videos')} 
        />
        <TabButton 
          title="Hashtags" 
          isActive={activeTab === 'hashtags'} 
          onPress={() => setActiveTab('hashtags')} 
        />
        <TabButton 
          title="Sounds" 
          isActive={activeTab === 'sounds'} 
          onPress={() => setActiveTab('sounds')} 
        />
        <TabButton 
          title="Creator" 
          isActive={activeTab === 'creator'} 
          onPress={() => setActiveTab('creator')} 
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'videos' && (
          <>
            <Typography variant="h3" style={styles.sectionTitle}>Trending Videos</Typography>
            <View style={styles.grid}>
              {DUMMY_VIDEOS.map((video) => (
                <View key={video.id} style={styles.gridItem}>
                  <View style={styles.videoThumbnail}>
                    <Ionicons name="play" size={32} color={Colors.background} />
                  </View>
                  <Typography variant="caption" numberOfLines={2} style={{ marginTop: 4 }}>
                    {video.title}
                  </Typography>
                  <Typography variant="caption" color={Colors.textSecondary}>
                    {video.views.toLocaleString()} Views
                  </Typography>
                </View>
              ))}
            </View>
          </>
        )}

        {activeTab === 'hashtags' && (
          <>
            <Typography variant="h3" style={styles.sectionTitle}>Trending Hashtags</Typography>
            {TRENDING_HASHTAGS.map((tag, index) => (
              <Card key={tag} style={styles.hashtagCard}>
                <View style={styles.hashtagContent}>
                  <View>
                    <Typography variant="body">{tag}</Typography>
                    <Typography variant="caption" color={Colors.textSecondary}>
                      {Math.floor(Math.random() * 1000)}k Videos
                    </Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
                </View>
              </Card>
            ))}
          </>
        )}

        {activeTab === 'sounds' && (
          <View style={styles.placeholder}>
            <Ionicons name="musical-notes" size={80} color={Colors.primary} />
            <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
              Sounds
            </Typography>
            <Typography variant="caption" align="center" color={Colors.textSecondary}>
              Beliebte Sounds kommen hier
            </Typography>
          </View>
        )}

        {activeTab === 'creator' && (
          <View style={styles.placeholder}>
            <Ionicons name="people" size={80} color={Colors.primary} />
            <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
              Creator
            </Typography>
            <Typography variant="caption" align="center" color={Colors.textSecondary}>
              Beliebte Creator kommen hier
            </Typography>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// Tab-Button Komponente
function TabButton({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) {
  return (
    <View style={styles.tabButton} onTouchEnd={onPress}>
      <Typography 
        variant="button" 
        color={isActive ? Colors.primary : Colors.textSecondary}
      >
        {title}
      </Typography>
      {isActive && <View style={styles.tabIndicator} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
    color: Colors.text,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    paddingHorizontal: Spacing.sm,
  },
  tabButton: {
    paddingHorizontal: Spacing.md,
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
  content: {
    flex: 1,
  },
  sectionTitle: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.sm,
  },
  gridItem: {
    width: '33.33%',
    padding: Spacing.sm,
  },
  videoThumbnail: {
    aspectRatio: 9 / 16,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  hashtagContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 400,
  },
});
