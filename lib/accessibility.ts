/**
 * Accessibility Utilities
 * WCAG 2.2+ Compliance für Anpip
 */

import { Platform } from 'react-native';

/**
 * Screen Reader Announcement
 */
export function announceForAccessibility(message: string) {
  if (Platform.OS === 'web') {
    // Web: Live Region
    const liveRegion = document.getElementById('a11y-announcer');
    if (liveRegion) {
      liveRegion.textContent = message;
    }
  } else {
    // Native: AccessibilityInfo
    const { AccessibilityInfo } = require('react-native');
    AccessibilityInfo.announceForAccessibility(message);
  }
}

/**
 * Generate Accessible Label for Video
 */
export function generateVideoLabel(
  description: string,
  username?: string,
  likes?: number,
  location?: string
): string {
  let label = `Video`;
  
  if (username) {
    label += ` von ${username}`;
  }
  
  if (description) {
    label += `: ${description}`;
  }
  
  if (location) {
    label += `. Standort: ${location}`;
  }
  
  if (likes !== undefined && likes > 0) {
    label += `. ${likes} ${likes === 1 ? 'Like' : 'Likes'}`;
  }
  
  return label;
}

/**
 * Keyboard Navigation Support
 */
export function setupKeyboardNavigation() {
  if (Platform.OS !== 'web') return;

  document.addEventListener('keydown', (event) => {
    // Pfeiltasten für Video-Navigation
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const activeElement = document.activeElement;
      
      if (activeElement?.getAttribute('data-video-item')) {
        event.preventDefault();
        
        const direction = event.key === 'ArrowUp' ? -1 : 1;
        const videos = Array.from(document.querySelectorAll('[data-video-item]'));
        const currentIndex = videos.indexOf(activeElement);
        const nextIndex = currentIndex + direction;
        
        if (nextIndex >= 0 && nextIndex < videos.length) {
          (videos[nextIndex] as HTMLElement).focus();
          (videos[nextIndex] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    
    // Space/Enter für Play/Pause
    if (event.key === ' ' || event.key === 'Enter') {
      const activeElement = document.activeElement;
      
      if (activeElement?.getAttribute('data-video-player')) {
        event.preventDefault();
        const video = activeElement as HTMLVideoElement;
        
        if (video.paused) {
          video.play();
          announceForAccessibility('Video wird abgespielt');
        } else {
          video.pause();
          announceForAccessibility('Video pausiert');
        }
      }
    }
    
    // M für Mute/Unmute
    if (event.key === 'm' || event.key === 'M') {
      const activeElement = document.activeElement;
      
      if (activeElement?.getAttribute('data-video-player')) {
        event.preventDefault();
        const video = activeElement as HTMLVideoElement;
        video.muted = !video.muted;
        announceForAccessibility(video.muted ? 'Ton aus' : 'Ton an');
      }
    }
  });
}

/**
 * Color Contrast Checker (WCAG AA/AAA)
 */
export function checkColorContrast(
  foreground: string,
  background: string
): { ratio: number; AA: boolean; AAA: boolean } {
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const r = ((rgb >> 16) & 0xff) / 255;
    const g = ((rgb >> 8) & 0xff) / 255;
    const b = (rgb & 0xff) / 255;

    const [rs, gs, bs] = [r, g, b].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,  // WCAG AA für normalen Text
    AAA: ratio >= 7,   // WCAG AAA für normalen Text
  };
}

/**
 * Focus Trap für Modals
 */
export function createFocusTrap(element: HTMLElement) {
  if (Platform.OS !== 'web') return () => {};

  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable?.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        event.preventDefault();
        firstFocusable?.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);
  firstFocusable?.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}

/**
 * Accessible Form Validation
 */
export function announceFormError(fieldName: string, errorMessage: string) {
  announceForAccessibility(`Fehler im Feld ${fieldName}: ${errorMessage}`);
}

/**
 * Skip Links Setup
 */
export function setupSkipLinks() {
  if (Platform.OS !== 'web') return;

  const style = document.createElement('style');
  style.textContent = `
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      background: #0ea5e9;
      color: white;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 100;
      font-weight: 600;
      border-radius: 0 0 4px 0;
    }
    .skip-link:focus {
      top: 0;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Reduced Motion Detection
 */
export function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * High Contrast Detection
 */
export function prefersHighContrast(): boolean {
  if (Platform.OS !== 'web') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Dark Mode Detection
 */
export function prefersDarkMode(): boolean {
  if (Platform.OS !== 'web') return false;
  
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Font Size Preference
 */
export function getPreferredFontScale(): number {
  if (Platform.OS !== 'web') return 1;
  
  // Check browser zoom level
  const zoom = window.devicePixelRatio || 1;
  return zoom;
}

/**
 * Setup ARIA Live Region
 */
export function setupAriaLiveRegion() {
  if (Platform.OS !== 'web') return;

  if (document.getElementById('a11y-announcer')) return;

  const liveRegion = document.createElement('div');
  liveRegion.id = 'a11y-announcer';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  
  document.body.appendChild(liveRegion);
}

/**
 * Accessible Time Format
 */
export function formatAccessibleDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`);
  }
  
  if (secs > 0 || parts.length === 0) {
    parts.push(`${secs} ${secs === 1 ? 'Sekunde' : 'Sekunden'}`);
  }

  return parts.join(' und ');
}
