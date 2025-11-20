/**
 * NOTIFICATIONS SCREEN
 * Benachrichtigungen über Likes, Kommentare, Follower etc.
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { Card, IconButton } from '@/components/ui';

// Dummy-Benachrichtigungen
const DUMMY_NOTIFICATIONS = [
  {
    id: '1',
    type: 'like',
    user: 'Maria Schmidt',
    action: 'gefällt dein Video',
    time: 'vor 5 Min.',
    read: false,
  },
  {
    id: '2',
    type: 'comment',
    user: 'Alex Mueller',
    action: 'hat dein Video kommentiert',
    time: 'vor 15 Min.',
    read: false,
  },
  {
    id: '3',
    type: 'follow',
    user: 'Lisa Berger',
    action: 'folgt dir jetzt',
    time: 'vor 1 Std.',
    read: false,
  },
  {
    id: '4',
    type: 'like',
    user: 'Tom Weber',
    action: 'gefällt dein Video',
    time: 'vor 2 Std.',
    read: true,
  },
];

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2">Benachrichtigungen</Typography>
      </View>

      {/* Liste */}
      <ScrollView style={styles.list}>
        {/* Neue Benachrichtigungen */}
        <Typography variant="caption" color={Colors.textSecondary} style={styles.sectionHeader}>
          Neu
        </Typography>

        {DUMMY_NOTIFICATIONS.filter(n => !n.read).map((notification) => (
          <Card key={notification.id} style={styles.notificationCard}>
            <TouchableOpacity style={styles.notificationContent}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={24} color={Colors.textSecondary} />
                </View>
                <View style={[
                  styles.iconBadge,
                  { backgroundColor: notification.type === 'like' ? '#FF3B5C' : notification.type === 'comment' ? '#4FC3F7' : Colors.primary }
                ]}>
                  <Ionicons 
                    name={
                      notification.type === 'like' ? 'heart' : 
                      notification.type === 'comment' ? 'chatbubble' : 
                      'person-add'
                    } 
                    size={12} 
                    color="#FFFFFF" 
                  />
                </View>
              </View>

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

              {notification.type === 'follow' && (
                <IconButton
                  icon="person-add-outline"
                  onPress={() => console.log('Follow back')}
                  size={36}
                  backgroundColor={Colors.primary}
                  color={Colors.background}
                />
              )}
            </TouchableOpacity>
          </Card>
        ))}

        {/* Ältere Benachrichtigungen */}
        <Typography variant="caption" color={Colors.textSecondary} style={styles.sectionHeader}>
          Früher
        </Typography>

        {DUMMY_NOTIFICATIONS.filter(n => n.read).map((notification) => (
          <Card key={notification.id} style={styles.notificationCard} variant="outlined">
            <TouchableOpacity style={styles.notificationContent}>
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
                  {notification.time}
                </Typography>
              </View>
            </TouchableOpacity>
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
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  list: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginTop: Spacing.sm,
  },
  notificationCard: {
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
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
});
