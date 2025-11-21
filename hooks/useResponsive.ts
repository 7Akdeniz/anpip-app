/**
 * ANPIP.COM - HOOK FÜR RESPONSIVE DESIGN
 * React Hook für Device Detection & Responsive Values
 */

import { useState, useEffect } from 'react';
import { Dimensions, Platform, ScaledSize } from 'react-native';
import { responsive, DeviceType, DeviceTypeValue } from '@/constants/Responsive';

interface ResponsiveHookReturn {
  // Device Info
  deviceType: DeviceTypeValue;
  isPhone: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltrawide: boolean;
  
  // Screen Dimensions
  screenWidth: number;
  screenHeight: number;
  
  // Orientation
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Safe Area
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // Scaling Functions
  scale: (size: number) => number;
  scaleVertical: (size: number) => number;
  scaleFont: (size: number) => number;
  
  // Responsive Value Helper
  responsive: <T>(values: {
    phone?: T;
    tablet?: T;
    laptop?: T;
    desktop?: T;
    ultrawide?: T;
    default: T;
  }) => T;
}

/**
 * React Hook für Responsive Design
 * 
 * Beispiel:
 * const { isPhone, scale, responsive } = useResponsive();
 * 
 * const padding = responsive({
 *   phone: 16,
 *   tablet: 24,
 *   desktop: 32,
 *   default: 16
 * });
 */
export function useResponsive(): ResponsiveHookReturn {
  const [dimensions, setDimensions] = useState<ScaledSize>(
    Dimensions.get('window')
  );
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  const deviceType = responsive.getDeviceType();
  
  return {
    // Device Type
    deviceType,
    isPhone: responsive.isPhone(),
    isTablet: responsive.isTablet(),
    isDesktop: responsive.isDesktop(),
    isLargeDesktop: responsive.isLargeDesktop(),
    isUltrawide: responsive.isUltrawide(),
    
    // Screen Dimensions
    screenWidth: dimensions.width,
    screenHeight: dimensions.height,
    
    // Orientation
    isPortrait: responsive.isPortrait(),
    isLandscape: responsive.isLandscape(),
    
    // Safe Area
    safeAreaInsets: responsive.getSafeAreaInsets(),
    
    // Scaling
    scale: responsive.scale.bind(responsive),
    scaleVertical: responsive.scaleVertical.bind(responsive),
    scaleFont: responsive.scaleFont.bind(responsive),
    
    // Responsive Helper
    responsive: responsive.responsive.bind(responsive),
  };
}

/**
 * Hook für Breakpoint Detection
 */
export function useBreakpoint() {
  const { screenWidth } = useResponsive();
  
  return {
    xs: screenWidth >= 0,
    sm: screenWidth >= 375,
    md: screenWidth >= 768,
    lg: screenWidth >= 1024,
    xl: screenWidth >= 1440,
    xxl: screenWidth >= 1920,
    ultrawide: screenWidth >= 2560,
  };
}

/**
 * Hook für Platform Detection
 */
export function usePlatform() {
  return {
    isIOS: Platform.OS === 'ios',
    isAndroid: Platform.OS === 'android',
    isWeb: Platform.OS === 'web',
    isMobile: Platform.OS === 'ios' || Platform.OS === 'android',
    platform: Platform.OS,
    version: Platform.Version,
  };
}

/**
 * Hook für Dark Mode Detection
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setIsDark(mediaQuery.matches);
      
      const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
      mediaQuery.addEventListener('change', listener);
      
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, []);
  
  return isDark;
}
