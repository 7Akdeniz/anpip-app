/**
 * Login Screen für Anpip.com
 * 
 * Features:
 * - Email/Password Login
 * - Social Logins (Google, Apple, Facebook, Microsoft, LinkedIn)
 * - Embedded Mode für AuthModal
 * - Standalone Mode für Full-Screen
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

interface LoginScreenProps {
  /** Embedded mode für Modal-Ansicht */
  embedded?: boolean;
  /** Callback zum Wechsel zu Register */
  onSwitchToRegister?: () => void;
  /** Callback für Passwort vergessen */
  onForgotPassword?: () => void;
}

export function LoginScreen({ embedded, onSwitchToRegister, onForgotPassword }: LoginScreenProps) {
  const { signIn, signInWithProvider } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte Email und Passwort eingeben');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn({ email, password });
      if (!result.success) {
        Alert.alert('Anmeldung fehlgeschlagen', result.error?.message || 'Unbekannter Fehler');
      }
      // Auth Context wird automatisch aktualisiert
    } catch (error: any) {
      Alert.alert('Anmeldung fehlgeschlagen', error.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    // Warnung: OAuth funktioniert nur im Web-Browser
    if (Platform.OS !== 'web') {
      Alert.alert(
        'Nicht verfügbar in Expo Go',
        `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login ist nur im Web-Browser verfügbar.\n\nBitte öffne die App im Browser (drücke 'w' im Terminal) oder nutze E-Mail/Passwort Login.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithProvider({ provider });
      if (!result.success) {
        Alert.alert('Anmeldung fehlgeschlagen', result.error?.message || 'Unbekannter Fehler');
      }
    } catch (error: any) {
      Alert.alert('Anmeldung fehlgeschlagen', error.message || 'Unbekannter Fehler');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="deine@email.com"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          editable={!loading}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Passwort</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
        {/* Passwort vergessen Link */}
        <TouchableOpacity 
          onPress={() => {
            if (onForgotPassword) {
              onForgotPassword();
            } else {
              router.push('/auth/forgot-password' as any);
            }
          }}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Passwort vergessen?</Text>
        </TouchableOpacity>
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={[styles.loginButton, loading && styles.loginButtonDisabled]}
        onPress={handleEmailLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Anmelden</Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>oder</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
      <View style={styles.socialContainer}>
        {/* Google */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('google')}
          disabled={loading}
        >
          <Ionicons name="logo-google" size={24} color="#EA4335" />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>

        {/* Apple - nur auf iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => handleSocialLogin('apple')}
            disabled={loading}
          >
            <Ionicons name="logo-apple" size={24} color="#000" />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        )}

        {/* Facebook */}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={() => handleSocialLogin('facebook')}
          disabled={loading}
        >
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
          <Text style={styles.socialButtonText}>Facebook</Text>
        </TouchableOpacity>
      </View>

      {/* Switch to Register */}
      {onSwitchToRegister && (
        <View style={styles.switchContainer}>
          <Text style={styles.switchText}>Noch kein Konto? </Text>
          <TouchableOpacity onPress={onSwitchToRegister} disabled={loading}>
            <Text style={styles.switchLink}>Registrieren</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  input: {
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#ffffff',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  loginButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.4)',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  switchLink: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'right',
    marginTop: 4,
  },
});
