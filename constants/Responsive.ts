/**
 * ANPIP.COM - RESPONSIVE DESIGN SYSTEM
 * Multi-Device Optimierung für alle Bildschirmgrößen
 * 
 * Unterstützt: Smartphones, Tablets, Laptops, Desktops, Ultrawide, Foldables
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

// ============================
// 1. GERÄTE-ERKENNUNG
// ============================

export const DeviceType = {
  PHONE: 'phone',
  TABLET: 'tablet',
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  ULTRAWIDE: 'ultrawide',
  FOLDABLE: 'foldable',
} as const;

export type DeviceTypeValue = typeof DeviceType[keyof typeof DeviceType];

// ============================
// 2. BREAKPOINTS (2025 Standard)
// ============================

export const Breakpoints = {
  // Mobile First Approach
  xs: 0,          // Kleine Phones (iPhone SE, Galaxy S)
  sm: 375,        // Standard Phones (iPhone 14/15)
  md: 768,        // Tablets Portrait (iPad Mini)
  lg: 1024,       // Tablets Landscape & Laptops (iPad Pro, MacBook)
  xl: 1440,       // Desktop Full HD (27" iMac)
  xxl: 1920,      // Desktop 4K (32" Display)
  ultrawide: 2560, // Ultrawide (34" 21:9)
} as const;

// ============================
// 3. DYNAMISCHE DIMENSIONEN
// ============================

class ResponsiveHelper {
  public screenWidth: number;
  public screenHeight: number;
  private screenDiagonal: number;
  
  constructor() {
    const { width, height } = Dimensions.get('window');
    this.screenWidth = width;
    this.screenHeight = height;
    this.screenDiagonal = Math.sqrt(width * width + height * height);
    
    // Event Listener für Rotation/Resize
    Dimensions.addEventListener('change', ({ window }) => {
      this.screenWidth = window.width;
      this.screenHeight = window.height;
      this.screenDiagonal = Math.sqrt(window.width * window.width + window.height * window.height);
    });
  }
  
  // ============================
  // GERÄTE-TYP ERKENNUNG
  // ============================
  
  getDeviceType(): DeviceTypeValue {
    const width = this.screenWidth;
    const height = this.screenHeight;
    const aspectRatio = width / height;
    
    // Foldable Detection (Samsung Fold: 1768x2208 unfolded)
    if (width > 700 && height > 1800 && aspectRatio < 1) {
      return DeviceType.FOLDABLE;
    }
    
    // Phone
    if (width < Breakpoints.md) {
      return DeviceType.PHONE;
    }
    
    // Tablet
    if (width >= Breakpoints.md && width < Breakpoints.lg) {
      return DeviceType.TABLET;
    }
    
    // Ultrawide
    if (width >= Breakpoints.ultrawide || aspectRatio > 2) {
      return DeviceType.ULTRAWIDE;
    }
    
    // Desktop
    if (width >= Breakpoints.xl) {
      return DeviceType.DESKTOP;
    }
    
    // Laptop
    return DeviceType.LAPTOP;
  }
  
  // ============================
  // RESPONSIVE SKALIERUNG
  // ============================
  
  /**
   * Skaliert Größe basierend auf Bildschirmbreite
   * Basis: iPhone 14 Pro (393px)
   */
  scale(size: number): number {
    const baseWidth = 393;
    return (this.screenWidth / baseWidth) * size;
  }
  
  /**
   * Vertikale Skalierung basierend auf Bildschirmhöhe
   * Basis: iPhone 14 Pro (852px)
   */
  scaleVertical(size: number): number {
    const baseHeight = 852;
    return (this.screenHeight / baseHeight) * size;
  }
  
  /**
   * Moderate Skalierung (weniger aggressiv)
   * Gut für Texte und Paddings
   */
  moderateScale(size: number, factor: number = 0.5): number {
    return size + (this.scale(size) - size) * factor;
  }
  
  /**
   * Font-Skalierung mit Pixel Ratio Berücksichtigung
   */
  scaleFont(size: number): number {
    const pixelRatio = PixelRatio.get();
    const scaled = this.moderateScale(size);
    
    // Verhindere zu kleine Schriften auf High-DPI Displays
    if (pixelRatio >= 3) {
      return Math.max(scaled, size * 0.95);
    }
    
    return scaled;
  }
  
  // ============================
  // BREAKPOINT HELPERS
  // ============================
  
  isPhone(): boolean {
    return this.screenWidth < Breakpoints.md;
  }
  
  isTablet(): boolean {
    return this.screenWidth >= Breakpoints.md && this.screenWidth < Breakpoints.lg;
  }
  
  isDesktop(): boolean {
    return this.screenWidth >= Breakpoints.lg;
  }
  
  isLargeDesktop(): boolean {
    return this.screenWidth >= Breakpoints.xl;
  }
  
  isUltrawide(): boolean {
    return this.screenWidth >= Breakpoints.ultrawide;
  }
  
  // ============================
  // ADAPTIVE WERTE
  // ============================
  
  /**
   * Gibt unterschiedliche Werte je nach Bildschirmgröße zurück
   */
  responsive<T>(values: {
    phone?: T;
    tablet?: T;
    laptop?: T;
    desktop?: T;
    ultrawide?: T;
    default: T;
  }): T {
    const deviceType = this.getDeviceType();
    
    switch (deviceType) {
      case DeviceType.PHONE:
        return values.phone ?? values.default;
      case DeviceType.TABLET:
      case DeviceType.FOLDABLE:
        return values.tablet ?? values.default;
      case DeviceType.LAPTOP:
        return values.laptop ?? values.default;
      case DeviceType.DESKTOP:
        return values.desktop ?? values.default;
      case DeviceType.ULTRAWIDE:
        return values.ultrawide ?? values.desktop ?? values.default;
      default:
        return values.default;
    }
  }
  
  // ============================
  // SAFE AREA INSETS
  // ============================
  
  getSafeAreaInsets() {
    const platform = Platform.OS;
    const width = this.screenWidth;
    const height = this.screenHeight;
    
    // iPhone Modelle mit Notch/Dynamic Island
    const hasNotch = platform === 'ios' && (
      // iPhone X/XS/11 Pro (375x812)
      (width === 375 && height === 812) ||
      // iPhone XR/11 (414x896)
      (width === 414 && height === 896) ||
      // iPhone 12/13 mini (375x812)
      (width === 375 && height === 812) ||
      // iPhone 12/13/14 (390x844)
      (width === 390 && height === 844) ||
      // iPhone 14 Pro (393x852)
      (width === 393 && height === 852) ||
      // iPhone 14 Pro Max (430x932)
      (width === 430 && height === 932) ||
      // iPhone 15 Pro (393x852)
      (width === 393 && height === 852) ||
      // Allgemein: Aspect Ratio > 2
      (height / width > 2)
    );
    
    return {
      top: hasNotch ? 47 : platform === 'ios' ? 20 : 0,
      bottom: hasNotch ? 34 : 0,
      left: 0,
      right: 0,
    };
  }
  
  // ============================
  // ORIENTIERUNG
  // ============================
  
  isPortrait(): boolean {
    return this.screenHeight > this.screenWidth;
  }
  
  isLandscape(): boolean {
    return this.screenWidth > this.screenHeight;
  }
  
  // ============================
  // GRID SYSTEM
  // ============================
  
  /**
   * Berechnet Grid-Spalten basierend auf Bildschirmgröße
   */
  getGridColumns(): number {
    return this.responsive({
      phone: 1,
      tablet: 2,
      laptop: 3,
      desktop: 4,
      ultrawide: 5,
      default: 1,
    });
  }
  
  /**
   * Container-Breite für zentrierte Layouts
   */
  getContainerWidth(): number {
    const maxWidths = {
      phone: this.screenWidth - 32,
      tablet: 720,
      laptop: 960,
      desktop: 1200,
      ultrawide: 1400,
    };
    
    const deviceType = this.getDeviceType();
    const maxWidth = maxWidths[deviceType as keyof typeof maxWidths] || this.screenWidth;
    
    return Math.min(this.screenWidth - 32, maxWidth);
  }
}

