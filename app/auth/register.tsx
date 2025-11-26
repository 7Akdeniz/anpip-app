/**
 * 📝 REGISTRATION SCREEN
 * 
 * Moderne, sichere Registrierungsseite mit DSGVO-Compliance
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
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { router } from 'expo-router';
import { useI18n } from '@/i18n/I18nContext';
import { Video } from 'expo-av';

// Country & Language Options
const COUNTRIES = [
  { code: 'DE', name: 'Deutschland' },
  { code: 'AT', name: 'Österreich' },
  { code: 'CH', name: 'Schweiz' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  // Add more...
];

const LANGUAGES = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
  // Add more...
];

export default function RegisterScreen() {
  const { signUp, signInWithProvider } = useAuth();
  const { t } = useI18n();

  const [step, setStep] = useState<1 | 2>(1); // Multi-step form
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('DE');
  const [language, setLanguage] = useState('de');
  const [companyName, setCompanyName] = useState('');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Consent
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDataProcessing, setAcceptDataProcessing] = useState(false);

  // ===========================
  // VALIDATION
  // ===========================

  const validateStep1 = (): boolean => {
    if (!firstName.trim() || firstName.trim().length < 2) {
      setError('Vorname muss mindestens 2 Zeichen lang sein');
      return false;
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      setError('Nachname muss mindestens 2 Zeichen lang sein');
      return false;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein');
      return false;
    }

    if (password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen lang sein');
      return false;
    }

    if (!/[a-z]/.test(password)) {
      setError('Passwort muss mindestens einen Kleinbuchstaben enthalten');
      return false;
    }

    if (!/[A-Z]/.test(password)) {
      setError('Passwort muss mindestens einen Großbuchstaben enthalten');
      return false;
    }

    if (!/[0-9]/.test(password)) {
      setError('Passwort muss mindestens eine Zahl enthalten');
      return false;
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setError('Passwort muss mindestens ein Sonderzeichen enthalten');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    if (!acceptTerms || !acceptPrivacy) {
      setError('Bitte akzeptiere die AGB und Datenschutzerklärung');
      return false;
    }

    return true;
  };

  // ===========================
  // NAVIGATION
  // ===========================

  const handleNext = () => {
    setError(null);
    
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError(null);
  };

  // ===========================
  // REGISTRATION
  // ===========================

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);

    console.log('📝 Starte Registrierung...');

    try {
      const result = await signUp({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        country,
        preferredLanguage: language,
        companyName: companyName.trim() || undefined,
        acceptTerms,
        acceptPrivacy,
        acceptDataProcessing,
      });

      setIsLoading(false);

      if (result.success) {
        console.log('✅ Registrierung erfolgreich');
        if (result.data?.requiresVerification) {
          Alert.alert(
            'Registrierung erfolgreich! ✅',
            'Bitte überprüfe deine E-Mails und bestätige deine E-Mail-Adresse.',
            [{ text: 'OK', onPress: () => router.replace('/(tabs)' as any) }]
          );
        } else {
          Alert.alert(
            'Willkommen! 🎉',
            'Dein Account wurde erfolgreich erstellt.',
            [{ text: 'Los geht\'s', onPress: () => router.replace('/(tabs)' as any) }]
          );
        }
      } else {
        console.error('❌ Registrierung fehlgeschlagen:', result.error);
        const errorMessage = result.error?.message || 'Registrierung fehlgeschlagen';
        setError(errorMessage);
        Alert.alert('Registrierung fehlgeschlagen', errorMessage);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('❌ Registrierung Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ein unbekannter Fehler ist aufgetreten';
      setError(errorMessage);
      Alert.alert('Fehler', errorMessage);
    }
  };

  // ===========================
  // SOCIAL REGISTRATION
  // ===========================

  const handleSocialRegister = async (provider: 'google' | 'apple' | 'facebook' | 'microsoft' | 'linkedin') => {
    // Nur Google wird unterstützt
    if (provider !== 'google') {
      setError(`${provider} Login kommt bald`);
      return;
    }

    // Nur auf Web verfügbar
    if (Platform.OS !== 'web') {
      setError('Google Login nur auf Web verfügbar');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔐 Google Registrierung gestartet...');

      // DIREKT-REDIRECT ZU GOOGLE (garantiert funktionierend)
      const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
      const authUri = 'https://accounts.google.com/o/oauth2/auth';
      const redirectUri = typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/google/callback`
        : 'http://localhost:8081/auth/google/callback';

      if (!clientId) {
        throw new Error('EXPO_PUBLIC_GOOGLE_CLIENT_ID nicht konfiguriert');
      }

      // State für Rückleitung speichern (nach Registrierung zur Profilseite)
      const state = encodeURIComponent('/(tabs)/profile');

      // Google OAuth URL zusammenbauen
      const googleAuthUrl = `${authUri}?` + [
        `client_id=${encodeURIComponent(clientId)}`,
        `redirect_uri=${encodeURIComponent(redirectUri)}`,
        `response_type=code`,
        `scope=${encodeURIComponent('email profile')}`,
        `access_type=online`,
        `state=${state}`,
        `include_granted_scopes=true`,
        `prompt=select_account`, // Zeigt immer Account-Auswahl
      ].join('&');

      console.log('🔗 Redirect zu Google:', googleAuthUrl);

      // DIREKT-WEITERLEITUNG ZU GOOGLE
      if (typeof window !== 'undefined') {
        window.location.href = googleAuthUrl;
      }

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      console.error('❌ Google Registrierung Error:', error);
      setError(errorMessage);
    }
  };

  // ===========================
  // RENDER
  // ===========================

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

      {/* Register Overlay Content */}
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
          <Text style={styles.title}>Konto erstellen</Text>
          <Text style={styles.subtitle}>
            Schritt {step} von 2
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <>
            {/* Social Registration */}
            <View style={styles.socialContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialRegister('google')}
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={20} color="#fff" />
                <Text style={styles.socialButtonText}>Mit Google registrieren</Text>
              </TouchableOpacity>

              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialRegister('apple')}
                  disabled={isLoading}
                >
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={styles.socialButtonText}>Mit Apple registrieren</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>oder mit E-Mail</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Vorname */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Vorname *</Text>
                <TextInput
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Max"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Nachname */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nachname *</Text>
                <TextInput
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Mustermann"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>E-Mail *</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="max@beispiel.de"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Passwort *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 Zeichen, Groß-, Kleinbuchstaben, Zahl, Sonderzeichen"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
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
                <Text style={styles.hint}>
                  Mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl & Sonderzeichen
                </Text>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Passwort bestätigen *</Text>
                <View style={styles.passwordWrapper}>
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Passwort wiederholen"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                  <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Next Button */}
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                disabled={isLoading}
              >
                <Text style={styles.nextButtonText}>Weiter</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* STEP 2: Additional Info & Consent */}
        {step === 2 && (
          <View style={styles.form}>
            {/* Country */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Land *</Text>
              <View style={styles.pickerWrapper}>
                <Ionicons name="globe-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.pickerText}>{COUNTRIES.find(c => c.code === country)?.name}</Text>
                {/* TODO: Implement proper country picker */}
              </View>
            </View>

            {/* Language */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bevorzugte Sprache *</Text>
              <View style={styles.pickerWrapper}>
                <Ionicons name="language-outline" size={20} color="rgba(255, 255, 255, 0.6)" />
                <Text style={styles.pickerText}>{LANGUAGES.find(l => l.code === language)?.name}</Text>
                {/* TODO: Implement proper language picker */}
              </View>
            </View>

            {/* Company Name (Optional) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Firmenname (optional)</Text>
              <TextInput
                style={styles.input}
                value={companyName}
                onChangeText={setCompanyName}
                placeholder="Für Business-Accounts"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                editable={!isLoading}
              />
            </View>

            {/* Consent Checkboxes */}
            <View style={styles.consentContainer}>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>
                  Ich akzeptiere die{' '}
                  <Text style={styles.link}>AGB</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptPrivacy(!acceptPrivacy)}
              >
                <View style={[styles.checkbox, acceptPrivacy && styles.checkboxChecked]}>
                  {acceptPrivacy && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>
                  Ich habe die{' '}
                  <Text style={styles.link}>Datenschutzerklärung</Text> gelesen
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setAcceptDataProcessing(!acceptDataProcessing)}
              >
                <View style={[styles.checkbox, acceptDataProcessing && styles.checkboxChecked]}>
                  {acceptDataProcessing && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.checkboxText}>
                  Ich stimme der Verarbeitung meiner Daten zu (DSGVO)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                disabled={isLoading}
              >
                <Ionicons name="arrow-back" size={20} color="#ffffff" />
                <Text style={styles.backButtonText}>Zurück</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.registerButtonText}>Registrieren</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Bereits ein Konto?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Jetzt anmelden</Text>
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
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: Spacing.md,
    fontSize: 16,
    color: '#ffffff',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  eyeIcon: {
    padding: Spacing.md,
  },
  hint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    padding: Spacing.md,
  },
  pickerText: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  consentContainer: {
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: 'rgba(156, 39, 176, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 20,
  },
  link: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  backButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  registerButton: {
    flex: 2,
    backgroundColor: 'rgba(156, 39, 176, 0.4)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: 'rgba(156, 39, 176, 0.4)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: 48,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nextButtonText: {
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
  loginLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: 'bold',
  },
});
