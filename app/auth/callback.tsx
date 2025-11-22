/**
 * 🔄 OAuth Callback Handler
 * 
 * Handled OAuth redirects from social login providers
 */

import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Colors, Spacing } from '@/constants/Theme';

export default function AuthCallbackScreen() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Anmeldung wird verarbeitet...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Check if we have a session after OAuth redirect
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('[Auth Callback] Error:', error);
        setStatus('error');
        setMessage('Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 3000);
        return;
      }

      if (session) {
        console.log('[Auth Callback] Success! User:', session.user.email);
        setStatus('success');
        setMessage('Anmeldung erfolgreich! Du wirst weitergeleitet...');

        // Check if there's a redirect path stored
        const redirectPath = typeof window !== 'undefined' 
          ? sessionStorage.getItem('redirectAfterLogin')
          : null;

        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          router.replace(redirectPath as any);
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setStatus('error');
        setMessage('Keine Sitzung gefunden. Bitte melde dich erneut an.');
        
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 3000);
      }
    } catch (error) {
      console.error('[Auth Callback] Unexpected error:', error);
      setStatus('error');
      setMessage('Ein unerwarteter Fehler ist aufgetreten.');
      
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === 'success' && (
          <>
            <View style={styles.successIcon}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
          </>
        )}

        {status === 'error' && (
          <>
            <View style={styles.errorIcon}>
              <Text style={styles.cross}>✕</Text>
            </View>
            <Text style={[styles.message, styles.errorMessage]}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  message: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    maxWidth: 300,
  },
  errorMessage: {
    color: Colors.error,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 48,
    color: Colors.success,
    fontWeight: 'bold',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.error + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cross: {
    fontSize: 48,
    color: Colors.error,
    fontWeight: 'bold',
  },
});
