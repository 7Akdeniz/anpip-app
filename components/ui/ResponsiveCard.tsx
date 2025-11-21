/**
 * ANPIP.COM - RESPONSIVE CARD
 * Adaptive Card-Komponente für alle Geräte
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/Theme';
import { responsive, ResponsiveSpacing } from '@/constants/Responsive';

interface ResponsiveCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'elevated' | 'outlined' | 'filled';
  onPress?: () => void;
  hoverable?: boolean;
  fullWidth?: boolean;
}

export function ResponsiveCard({
  children,
  style,
  padding,
  variant = 'elevated',
  onPress,
  hoverable = true,
  fullWidth = false,
}: ResponsiveCardProps) {
  
  // Responsive Padding
  const cardPadding = padding ?? responsive.responsive({
    phone: Spacing.md,
    tablet: Spacing.lg,
    laptop: Spacing.lg,
    desktop: Spacing.xl,
    default: Spacing.md,
  });
  
  // Variant Styles
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.background,
          ...Shadows.medium,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.background,
          borderWidth: 1,
          borderColor: Colors.border,
        };
      case 'filled':
        return {
          backgroundColor: Colors.surface,
        };
      default:
        return {
          backgroundColor: Colors.background,
        };
    }
  };
  
  // Responsive Border Radius
  const borderRadius = responsive.responsive({
    phone: BorderRadius.md,
    tablet: BorderRadius.lg,
    laptop: BorderRadius.lg,
    desktop: BorderRadius.xl,
    default: BorderRadius.md,
  });
  
  const cardStyle: ViewStyle = {
    padding: cardPadding,
    borderRadius,
    width: fullWidth ? '100%' : 'auto',
    ...getVariantStyle(),
  };
  
  // Web-spezifische Styles
  const webStyle = Platform.OS === 'web' ? {
    cursor: onPress ? 'pointer' : 'default',
    userSelect: 'none',
  } : {};
  
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={[cardStyle, webStyle as any, style]}
        accessible={true}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  // Zusätzliche Styles falls benötigt
});
