import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const EDIT_TOOLS = [
  { id: 'trim', icon: 'cut', label: 'Schneiden' },
  { id: 'text', icon: 'text', label: 'Text' },
  { id: 'sticker', icon: 'happy-outline', label: 'Sticker' },
  { id: 'filter', icon: 'color-filter-outline', label: 'Filter' },
  { id: 'beauty', icon: 'sparkles-outline', label: 'Beauty' },
  { id: 'speed', icon: 'speedometer-outline', label: 'Speed' },
  { id: 'voice', icon: 'mic-outline', label: 'Voice' },
  { id: 'more', icon: 'add-circle-outline', label: 'Mehr' },
];

// Mock data - replace with real API
const LOCATIONS = ['Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Istanbul', 'Ankara'];
const CATEGORIES = [
  { id: 'vehicles', name: 'Fahrzeuge', icon: 'car-outline' },
  { id: 'electronics', name: 'Elektronik', icon: 'phone-portrait-outline' },
  { id: 'fashion', name: 'Mode', icon: 'shirt-outline' },
  { id: 'home', name: 'Haus & Garten', icon: 'home-outline' },
  { id: 'sports', name: 'Sport', icon: 'basketball-outline' },
];

export default function VideoEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(
    params.selectedMusic as string || null
  );
  
  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [isForMarket, setIsForMarket] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Update selected music when params change
  useEffect(() => {
    if (params.selectedMusic) {
      setSelectedMusic(params.selectedMusic as string);
    }
  }, [params.selectedMusic]);

  // Simple Animations without Reanimated
  const toolScale = useRef(new Animated.Value(1)).current;
  const musicPulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(musicPulse, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(musicPulse, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis || 0);
      if (status.durationMillis) {
        setDuration(status.durationMillis);
      }
      if (status.didJustFinish) {
        videoRef.current?.replayAsync();
      }
    }
  };

  const handleToolPress = (toolId: string) => {
    setSelectedTool(toolId);
    Animated.sequence([
      Animated.timing(toolScale, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(toolScale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Handle specific tools
    if (toolId === 'trim') {
      // TODO: Open trim editor
    } else if (toolId === 'text') {
      // TODO: Open text editor
    } else if (toolId === 'sticker') {
      // TODO: Open sticker picker
    } else if (toolId === 'filter') {
      // TODO: Open filter selector
    }
  };

  const handleMusicPress = () => {
    // Navigate to simple music picker (no MusicProvider needed)
    router.push({
      pathname: '/simple-music-picker',
      params: { 
        videoUri: params.videoUri 
      }
    });
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Video Background */}
      <Video
        ref={videoRef}
        source={{ uri: params.videoUri as string || 'https://vlibyocpdguxpretjvnz.supabase.co/storage/v1/object/public/videos/video_1764103187455.mp4' }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isPlaying}
        isLooping
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {/* Dark Overlay */}
      <View style={styles.overlay} />

      {/* Top Music Panel */}
      <Pressable
        style={styles.musicPanel}
        onPress={handleMusicPress}
      >
        <BlurView intensity={30} style={styles.musicBlur}>
          <View style={styles.musicContent}>
            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
            <Text style={styles.musicText}>
              {selectedMusic || 'Sound hinzufügen'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
          </View>
        </BlurView>
      </Pressable>

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <BlurView intensity={20} style={styles.closeBlur}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity style={styles.settingsButton}>
        <BlurView intensity={20} style={styles.settingsBlur}>
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </BlurView>
      </TouchableOpacity>

      {/* Right Side Tool Icons */}
      <View style={styles.toolsContainer}>
        {EDIT_TOOLS.map((tool, index) => (
          <View key={tool.id} style={styles.toolWrapper}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleToolPress(tool.id)}
            >
              <BlurView
                intensity={selectedTool === tool.id ? 40 : 20}
                style={[
                  styles.toolButton,
                  selectedTool === tool.id && styles.toolButtonActive,
                ]}
              >
                <Ionicons
                  name={tool.icon as any}
                  size={24}
                  color={selectedTool === tool.id ? '#FF0050' : '#FFFFFF'}
                />
              </BlurView>
              <Text style={styles.toolLabel}>{tool.label}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Timeline Scrubber */}
      <View style={styles.timelineContainer}>
        <BlurView intensity={30} style={styles.timelineBlur}>
          <View style={styles.timeline}>
            <View style={styles.timelineTrack}>
              <View style={[styles.timelineProgress, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.timelineText}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </BlurView>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        {/* AutoCut Button */}
        <TouchableOpacity style={styles.autoCutButton}>
          <BlurView intensity={30} style={styles.autoCutBlur}>
            <Ionicons name="cut" size={18} color="#FFFFFF" />
            <Text style={styles.autoCutText}>AutoCut</Text>
          </BlurView>
        </TouchableOpacity>

        {/* Main Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.storyButton}>
            <BlurView intensity={20} style={styles.storyBlur}>
              <View style={styles.storyAvatar} />
              <Text style={styles.storyText}>Deine Story</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={() => {
            setShowUploadModal(true);
          }}>
            <LinearGradient
              colors={['#FF0050', '#E1004A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nextGradient}
            >
              <Text style={styles.nextText}>Weiter</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Upload Modal */}
      <Modal
        visible={showUploadModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" />
          
          {/* Modal Header */}
          <LinearGradient
            colors={['#1a1a1a', '#000000']}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowUploadModal(false)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Video hochladen</Text>
            <View style={styles.modalHeaderRight} />
          </LinearGradient>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Description */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Beschreibung</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Beschreibe dein Video..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={500}
                />
              </View>

              {/* Selected Music */}
              {selectedMusic && (
                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>Musik</Text>
                  <View style={styles.modalMusicCard}>
                    <Ionicons name="musical-notes" size={20} color="#00D9FF" />
                    <Text style={styles.modalMusicText}>{selectedMusic}</Text>
                  </View>
                </View>
              )}

              {/* Visibility */}
              <View style={styles.modalSection}>
                <Text style={styles.modalLabel}>Sichtbarkeit</Text>
                <View style={styles.visibilityOptions}>
                  {(['public', 'friends', 'private'] as const).map((vis) => (
                    <TouchableOpacity
                      key={vis}
                      style={[
                        styles.visibilityOption,
                        visibility === vis && styles.visibilityOptionActive
                      ]}
                      onPress={() => setVisibility(vis)}
                    >
                      <Ionicons
                        name={
                          vis === 'public' ? 'earth' :
                          vis === 'friends' ? 'people' : 'lock-closed'
                        }
                        size={20}
                        color={visibility === vis ? '#00D9FF' : '#FFFFFF'}
                      />
                      <Text style={[
                        styles.visibilityText,
                        visibility === vis && styles.visibilityTextActive
                      ]}>
                        {vis === 'public' ? 'Öffentlich' :
                         vis === 'friends' ? 'Freunde' : 'Privat'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Market Toggle */}
              <TouchableOpacity
                style={[
                  styles.marketToggle,
                  isForMarket && styles.marketToggleActive
                ]}
                onPress={() => setIsForMarket(!isForMarket)}
              >
                <View style={styles.marketToggleLeft}>
                  <Ionicons name="pricetag" size={24} color="#FFFFFF" />
                  <View>
                    <Text style={styles.marketToggleTitle}>Für Market verwenden</Text>
                    <Text style={styles.marketToggleSubtitle}>Im Marketplace anzeigen</Text>
                  </View>
                </View>
                <View style={[
                  styles.marketCheckbox,
                  isForMarket && styles.marketCheckboxActive
                ]}>
                  {isForMarket && <Ionicons name="checkmark" size={18} color="#FFFFFF" />}
                </View>
              </TouchableOpacity>

              {/* Upload Button */}
              <TouchableOpacity
                style={[
                  styles.uploadButton,
                  uploading && styles.uploadButtonDisabled
                ]}
                onPress={() => {
                  if (!uploading) {
                    setUploading(true);
                    // TODO: Implement actual upload logic
                    setTimeout(() => {
                      setUploading(false);
                      setShowUploadModal(false);
                      Alert.alert('Erfolg', 'Video wurde hochgeladen!');
                      router.push('/(tabs)');
                    }, 2000);
                  }
                }}
                disabled={uploading}
              >
                <LinearGradient
                  colors={['#FF0050', '#E1004A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.uploadGradient}
                >
                  {uploading ? (
                    <>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Wird hochgeladen...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                      <Text style={styles.uploadButtonText}>Veröffentlichen</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  video: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  musicPanel: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  musicBlur: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  musicContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 10,
  },
  musicText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 101,
    width: 44,
    height: 44,
  },
  closeBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 101,
    width: 44,
    height: 44,
  },
  settingsBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toolsContainer: {
    position: 'absolute',
    right: 12,
    top: SCREEN_HEIGHT * 0.3,
    gap: 20,
    zIndex: 50,
  },
  toolWrapper: {
    alignItems: 'center',
  },
  toolButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toolButtonActive: {
    borderColor: '#FF0050',
    borderWidth: 2,
    shadowColor: '#FF0050',
    shadowOpacity: 0.5,
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timelineContainer: {
    position: 'absolute',
    bottom: 160,
    left: 20,
    right: 20,
    zIndex: 40,
  },
  timelineBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  timeline: {
    padding: 12,
  },
  timelineTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  timelineText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 16,
    zIndex: 60,
  },
  autoCutButton: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  autoCutBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  autoCutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  storyButton: {
    flex: 1,
  },
  storyBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  storyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#00D9FF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1.2,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  nextGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  // Upload Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  modalHeaderRight: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalScroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginTop: 24,
  },
  modalLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalMusicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.3)',
    borderRadius: 12,
  },
  modalMusicText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  visibilityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  visibilityOptionActive: {
    backgroundColor: 'rgba(0,217,255,0.1)',
    borderColor: '#00D9FF',
  },
  visibilityText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  visibilityTextActive: {
    color: '#00D9FF',
  },
  marketToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  marketToggleActive: {
    backgroundColor: 'rgba(0,217,255,0.05)',
    borderColor: '#00D9FF',
  },
  marketToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  marketToggleTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  marketToggleSubtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 2,
  },
  marketCheckbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  marketCheckboxActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  uploadButton: {
    marginTop: 32,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#FF0050',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
});
