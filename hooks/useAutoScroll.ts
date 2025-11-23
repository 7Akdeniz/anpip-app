/**
 * ============================================================================
 * AUTO-SCROLL HOOK - Automatisches Weiter-Scrollen im Video-Feed
 * ============================================================================
 * 
 * Features:
 * - Automatisches Scrollen zum nächsten Video nach Video-Ende
 * - User-Interaktion hat Vorrang (manuelles Scrollen, Pause, Long-Press)
 * - Ressourcenschonend (nur ein aktives Video)
 * - Settings-Toggle zum An/Aus-Schalten
 * - Smooth Scrolling mit Snap-to-Video
 * - Infinite Scroll Support
 */

import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// TYPES
// ============================================================================

interface AutoScrollConfig {
  enabled: boolean;                    // Auto-Scroll aktiviert?
  currentIndex: number;                // Aktueller Video-Index
  videosLength: number;                // Anzahl Videos im Feed
  scrollToIndex: (index: number) => void; // Scroll-Funktion
  onEndReached?: () => void;           // Callback für Infinite Scroll
  hasMore?: boolean;                   // Weitere Videos verfügbar?
  preloadNext?: boolean;               // Nächstes Video vorladen (Default: true)
  minVideoDuration?: number;           // Min. Video-Dauer in ms (Default: 1000ms)
  scrollDelay?: number;                // Verzögerung vor Scroll in ms (Default: 500ms)
}

interface VideoEndEvent {
  videoIndex: number;                  // Index des beendeten Videos
  duration: number;                    // Video-Dauer in Millisekunden
}

// ============================================================================
// CONSTANTS
// ============================================================================

const AUTO_SCROLL_ENABLED_KEY = '@anpip_auto_scroll_enabled';
const AUTO_SCROLL_DELAY_MS = 500;    // Verzögerung vor Auto-Scroll (500ms)
const MIN_VIDEO_DURATION_MS = 1000;   // Min. Dauer für Auto-Scroll (1s)

// ============================================================================
// HOOK
// ============================================================================

