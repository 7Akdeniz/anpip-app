// ============================================================================
// 🚫 BLOCKIERTE NUTZER
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import type { BlockedUser } from '@/types/settings';

export default function BlockedUsersScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('blocked_users')
          .select(`
            id,
            blocked_user_id,
            blocked_at,
            blocked_user:users!blocked_user_id (
              id,
              username,
              avatar_url
            )
          `)
          .eq('user_id', user.id)
          .order('blocked_at', { ascending: false });
        
        if (data) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            username: item.blocked_user?.username || 'Unbekannt',
            avatar_url: item.blocked_user?.avatar_url || '',
            blocked_at: item.blocked_at,
          }));
          setBlockedUsers(formatted as BlockedUser[]);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der blockierten Nutzer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = (userId: string, username: string) => {
    Alert.alert(
      'Blockierung aufheben',
      `Möchtest du ${username} entblocken?`,
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entblocken',
          onPress: async () => {
            try {
              await supabase
                .from('blocked_users')
                .delete()
                .eq('id', userId);
              
              loadBlockedUsers();
            } catch (error) {
              Alert.alert('Fehler', 'Blockierung konnte nicht aufgehoben werden');
            }
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={[styles.userItem, isDark && styles.userItemDark]}>
      <View style={styles.userInfo}>
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, isDark && styles.avatarPlaceholderDark]}>
            <Ionicons name="person" size={24} color={isDark ? '#8E8E93' : '#C7C7CC'} />
          </View>
        )}
        <View style={styles.userDetails}>
          <Text style={[styles.username, isDark && styles.usernameDark]}>
            {item.username || 'Unbekannter Nutzer'}
          </Text>
          <Text style={[styles.blockedDate, isDark && styles.blockedDateDark]}>
            Blockiert am {new Date(item.blocked_at).toLocaleDateString('de-DE')}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.unblockButton}
        onPress={() => handleUnblock(item.id, item.username || 'Nutzer')}
      >
        <Text style={styles.unblockButtonText}>Entblocken</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Blockierte Nutzer',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      {blockedUsers.length > 0 ? (
        <FlatList
          data={blockedUsers}
          renderItem={renderBlockedUser}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons
            name="ban-outline"
            size={64}
            color={isDark ? '#8E8E93' : '#C7C7CC'}
          />
          <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
            Keine blockierten Nutzer
          </Text>
          <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
            Du hast noch niemanden blockiert
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  listContent: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  userItemDark: {
    backgroundColor: '#1C1C1E',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderDark: {
    backgroundColor: '#2C2C2E',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  usernameDark: {
    color: '#FFFFFF',
  },
  blockedDate: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  blockedDateDark: {
    color: '#8E8E93',
  },
  unblockButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unblockButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
  emptyTextDark: {
    color: '#8E8E93',
  },
});
