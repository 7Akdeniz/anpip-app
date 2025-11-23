/**
 * ============================================================================
 * DUET SCREEN
 * ============================================================================
 * 
 * Screen zum Erstellen von Video-Duets
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DuetRecorder from '@/components/DuetRecorder';
import { canUserDuet } from '@/lib/duet-engine';
import { supabase } from '@/lib/supabase';
import { Typography } from '@/components/ui';
import { Colors } from '@/constants/Theme';

export default function DuetScreen() {
  const router = useRouter();
  const { videoId } = useLocalSearchParams<{ videoId: string }>();
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [canDuet, setCanDuet] = useState(false);

  useEffect(() => {
    checkDuetPermission();
  }, [videoId]);

  async function checkDuetPermission() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Fehler', 'Bitte melde dich an');
        router.back();
        return;
      }

      // Check Permission
      const permission = await canUserDuet(session.user.id, videoId);
      
      if (!permission.allowed) {
        Alert.alert('Duet nicht möglich', permission.reason || 'Unknown error');
        router.back();
        return;
      }

      // Load Video
      const { data: video } = await supabase
        .from('videos')
        .select('video_url')
        .eq('id', videoId)
        .single();

      if (!video) {
        Alert.alert('Fehler', 'Video nicht gefunden');
        router.back();
        return;
      }

      setVideoUrl(video.video_url);
      setCanDuet(true);

    } catch (error) {
      console.error('Error checking duet permission:', error);
      Alert.alert('Fehler', 'Konnte nicht laden');
      router.back();
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Typography>Wird geladen...</Typography>
      </View>
    );
  }

  if (!canDuet || !videoUrl) {
    return null;
  }

  return (
    <DuetRecorder
      originalVideoId={videoId}
      originalVideoUrl={videoUrl}
      onComplete={(newVideoId) => {
        // Navigate back to feed
        router.replace('/');
      }}
      onCancel={() => {
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
