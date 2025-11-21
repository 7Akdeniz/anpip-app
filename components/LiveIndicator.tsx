/**
 * 🔴 LIVE ICON - Schwebender Roter Punkt (wenn Live aktiv)
 * 
 * Erscheint oben rechts auf allen Seiten
 * Klick führt zu /live
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { liveStreamingService } from '@/lib/live-streaming-advanced';

export function LiveIndicator() {
  const router = useRouter();
  const [hasLiveStreams, setHasLiveStreams] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    checkLiveStreams();
    
    // Alle 30 Sekunden prüfen
    const interval = setInterval(checkLiveStreams, 30000);
    
    // Pulsing-Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    return () => clearInterval(interval);
  }, []);

  const checkLiveStreams = async () => {
    try {
      const streams = await liveStreamingService.searchLiveStreams({
        status: 'live',
        limit: 1,
      });
      setHasLiveStreams(streams.length > 0);
      setLiveCount(streams.length);
    } catch (error) {
      console.error('Error checking live streams:', error);
    }
  };

  if (!hasLiveStreams) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (Platform.OS === 'web') {
          window.location.href = '/live';
        } else {
          router.push('/(tabs)/live' as any);
        }
      }}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.liveButton,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <View style={styles.redDot} />
        <Text style={styles.liveText}>LIVE</Text>
        {liveCount > 1 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{liveCount}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.select({ web: 80, default: 60 }),
    right: 16,
    zIndex: 9999,
  },
  liveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff0000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#ff0000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 6,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ff0000',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
