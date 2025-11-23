/**
 * ACCESSIBILITY (A11Y) 2025 - WCAG 2.2 COMPLIANT
 * Screenreader-Optimierung, Farbkontraste, Keyboard Navigation
 */

import { Platform } from 'react-native';

// ==================== COLOR CONTRAST ====================

/**
 * Berechnet Kontrast-Ratio zwischen zwei Farben (WCAG)
 * Mindest-Anforderungen:
 * - Normal text: 4.5:1 (AA), 7:1 (AAA)
 * - Large text (18pt+): 3:1 (AA), 4.5:1 (AAA)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;
  
  const [r, g, b] = [rgb.r / 255, rgb.g / 255, rgb.b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Prüft ob Farbkontrast WCAG-konform ist
 */
export function isAccessibleContrast(
  foreground: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA',
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  
  if (level === 'AAA') {
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }
  
  // AA
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Findet barrierefreie Farbvariante
 */
export function findAccessibleColor(
  color: string,
  background: string,
  level: 'AA' | 'AAA' = 'AA'
): string {
  if (isAccessibleContrast(color, background, level)) {
    return color;
  }
  
  // Verdunkle/Erhelle Farbe schrittweise
  const rgb = hexToRgb(color);
  if (!rgb) return color;
  
  // Versuche zuerst Verdunkelung
  for (let factor = 0.9; factor >= 0.1; factor -= 0.1) {
    const darkened = rgbToHex(
      Math.round(rgb.r * factor),
      Math.round(rgb.g * factor),
      Math.round(rgb.b * factor)
    );
    
    if (isAccessibleContrast(darkened, background, level)) {
      return darkened;
    }
  }
  
  // Dann Aufhellung
  for (let factor = 1.1; factor <= 2; factor += 0.1) {
    const lightened = rgbToHex(
      Math.min(255, Math.round(rgb.r * factor)),
      Math.min(255, Math.round(rgb.g * factor)),
      Math.min(255, Math.round(rgb.b * factor))
    );
    
    if (isAccessibleContrast(lightened, background, level)) {
      return lightened;
    }
  }
  
  // Fallback: Schwarz oder Weiß
  return isAccessibleContrast('#000000', background, level) ? '#000000' : '#FFFFFF';
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ==================== ARIA LABELS ====================

export interface AriaProps {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: string;
  'aria-expanded'?: boolean;
  'aria-selected'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-disabled'?: boolean;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
}

/**
 * Generiert optimierte ARIA-Attribute für Komponenten
 */
export function generateAriaProps(config: {
  label: string;
  description?: string;
  role?: string;
  state?: {
    expanded?: boolean;
    selected?: boolean;
    pressed?: boolean;
    checked?: boolean | 'mixed';
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    current?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
  };
  live?: 'polite' | 'assertive' | 'off';
}): AriaProps {
  const props: AriaProps = {
    'aria-label': config.label,
  };
  
  if (config.description) {
    props['aria-describedby'] = config.description;
  }
  
  if (config.role) {
    props.role = config.role;
  }
  
  if (config.state) {
    if (config.state.expanded !== undefined) props['aria-expanded'] = config.state.expanded;
    if (config.state.selected !== undefined) props['aria-selected'] = config.state.selected;
    if (config.state.pressed !== undefined) props['aria-pressed'] = config.state.pressed;
    if (config.state.checked !== undefined) props['aria-checked'] = config.state.checked;
    if (config.state.disabled !== undefined) props['aria-disabled'] = config.state.disabled;
    if (config.state.invalid !== undefined) props['aria-invalid'] = config.state.invalid;
    if (config.state.required !== undefined) props['aria-required'] = config.state.required;
    if (config.state.current !== undefined) props['aria-current'] = config.state.current;
  }
  
  if (config.live) {
    props['aria-live'] = config.live;
    props['aria-atomic'] = true;
  }
  
  return props;
}

// ==================== SCREENREADER OPTIMIZATION ====================

/**
 * Screenreader-optimierte Texte
 */
export function getScreenReaderText(text: string, context?: string): string {
  let srText = text;
  
  // Zahlen ausschreiben
  srText = srText.replace(/(\d+)K/gi, (match, num) => `${num} tausend`);
  srText = srText.replace(/(\d+)M/gi, (match, num) => `${num} Millionen`);
  srText = srText.replace(/(\d+)B/gi, (match, num) => `${num} Milliarden`);
  
  // Icons/Emojis beschreiben
  srText = srText.replace(/👍/g, 'Daumen hoch');
  srText = srText.replace(/❤️/g, 'Herz');
  srText = srText.replace(/💬/g, 'Kommentar');
  srText = srText.replace(/📤/g, 'Teilen');
  srText = srText.replace(/🎁/g, 'Geschenk');
  srText = srText.replace(/⭐/g, 'Stern');
  
  // Kontext hinzufügen
  if (context) {
    srText = `${context}: ${srText}`;
  }
  
  return srText;
}

/**
 * Generiert Screenreader-Text für Video
 */
export function getVideoAriaLabel(video: {
  title?: string;
  description?: string;
  username?: string;
  likes?: number;
  comments?: number;
  views?: number;
  isLive?: boolean;
}): string {
  const parts: string[] = [];
  
  if (video.isLive) {
    parts.push('Live-Video');
  } else {
    parts.push('Video');
  }
  
  if (video.username) {
    parts.push(`von ${video.username}`);
  }
  
  if (video.title) {
    parts.push(video.title);
  }
  
  if (video.description) {
    parts.push(video.description.substring(0, 100));
  }
  
  if (video.views !== undefined) {
    parts.push(`${video.views} Aufrufe`);
  }
  
  if (video.likes !== undefined) {
    parts.push(`${video.likes} Likes`);
  }
  
  if (video.comments !== undefined) {
    parts.push(`${video.comments} Kommentare`);
  }
  
  return parts.join(', ');
}

// ==================== KEYBOARD NAVIGATION ====================

/**
 * Keyboard Event Handler
 */
export function handleKeyboardNavigation(
  event: KeyboardEvent,
  actions: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
  }
): void {
  switch (event.key) {
    case 'Enter':
      event.preventDefault();
      actions.onEnter?.();
      break;
    
    case ' ':
    case 'Space':
      event.preventDefault();
      actions.onSpace?.();
      break;
    
    case 'Escape':
      event.preventDefault();
      actions.onEscape?.();
      break;
    
    case 'ArrowUp':
      event.preventDefault();
      actions.onArrowUp?.();
      break;
    
    case 'ArrowDown':
      event.preventDefault();
      actions.onArrowDown?.();
      break;
    
    case 'ArrowLeft':
      event.preventDefault();
      actions.onArrowLeft?.();
      break;
    
    case 'ArrowRight':
      event.preventDefault();
      actions.onArrowRight?.();
      break;
    
    case 'Tab':
      actions.onTab?.();
      break;
  }
}

/**
 * Focus Management
 */
export function trapFocus(container: HTMLElement): () => void {
  const focusableElements = container.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
  
  const handleTab = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };
  
  container.addEventListener('keydown', handleTab as any);
  
  // Focus erstes Element
  firstElement?.focus();
  
  // Cleanup function
  return () => {
    container.removeEventListener('keydown', handleTab as any);
  };
}

