/**
 * CARD - Container mit Schatten (Google Material Card)
 * 
 * Verwendung:
 * <Card>
 *   <Text>Dein Inhalt hier</Text>
 * </Card>
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'elevated' | 'outlined' | 'filled';
}

export function Card({ 
  children, 
  style, 
  padding = Spacing.md,
  variant = 'elevated',
}: CardProps) {
  return (
    <View 
      style={[
        styles.card,
        { padding },
        variant === 'elevated' && styles.elevated,
        variant === 'outlined' && styles.outlined,
        variant === 'filled' && styles.filled,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background,
  },
  elevated: {
    ...Shadows.medium,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filled: {
    backgroundColor: Colors.surface,
  },
});
