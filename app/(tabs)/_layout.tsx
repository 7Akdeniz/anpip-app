/**
 * ANPIP TAB NAVIGATION
 * 
 * 5 Haupt-Tabs: Feed, Explore, Upload, Notifications, Profile
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors as ThemeColors } from '@/constants/Theme';
import { usePathname, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { triggerNewMessage } from './messages';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const isMessagesScreen = pathname === '/messages';
  const { checkAuth } = useRequireAuth();

  // Handler für Tab-Presses auf Messages-Screen
  const handleTabPress = (routeName: string, event: any) => {
    // Auth-Checks für geschützte Tabs
    if (routeName === 'upload') {
      if (!isMessagesScreen) {
        // Auf Startseite/Feed: Zur Upload-Seite navigieren
        event.preventDefault();
        if (checkAuth('upload')) {
          router.push('/upload');
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
  
  return (
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
          borderTopColor: 'rgba(255,255,255,0.45)',
          borderTopWidth: 1,
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
      }}>
      
      {/* Index/Feed - Hauptseite */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} style={{
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowRadius: 4,
            }} />
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
              name={isMessagesScreen ? "call-outline" : "search-outline"}
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
                marginTop: -4,
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
            <Ionicons name="chatbubbles-outline" size={size} color={color} style={{
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowRadius: 4,
            }} />
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
              name={isMessagesScreen ? "videocam-outline" : "person-outline"}
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
  );
}
