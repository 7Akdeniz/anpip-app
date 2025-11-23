/**
 * 🔐 GOOGLE LOGIN BUTTON COMPONENT
 * 
 * Wiederverwendbarer Google-Login-Button für Web & Mobile
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { googleLoginService } from '@/lib/google-login';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Theme';
import { router } from 'expo-router';

interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  returnUrl?: string;
  text?: string;
  style?: any;
  // Nur Web: Rendert Google's eigenen Button
  useNativeButton?: boolean;
}

export function GoogleLoginButton({
  onSuccess,
  onError,
  returnUrl = '/(tabs)',
  text = 'Mit Google anmelden',
  style,
  useNativeButton = false,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Nur für Web + Native Button
    if (Platform.OS === 'web' && useNativeButton) {
      initializeNativeButton();
    }
  }, [useNativeButton]);

  /**
   * Initialisiere Google's nativen Button (nur Web)
   */
  const initializeNativeButton = async () => {
    try {
      await googleLoginService.initialize();
      
      if (buttonRef.current) {
        await googleLoginService.renderButton(
          'google-native-button',
          handleGoogleCredential,
          (error) => {
            console.error('Google Button Error:', error);
            onError?.(error);
          }
        );
      }
    } catch (error) {
      console.error('Failed to initialize Google button:', error);
    }
  };

  /**
   * Handle Google Login (Custom Button)
   * Verwendet Redirect-Flow (garantiert funktionierend)
   */
  const handleGoogleLogin = async () => {
    if (Platform.OS !== 'web') {
      const errorMsg = 'Google Login ist nur im Browser verfügbar';
      console.warn('⚠️', errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔐 Google Login wird gestartet...');

      // DIREKT-REDIRECT ZU GOOGLE (garantiert funktionierende Methode)
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        throw new Error('Google Client ID nicht konfiguriert. Bitte .env Datei prüfen.');
      }

      const authUri = 'https://accounts.google.com/o/oauth2/auth';
      const redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/google/callback`
        : 'http://localhost:8081/auth/google/callback';

      // State für Rückleitung speichern
      const state = encodeURIComponent(returnUrl);

      // Google OAuth URL zusammenbauen
      const googleAuthUrl = `${authUri}?` + [
        `client_id=${encodeURIComponent(clientId)}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        `response_type=code`,
        `scope=${encodeURIComponent('email profile')}`,
        `access_type=online`,
        `state=${state}`,
        `include_granted_scopes=true`,
        `prompt=select_account`, // Zeige Account-Auswahl
      ].join('&');

      console.log('🔗 Weiterleitung zu Google OAuth...');
      console.log('   Redirect URI:', redirectUri);
      console.log('   Return URL:', returnUrl);

      // DIREKT-WEITERLEITUNG ZU GOOGLE
      if (typeof window !== 'undefined') {
        window.location.href = googleAuthUrl;
      }

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('❌ Google Login Error:', error);
      onError?.(errorMessage);
    }
  };

  /**
   * ALTERNATIVE: Popup-basierter Login (komplexer, aber ohne Redirect)
   */
  const handleGoogleLoginPopup = async () => {
    if (Platform.OS !== 'web') {
      if (onError) {
        onError('Google Login nur auf Web verfügbar');
      }
      return;
    }

    setIsLoading(true);

    try {
      // 1. Initialisiere Google Login Service
      await googleLoginService.initialize();

      // 2. Öffne Google Login Popup
      const loginResult = await googleLoginService.loginWithPopup();

      if (!loginResult.success || !loginResult.credential) {
        setIsLoading(false);
        if (onError) {
          onError(loginResult.error || 'Login fehlgeschlagen');
        }
        return;
      }

      // 3. Sende Token an Backend
      await handleGoogleCredential(loginResult.credential);

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('Google Login Error:', error);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  /**
   * Handle Google Credential (von Popup oder Native Button)
   */
  const handleGoogleCredential = async (credential: string) => {
    setIsLoading(true);

    try {
      // Sende Token an unser Backend
      const result = await googleLoginService.authenticateWithBackend(
        credential,
        returnUrl
      );

      setIsLoading(false);

      if (result.success && result.user) {
        console.log('✅ Google Login erfolgreich:', result.user);
        
        // Callback aufrufen
        if (onSuccess) {
          onSuccess(result.user);
        }

        // Navigation
        router.replace(returnUrl as any);
      } else {
        console.error('❌ Backend-Authentifizierung fehlgeschlagen:', result.error);
        if (onError) {
          onError(result.error || 'Authentifizierung fehlgeschlagen');
        }
      }
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('❌ Google Auth Error:', error);
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  // ===================================================
  // NATIVE BUTTON (nur Web)
  // ===================================================

  if (Platform.OS === 'web' && useNativeButton) {
    return (
      <View style={[styles.nativeButtonContainer, style]}>
        <div id="google-native-button" ref={buttonRef as any}></div>
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </View>
    );
  }

  // ===================================================
  // CUSTOM BUTTON (Web & Mobile)
  // ===================================================

  return (
    <TouchableOpacity
      style={[styles.button, style, isLoading && styles.buttonDisabled]}
      onPress={handleGoogleLogin}
      disabled={isLoading || Platform.OS !== 'web'}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <>
          <Ionicons name="logo-google" size={20} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>{text}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4285F4', // Google Blue
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontWeight: '600',
  },
  nativeButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
  },
});
