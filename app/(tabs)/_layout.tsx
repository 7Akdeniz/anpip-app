/**
 * ANPIP TAB NAVIGATION
 * 
 * 5 Haupt-Tabs: Feed, Explore, Upload, Notifications, Profile
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors as ThemeColors } from '@/constants/Theme';

export default function TabLayout() {
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

      {/* Explore - Entdecken */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} style={{
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowRadius: 4,
            }} />
          ),
        }}
      />

      {/* Upload - Video hochladen (zentraler Button) */}
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
      />

      {/* Notifications - Benachrichtigungen */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mail-outline" size={size} color={color} style={{
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowRadius: 4,
            }} />
          ),
        }}
      />

      {/* Profile - Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} style={{
              textShadowColor: 'rgba(0,0,0,0.8)',
              textShadowRadius: 4,
            }} />
          ),
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
