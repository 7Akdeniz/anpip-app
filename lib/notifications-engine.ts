/**
 * ============================================================================
 * PUSH NOTIFICATIONS ENGINE
 * ============================================================================
 * 
 * Expo Notifications für maximale Retention
 * 
 * Notification-Types:
 * - Like on Video
 * - Comment on Video
 * - New Follower
 * - Reply to Comment
 * - Video Mention
 * - Duet/Stitch of your Video
 * - Gift Received
 * - Live Stream Started
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// ============================================================================
// NOTIFICATION CONFIG
// ============================================================================

// Wie werden Notifications angezeigt wenn App im Vordergrund ist
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = 
  | 'like'
  | 'comment' 
  | 'follower'
  | 'reply'
  | 'mention'
  | 'duet'
  | 'gift'
  | 'live';

export interface NotificationData {
  type: NotificationType;
  userId: string;
  videoId?: string;
  commentId?: string;
  giftId?: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar?: string;
}

// ============================================================================
// PERMISSION REQUEST
// ============================================================================

/**
 * Fragt User nach Notification-Erlaubnis
 * WICHTIG: Beim ersten App-Start aufrufen!
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Falls noch nicht gefragt → jetzt fragen
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }

    console.log('✅ Notification permissions granted');
    return true;

  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
  }
}

// ============================================================================
// PUSH TOKEN REGISTRATION
// ============================================================================

/**
 * Holt Expo Push Token und speichert in DB
 */
export async function registerForPushNotifications(
  userId: string
): Promise<string | null> {
  try {
    // 1. Permissions checken
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return null;
    }

    // 2. Push Token holen
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'anpip-app',
    });

    console.log('📱 Push Token:', token.data);

    // 3. Token in DB speichern
    await supabase
      .from('users')
      .update({ 
        push_token: token.data,
        push_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    // 4. iOS: Badge-Count zurücksetzen
    if (Platform.OS === 'ios') {
      await Notifications.setBadgeCountAsync(0);
    }

    return token.data;

  } catch (error) {
    console.error('Failed to register push token:', error);
    return null;
  }
}

// ============================================================================
// SEND NOTIFICATION
// ============================================================================

/**
 * Sendet Push Notification an einen User
 */
export async function sendPushNotification(
  toUserId: string,
  data: NotificationData
): Promise<boolean> {
  try {
    // 1. Hole Push-Token des Users
    const { data: user } = await supabase
      .from('users')
      .select('push_token, push_enabled')
      .eq('id', toUserId)
      .single();

    if (!user?.push_token || !user?.push_enabled) {
      console.log('User has no push token or disabled notifications');
      return false;
    }

    // 2. Erstelle Notification-Message
    const message = buildNotificationMessage(data);

    // 3. Sende über Expo Push API
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: user.push_token,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: data,
        badge: 1,
        priority: 'high',
      }),
    });

    const result = await response.json();
    console.log('✅ Notification sent:', result);

    // 4. Speichere in Notifications-Tabelle
    await supabase.from('notifications').insert({
      user_id: toUserId,
      type: data.type,
      from_user_id: data.fromUserId,
      video_id: data.videoId,
      comment_id: data.commentId,
      gift_id: data.giftId,
      title: message.title,
      body: message.body,
      read: false,
      created_at: new Date().toISOString(),
    });

    return true;

  } catch (error) {
    console.error('Failed to send notification:', error);
    return false;
  }
}

// ============================================================================
// NOTIFICATION MESSAGES
// ============================================================================

function buildNotificationMessage(data: NotificationData): { 
  title: string; 
  body: string; 
} {
  const username = data.fromUsername;

  switch (data.type) {
    case 'like':
      return {
        title: '❤️ Neuer Like!',
        body: `${username} hat dein Video geliked`,
      };

    case 'comment':
      return {
        title: '💬 Neuer Kommentar',
        body: `${username} hat dein Video kommentiert`,
      };

    case 'follower':
      return {
        title: '👤 Neuer Follower!',
        body: `${username} folgt dir jetzt`,
      };

    case 'reply':
      return {
        title: '💬 Neue Antwort',
        body: `${username} hat auf deinen Kommentar geantwortet`,
      };

    case 'mention':
      return {
        title: '📢 Du wurdest erwähnt',
        body: `${username} hat dich in einem Video erwähnt`,
      };

    case 'duet':
      return {
        title: '🎬 Neues Duet!',
        body: `${username} hat ein Duet mit deinem Video erstellt`,
      };

    case 'gift':
      return {
        title: '🎁 Geschenk erhalten!',
        body: `${username} hat dir ein Geschenk geschickt`,
      };

    case 'live':
      return {
        title: '🔴 Live jetzt!',
        body: `${username} ist jetzt live`,
      };

    default:
      return {
        title: 'Neue Benachrichtigung',
        body: `${username} hat interagiert`,
      };
  }
}

// ============================================================================
// BATCH NOTIFICATIONS
// ============================================================================

/**
 * Sendet Notifications an mehrere User gleichzeitig
 * Z.B. für alle Follower wenn Creator live geht
 */
export async function sendBatchNotifications(
  userIds: string[],
  data: NotificationData
): Promise<void> {
  try {
    // Hole alle Push-Tokens
    const { data: users } = await supabase
      .from('users')
      .select('id, push_token')
      .in('id', userIds)
      .eq('push_enabled', true);

    if (!users || users.length === 0) {
      return;
    }

    const message = buildNotificationMessage(data);

    // Batch-Request (max 100 pro Request bei Expo)
    const chunks = chunkArray(users, 100);

    for (const chunk of chunks) {
      const messages = chunk
        .filter(u => u.push_token)
        .map(u => ({
          to: u.push_token,
          sound: 'default',
          title: message.title,
          body: message.body,
          data: data,
          priority: 'high',
        }));

      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messages),
      });
    }

    console.log(`✅ Sent batch notifications to ${users.length} users`);

  } catch (error) {
    console.error('Batch notification failed:', error);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// ============================================================================
// NOTIFICATION SETTINGS
// ============================================================================

/**
 * User kann Notifications ein/ausschalten
 */
export async function updateNotificationSettings(
  userId: string,
  settings: {
    pushEnabled?: boolean;
    likes?: boolean;
    comments?: boolean;
    followers?: boolean;
    mentions?: boolean;
  }
): Promise<void> {
  await supabase
    .from('users')
    .update({
      push_enabled: settings.pushEnabled,
      notify_likes: settings.likes,
      notify_comments: settings.comments,
      notify_followers: settings.followers,
      notify_mentions: settings.mentions,
    })
    .eq('id', userId);
}

// ============================================================================
// MARK AS READ
// ============================================================================

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
}

// ============================================================================
// GET NOTIFICATIONS
// ============================================================================

export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const { data } = await supabase
    .from('notifications')
    .select(`
      *,
      from_user:users!from_user_id(id, username, avatar_url)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  return count || 0;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const notificationsEngine = {
  requestNotificationPermissions,
  registerForPushNotifications,
  sendPushNotification,
  sendBatchNotifications,
  updateNotificationSettings,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUserNotifications,
  getUnreadCount,
};
