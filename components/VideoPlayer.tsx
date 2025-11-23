/**
 * ============================================================================
 * VIDEO PLAYER KOMPONENTE - HLS Streaming
 * ============================================================================
 * 
 * React-Komponente für Adaptive Streaming (HLS) von Cloudflare Stream Videos.
 * 
 * Features:
 * - HLS/m3u8 Wiedergabe (adaptiv: automatische Qualitätsanpassung)
 * - Optimiert für 9:16 vertikale Videos (TikTok/Reels-Format)
 * - Autoplay-Support
 * - Play/Pause Controls
 * - Mute/Unmute
 * - Fullscreen-fähig
 * - Performance-optimiert
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

// ============================================================================
// TYPES
// ============================================================================

interface VideoPlayerProps {
  videoId?: string;           // Cloudflare Stream Video UID
  playbackUrl?: string;       // Direkte HLS URL (falls bereits vorhanden)
  thumbnailUrl?: string;      // Thumbnail
  autoplay?: boolean;         // Automatisch abspielen
  muted?: boolean;            // Stumm starten
  loop?: boolean;             // Loop aktivieren
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  onViewCountIncrement?: () => void; // Callback wenn Video zu X% gesehen wurde
  aspectRatio?: '9:16' | '16:9' | '1:1'; // Default: 9:16
}

// Cloudflare Account ID aus .env (für URL-Generierung)
const CLOUDFLARE_ACCOUNT_ID = process.env.EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID || '';

// ============================================================================
// KOMPONENTE
// ============================================================================

export default function VideoPlayer({
  videoId,
  playbackUrl,
  thumbnailUrl,
  autoplay = false,
  muted = false,
  loop = true,
  onPlaybackStatusUpdate,
  onViewCountIncrement,
  aspectRatio = '9:16',
}: VideoPlayerProps) {
  
  // State
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(false);
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  
  // Ref zum Video-Player
  const videoRef = useRef<Video>(null);

  // ============================================================================
  // URL GENERIERUNG
  // ============================================================================

  /**
   * Generiert HLS Playback URL aus Cloudflare Video ID
   */
  const getPlaybackUrl = (): string => {
    if (playbackUrl) {
      return playbackUrl;
    }
    
    if (videoId && CLOUDFLARE_ACCOUNT_ID) {
      return `https://customer-${CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
    }
    
    console.warn('Keine Video-URL verfügbar');
    return '';
  };

  const videoUrl = getPlaybackUrl();

  // ============================================================================
  // CONTROLS
  // ============================================================================

  /**
   * Play/Pause Toggle
   */
  const togglePlayPause = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await videoRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  /**
   * Mute/Unmute Toggle
   */
  const toggleMute = async () => {
    if (!videoRef.current) return;

    await videoRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  /**
   * Controls ein/ausblenden
   */
  const toggleControls = () => {
    setShowControls(!showControls);
    
    // Auto-hide nach 3 Sekunden
    if (!showControls) {
      setTimeout(() => setShowControls(false), 3000);
    }
  };

  // ============================================================================
  // PLAYBACK STATUS TRACKING
  // ============================================================================

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;

    // View Count incrementieren wenn Video zu 50% gesehen wurde
    if (
      !hasIncrementedView &&
      status.positionMillis > 0 &&
      status.durationMillis &&
      status.positionMillis / status.durationMillis > 0.5
    ) {
      setHasIncrementedView(true);
      onViewCountIncrement?.();
    }

    // Optional: Callback weitergeben
    onPlaybackStatusUpdate?.(status);
  };

  // ============================================================================
  // ASPECT RATIO
  // ============================================================================

  const getAspectRatioStyle = () => {
    const { width, height } = Dimensions.get('window');
    
    switch (aspectRatio) {
      case '9:16': // Vertical (TikTok/Reels)
        return {
          width: width,
          height: height,
        };
      case '16:9': // Landscape
        return {
          width: width,
          height: width * (9 / 16),
        };
      case '1:1': // Square
        return {
          width: width,
          height: width,
        };
      default:
        return {
          width: width,
          height: height,
        };
    }
  };

  // ============================================================================
  // AUTOPLAY on Mount
  // ============================================================================

  useEffect(() => {
    if (autoplay && videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [autoplay]);

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!videoUrl) {
    return (
      <View style={[styles.container, getAspectRatioStyle()]}>
        <Text style={styles.errorText}>Video nicht verfügbar</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, getAspectRatioStyle()]}>
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={autoplay}
        isLooping={loop}
        isMuted={isMuted}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        usePoster={!!thumbnailUrl}
        posterSource={thumbnailUrl ? { uri: thumbnailUrl } : undefined}
        posterStyle={styles.poster}
      />

      {/* Touch Area für Controls */}
      <TouchableOpacity
        style={styles.touchArea}
        activeOpacity={1}
        onPress={toggleControls}
      >
        {/* Controls Overlay */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            
            {/* Play/Pause Button */}
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
            >
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={styles.muteButton}
              onPress={toggleMute}
            >
              <Text style={styles.muteButtonText}>
                {isMuted ? '🔇' : '🔊'}
              </Text>
            </TouchableOpacity>

          </View>
        )}
      </TouchableOpacity>

    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  controlsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 40,
  },
  muteButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  muteButtonText: {
    fontSize: 24,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
  },
});
