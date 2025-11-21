/**
 * TIKTOK-STYLE VIDEO FEED 2025
 * Full-Screen Scroll, URL Updates, Preloading
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Platform } from 'react-native';

export interface VideoFeedItem {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  category?: string;
  location?: {
    country: string;
    city: string;
  };
}

export interface VideoFeedConfig {
  videos: VideoFeedItem[];
  onVideoChange?: (video: VideoFeedItem, index: number) => void;
  preloadCount?: number; // Anzahl Videos zum Preloaden
  updateURL?: boolean; // URL per pushState updaten
  autoPlay?: boolean;
  loop?: boolean;
}

/**
 * Video Feed Hook mit TikTok-Style Funktionalität
 */
export function useVideoFeed(config: VideoFeedConfig) {
  const { videos, onVideoChange, preloadCount = 2, updateURL = true, autoPlay = true, loop = true } = config;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastScrollTime = useRef<number>(0);
  const isScrolling = useRef<boolean>(false);

  /**
   * Video-Element registrieren
   */
  const registerVideo = useCallback((id: string, element: HTMLVideoElement | null) => {
    if (element) {
      videoRefs.current.set(id, element);
    } else {
      videoRefs.current.delete(id);
    }
  }, []);

  /**
   * Scroll zu bestimmtem Video
   */
  const scrollToVideo = useCallback((index: number, smooth = true) => {
    if (Platform.OS !== 'web') return;
    
    const video = videos[index];
    if (!video) return;

    const element = videoRefs.current.get(video.id);
    if (element) {
      element.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        block: 'start',
      });
    }
  }, [videos]);

  /**
   * Nächstes Video
   */
  const nextVideo = useCallback(() => {
    if (currentIndex < videos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollToVideo(currentIndex + 1);
    }
  }, [currentIndex, videos.length, scrollToVideo]);

  /**
   * Vorheriges Video
   */
  const previousVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollToVideo(currentIndex - 1);
    }
  }, [currentIndex, scrollToVideo]);

  /**
   * Intersection Observer Setup
   */
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const videoElement = entry.target as HTMLVideoElement;
          const videoId = videoElement.dataset.videoId;
          
          if (!videoId) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Video ist mindestens 50% sichtbar
            const index = videos.findIndex(v => v.id === videoId);
            
            if (index !== -1 && index !== currentIndex) {
              setCurrentIndex(index);
              
              // Auto-Play
              if (autoPlay) {
                videoElement.play().catch(console.warn);
                setIsPlaying(true);
              }

              // Andere Videos pausieren
              videoRefs.current.forEach((vid, id) => {
                if (id !== videoId && !vid.paused) {
                  vid.pause();
                }
              });

              // Callback
              if (onVideoChange) {
                onVideoChange(videos[index], index);
              }

              // URL Update
              if (updateURL) {
                updateVideoURL(videos[index]);
              }

              // Preload nächste Videos
              preloadNextVideos(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0, 0.5, 1],
      }
    );

    // Alle Video-Elemente beobachten
    videoRefs.current.forEach((video) => {
      observerRef.current?.observe(video);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [videos, currentIndex, autoPlay, onVideoChange, updateURL]);

  /**
   * URL Update (für SEO)
   */
  const updateVideoURL = useCallback((video: VideoFeedItem) => {
    if (Platform.OS !== 'web') return;

    const url = generateVideoURL(video);
    
    try {
      window.history.pushState(
        { videoId: video.id },
        '',
        url
      );
    } catch (error) {
      console.warn('URL update failed:', error);
    }
  }, []);

  /**
   * Preload nächste Videos
   */
  const preloadNextVideos = useCallback((currentIdx: number) => {
    if (Platform.OS !== 'web') return;

    const preloadIndices = [];
    for (let i = 1; i <= (preloadCount || 2); i++) {
      const nextIdx = currentIdx + i;
      if (nextIdx < videos.length) {
        preloadIndices.push(nextIdx);
      }
    }

    preloadIndices.forEach(idx => {
      const video = videos[idx];
      const element = videoRefs.current.get(video.id);
      
      if (element && element.readyState < 2) {
        // Preload Video
        element.load();
      }
    });
  }, [videos, preloadCount]);

  /**
   * Play/Pause Toggle
   */
  const togglePlayPause = useCallback(() => {
    const currentVideo = videos[currentIndex];
    if (!currentVideo) return;

    const element = videoRefs.current.get(currentVideo.id);
    if (!element) return;

    if (element.paused) {
      element.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      element.pause();
      setIsPlaying(false);
    }
  }, [currentIndex, videos]);

  /**
   * Keyboard Navigation
   */
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          previousVideo();
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextVideo();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextVideo, previousVideo, togglePlayPause]);

  /**
   * Scroll Snap Behavior
   */
  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const container = containerRef.current;
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      isScrolling.current = true;
      clearTimeout(scrollTimeout);

      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
        
        // Snap to nearest video
        const scrollTop = container.scrollTop;
        const viewportHeight = window.innerHeight;
        const nearestIndex = Math.round(scrollTop / viewportHeight);
        
        if (nearestIndex !== currentIndex && nearestIndex >= 0 && nearestIndex < videos.length) {
          scrollToVideo(nearestIndex, true);
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [currentIndex, videos.length, scrollToVideo]);

  return {
    currentIndex,
    currentVideo: videos[currentIndex],
    isPlaying,
    containerRef,
    registerVideo,
    nextVideo,
    previousVideo,
    togglePlayPause,
    scrollToVideo,
  };
}

/**
 * Generiert SEO-optimierte Video-URL
 */
function generateVideoURL(video: VideoFeedItem): string {
  const segments: string[] = [];

  // Location
  if (video.location) {
    segments.push(video.location.country.toLowerCase());
    segments.push(video.location.city.toLowerCase().replace(/\s+/g, '-'));
  }

  // Category
  if (video.category) {
    segments.push('kategorie', video.category.toLowerCase().replace(/\s+/g, '-'));
  }

  // Video ID mit Titel-Slug
  const titleSlug = video.title 
    ? video.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
    : 'video';
  
  segments.push('v', `${titleSlug}-${video.id}`);

  return '/' + segments.join('/');
}

/**
 * Video Feed Component Styles (CSS-in-JS oder Tailwind)
 */
export const videoFeedStyles = `
.video-feed-container {
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height */
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.video-feed-container::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

.video-feed-item {
  height: 100vh;
  height: 100dvh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  position: relative;
  width: 100%;
}

.video-feed-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #000;
}

.video-feed-controls {
  position: absolute;
  bottom: 80px;
  right: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 10;
}

.video-feed-info {
  position: absolute;
  bottom: 20px;
  left: 12px;
  right: 70px;
  color: white;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
  z-index: 10;
}

/* Preloading Indicator */
.video-feed-item.loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
`;

export default {
  useVideoFeed,
  videoFeedStyles,
};
