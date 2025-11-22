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

interface LoginScreenProps {
  /** Embedded mode für Modal-Ansicht */
  embedded?: boolean;
  /** Callback zum Wechsel zu Register */
  onSwitchToRegister?: () => void;
}

export function LoginScreen({ embedded, onSwitchToRegister }: LoginScreenProps) {
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
          placeholderTextColor="#999"
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
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
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
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
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
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    fontSize: 14,
    color: '#999',
  },
  socialContainer: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#fff',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
