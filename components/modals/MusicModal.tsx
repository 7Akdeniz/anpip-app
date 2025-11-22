/**
 * MUSIC MODAL - TikTok-Style Sound/Musik Ansicht
 * 
 * Funktionen:
 * - Original-Sound anzeigen
 * - Musik speichern
 * - Alle Videos mit diesem Sound ansehen
 * - Sound-Informationen
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

interface Sound {
  id: string;
  sound_name: string;
  artist_name?: string;
  sound_url?: string;
  thumbnail_url?: string;
  duration?: number;
  videos_count: number;
  is_saved?: boolean;
}

interface MusicModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  soundId?: string;
  soundName?: string;
}

export const MusicModal: React.FC<MusicModalProps> = ({
  visible,
  onClose,
  videoId,
  soundId,
  soundName = 'Original-Sound',
}) => {
  const [sound, setSound] = useState<Sound | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  /**
   * Sound-Informationen laden
   */
  const loadSound = async () => {
    if (!soundId) {
      // Fallback: Video-Sound
      setSound({
        id: videoId,
        sound_name: soundName,
        videos_count: 1,
        is_saved: false,
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sounds')
        .select('*')
        .eq('id', soundId)
        .single();

      if (error) throw error;

      setSound(data);
      setIsSaved(data.is_saved || false);
    } catch (error) {
      console.error('Fehler beim Laden des Sounds:', error);
      // Fallback
      setSound({
        id: soundId,
        sound_name: soundName,
        videos_count: 0,
        is_saved: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      loadSound();
    }
  }, [visible, soundId]);

  /**
   * Sound speichern/entfernen
   */
  const handleToggleSave = async () => {
    try {
      setIsSaved(!isSaved);
      
      // TODO: Backend-Call zum Speichern
      // await supabase.from('saved_sounds').insert/delete
      
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setIsSaved(!isSaved); // Revert
    }
  };

  /**
   * Alle Videos mit diesem Sound ansehen
   */
  const handleViewAllVideos = () => {
    onClose();
    // TODO: Navigate zu Sound-Feed
    // router.push(`/sounds/${soundId || videoId}`);
    console.log('Zeige alle Videos mit diesem Sound:', soundId || videoId);
  };

  /**
   * Sound verwenden (für neues Video)
   */
  const handleUseSound = () => {
    onClose();
    // TODO: Navigate zu Upload mit Sound
    // router.push(`/upload?soundId=${soundId || videoId}`);
    console.log('Verwende Sound für neues Video:', soundId || videoId);
  };

  if (!sound && !loading) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              Sound
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : sound ? (
            <ScrollView
              style={styles.content}
              contentContainerStyle={styles.contentContainer}
              showsVerticalScrollIndicator={false}
            >
              {/* Sound Info */}
              <View style={styles.soundInfo}>
                {/* Rotating Disc Animation */}
                <View style={styles.discContainer}>
                  <View style={styles.disc}>
                    {sound.thumbnail_url ? (
                      <Image
                        source={{ uri: sound.thumbnail_url }}
                        style={styles.discImage}
                      />
                    ) : (
                      <Ionicons name="musical-notes" size={48} color={Colors.primary} />
                    )}
                  </View>
                  <View style={styles.discCenter} />
                </View>

                {/* Sound Name */}
                <Typography variant="h2" style={styles.soundName}>
                  {sound.sound_name}
                </Typography>

                {sound.artist_name && (
                  <Typography variant="body" style={styles.artistName}>
                    {sound.artist_name}
                  </Typography>
                )}

                {/* Stats */}
                <View style={styles.stats}>
                  <View style={styles.statItem}>
                    <Typography variant="h3" style={styles.statValue}>
                      {sound.videos_count || 0}
                    </Typography>
                    <Typography variant="caption" style={styles.statLabel}>
                      Videos
                    </Typography>
                  </View>

                  {sound.duration && (
                    <View style={styles.statItem}>
                      <Typography variant="h3" style={styles.statValue}>
                        {Math.floor(sound.duration / 60)}:{String(sound.duration % 60).padStart(2, '0')}
                      </Typography>
                      <Typography variant="caption" style={styles.statLabel}>
                        Dauer
                      </Typography>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                {/* Speichern */}
                <TouchableOpacity
                  style={[styles.actionButton, isSaved && styles.actionButtonActive]}
                  onPress={handleToggleSave}
                >
                  <Ionicons
                    name={isSaved ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color={isSaved ? Colors.primary : '#FFFFFF'}
                  />
                  <Typography
                    variant="body"
                    style={isSaved ? styles.actionButtonTextActive : styles.actionButtonText}
                  >
                    {isSaved ? 'Gespeichert' : 'Speichern'}
                  </Typography>
                </TouchableOpacity>

                {/* Alle Videos ansehen */}
                <TouchableOpacity
                  style={styles.actionButtonPrimary}
                  onPress={handleViewAllVideos}
                >
                  <Ionicons name="play-circle" size={24} color="#FFFFFF" />
                  <Typography variant="body" style={styles.actionButtonText}>
                    Alle Videos ansehen
                  </Typography>
                </TouchableOpacity>

                {/* Sound verwenden */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleUseSound}
                >
                  <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
                  <Typography variant="body" style={styles.actionButtonText}>
                    Sound verwenden
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Info */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
                <Typography variant="caption" style={styles.infoText}>
                  Dieser Sound kann für eigene Videos verwendet werden
                </Typography>
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  soundInfo: {
    alignItems: 'center',
    marginBottom: 32,
  },
  discContainer: {
    position: 'relative',
    width: 160,
    height: 160,
    marginBottom: 24,
  },
  disc: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  discImage: {
    width: '100%',
    height: '100%',
  },
  discCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000000',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  soundName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  artistName: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonActive: {
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderColor: Colors.primary,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonTextActive: {
    color: Colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  infoText: {
    flex: 1,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
});
