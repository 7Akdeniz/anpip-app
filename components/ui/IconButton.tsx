/**
 * ICON BUTTON - Runder Button nur mit Icon
 * 
 * Verwendung:
 * <IconButton 
 *   icon="heart" 
 *   onPress={() => console.log('Like!')} 
 *   size={40}
 * />
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows } from '@/constants/Theme';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;  // Icon-Name
  onPress: () => void;
  size?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export function IconButton({
  icon,
  onPress,
  size = 48,
  color = Colors.text,
  backgroundColor = Colors.surface,
  style,
}: IconButtonProps) {
  const iconSize = size * 0.5; // Icon ist 50% der Button-Größe
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.button,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Ionicons name={icon} size={iconSize} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.small,
  },
});
