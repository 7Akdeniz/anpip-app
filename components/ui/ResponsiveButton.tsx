/**
 * ANPIP.COM - RESPONSIVE BUTTON
 * Touch-optimiert für alle Geräte
 */

import React, { useState } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
  Pressable,
} from 'react-native';
import { Typography } from './Typography';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/Theme';
import { responsive, TouchTargets, ResponsiveTypography } from '@/constants/Responsive';
import { AnimationOptimization } from '@/constants/Performance';

interface ResponsiveButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function ResponsiveButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ResponsiveButtonProps) {
  const [pressed, setPressed] = useState(false);
  
  const handlePress = () => {
    if (!disabled && !loading) {
      // Haptic Feedback (iOS/Android)
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        try {
          const Haptics = require('expo-haptics');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
      }
      onPress();
    }
  };
  
  // Button Styles basierend auf Variant
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.surface,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: Colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          backgroundColor: Colors.error,
        };
      default:
        return {
          backgroundColor: Colors.primary,
        };
    }
  };
  
  // Text Styles basierend auf Variant
  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return Colors.textOnPrimary;
      case 'secondary':
        return Colors.text;
      case 'outline':
      case 'text':
        return Colors.primary;
      default:
        return Colors.textOnPrimary;
    }
  };
  
  // Size Styles
  const getSizeStyle = (): {
    height: number;
    paddingHorizontal: number;
    fontSize: number;
  } => {
    const baseSize = responsive.responsive({
      phone: {
        small: { height: 36, paddingHorizontal: 12, fontSize: 14 },
        medium: { height: TouchTargets.minimum, paddingHorizontal: 16, fontSize: 16 },
        large: { height: 56, paddingHorizontal: 24, fontSize: 18 },
      },
      tablet: {
        small: { height: 40, paddingHorizontal: 16, fontSize: 14 },
        medium: { height: 52, paddingHorizontal: 20, fontSize: 16 },
        large: { height: 60, paddingHorizontal: 28, fontSize: 18 },
      },
      desktop: {
        small: { height: 40, paddingHorizontal: 16, fontSize: 14 },
        medium: { height: 56, paddingHorizontal: 24, fontSize: 16 },
        large: { height: 64, paddingHorizontal: 32, fontSize: 18 },
      },
      default: {
        small: { height: 36, paddingHorizontal: 12, fontSize: 14 },
        medium: { height: TouchTargets.minimum, paddingHorizontal: 16, fontSize: 16 },
        large: { height: 56, paddingHorizontal: 24, fontSize: 18 },
      },
    });
    
    return baseSize[size];
  };
  
  const sizeStyle = getSizeStyle();
  
  return (
    <Pressable
      onPress={handlePress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={disabled || loading}
      style={[
        styles.button,
        getVariantStyle(),
        {
          height: sizeStyle.height,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : (pressed ? 0.7 : 1),
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        variant === 'primary' && Shadows.small,
        style,
      ]}
      // Accessibility
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          
          <Typography
            variant="button"
            style={{
              color: getTextColor(),
              fontSize: sizeStyle.fontSize,
              ...textStyle,
            }}
          >
            {title}
          </Typography>
          
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    // Web: Cursor Pointer
    ...Platform.select({
      web: {
        cursor: 'pointer',
        userSelect: 'none',
      } as any,
    }),
  },
});
