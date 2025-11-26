/**
 * ANPIP TAB NAVIGATION
 * 
 * 5 Haupt-Tabs: Feed, Explore, Upload, Notifications, Profile
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors as ThemeColors } from '@/constants/Theme';
import { usePathname, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { triggerNewMessage } from './messages';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { VideoTimelineProvider } from '@/contexts/VideoTimelineContext';
import { TabBarTimeline } from '@/components/TabBarTimeline';

type UploadMenuAction = 'select' | 'public' | 'friends' | 'private';

const UPLOAD_MENU_ITEMS: { action: UploadMenuAction; icon: string; label: string }[] = [
  { action: 'select', icon: 'images', label: 'Video auswählen' },
  { action: 'public', icon: 'globe', label: 'Öffentlich' },
  { action: 'friends', icon: 'people', label: 'Freunde' },
  { action: 'private', icon: 'lock-closed', label: 'Privat' },
];

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const isMessagesScreen = pathname === '/messages';
  const { checkAuth } = useRequireAuth();
  const [uploadMenuVisible, setUploadMenuVisible] = useState(false);
  const [selectedVisibility, setSelectedVisibility] = useState<'public' | 'friends' | 'private'>('public');

  useEffect(() => {
    setUploadMenuVisible(false);
  }, [pathname]);

  // Handler für Tab-Presses auf Messages-Screen
  const handleTabPress = (routeName: string, event: any) => {
    // Auth-Checks für geschützte Tabs
    if (routeName === 'upload') {
      if (!isMessagesScreen) {
        // Auf Startseite/Feed: Upload-Menü öffnen statt navigieren
        event.preventDefault();
        if (checkAuth('upload')) {
          setUploadMenuVisible(true);
        }
      } else {
        // Auf Messages-Screen: Neue Nachricht
        event.preventDefault();
        if (checkAuth('message')) {
          triggerNewMessage();
        }
      }
    } else if (routeName === 'messages') {
      // Messages-Tab schützen
      event.preventDefault();
      if (checkAuth('message')) {
        router.push('/messages');
      }
    } else if (routeName === 'profile' && !isMessagesScreen) {
      // Profile-Tab schützen (aber nicht auf Messages-Screen wo es Videoanruf ist)
      event.preventDefault();
      if (checkAuth('profile')) {
        router.push('/profile');
      }
    }

    // Spezielle Funktionen auf Messages-Screen
    if (!isMessagesScreen) return;

    if (routeName === 'explore') {
      // Anruf-Funktion
      event.preventDefault();
      if (checkAuth('message', 'Melde dich an, um Anrufe zu tätigen')) {
        Alert.alert('Anruf', 'Anruffunktion wird gestartet...');
      }
    } else if (routeName === 'profile') {
      // Videoanruf-Funktion
      event.preventDefault();
      if (checkAuth('message', 'Melde dich an, um Videoanrufe zu tätigen')) {
        Alert.alert('Videoanruf', 'Videoanruffunktion wird gestartet...');
      }
    }
  };
  
  const handleUploadMenuAction = async (action: UploadMenuAction) => {
    if (action === 'select') {
      // Galerie öffnen MIT der gewählten Visibility
      setUploadMenuVisible(false);
      await openVideoPicker();
      return;
    }
    // Visibility ändern (Menü bleibt offen)
    setSelectedVisibility(action as 'public' | 'friends' | 'private');
  };

  const openVideoPicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Bitte erlaube den Zugriff auf deine Galerie.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]) {
      return;
    }

    // Video-Editor mit gewählter Visibility öffnen
    router.push({
      pathname: '/video-editor',
      params: { 
        videoUri: result.assets[0].uri,
        visibility: selectedVisibility, // Hier wird die gewählte Visibility mitgegeben!
      },
    });
  };
  
  return (
    <VideoTimelineProvider>
      <View style={styles.wrapper}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: 'rgba(255,255,255,0.5)',
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: 'transparent',
              borderTopWidth: 0,
              height: 50,
              paddingBottom: 2,
              paddingTop: 0,
              paddingHorizontal: 16,
              elevation: 0,
              shadowOpacity: 0,
              overflow: 'visible',
            },
            tabBarItemStyle: {
              paddingTop: 2,
              marginTop: 0,
            },
            tabBarShowLabel: false,
            tabBarIconStyle: {
              textShadowColor: 'rgba(0, 0, 0, 0.8)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            },
            headerShown: false, // Wir haben eigene Header in den Screens
          }}
        >
      
          {/* Index/Feed - Hauptseite */}
          <Tabs.Screen
            name="index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="home-outline"
                  size={size}
                  color={color}
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowRadius: 4,
                  }}
                />
              ),
            }}
          />

          {/* Explore - Suche / Anruf auf Messages-Screen */}
          <Tabs.Screen
            name="explore"
            options={{
              title: isMessagesScreen ? 'Call' : 'Search',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={isMessagesScreen ? 'call-outline' : 'search-outline'}
                  size={size}
                  color={color}
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowRadius: 4,
                  }}
                />
              ),
            }}
            listeners={{
              tabPress: (e) => handleTabPress('explore', e),
            }}
          />

          {/* Upload - Video hochladen / Neue Nachricht auf Messages-Screen */}
          <Tabs.Screen
            name="upload"
            options={{
              title: '',
              tabBarIcon: ({ color }) => (
                <Ionicons
                  name="add-circle-outline"
                  size={34}
                  color="#FFFFFF"
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowRadius: 4,
                    marginTop: -2,
                  }}
                />
              ),
              tabBarItemStyle: {
                paddingTop: 0,
                marginTop: 0,
              },
            }}
            listeners={{
              tabPress: (e) => handleTabPress('upload', e),
            }}
          />

          {/* Messages - WhatsApp-Style Nachrichten */}
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Messages',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="chatbubbles-outline"
                  size={size}
                  color={color}
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowRadius: 4,
                  }}
                />
              ),
            }}
          />

          {/* Notifications verstecken (durch messages ersetzt) */}
          <Tabs.Screen
            name="notifications"
            options={{
              href: null, // Versteckt den Tab
            }}
          />

          {/* Profile - Profil / Videoanruf auf Messages-Screen */}
          <Tabs.Screen
            name="profile"
            options={{
              title: isMessagesScreen ? 'Video Call' : 'Profile',
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name={isMessagesScreen ? 'videocam-outline' : 'person-outline'}
                  size={size}
                  color={color}
                  style={{
                    textShadowColor: 'rgba(0,0,0,0.8)',
                    textShadowRadius: 4,
                  }}
                />
              ),
            }}
            listeners={{
              tabPress: (e) => handleTabPress('profile', e),
            }}
          />

          {/* Feed-Tab verstecken (Feed ist jetzt auf index) */}
          <Tabs.Screen
            name="feed"
            options={{
              href: null, // Versteckt den Tab
            }}
          />
          
          {/* Two verstecken */}
          <Tabs.Screen
            name="two"
            options={{
              href: null, // Versteckt den Tab
            }}
          />

          {/* Live verstecken */}
          <Tabs.Screen
            name="live"
            options={{
              href: null, // Versteckt den Tab
            }}
          />

          {/* Settings verstecken */}
          <Tabs.Screen
            name="settings"
            options={{
              href: null, // Versteckt den Tab
            }}
          />
        </Tabs>
        <TabBarTimeline />
        <UploadMenuOverlay
          visible={uploadMenuVisible}
          onClose={() => setUploadMenuVisible(false)}
          onSelect={handleUploadMenuAction}
          selectedVisibility={selectedVisibility}
        />
      </View>
    </VideoTimelineProvider>
  );
}

