/**
 * ============================================================================
 * VIDEO FEED ITEM KOMPONENTE
 * ============================================================================
 * 
 * Einzelnes Video-Item für den Feed (9:16 Vollbild-Format)
 * Kombiniert VideoPlayer mit zusätzlichen Feed-Informationen
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import VideoPlayer from './VideoPlayer';

// ============================================================================
// TYPES
// ============================================================================

interface VideoFeedItemProps {
  video: {
    id: string;
    cloudflare_uid: string;
    title?: string;
    description?: string;
    playback_url: string;
    thumbnail_url?: string;
    duration?: number;
    view_count?: number;
    like_count?: number;
    comment_count?: number;
    user_id?: string;
    location_name?: string;
    tags?: string[];
  };
  isActive?: boolean; // Ob dieses Video aktuell im Viewport ist (für Autoplay)
  onLike?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
}

// ============================================================================
// KOMPONENTE
// ============================================================================

export default function VideoFeedItem({
  video,
  isActive = false,
  onLike,
  onComment,
  onShare,
}: VideoFeedItemProps) {
  
  const [liked, setLiked] = useState(false);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(video.id);
  };

  const handleComment = () => {
    onComment?.(video.id);
  };

  const handleShare = () => {
    onShare?.(video.id);
  };

  const handleViewIncrement = async () => {
    // View Count in DB erhöhen
    try {
      await fetch(`/api/videos/${video.id}/increment-view`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('View increment error:', error);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      
      {/* Video Player (Vollbild) */}
      <VideoPlayer
        videoId={video.cloudflare_uid}
        playbackUrl={video.playback_url}
        thumbnailUrl={video.thumbnail_url}
        autoplay={isActive}
        muted={false}
        loop={true}
        aspectRatio="9:16"
        onViewCountIncrement={handleViewIncrement}
      />

      {/* Overlay mit Video-Infos & Actions */}
      <View style={styles.overlay}>
        
        {/* Video-Infos (unten links) */}
        <View style={styles.infoContainer}>
          
          {/* Titel */}
          {video.title && (
            <Text style={styles.title} numberOfLines={2}>
              {video.title}
            </Text>
          )}

          {/* Beschreibung */}
          {video.description && (
            <Text style={styles.description} numberOfLines={3}>
              {video.description}
            </Text>
          )}

          {/* Location */}
          {video.location_name && (
            <Text style={styles.location}>
              📍 {video.location_name}
            </Text>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {video.tags.slice(0, 3).map((tag, index) => (
                <Text key={index} style={styles.tag}>
                  #{tag}
                </Text>
              ))}
            </View>
          )}

        </View>

        {/* Action Buttons (rechts) */}
        <View style={styles.actionsContainer}>
          
          {/* Like */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Text style={styles.actionIcon}>{liked ? '❤️' : '🤍'}</Text>
            <Text style={styles.actionText}>
              {(video.like_count || 0) + (liked ? 1 : 0)}
            </Text>
          </TouchableOpacity>

          {/* Comment */}
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>{video.comment_count || 0}</Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionIcon}>↗️</Text>
            <Text style={styles.actionText}>Teilen</Text>
          </TouchableOpacity>

          {/* Views */}
          <View style={styles.actionButton}>
            <Text style={styles.actionIcon}>👁️</Text>
            <Text style={styles.actionText}>{video.view_count || 0}</Text>
          </View>

        </View>

      </View>

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 40,
  },
  infoContainer: {
    flex: 1,
    marginRight: 16,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  description: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  location: {
    fontSize: 12,
    color: '#fff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    fontSize: 12,
    color: '#00D9FF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionsContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
