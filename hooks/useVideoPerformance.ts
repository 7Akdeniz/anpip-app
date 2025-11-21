/**
 * Video Performance Optimization Hook
 * Optimiert für 9:16 Videos, Core Web Vitals, Lazy Loading
 */

import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

export interface VideoPerformanceOptions {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  playsInline?: boolean;
  enableLazyLoad?: boolean;
  intersectionThreshold?: number;
  onLoadStart?: () => void;
  onCanPlay?: () => void;
  onError?: (error: any) => void;
}

export function useVideoPerformance(
  videoRef: React.RefObject<any>,
  options: VideoPerformanceOptions = {}
) {
  const {
    autoplay = false,
    muted = true,
    loop = false,
    preload = 'metadata',
    playsInline = true,
    enableLazyLoad = true,
    intersectionThreshold = 0.5,
    onLoadStart,
    onCanPlay,
    onError,
  } = options;

  const [isVisible, setIsVisible] = useState(!enableLazyLoad);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer für Lazy Loading
  useEffect(() => {
    if (Platform.OS !== 'web' || !enableLazyLoad || !videoRef.current) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        
        if (entry.isIntersecting && autoplay) {
          // Auto-play wenn sichtbar
          videoRef.current?.play?.();
        } else if (!entry.isIntersecting) {
          // Pause wenn nicht sichtbar
          videoRef.current?.pause?.();
        }
      },
      { threshold: intersectionThreshold }
    );

    observerRef.current.observe(videoRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [enableLazyLoad, autoplay, intersectionThreshold]);

  // Video Attributes Setup
  useEffect(() => {
    if (Platform.OS !== 'web' || !videoRef.current) {
      return;
    }

    const video = videoRef.current;

    // Standard-Attribute
    video.muted = muted;
    video.loop = loop;
    video.playsInline = playsInline;
    video.preload = isVisible ? preload : 'none';

    // Event Listeners
    const handleLoadStart = () => {
      setIsLoading(true);
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setIsReady(true);
      onCanPlay?.();
    };

    const handleError = (error: any) => {
      setIsLoading(false);
      onError?.(error);
    };

    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, [isVisible, muted, loop, playsInline, preload]);

  return {
    isVisible,
    isLoading,
    isReady,
    shouldLoad: isVisible,
  };
}

/**
 * Video Thumbnail Generator
 */
export async function generateVideoThumbnail(
  videoUrl: string,
  timeSeconds: number = 1
): Promise<string | null> {
  if (Platform.OS !== 'web') {
    // Nutze expo-video-thumbnails für Native
    try {
      const VideoThumbnails = await import('expo-video-thumbnails');
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUrl, {
        time: timeSeconds * 1000,
      });
      return uri;
    } catch (error) {
      console.error('Thumbnail generation failed:', error);
      return null;
    }
  }

  // Web: Canvas-basierte Thumbnail-Generierung
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.currentTime = timeSeconds;

    video.addEventListener('loadeddata', () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    });

    video.addEventListener('error', () => resolve(null));
    video.src = videoUrl;
  });
}

/**
 * Adaptive Video Quality basierend auf Netzwerkqualität
 */
export function getOptimalVideoQuality(): '480p' | '720p' | '1080p' {
  if (Platform.OS !== 'web' || !('connection' in navigator)) {
    return '720p'; // Default
  }

  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType;

  // 4G -> 1080p, 3G -> 720p, 2G -> 480p
  if (effectiveType === '4g') return '1080p';
  if (effectiveType === '3g') return '720p';
  return '480p';
}

/**
 * Video Preloading Strategy
 */
export function preloadVideo(url: string, priority: 'high' | 'low' = 'low') {
  if (Platform.OS !== 'web') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'video';
  link.href = url;
  
  if (priority === 'high') {
    link.setAttribute('fetchpriority', 'high');
  }

  document.head.appendChild(link);
}

/**
 * Smooth Scroll für Video Feed (ein Video pro Scroll)
 */
export function useVideoScroll(
  containerRef: React.RefObject<any>,
  videoHeight: number,
  onVideoChange?: (index: number) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !containerRef.current) return;

    const container = containerRef.current;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollTop = container.scrollTop;
        const newIndex = Math.round(scrollTop / videoHeight);

        if (newIndex !== currentIndex) {
          setCurrentIndex(newIndex);
          onVideoChange?.(newIndex);

          // Snap to Video
          container.scrollTo({
            top: newIndex * videoHeight,
            behavior: 'smooth',
          });
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentIndex, videoHeight]);

  return { currentIndex };
}

/**
 * Video Compression Check
 */
export function shouldCompressVideo(
  fileSize: number,
  duration: number
): boolean {
  const MB = 1024 * 1024;
  const bitrate = (fileSize * 8) / duration; // bits per second

  // Komprimiere wenn > 5MB oder bitrate > 8Mbps
  return fileSize > 5 * MB || bitrate > 8000000;
}

/**
 * Video Format Check
 */
export function isSupportedVideoFormat(filename: string): boolean {
  const supportedFormats = ['.mp4', '.webm', '.mov', '.m4v'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return supportedFormats.includes(extension);
}

/**
 * Calculate Video Aspect Ratio
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Is 9:16 Video (optimales Format für Anpip)
 */
export function is9x16Video(width: number, height: number): boolean {
  const ratio = calculateAspectRatio(width, height);
  return ratio === '9:16';
}