// ============================
// SINGLETON INSTANZ
// ============================

export const responsive = new ResponsiveHelper();

// ============================
// RESPONSIVE STYLES HELPER
// ============================

/**
 * Erstellt responsive Styles
 * 
 * Beispiel:
 * const styles = createResponsiveStyles({
 *   container: {
 *     padding: responsive.scale(16),
 *   },
 *   text: {
 *     fontSize: responsive.scaleFont(16),
 *   }
 * });
 */
export function createResponsiveStyles<T extends Record<string, any>>(
  styles: T
): T {
  return styles;
}

// ============================
// ADAPTIVE SPACING
// ============================

export const ResponsiveSpacing = {
  xs: responsive.scale(4),
  sm: responsive.scale(8),
  md: responsive.scale(16),
  lg: responsive.scale(24),
  xl: responsive.scale(32),
  xxl: responsive.scale(48),
  xxxl: responsive.scale(64),
  
  // Gerätespezifisch
  containerPadding: responsive.responsive({
    phone: 16,
    tablet: 24,
    laptop: 32,
    desktop: 48,
    default: 16,
  }),
  
  sectionGap: responsive.responsive({
    phone: 24,
    tablet: 32,
    laptop: 48,
    desktop: 64,
    default: 24,
  }),
};

// ============================
// ADAPTIVE TYPOGRAPHY
// ============================