function UploadMenuOverlay({
  visible,
  onClose,
  onSelect,
  selectedVisibility,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (action: UploadMenuAction) => void;
  selectedVisibility: 'public' | 'friends' | 'private';
}) {
  if (!visible) return null;

  return (
    <View style={styles.uploadMenuOverlay} pointerEvents="box-none">
      <TouchableOpacity
        style={styles.uploadMenuBackdrop}
        activeOpacity={1}
        onPress={onClose}
      />
      <View style={styles.uploadMenuBubble}>
        {UPLOAD_MENU_ITEMS.map((item) => {
          const isSelected = item.action === selectedVisibility;
          return (
            <TouchableOpacity
              key={item.action}
              style={[
                styles.uploadMenuButton,
              ]}
              onPress={() => onSelect(item.action)}
              accessibilityLabel={item.label}
              accessibilityRole="button"
            >
              {isSelected && item.action !== 'select' && (
                <View style={styles.selectionRing} />
              )}
              <Ionicons 
                name={item.icon} 
                size={50} 
                color={isSelected && item.action !== 'select' ? '#00D9FF' : '#FFFFFF'} 
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: 'relative',
  },
  uploadMenuOverlay: {
    position: 'absolute',
    inset: 0,
    zIndex: 99,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  uploadMenuBubble: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    borderWidth: 0,
    shadowOpacity: 0,
    flexDirection: 'row',
    gap: 40,
  },
  uploadMenuButton: {
    width: 50,
    height: 50,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginVertical: 0,
    position: 'relative',
  },
  selectionRing: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#00D9FF',
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
});
