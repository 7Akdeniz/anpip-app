/**
 * ANPIP.COM - RESPONSIVE VIDEO PLAYER
 * Optimiert für alle Geräte & Browser
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/Theme';
import { responsive, VideoSizes } from '@/constants/Responsive';
import { VideoOptimization, debounce } from '@/constants/Performance';

interface ResponsiveVideoPlayerProps {
  uri: string;
  thumbnailUri?: string;
  shouldPlay?: boolean;
  isLooping?: boolean;
  isMuted?: boolean;
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void;
  style?: any;
  showControls?: boolean;
  autoQuality?: boolean;
}

export function ResponsiveVideoPlayer({
  uri,
  thumbnailUri,
  shouldPlay = false,
  isLooping = true,
  isMuted = false,
  onPlaybackStatusUpdate,
  style,
  showControls = true,
  autoQuality = true,
}: ResponsiveVideoPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(shouldPlay);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutedState, setIsMutedState] = useState(isMuted);
  const [showControlsState, setShowControlsState] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // Auto-hide Controls
  const hideControls = useRef(
    debounce(() => {
      setShowControlsState(false);
    }, 3000)
  ).current;
  
  // Toggle Play/Pause
  const togglePlayback = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Toggle Mute
  const toggleMute = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMutedState);
      setIsMutedState(!isMutedState);
    }
  };
  
  // Show Controls
  const handlePress = () => {
    setShowControlsState(true);
    if (showControls) {
      hideControls();
    }
  };
  
  // Playback Status Handler
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
    }
    
    if (onPlaybackStatusUpdate) {
      onPlaybackStatusUpdate(status);
    }
  };
  
  // Optimale Video-Qualität
  const getOptimizedVideoUri = () => {
    if (!autoQuality) return uri;
    
    const deviceType = responsive.getDeviceType();
    const quality = responsive.isPhone() ? 'medium' : 'high';
    
    return VideoOptimization.getAdaptiveStreamUrl(uri, quality);
  };
  
  // Video Dimensions
  const videoDimensions = responsive.responsive({
    phone: {
      width: responsive.screenWidth,
      height: responsive.screenHeight,
    },
    tablet: {
      width: responsive.screenWidth,
      height: responsive.screenHeight * 0.75,
    },
    laptop: {
      width: 640,
      height: 1138, // 9:16
    },
    desktop: {
      width: 720,
      height: 1280, // 9:16
    },
    default: {
      width: responsive.screenWidth,
      height: responsive.screenHeight,
    },
  });
  
  // Progress Bar
  const progress = duration > 0 ? (position / duration) * 100 : 0;
  
  useEffect(() => {
    if (shouldPlay && videoRef.current) {
      videoRef.current.playAsync();
    }
  }, [shouldPlay]);
  
  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={handlePress}
      style={[styles.container, style]}
    >
      <Video
        ref={videoRef}
        source={{ uri: getOptimizedVideoUri() }}
        style={[
          styles.video,
          {
            width: videoDimensions.width,
            height: videoDimensions.height,
          },
        ]}
        resizeMode={ResizeMode.COVER}
        shouldPlay={shouldPlay}
        isLooping={isLooping}
        isMuted={isMutedState}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        useNativeControls={false}
        // Performance Optimierungen
        posterSource={thumbnailUri ? { uri: thumbnailUri } : undefined}
        usePoster={!!thumbnailUri}
        progressUpdateIntervalMillis={100}
      />
      
      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
      
      {/* Custom Controls */}
      {showControls && showControlsState && (
        <View
          style={[styles.controls, { opacity: showControlsState ? 1 : 0 }]}
        >
          {/* Center Play/Pause Button */}
          <TouchableOpacity
            style={styles.centerControl}
            onPress={togglePlayback}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={responsive.scale(64)}
              color="white"
            />
          </TouchableOpacity>
          
          {/* Bottom Controls */}
          <View style={styles.bottomControls}>
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progress}%` },
                ]}
              />
            </View>
            
            {/* Mute Button */}
            <TouchableOpacity
              style={styles.muteButton}
              onPress={toggleMute}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isMutedState ? 'volume-mute' : 'volume-high'}
                size={responsive.scale(24)}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: Colors.text,
  },
  video: {
    backgroundColor: Colors.text,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controls: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerControl: {
    padding: Spacing.md,
  },
  bottomControls: {
    position: 'absolute',
    bottom: responsive.getSafeAreaInsets().bottom + Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  muteButton: {
    padding: Spacing.sm,
  },
});