export const ResponsiveTypography = {
  fontSize: {
    xs: responsive.scaleFont(12),
    sm: responsive.scaleFont(14),
    base: responsive.scaleFont(16),
    lg: responsive.scaleFont(18),
    xl: responsive.scaleFont(20),
    xxl: responsive.scaleFont(24),
    xxxl: responsive.scaleFont(32),
    huge: responsive.responsive({
      phone: 32,
      tablet: 40,
      laptop: 48,
      desktop: 56,
      ultrawide: 64,
      default: 32,
    }),
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: responsive.isPhone() ? 1.5 : 1.75,
  },
};

// ============================
// VIDEO DIMENSIONEN
// ============================

export const VideoSizes = {
  /**
   * TikTok-Style Fullscreen Video
   */
  fullscreen: {
    width: responsive.screenWidth,
    height: responsive.screenHeight,
  },
  
  /**
   * Feed Video (9:16 Aspect Ratio)
   */
  feed: {
    width: responsive.screenWidth,
    height: responsive.responsive({
      phone: responsive.screenHeight * 0.85,
      tablet: responsive.screenHeight * 0.75,
      laptop: responsive.screenHeight * 0.7,
      desktop: 800,
      default: responsive.screenHeight * 0.85,
    }),
  },
  
  /**
   * Grid Thumbnail
   */
  thumbnail: {
    width: responsive.responsive({
      phone: (responsive.screenWidth - 48) / 3,
      tablet: (responsive.screenWidth - 64) / 4,
      laptop: 250,
      desktop: 300,
      default: (responsive.screenWidth - 48) / 3,
    }),
    aspectRatio: 9 / 16,
  },
};

// ============================
// TOUCH TARGET SIZES (Accessibility)
// ============================

export const TouchTargets = {
  // Minimum Touch Target: 44x44 (Apple HIG) / 48x48 (Material Design)
  minimum: Platform.select({
    ios: 44,
    android: 48,
    default: 48,
  }),
  
  // Empfohlen für wichtige Buttons
  recommended: 48,
  
  // Komfortabel für große Screens
  comfortable: responsive.responsive({
    phone: 48,
    tablet: 52,
    desktop: 56,
    default: 48,
  }),
};

// ============================
// EXPORT DEFAULT
// ============================

export default {
  responsive,
  Breakpoints,
  DeviceType,
  ResponsiveSpacing,
  ResponsiveTypography,
  VideoSizes,
  TouchTargets,
  createResponsiveStyles,
};
