/**
 * 🔒 AUTH GUARD - Protected Route Component
 * 
 * Schützt Routen vor unautorisierten Zugriffen
 * Leitet automatisch zum Login weiter
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router, usePathname } from 'expo-router';
import { Colors } from '@/constants/Theme';

interface AuthGuardProps {
  children: React.ReactNode;
  requireVerified?: boolean;
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, requireVerified = false, fallback }: AuthGuardProps) {
  const { state } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!state.loading) {
      if (!state.isAuthenticated) {
        // Speichere die aktuelle URL für Redirect nach Login
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        
        // Redirect zu Login
        router.replace('/(tabs)');
      } else if (requireVerified && !state.user?.emailVerified) {
        // Redirect zu Verifizierungs-Info
        router.replace('/(tabs)');
      }
    }
  }, [state.loading, state.isAuthenticated, state.user, pathname, requireVerified]);

  // Loading State
  if (state.loading) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not Authenticated
  if (!state.isAuthenticated) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Needs Verification
  if (requireVerified && !state.user?.emailVerified) {
    return fallback || (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

/**
 * HOC für Auth-Protected Screens
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireVerified?: boolean }
) {
  return function AuthProtectedComponent(props: P) {
    return (
      <AuthGuard requireVerified={options?.requireVerified}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Hook für Auth-Checks in Komponenten
 */
export function useRequireAuth(requireVerified = false) {
  const { state } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    if (!state.loading) {
      if (!state.isAuthenticated) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('redirectAfterLogin', pathname);
        }
        router.replace('/(tabs)');
      } else if (requireVerified && !state.user?.emailVerified) {
        router.replace('/(tabs)');
      }
    }
  }, [state.loading, state.isAuthenticated, state.user, pathname, requireVerified]);

  return {
    isAuthenticated: state.isAuthenticated,
    isVerified: state.user?.emailVerified || false,
    user: state.user,
    loading: state.loading,
  };
}
