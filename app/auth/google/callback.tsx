/**
 * 🔐 GOOGLE OAUTH CALLBACK PAGE
 * 
 * Empfängt User nach erfolgreichem Google-Login
 * Verarbeitet den Authorization Code oder ID Token
 */

import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, Typography } from '@/constants/Theme';

export default function GoogleCallbackScreen() {
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    handleGoogleCallback();
  }, [params]);

  const handleGoogleCallback = async () => {
    try {
      // Google kann verschiedene Parameter zurückgeben:
      // 1. code (Authorization Code Flow)
      // 2. id_token (Implicit Flow)
      // 3. error (bei Fehlern)

      const { code, error, error_description, state } = params;

      // =====================================================
      // FEHLERBEHANDLUNG
      // =====================================================

      if (error) {
        let userMessage = 'Login fehlgeschlagen';

        switch (error) {
          case 'access_denied':
            userMessage = 'Du hast den Login abgebrochen';
            break;
          case 'invalid_request':
            userMessage = 'Ungültige Anfrage. Bitte versuche es erneut.';
            break;
          case 'unauthorized_client':
            userMessage = 'App ist nicht autorisiert';
            break;
          case 'unsupported_response_type':
            userMessage = 'Nicht unterstützter Response-Typ';
            break;
          default:
            userMessage = error_description as string || 'Unbekannter Fehler';
        }

        console.error('❌ Google OAuth Error:', {
          error,
          error_description,
        });

        setStatus('error');
        setErrorMessage(userMessage);

        // Nach 3 Sekunden zurück zum Login
        setTimeout(() => {
          router.replace('/auth/login' as any);
        }, 3000);

        return;
      }

      // =====================================================
      // KEIN CODE ERHALTEN
      // =====================================================

      if (!code) {
        setStatus('error');
        setErrorMessage('Kein Authorization Code erhalten');

        setTimeout(() => {
          router.replace('/auth/login' as any);
        }, 3000);

        return;
      }

      // =====================================================
      // CODE AN BACKEND SENDEN
      // =====================================================

      const response = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Backend-Authentifizierung fehlgeschlagen');
      }

      // =====================================================
      // ERFOLG!
      // =====================================================

      console.log('✅ Google Login erfolgreich:', data.user);
      setStatus('success');

      // Weiterleitung zur ursprünglichen Seite oder Home
      const returnUrl = (state as string) || '/(tabs)';
      
      setTimeout(() => {
        router.replace(returnUrl as any);
      }, 1000);

    } catch (error) {
      console.error('❌ Callback Error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unbekannter Fehler');

      setTimeout(() => {
        router.replace('/auth/login' as any);
      }, 3000);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <View style={styles.container}>
      {status === 'loading' && (
        <>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.text}>Google-Login wird verarbeitet...</Text>
        </>
      )}

      {status === 'success' && (
        <>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.text}>Erfolgreich angemeldet!</Text>
          <Text style={styles.subtext}>Du wirst weitergeleitet...</Text>
        </>
      )}

      {status === 'error' && (
        <>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorText}>Fehler beim Login</Text>
          <Text style={styles.errorDetail}>{errorMessage}</Text>
          <Text style={styles.subtext}>Du wirst zum Login zurückgeleitet...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  text: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.lg,
    color: Colors.text,
    textAlign: 'center',
  },
  subtext: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  successIcon: {
    fontSize: 64,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorText: {
    marginTop: Spacing.lg,
    fontSize: Typography.fontSize.lg,
    color: Colors.error,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDetail: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.error,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
