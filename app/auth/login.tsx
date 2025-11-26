/**
 * 🔐 LOGIN SCREEN
 * 
 * Moderne, sichere Login-Seite mit Social-Login-Support
 * Video im Hintergrund mit transparentem Overlay
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants/Theme';
import { router } from 'expo-router';
import { useI18n } from '@/i18n/I18nContext';
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton';
import { Video } from 'expo-av';

export default function LoginScreen() {
  const { signIn, signInWithProvider, state } = useAuth();
  const { t } = useI18n();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ===========================
  // EMAIL/PASSWORD LOGIN
  // ===========================

  const handleEmailLogin = async () => {
    if (!email || !password) {
      setError('Bitte fülle alle Felder aus');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('🔐 Starte Login...');

    try {
      const result = await signIn({
        email: email.trim(),
        password,
        rememberMe,
      });

      setIsLoading(false);

      if (result.success) {
        console.log('✅ Login erfolgreich');
        // Navigation wird automatisch vom AuthContext gehandhabt
        router.replace('/(tabs)');
      } else {
        console.error('❌ Login fehlgeschlagen:', result.error);
        const errorMessage = result.error?.message || 'Anmeldung fehlgeschlagen';
        setError(errorMessage);
        Alert.alert('Anmeldung fehlgeschlagen', errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Login Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      Alert.alert('Fehler', errorMessage);
    }
  };

  // ===========================
  // SOCIAL LOGIN
  // ===========================

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook' | 'microsoft' | 'linkedin') => {
    setIsLoading(true);
    setError(null);

    const result = await signInWithProvider({ provider });

    setIsLoading(false);

    if (result.success && result.data?.url) {
      // Redirect to OAuth URL
      if (Platform.OS === 'web') {
        window.location.href = result.data.url;
      } else {
        // TODO: Use Linking API for mobile
        Alert.alert('Social Login', 'Wird geöffnet...');
      }
    } else {
      setError(result.error?.message || 'Social Login fehlgeschlagen');
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Background - Fullscreen */}
      {Platform.OS === 'web' ? (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        >
          <source src="https://cdn.pixabay.com/video/2024/05/20/212491_large.mp4" type="video/mp4" />
        </video>
      ) : (
        <Video
          source={{ uri: 'https://cdn.pixabay.com/video/2024/05/20/212491_large.mp4' }}
          style={StyleSheet.absoluteFillObject}
          shouldPlay
          isLooping
          isMuted
          resizeMode="cover"
        />
      )}

      {/* Schatten Overlay */}
      <View style={styles.shadowOverlay} />

      {/* Login Overlay Content */}
      <KeyboardAvoidingView
        style={styles.overlayContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>Anpip</Text>
            <Text style={styles.title}>Willkommen zurück</Text>
            <Text style={styles.subtitle}>Melde dich an, um fortzufahren</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Social Login Buttons */}
        <View style={styles.socialContainer}>
          {/* Google Login mit dedizierter Komponente */}
          <GoogleLoginButton
            onSuccess={(user) => {
              console.log('✅ Google Login erfolgreich:', user);
              // Navigation wird automatisch vom GoogleLoginButton gehandhabt
            }}
            onError={(error) => {
              setError(error);
            }}
            returnUrl="/(tabs)"
            text="Mit Google anmelden"
          />

          {Platform.OS === 'ios' && (
            <TouchableOpacity
              style={[styles.socialButton, styles.appleButton]}
              onPress={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <Ionicons name="logo-apple" size={20} color="#fff" />
              <Text style={styles.socialButtonText}>Mit Apple anmelden</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.socialButton, styles.facebookButton]}
            onPress={() => handleSocialLogin('facebook')}
            disabled={isLoading}
          >
            <Ionicons name="logo-facebook" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Mit Facebook anmelden</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.microsoftButton]}
            onPress={() => handleSocialLogin('microsoft')}
            disabled={isLoading}
          >
            <Ionicons name="logo-windows" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Mit Microsoft anmelden</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.socialButton, styles.linkedinButton]}
            onPress={() => handleSocialLogin('linkedin')}
            disabled={isLoading}
          >
            <Ionicons name="logo-linkedin" size={20} color="#fff" />
            <Text style={styles.socialButtonText}>Mit LinkedIn anmelden</Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>oder mit E-Mail</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email/Password Form */}
        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-Mail</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@beispiel.de"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Passwort</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Dein Passwort"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                editable={!isLoading}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Remember Me & Forgot Password */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
              </View>
              <Text style={styles.rememberMeText}>Angemeldet bleiben</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/auth/forgot-password' as any)}>
              <Text style={styles.forgotPassword}>Passwort vergessen?</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleEmailLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Anmelden</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Noch kein Konto?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register' as any)}>
            <Text style={styles.signUpLink}>Jetzt registrieren</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  shadowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
  overlayContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 14,
  },
  socialContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(156, 39, 176, 0.3)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appleButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  facebookButton: {
    backgroundColor: 'rgba(24, 119, 242, 0.3)',
  },
  microsoftButton: {
    backgroundColor: 'rgba(0, 164, 239, 0.3)',
  },
  linkedinButton: {
    backgroundColor: 'rgba(10, 102, 194, 0.3)',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
  form: {
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: 16,
    color: '#ffffff',
  },
  eyeIcon: {
    padding: Spacing.md,
  },
  optionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: 'rgba(156, 39, 176, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#ffffff',
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: 'rgba(156, 39, 176, 0.4)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
