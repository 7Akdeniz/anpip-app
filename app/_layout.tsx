import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo } from 'react';
import { Platform } from 'react-native';

import { I18nProvider } from '@/i18n/I18nContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { LocationDetector } from '@/components/LocationDetector';
import { AuthProvider } from '@/contexts/AuthContext';
import { AuthModalProvider } from '@/contexts/AuthModalContext';
import { AuthModal } from '@/components/modals/AuthModal';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';

// Performance & Analytics - nur bei Bedarf laden
const initPerformance = async () => {
  if (Platform.OS !== 'web') return;
  
  const { initWebVitals } = await import('@/lib/webVitals');
  const { setupLazyLoading, setupPrefetching, addResourceHints } = await import('@/lib/performance');
  const { setupKeyboardNavigation, setupAriaLiveRegion, setupSkipLinks } = await import('@/lib/accessibility');
  
  return { initWebVitals, setupLazyLoading, setupPrefetching, addResourceHints, setupKeyboardNavigation, setupAriaLiveRegion, setupSkipLinks };
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize Performance Monitoring & Optimizations (lazy)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cancelled = false;

    initPerformance().then((perfTools) => {
      if (cancelled || !perfTools) return;

      // Web Vitals Tracking
      perfTools.initWebVitals((metrics: any) => {
        console.log('📊 Web Vitals:', {
          LCP: metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A',
          FID: metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A',
          CLS: metrics.cls ? metrics.cls.toFixed(3) : 'N/A',
          INP: metrics.inp ? `${Math.round(metrics.inp)}ms` : 'N/A',
        });

        // Send to analytics endpoint
        fetch('/api/analytics/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        }).catch(console.error);
      });

      // Performance Optimizations
      perfTools.setupLazyLoading();
      perfTools.setupPrefetching();

      // DNS Prefetch & Preconnect
      perfTools.addResourceHints([
        { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
        { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
        { rel: 'preconnect', href: 'https://fkmhucsjybyhjrgodwcx.supabase.co', crossOrigin: true },
      ]);

      // Accessibility
      perfTools.setupKeyboardNavigation();
      perfTools.setupAriaLiveRegion();
      perfTools.setupSkipLinks();

      console.log('✅ Performance & Accessibility initialized');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  // 🔥 NEU: Setup Push Notifications
  useNotificationSetup();

  // FORCE DarkTheme for consistent video app experience (like TikTok, Instagram Reels)
  return (
    <AuthProvider>
      <AuthModalProvider>
        <I18nProvider>
          <LocationProvider>
            <ThemeProvider value={DarkTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
              </Stack>
              <LocationDetector />
              <AuthModal />
            </ThemeProvider>
          </LocationProvider>
        </I18nProvider>
      </AuthModalProvider>
    </AuthProvider>
  );
}
