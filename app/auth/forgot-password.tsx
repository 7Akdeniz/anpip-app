/**
 * 🔄 PASSWORD RESET REQUEST SCREEN
 * 
 * Fordere eine Passwort-Zurücksetzung an
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { router } from 'expo-router';

interface ForgotPasswordScreenProps {
  embedded?: boolean;
  onBack?: () => void;
}

export default function ForgotPasswordScreen({ embedded, onBack }: ForgotPasswordScreenProps = {}) {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein');
      return;
    }

    if (!email.includes('@')) {
      setError('Bitte gib eine gültige E-Mail-Adresse ein');
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await requestPasswordReset({ email: email.trim().toLowerCase() });

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error?.message || 'Fehler beim Senden der E-Mail');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
          </View>
          <Text style={styles.successTitle}>E-Mail gesendet!</Text>
          <Text style={styles.successText}>
            Wir haben dir eine E-Mail mit einem Link zum Zurücksetzen deines Passworts geschickt.
          </Text>
          <Text style={styles.successHint}>
            Bitte überprüfe auch deinen Spam-Ordner.
          </Text>
          <TouchableOpacity
            style={styles.backToLoginButton}
            onPress={() => {
              if (onBack) {
                onBack();
              } else {
                router.back();
              }
            }}
          >
            <Text style={styles.backToLoginText}>Zurück zum Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Passwort vergessen?</Text>
          <Text style={styles.subtitle}>
            Kein Problem! Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zurücksetzen.
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
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
                autoFocus
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Link senden</Text>
            )}
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
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
  form: {
    gap: Spacing.lg,
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
  submitButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: 22,
  },
  successHint: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: Spacing.xl,
  },
  backToLoginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  backToLoginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
