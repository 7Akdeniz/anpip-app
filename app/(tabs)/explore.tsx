/**
 * EXPLORE SCREEN - Entdecken & Suche (Apple Style)
 * 
 * Modern Apple-Style mit glassmorphism, Icons und Kategorien
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Kategorien mit Icons (wie Apple App Store)
const CATEGORIES = [
  { id: 'trending', icon: 'flame', label: 'Trending', color: '#FF6B6B' },
  { id: 'music', icon: 'musical-notes', label: 'Musik', color: '#4ECDC4' },
  { id: 'dance', icon: 'body', label: 'Tanz', color: '#95E1D3' },
  { id: 'comedy', icon: 'happy', label: 'Comedy', color: '#FFD93D' },
  { id: 'sports', icon: 'basketball', label: 'Sport', color: '#6BCF7F' },
  { id: 'food', icon: 'pizza', label: 'Food', color: '#FF8A65' },
  { id: 'beauty', icon: 'sparkles', label: 'Beauty', color: '#E91E63' },
  { id: 'gaming', icon: 'game-controller', label: 'Gaming', color: '#9C27B0' },
  { id: 'travel', icon: 'airplane', label: 'Reisen', color: '#00BCD4' },
  { id: 'fashion', icon: 'shirt', label: 'Mode', color: '#FF5252' },
  { id: 'art', icon: 'color-palette', label: 'Kunst', color: '#7E57C2' },
  { id: 'pets', icon: 'paw', label: 'Tiere', color: '#FFA726' },
  { id: 'tech', icon: 'laptop', label: 'Tech', color: '#42A5F5' },
  { id: 'fitness', icon: 'barbell', label: 'Fitness', color: '#66BB6A' },
  { id: 'education', icon: 'school', label: 'Bildung', color: '#26C6DA' },
  { id: 'diy', icon: 'hammer', label: 'DIY', color: '#8D6E63' },
];

// Dummy-Daten für Videos
const DUMMY_VIDEOS = Array.from({ length: 12 }, (_, i) => ({
  id: `video-${i}`,
  title: `Video ${i + 1}`,
  views: Math.floor(Math.random() * 10000),
  category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
}));

const TRENDING_HASHTAGS = [
  { tag: '#anpip', views: '1.2M', color: '#FF6B6B' },
  { tag: '#trending', views: '850K', color: '#4ECDC4' },
  { tag: '#viral', views: '2.4M', color: '#FFD93D' },
  { tag: '#foryou', views: '3.1M', color: '#95E1D3' },
  { tag: '#musik', views: '670K', color: '#FF8A65' },
  { tag: '#dance', views: '920K', color: '#E91E63' },
  { tag: '#comedy', views: '1.5M', color: '#9C27B0' },
  { tag: '#diy', views: '430K', color: '#8D6E63' },
];


export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      {/* Header mit Premium Glasmorphism */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerContent}>
          <Typography variant="h2" style={styles.headerTitle}>Entdecken</Typography>
          
          {/* Minimalistische Suchleiste */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={24} color="#FFFFFF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Videos, Creator & Sounds entdecken..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 ? (
                <TouchableOpacity 
                  onPress={() => setSearchQuery('')}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name="mic-outline" 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </BlurView>

      {/* Scrollbarer Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Kategorien Grid (wie Apple App Store) */}
        <View style={styles.section}>
          <Typography variant="h3" style={styles.sectionTitle}>Kategorien</Typography>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={styles.categoryCard}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIconContainer, { backgroundColor: category.color }]}>
                  <Ionicons name={category.icon as any} size={28} color="#FFFFFF" />
                </View>
                <Typography variant="caption" style={styles.categoryLabel} numberOfLines={1}>
                  {category.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Trending Hashtags mit Icons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Trending Hashtags</Typography>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {TRENDING_HASHTAGS.map((item, index) => (
            <TouchableOpacity 
              key={item.tag} 
              style={styles.hashtagCard}
              activeOpacity={0.7}
            >
              <View style={styles.hashtagLeft}>
                <View style={[styles.hashtagIcon, { backgroundColor: item.color }]}>
                  <Ionicons name="trending-up" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Typography variant="body" style={styles.hashtagText}>{item.tag}</Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">
                    {item.views} Videos
                  </Typography>
                </View>
              </View>
              <View style={styles.hashtagRight}>
                <Typography variant="caption" color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }}>
                  #{index + 1}
                </Typography>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trending Videos Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Trending Videos</Typography>
            <TouchableOpacity>
              <Typography variant="caption" color={Colors.primary}>Alle anzeigen</Typography>
            </TouchableOpacity>
          </View>
          
          <View style={styles.videosGrid}>
            {DUMMY_VIDEOS.map((video) => (
              <TouchableOpacity 
                key={video.id} 
                style={styles.videoCard}
                activeOpacity={0.8}
              >
                <View style={styles.videoThumbnail}>
                  {/* Play Icon */}
                  <View style={styles.playIconContainer}>
                    <Ionicons name="play" size={32} color="#FFFFFF" />
                  </View>
                  
                  {/* View Count Badge */}
                  <BlurView intensity={60} tint="dark" style={styles.viewsBadge}>
                    <Ionicons name="eye-outline" size={12} color="#FFFFFF" />
                    <Typography variant="caption" style={styles.viewsText}>
                      {(video.views / 1000).toFixed(1)}K
                    </Typography>
                  </BlurView>

                  {/* Category Badge */}
                  <View style={[styles.categoryBadge, { backgroundColor: video.category.color }]}>
                    <Ionicons name={video.category.icon as any} size={14} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Top Creator */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Top Creator</Typography>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creatorsScroll}
          >
            {Array.from({ length: 8 }, (_, i) => (
              <TouchableOpacity key={i} style={styles.creatorCard}>
                <View style={styles.creatorAvatar}>
                  <Ionicons name="person" size={32} color="#FFFFFF" />
                </View>
                <Typography variant="caption" style={styles.creatorName} numberOfLines={1}>
                  @creator{i + 1}
                </Typography>
                <View style={styles.followButton}>
                  <Ionicons name="add" size={16} color="#FFFFFF" />
                  <Typography variant="caption" style={styles.followText}>Folgen</Typography>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Beliebte Sounds */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <View style={styles.sectionHeader}>
            <Typography variant="h3" style={styles.sectionTitle}>Beliebte Sounds</Typography>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={Colors.primary} />
            </TouchableOpacity>
          </View>
          
          {Array.from({ length: 5 }, (_, i) => (
            <TouchableOpacity 
              key={i} 
              style={styles.soundCard}
              activeOpacity={0.7}
            >
              <View style={styles.soundLeft}>
                <View style={styles.soundIcon}>
                  <Ionicons name="musical-notes" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.soundInfo}>
                  <Typography variant="body" style={styles.soundTitle} numberOfLines={1}>
                    Sound {i + 1} - Artist Name
                  </Typography>
                  <Typography variant="caption" color="rgba(255,255,255,0.5)">
                    {Math.floor(Math.random() * 500)}K Videos
                  </Typography>
                </View>
              </View>
              <TouchableOpacity style={styles.soundPlayButton}>
                <Ionicons name="play" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    gap: 12,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: -0.2,
  },
  recordingButton: {
    backgroundColor: 'rgba(255,59,48,0.1)',
    borderRadius: 12,
    padding: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: 12,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: 12,
  },
  
  // Kategorien Grid
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md - 6,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - (Spacing.md * 2)) / 4,
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 6,
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  categoryLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  
  // Hashtags
  hashtagCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    borderRadius: 12,
  },
  hashtagLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  hashtagIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hashtagText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  hashtagRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Videos Grid
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md - 4,
  },
  videoCard: {
    width: (SCREEN_WIDTH - (Spacing.md * 2)) / 3,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  videoThumbnail: {
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewsBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Creator Cards
  creatorsScroll: {
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  creatorCard: {
    width: 100,
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  creatorName: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 6,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Sound Cards
  soundCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: Spacing.md,
    marginBottom: 8,
    borderRadius: 12,
  },
  soundLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  soundIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  soundInfo: {
    flex: 1,
  },
  soundTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  soundPlayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

