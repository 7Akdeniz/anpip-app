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
        tabBarActiveTintColor: ThemeColors.primary,
        tabBarInactiveTintColor: ThemeColors.textSecondary,
        tabBarStyle: {
          backgroundColor: ThemeColors.background,
          borderTopColor: ThemeColors.divider,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false, // Wir haben eigene Header in den Screens
      }}>
      
      {/* Feed - Hauptseite */}
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />

      {/* Explore - Entdecken */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Entdecken',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />

      {/* Upload - Video hochladen (zentraler Button) */}
      <Tabs.Screen
        name="upload"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={48} color={ThemeColors.primary} />
          ),
        }}
      />

      {/* Notifications - Benachrichtigungen */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Aktivität',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      {/* Profile - Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />

      {/* Alte Screens verstecken */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Versteckt den Tab
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Versteckt den Tab
        }}
      />
    </Tabs>
  );
}
