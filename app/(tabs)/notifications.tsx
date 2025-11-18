/**
 * NOTIFICATIONS SCREEN - Benachrichtigungen
 * 
 * Likes, Kommentare, neue Follower, etc.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Typography, Card, IconButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

// Dummy-Benachrichtigungen
const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'maria_schmidt',
    action: 'hat dein Video geliked',
    time: 'vor 2 Min',
    icon: 'heart' as const,
    iconColor: Colors.like,
  },
  {
    id: '2',
    type: 'comment',
    user: 'alex_mueller',
    action: 'hat kommentiert: "Super Video! 🔥"',
    time: 'vor 5 Min',
    icon: 'chatbubble' as const,
    iconColor: Colors.info,
  },
  {
    id: '3',
    type: 'follow',
    user: 'lisa_berger',
    action: 'folgt dir jetzt',
    time: 'vor 10 Min',
    icon: 'person-add' as const,
    iconColor: Colors.primary,
  },
  {
    id: '4',
    type: 'like',
    user: 'tom_weber',
    action: 'hat dein Video geliked',
    time: 'vor 30 Min',
    icon: 'heart' as const,
    iconColor: Colors.like,
  },
  {
    id: '5',
    type: 'mention',
    user: 'sarah_fischer',
    action: 'hat dich in einem Video erwähnt',
    time: 'vor 1 Std',
    icon: 'at' as const,
    iconColor: Colors.warning,
  },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" color={Colors.primary}>Benachrichtigungen</Typography>
      </View>

      {/* Benachrichtigungen Liste */}
      <ScrollView style={styles.list}>
        {DUMMY_NOTIFICATIONS.map((notification) => (
          <Card key={notification.id} style={styles.notificationCard} variant="outlined">
            <View style={styles.notificationContent}>
              {/* Avatar & Icon */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={Colors.textSecondary} />
                </View>
                <View style={[styles.iconBadge, { backgroundColor: notification.iconColor }]}>
                  <Ionicons name={notification.icon} size={14} color={Colors.background} />
                </View>
              </View>

              {/* Inhalt */}
              <View style={styles.textContainer}>
                <Typography variant="body">
                  <Typography variant="body" style={{ fontWeight: '600' }}>
                    {notification.user}
                  </Typography>
                  {' '}
                  {notification.action}
                </Typography>
                <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                  {notification.time}
                </Typography>
              </View>

              {/* Video-Thumbnail (bei Video-Benachrichtigungen) */}
              {(notification.type === 'like' || notification.type === 'comment') && (
                <View style={styles.videoThumbnail}>
                  <Ionicons name="play" size={20} color={Colors.background} />
                </View>
              )}

              {/* Follow-Button (bei neuen Followern) */}
              {notification.type === 'follow' && (
                <IconButton
                  icon="person-add-outline"
                  onPress={() => console.log('Follow back')}
                  size={36}
                  backgroundColor={Colors.primary}
                  color={Colors.background}
                />
              )}
            </View>
          </Card>
        ))}

        {/* Ältere Benachrichtigungen */}
        <Typography variant="caption" color={Colors.textSecondary} align="center" style={styles.divider}>
          Ältere Benachrichtigungen
        </Typography>

        {DUMMY_NOTIFICATIONS.slice(0, 3).map((notification, index) => (
          <Card key={`old-${index}`} style={styles.notificationCard} variant="outlined">
            <View style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={Colors.textSecondary} />
                </View>
              </View>

              <View style={styles.textContainer}>
                <Typography variant="body" color={Colors.textSecondary}>
                  <Typography variant="body" style={{ fontWeight: '600' }} color={Colors.textSecondary}>
                    {notification.user}
                  </Typography>
                  {' '}
                  {notification.action}
                </Typography>
                <Typography variant="caption" color={Colors.textSecondary} style={{ marginTop: 4 }}>
                  vor 2 Tagen
                </Typography>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  list: {
    flex: 1,
  },
  notificationCard: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background,
  },
  textContainer: {
    flex: 1,
  },
  videoThumbnail: {
    width: 48,
    height: 64,
    backgroundColor: Colors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    marginVertical: Spacing.lg,
  },
});