// ==================== FOCUS INDICATORS ====================

/**
 * Generiert sichtbare Focus-Styles (WCAG 2.2)
 */
export function getFocusStyles(color: string = '#0ea5e9'): any {
  return {
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: color,
    outlineOffset: 2,
  };
}

// ==================== MOTION & ANIMATION ====================

/**
 * Prüft ob Nutzer reduzierte Bewegung bevorzugt
 */
export function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Adaptive Animation Config
 */
export function getAnimationConfig(): {
  duration: number;
  useNativeDriver: boolean;
  enableAnimations: boolean;
} {
  const reducedMotion = prefersReducedMotion();
  
  return {
    duration: reducedMotion ? 0 : 300,
    useNativeDriver: true,
    enableAnimations: !reducedMotion,
  };
}

// ==================== TEXT SIZING ====================

/**
 * Responsive Text Scaling
 */
export function getAccessibleFontSize(baseFontSize: number): number {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return baseFontSize;
  }
  
  // Browser Text-Zoom berücksichtigen
  const computedFontSize = parseFloat(
    window.getComputedStyle(document.documentElement).fontSize
  );
  
  const scaleFactor = computedFontSize / 16; // 16px = Standard
  
  return baseFontSize * scaleFactor;
}

// ==================== LIVE REGION ANNOUNCEMENTS ====================

/**
 * Erstellt Live Region für Screenreader-Announcements
 */
export function createLiveRegion(id: string = 'a11y-announcer'): HTMLElement | null {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return null;
  
  let region = document.getElementById(id);
  
  if (!region) {
    region = document.createElement('div');
    region.id = id;
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    document.body.appendChild(region);
  }
  
  return region;
}

/**
 * Announce für Screenreader
 */
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (Platform.OS !== 'web') return;
  
  const region = createLiveRegion();
  if (!region) return;
  
  region.setAttribute('aria-live', priority);
  region.textContent = message;
  
  // Reset nach 1 Sekunde
  setTimeout(() => {
    region.textContent = '';
  }, 1000);
}

// ==================== VALIDATION ====================

/**
 * A11y Audit einer Komponente
 */
export function auditAccessibility(element: HTMLElement): {
  errors: string[];
  warnings: string[];
  passed: boolean;
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Prüfe auf aria-label oder alt-text bei Bildern
  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    errors.push('Bild hat kein alt-Attribut');
  }
  
  // Prüfe auf aria-label bei interaktiven Elementen
  if (
    (element.tagName === 'BUTTON' || element.getAttribute('role') === 'button') &&
    !element.getAttribute('aria-label') &&
    !element.textContent?.trim()
  ) {
    errors.push('Button hat kein Label');
  }
  
  // Prüfe Farbkontrast
  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;
  const backgroundColor = computedStyle.backgroundColor;
  
  if (color && backgroundColor) {
    if (!isAccessibleContrast(color, backgroundColor)) {
      warnings.push('Farbkontrast erfüllt nicht WCAG AA Standard');
    }
  }
  
  // Prüfe tabindex
  const tabindex = element.getAttribute('tabindex');
  if (tabindex && parseInt(tabindex) > 0) {
    warnings.push('Positiver tabindex kann Keyboard-Navigation stören');
  }
  
  return {
    errors,
    warnings,
    passed: errors.length === 0,
  };
}

// ==================== EXPORT ====================

export default {
  getContrastRatio,
  isAccessibleContrast,
  findAccessibleColor,
  generateAriaProps,
  getScreenReaderText,
  getVideoAriaLabel,
  handleKeyboardNavigation,
  trapFocus,
  getFocusStyles,
  prefersReducedMotion,
  getAnimationConfig,
  getAccessibleFontSize,
  announce,
  auditAccessibility,
};
