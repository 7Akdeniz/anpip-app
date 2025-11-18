/**
 * TYPOGRAPHY - Text-Komponente mit vordefinierten Styles
 * 
 * Verwendung:
 * <Typography variant="h1">Überschrift</Typography>
 * <Typography variant="body">Normaler Text</Typography>
 */

import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { Colors, Typography as TypographyTheme } from '@/constants/Theme';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'button';
  color?: string;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body',
  color = Colors.text,
  align = 'left',
  style,
  numberOfLines,
}: TypographyProps) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { color, textAlign: align },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    fontFamily: TypographyTheme.fontFamily.regular,
  },
  h1: {
    fontSize: TypographyTheme.fontSize.xxxl,
    fontWeight: TypographyTheme.fontWeight.bold,
    lineHeight: TypographyTheme.fontSize.xxxl * TypographyTheme.lineHeight.tight,
  },
  h2: {
    fontSize: TypographyTheme.fontSize.xxl,
    fontWeight: TypographyTheme.fontWeight.bold,
    lineHeight: TypographyTheme.fontSize.xxl * TypographyTheme.lineHeight.tight,
  },
  h3: {
    fontSize: TypographyTheme.fontSize.xl,
    fontWeight: TypographyTheme.fontWeight.semibold,
    lineHeight: TypographyTheme.fontSize.xl * TypographyTheme.lineHeight.tight,
  },
  body: {
    fontSize: TypographyTheme.fontSize.base,
    fontWeight: TypographyTheme.fontWeight.regular,
    lineHeight: TypographyTheme.fontSize.base * TypographyTheme.lineHeight.normal,
  },
  caption: {
    fontSize: TypographyTheme.fontSize.sm,
    fontWeight: TypographyTheme.fontWeight.regular,
    lineHeight: TypographyTheme.fontSize.sm * TypographyTheme.lineHeight.normal,
    color: Colors.textSecondary,
  },
  button: {
    fontSize: TypographyTheme.fontSize.base,
    fontWeight: TypographyTheme.fontWeight.semibold,
  },
});
