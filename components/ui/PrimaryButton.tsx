/**
 * PRIMARY BUTTON - Dein Haupt-Button im Google-Style
 * 
 * Verwendung:
 * <PrimaryButton title="Veröffentlichen" onPress={() => console.log('Geklickt!')} />
 */

import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants/Theme';

interface PrimaryButtonProps {
  title: string;                    // Der Text auf dem Button
  onPress: () => void;              // Was passiert beim Klick
  disabled?: boolean;               // Button deaktiviert?
  loading?: boolean;                // Lädt gerade etwas?
  variant?: 'filled' | 'outlined';  // Gefüllt oder nur Umrandung
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;              // Volle Breite?
  style?: ViewStyle;                // Eigene Styles
}

export function PrimaryButton({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'filled',
  size = 'medium',
  fullWidth = false,
  style,
}: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.button,
        variant === 'filled' ? styles.filled : styles.outlined,
        size === 'small' && styles.small,
        size === 'large' && styles.large,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'filled' ? Colors.textOnPrimary : Colors.primary} 
        />
      ) : (
        <Text 
          style={[
            styles.text,
            variant === 'filled' ? styles.textFilled : styles.textOutlined,
            size === 'small' && styles.textSmall,
            size === 'large' && styles.textLarge,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    // Basis-Style
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...Shadows.medium,
  },
  
  // Varianten
  filled: {
    backgroundColor: Colors.primary,
  },
  outlined: {
    backgroundColor: Colors.transparent,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  
  // Größen
  small: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  large: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minHeight: 56,
  },
  
  // Breite
  fullWidth: {
    width: '100%',
  },
  
  // Deaktiviert
  disabled: {
    opacity: 0.5,
  },
  
  // Text
  text: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  textFilled: {
    color: Colors.textOnPrimary,
  },
  textOutlined: {
    color: Colors.primary,
  },
  textSmall: {
    fontSize: Typography.fontSize.sm,
  },
  textLarge: {
    fontSize: Typography.fontSize.lg,
  },
});