export function useAutoScroll(config: AutoScrollConfig) {
  const {
    enabled,
    currentIndex,
    videosLength,
    scrollToIndex,
    onEndReached,
    hasMore = true,
    preloadNext = true,
    minVideoDuration = MIN_VIDEO_DURATION_MS,
    scrollDelay = AUTO_SCROLL_DELAY_MS,
  } = config;

  // Refs für Zustandsverwaltung
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionRef = useRef<boolean>(false);
  const lastScrollTimeRef = useRef<number>(0);
  const isAutoScrollingRef = useRef<boolean>(false);

  /**
   * Prüft ob Auto-Scroll ausgeführt werden soll
   */
  const shouldAutoScroll = useCallback((): boolean => {
    // Auto-Scroll deaktiviert
    if (!enabled) return false;

    // User-Interaktion aktiv (manuelles Scrollen, Pause)
    if (userInteractionRef.current) return false;

    // Gerade am Auto-Scrollen
    if (isAutoScrollingRef.current) return false;

    // Letztes manuelless Scrollen war vor < 2 Sekunden
    const timeSinceLastScroll = Date.now() - lastScrollTimeRef.current;
    if (timeSinceLastScroll < 2000) return false;

    return true;
  }, [enabled]);

  /**
   * Scrollt zum nächsten Video
   */
  const scrollToNext = useCallback(() => {
    if (!shouldAutoScroll()) return;

    const nextIndex = currentIndex + 1;

    // Letztes Video erreicht
    if (nextIndex >= videosLength) {
      // Infinite Scroll: Weitere Videos nachladen
      if (hasMore && onEndReached) {
        console.log('🔄 Auto-Scroll: Lade weitere Videos...');
        onEndReached();
        return;
      }
      
      // Kein Auto-Scroll mehr (Feed-Ende erreicht)
      console.log('⏹️ Auto-Scroll: Feed-Ende erreicht - keine weiteren Videos');
      return;
    }

    // Zum nächsten Video scrollen
    console.log(`▶️ Auto-Scroll: Scrolle von Video ${currentIndex} → ${nextIndex} (${videosLength} total)`);
    isAutoScrollingRef.current = true;

    // Smooth Scroll mit konfigurierbarem Delay
    setTimeout(() => {
      scrollToIndex(nextIndex);
      
      // Auto-Scroll-Flag nach Animation zurücksetzen
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 300);
    }, scrollDelay);

  }, [currentIndex, videosLength, scrollToIndex, shouldAutoScroll, hasMore, onEndReached]);

  /**
   * Callback wenn Video zu Ende ist
   */
  const onVideoEnd = useCallback((event?: VideoEndEvent) => {
    if (!enabled) return;

    // Prüfe ob Video lang genug war (verhindert Auto-Scroll bei sehr kurzen/fehlerhaften Videos)
    if (event && event.duration < minVideoDuration) {
      console.log(`⏭️ Auto-Scroll: Video zu kurz (${event.duration}ms < ${minVideoDuration}ms), übersprungen`);
      return;
    }

    console.log(`✅ Video beendet (${event?.duration || 0}ms) - Auto-Scroll wird vorbereitet...`);
    scrollToNext();
  }, [enabled, scrollToNext, minVideoDuration]);

  /**
   * Registriert manuelles Scrollen (verhindert Auto-Scroll)
   */
  const onManualScroll = useCallback(() => {
    lastScrollTimeRef.current = Date.now();
    userInteractionRef.current = true;

    // User-Interaktion-Flag nach 2 Sekunden zurücksetzen
    setTimeout(() => {
      userInteractionRef.current = false;
    }, 2000);

    console.log('👆 Manuelle Scroll-Interaktion erkannt');
  }, []);

  /**
   * Registriert Pause-Aktion (verhindert Auto-Scroll)
   */
  const onVideoPause = useCallback(() => {
    userInteractionRef.current = true;
    console.log('⏸️ Video pausiert - Auto-Scroll deaktiviert');
  }, []);

  /**
   * Registriert Play-Aktion (erlaubt Auto-Scroll wieder)
   */
  const onVideoPlay = useCallback(() => {
    // User-Interaktion-Flag nach 1 Sekunde zurücksetzen
    setTimeout(() => {
      userInteractionRef.current = false;
      console.log('▶️ Video spielt - Auto-Scroll aktiviert');
    }, 1000);
  }, []);

  /**
   * Cleanup bei Component Unmount
   */
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearTimeout(autoScrollTimerRef.current);
      }
    };
  }, []);

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    onVideoEnd,          // Callback für Video-Ende
    onManualScroll,      // Callback für manuelles Scrollen
    onVideoPause,        // Callback für Video-Pause
    onVideoPlay,         // Callback für Video-Play
  };
}

// ============================================================================
// SETTINGS STORAGE (AsyncStorage)
// ============================================================================

/**
 * Lädt Auto-Scroll-Einstellung aus AsyncStorage
 */
export async function loadAutoScrollSetting(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(AUTO_SCROLL_ENABLED_KEY);
    // Standard: Auto-Scroll ist aktiviert
    return value === null ? true : value === 'true';
  } catch (error) {
    console.error('Fehler beim Laden der Auto-Scroll-Einstellung:', error);
    return true; // Fallback: aktiviert
  }
}

/**
 * Speichert Auto-Scroll-Einstellung in AsyncStorage
 */
export async function saveAutoScrollSetting(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(AUTO_SCROLL_ENABLED_KEY, enabled.toString());
    console.log(`✅ Auto-Scroll-Einstellung gespeichert: ${enabled}`);
  } catch (error) {
    console.error('Fehler beim Speichern der Auto-Scroll-Einstellung:', error);
  }
}
