/**
 * MESSAGES SCREEN - WhatsApp-Style Nachrichten
 * 
 * Vollständiges Chat-System wie WhatsApp mit allen Features
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Text, Alert } from 'react-native';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { usePathname } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Event-System für neue Nachricht
let newMessageListener: (() => void) | null = null;

export const triggerNewMessage = () => {
  if (newMessageListener) {
    newMessageListener();
  }
};

// Dummy Chat-Daten (wie WhatsApp)
const DUMMY_CHATS = [
  {
    id: '1',
    name: 'Maria Schmidt',
    avatar: '👩',
    lastMessage: 'Hey! Hast du das neue Video gesehen? 🔥',
    time: '14:23',
    unread: 3,
    online: true,
    typing: false,
  },
  {
    id: '2',
    name: 'Alex Mueller',
    avatar: '👨',
    lastMessage: 'Super Content! Weiter so 👍',
    time: '13:45',
    unread: 0,
    online: true,
    typing: false,
  },
  {
    id: '3',
    name: 'Lisa Berger',
    avatar: '👧',
    lastMessage: 'Lass uns ein Duett machen!',
    time: '12:30',
    unread: 1,
    online: false,
    typing: false,
  },
  {
    id: '4',
    name: 'Tom Weber',
    avatar: '🧑',
    lastMessage: 'Du: Danke für deinen Kommentar! ❤️',
    time: '11:15',
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: '5',
    name: 'Sarah Fischer',
    avatar: '👩‍🦰',
    lastMessage: 'Schicke ich dir später',
    time: 'Gestern',
    unread: 0,
    online: true,
    typing: true,
  },
  {
    id: '6',
    name: 'David Klein',
    avatar: '👦',
    lastMessage: 'Perfekt! Bis morgen dann 🎥',
    time: 'Gestern',
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: '7',
    name: 'Emma Wagner',
    avatar: '👱‍♀️',
    lastMessage: 'Das war so lustig 😂😂😂',
    time: 'Montag',
    unread: 0,
    online: false,
    typing: false,
  },
  {
    id: '8',
    name: 'Nina Hoffmann',
    avatar: '👩‍🦱',
    lastMessage: 'Wann machst du das nächste Live? 🎬',
    time: 'Montag',
    unread: 2,
    online: true,
    typing: false,
  },
];

export default function MessagesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const pathname = usePathname();

  // Registriere Listener für neue Nachricht
  useEffect(() => {
    newMessageListener = () => {
      setShowNewMessageModal(true);
      setRecipientSearch('');
    };
    
    return () => {
      newMessageListener = null;
    };
  }, []);

  const filteredChats = DUMMY_CHATS.filter(chat => {
    if (searchQuery) {
      return chat.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <View style={styles.container}>
      {/* WhatsApp-Style Header */}
      <BlurView intensity={80} tint="dark" style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Anpip</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity 
              style={styles.headerIconButton}
              onPress={() => Alert.alert('Einstellungen', 'Einstellungen werden geöffnet...')}
            >
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Suchleiste */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Chats durchsuchen..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}
        </View>
      </BlurView>

      {/* Chat Liste */}
      <ScrollView 
        style={styles.chatList}
        showsVerticalScrollIndicator={false}
      >
        {filteredChats.map((chat, index) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            activeOpacity={0.7}
          >
            {/* Avatar mit Online-Status */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Typography variant="h2" style={styles.avatarEmoji}>{chat.avatar}</Typography>
              </View>
              {chat.online && <View style={styles.onlineIndicator} />}
            </View>

            {/* Chat Info */}
            <View style={styles.chatInfo}>
              <View style={styles.chatHeader}>
                <Typography variant="body" style={styles.chatName} numberOfLines={1}>
                  {chat.name}
                </Typography>
                <Typography variant="caption" style={styles.chatTime}>
                  {chat.time}
                </Typography>
              </View>
              
              <View style={styles.chatFooter}>
                <View style={styles.messagePreview}>
                  {chat.typing ? (
                    <View style={styles.typingContainer}>
                      <View style={styles.typingDot} />
                      <View style={[styles.typingDot, styles.typingDot2]} />
                      <View style={[styles.typingDot, styles.typingDot3]} />
                      <Typography variant="caption" style={styles.typingText}>
                        schreibt...
                      </Typography>
                    </View>
                  ) : (
                    <>
                      {chat.lastMessage.startsWith('Du:') && (
                        <Ionicons 
                          name="checkmark-done" 
                          size={16} 
                          color="#4FC3F7" 
                          style={{ marginRight: 4 }} 
                        />
                      )}
                      <Text 
                        style={[
                          styles.lastMessage,
                          chat.unread > 0 && styles.lastMessageUnread
                        ]} 
                        numberOfLines={1}
                      >
                        {chat.lastMessage}
                      </Text>
                    </>
                  )}
                </View>
                
                {chat.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Typography variant="caption" style={styles.unreadText}>
                      {chat.unread}
                    </Typography>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {filteredChats.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={80} color="rgba(255,255,255,0.3)" />
            <Typography variant="h3" style={styles.emptyTitle}>
              Keine Chats gefunden
            </Typography>
            <Typography variant="caption" style={styles.emptySubtitle}>
              {searchQuery ? 'Versuche eine andere Suche' : 'Starte einen neuen Chat'}
            </Typography>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Neue Nachricht Modal */}
      {showNewMessageModal && (
        <View style={styles.modalOverlay}>
          <BlurView intensity={95} tint="dark" style={styles.newMessageModal}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowNewMessageModal(false)}>
                <Text style={styles.modalCancelButton}>Abbrechen</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Neue Nachricht</Text>
              <View style={{ width: 80 }} />
            </View>

            {/* Empfänger Suchfeld */}
            <View style={styles.recipientField}>
              <Text style={styles.recipientLabel}>An:</Text>
              <TextInput
                style={styles.recipientInput}
                placeholder="Name oder Telefonnummer"
                placeholderTextColor="rgba(255,255,255,0.4)"
                value={recipientSearch}
                onChangeText={setRecipientSearch}
                autoFocus
              />
            </View>

            {/* Kontaktliste */}
            <ScrollView style={styles.contactsList}>
              <Text style={styles.contactsHeader}>VORGESCHLAGENE KONTAKTE</Text>
              
              {DUMMY_CHATS.filter(chat => 
                chat.name.toLowerCase().includes(recipientSearch.toLowerCase())
              ).map((contact) => (
                <TouchableOpacity
                  key={contact.id}
                  style={styles.contactItem}
                  onPress={() => {
                    setShowNewMessageModal(false);
                    // Hier würde die Navigation zum Chat erfolgen
                  }}
                >
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarEmoji}>{contact.avatar}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    <Text style={styles.contactStatus}>
                      {contact.online ? 'Online' : 'Offline'}
                    </Text>
                  </View>
                  {contact.online && <View style={styles.onlineIndicatorSmall} />}
                </TouchableOpacity>
              ))}

              {recipientSearch.length > 0 && DUMMY_CHATS.filter(chat => 
                chat.name.toLowerCase().includes(recipientSearch.toLowerCase())
              ).length === 0 && (
                <View style={styles.noResults}>
                  <Ionicons name="search-outline" size={60} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.noResultsText}>Keine Kontakte gefunden</Text>
                  <Text style={styles.noResultsSubtext}>Versuche eine andere Suche</Text>
                </View>
              )}
            </ScrollView>
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  // Header
  header: {
    paddingTop: 60,
    paddingBottom: 0,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.3,
    fontFamily: 'System',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  headerIconButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Suchleiste
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'System',
    letterSpacing: 0.1,
  },
  
  // WhatsApp-Style Navigation Tabs
  whatsappTabs: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
  },
  whatsappTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 4,
  },
  whatsappTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  whatsappTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '500',
  },
  whatsappTabTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  
  // Filter Tabs (alte Styles entfernt)
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTabActive: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterBadge: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  
  // Chat Liste
  chatList: {
    flex: 1,
    paddingBottom: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.95)',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'transparent',
  },
  
  // Avatar
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#000000',
  },
  
  // Chat Info
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    letterSpacing: 0.2,
    fontFamily: 'System',
  },
  chatTime: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.1,
    fontFamily: 'System',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messagePreview: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  lastMessage: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    flex: 1,
    letterSpacing: 0.1,
    fontFamily: 'System',
  },
  lastMessageUnread: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  
  // Typing Indicator
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 0.4,
  },
  typingText: {
    color: Colors.primary,
    fontSize: 14,
    fontStyle: 'italic',
    marginLeft: 4,
  },
  
  // Unread Badge
  unreadBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
  },
  
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
  },
  newMessageModal: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalCancelButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    width: 80,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    fontFamily: 'System',
  },
  recipientField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  recipientLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  recipientInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'System',
    letterSpacing: 0.1,
  },
  contactsList: {
    flex: 1,
  },
  contactsHeader: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'System',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactAvatarEmoji: {
    fontSize: 28,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
    fontFamily: 'System',
    marginBottom: 2,
  },
  contactStatus: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    letterSpacing: 0.1,
    fontFamily: 'System',
  },
  onlineIndicatorSmall: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  noResults: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'System',
  },
  noResultsSubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'System',
  },
});
