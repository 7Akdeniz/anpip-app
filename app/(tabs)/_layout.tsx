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

export default function TabLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const isMessagesScreen = pathname === '/messages';

  // Handler für Tab-Presses auf Messages-Screen
  const handleTabPress = (routeName: string, event: any) => {
    if (!isMessagesScreen) return; // Nur auf Messages-Screen aktiv

    if (routeName === 'explore') {
      // Anruf-Funktion
      event.preventDefault();
      Alert.alert('Anruf', 'Anruffunktion wird gestartet...');
    } else if (routeName === 'upload') {
      // Neue Nachricht
      if (isMessagesScreen) {
        event.preventDefault();
        triggerNewMessage();
      }
    } else if (routeName === 'profile') {
      // Videoanruf-Funktion
      event.preventDefault();
      Alert.alert('Videoanruf', 'Videoanruffunktion wird gestartet...');
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

      {/* Explore - Entdecken / Anruf auf Messages-Screen */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search',
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
          title: 'Menu',
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
    </Tabs>
  );
}
