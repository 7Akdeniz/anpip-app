/**
 * 🔐 LOGIN SCREEN
 * 
 * Moderne, sichere Login-Seite mit Social-Login-Support
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

    const result = await signIn({
      email: email.trim(),
      password,
      rememberMe,
    });

    setIsLoading(false);

    if (result.success) {
      // Navigation wird automatisch vom AuthContext gehandhabt
      router.replace('/(tabs)');
    } else {
      setError(result.error?.message || 'Anmeldung fehlgeschlagen');
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
    <KeyboardAvoidingView
      style={styles.container}
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
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@beispiel.de"
                placeholderTextColor={Colors.textSecondary}
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
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Dein Passwort"
                placeholderTextColor={Colors.textSecondary}
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
                  color={Colors.textSecondary}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing.xxl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error + '20',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
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
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  microsoftButton: {
    backgroundColor: '#00A4EF',
  },
  linkedinButton: {
    backgroundColor: '#0A66C2',
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
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textSecondary,
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
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
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
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: Colors.text,
  },
  forgotPassword: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
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
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
