// ============================================================================
// 🎛️ SETTINGS ITEM COMPONENT - Reusable Setting Row
// ============================================================================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsItemProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  type?: 'navigation' | 'switch' | 'info';
  value?: boolean;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  isLast?: boolean;
  isDanger?: boolean;
}

export default function SettingsItem({
  icon,
  title,
  subtitle,
  type = 'navigation',
  value = false,
  onPress,
  onValueChange,
  isLast = false,
  isDanger = false,
}: SettingsItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (type !== 'info' && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isDark && styles.containerDark,
        !isLast && styles.borderBottom,
      ]}
      onPress={handlePress}
      disabled={type === 'info'}
      activeOpacity={type === 'info' ? 1 : 0.7}
    >
      <View style={styles.leftContent}>
        {icon && (
          <Ionicons
            name={icon}
            size={22}
            color={isDanger ? '#FF3B30' : isDark ? '#FFFFFF' : '#000000'}
            style={styles.icon}
          />
        )}
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              isDark && styles.titleDark,
              isDanger && styles.titleDanger,
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, isDark && styles.subtitleDark]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightContent}>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#767577', true: '#FF3B30' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#3e3e3e"
          />
        )}
        {type === 'navigation' && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={isDark ? '#8E8E93' : '#C7C7CC'}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    minHeight: 56,
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
    width: 24,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  titleDanger: {
    color: '#FF3B30',
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  subtitleDark: {
    color: '#8E8E93',
  },
  rightContent: {
    marginLeft: 12,
  },
});
