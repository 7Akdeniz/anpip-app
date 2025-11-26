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
  Text,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LocationAutocomplete, Location } from '@/components/LocationAutocomplete';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TOOLS = [
  { id: 'trim', icon: 'cut', label: 'Schneiden' },
  { id: 'text', icon: 'text', label: 'Text' },
  { id: 'sticker', icon: 'happy-outline', label: 'Sticker' },
  { id: 'filter', icon: 'color-filter-outline', label: 'Filter' },
  { id: 'beauty', icon: 'sparkles-outline', label: 'Beauty' },
];

const MARKET_CATEGORIES = [
  { 
    id: 'vehicles', 
    name: 'Fahrzeuge', 
    icon: 'car-outline',
    subcategories: [
      'Autos', 'Motorräder & Roller', 'Transporter & Nutzfahrzeuge', 
      'Fahrräder & E-Bikes', 'Wohnmobile & Camping', 'Bootsfahrzeuge', 
      'Autoteile & Zubehör', 'Reifen & Felgen'
    ]
  },
  { 
    id: 'real-estate', 
    name: 'Immobilien', 
    icon: 'home-outline',
    subcategories: [
      'Wohnung mieten', 'Wohnung kaufen', 'Haus mieten', 
      'Haus kaufen', 'WG & Zimmer', 'Gewerbeimmobilien', 
      'Grundstücke', 'Ferienwohnungen'
    ]
  },
  { 
    id: 'electronics', 
    name: 'Elektronik', 
    icon: 'phone-portrait-outline',
    subcategories: [
      'Smartphones', 'Laptops & Computer', 'Spielekonsolen & Gaming', 
      'TV & Audio', 'Kameras', 'Smart Home', 
      'Haushaltsgeräte', 'Zubehör & Kabel'
    ]
  },
  { 
    id: 'home-garden', 
    name: 'Haus & Garten', 
    icon: 'leaf-outline',
    subcategories: [
      'Möbel', 'Küche & Esszimmer', 'Garten & Pflanzen', 
      'Werkzeuge', 'Heimwerken & Baumaterial', 'Deko & Wohnen', 
      'Haushaltsgeräte', 'Bad & Sanitär'
    ]
  },
  { 
    id: 'fashion-beauty', 
    name: 'Mode & Beauty', 
    icon: 'shirt-outline',
    subcategories: [
      'Damenmode', 'Herrenmode', 'Schuhe', 
      'Taschen & Accessoires', 'Schmuck', 'Beauty & Pflege', 
      'Luxusmode', 'Uhren'
    ]
  },
  { 
    id: 'family-baby', 
    name: 'Familie & Baby', 
    icon: 'people-outline',
    subcategories: [
      'Kinderkleidung', 'Kinderwagen & Buggys', 'Babyzimmer & Möbel', 
      'Spielzeug', 'Schulbedarf', 'Sicherheit & Überwachung', 
      'Umstandsmode', 'Babyzubehör'
    ]
  },
  { 
    id: 'animals', 
    name: 'Tiere', 
    icon: 'paw-outline',
    subcategories: [
      'Hunde', 'Katzen', 'Kleintiere', 
      'Vögel', 'Fische & Aquaristik', 'Terraristik', 
      'Tierfutter', 'Tierzubehör'
    ]
  },
  { 
    id: 'leisure-hobby', 
    name: 'Freizeit & Hobby', 
    icon: 'basketball-outline',
    subcategories: [
      'Sport & Fitness', 'Outdoor & Camping', 'Spiele & Brettspiele', 
      'Sammeln & Raritäten', 'Modellbau', 'Events & Aktivitäten', 
      'Kunst & Basteln', 'Fahrräder'
    ]
  },
  { 
    id: 'music-media', 
    name: 'Musik & Medien', 
    icon: 'musical-notes-outline',
    subcategories: [
      'Bücher', 'Filme & DVDs', 'Musik & CDs', 
      'Musikinstrumente', 'Games', 'Vinyl', 
      'Noten & Musikzubehör', 'Hörbücher'
    ]
  },
  { 
    id: 'jobs-services', 
    name: 'Jobs & Dienstleistungen', 
    icon: 'briefcase-outline',
    subcategories: [
      'Jobangebote', 'Nebenjobs & Minijobs', 'Dienstleistungen privat', 
      'Handwerk & Bau', 'Reinigung & Haushalt', 'Umzug & Transport', 
      'Coaching & Unterricht', 'Beauty & Wellness Services'
    ]
  },
  { 
    id: 'business', 
    name: 'Business & Gewerbe', 
    icon: 'business-outline',
    subcategories: [
      'Büroausstattung', 'Maschinen & Industrie', 'Ladeneinrichtung', 
      'Gastronomie & Küche', 'Computer & IT', 'Großhandelsposten', 
      'Werkzeuge', 'Verpackung & Versand'
    ]
  },
  { 
    id: 'free-exchange', 
    name: 'Verschenken / Tauschen', 
    icon: 'gift-outline',
    subcategories: [
      'Zu verschenken', 'Tauschangebote', 'Möbel', 
      'Kleidung', 'Bücher & Medien', 'Baby & Kinder', 
      'Haushaltsartikel', 'Sonstiges'
    ]
  },
];

export default function VideoEditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const videoRef = useRef<Video>(null);
  
  // Video State
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  
  // UI State
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const [isForMarket, setIsForMarket] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  
  // Market Form State
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleMusicPress = () => {
    router.push({
      pathname: '/simple-music-picker',
      params: { videoUri: params.videoUri }
    });
  };

  const handleUpload = async () => {
    if (isForMarket && (!selectedLocation || !selectedCategory || !selectedSubcategory || !description)) {
      Alert.alert('Fehlende Daten', 'Bitte fülle alle Market-Felder aus (Stadt, Kategorie, Unterkategorie, Beschreibung)');
      return;
    }

    setUploading(true);
    
    // Simulate upload with progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setUploading(false);
    Alert.alert('Erfolg!', 'Video wurde hochgeladen');
    router.push('/(tabs)');
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Video Background */}
      <Video
        ref={videoRef}
        source={{ uri: params.videoUri as string }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isPlaying}
        isLooping
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
            setPosition(status.positionMillis || 0);
          }
        }}
      />
      
      {/* Overlay */}
      <View style={styles.overlay} />

      {/* Top: Sound Panel - ALWAYS VISIBLE */}
      <View style={styles.topPanel}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.soundPanel} onPress={handleMusicPress}>
          <BlurView intensity={30} style={styles.soundBlur}>
            <Ionicons name="musical-notes" size={20} color="#FFFFFF" />
            <Text style={styles.soundText}>
              {selectedMusic || 'Sound hinzufügen'}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </BlurView>
        </TouchableOpacity>

        {/* Market Toggle - RIGHT BELOW SOUND */}
        <TouchableOpacity
          style={[styles.marketToggle, isForMarket && styles.marketToggleActive]}
          onPress={() => setIsForMarket(!isForMarket)}
        >
          <BlurView intensity={20} style={styles.marketToggleBlur}>
            <Ionicons 
              name="pricetag" 
              size={20} 
              color={isForMarket ? '#00D9FF' : '#FFFFFF'} 
            />
            <Text style={[styles.marketText, isForMarket && styles.marketTextActive]}>
              Für Market anwenden
            </Text>
            <View style={[styles.checkbox, isForMarket && styles.checkboxActive]}>
              {isForMarket && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
            </View>
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Market Form - Shows when isForMarket = true */}
      {isForMarket && (
        <ScrollView 
          style={styles.marketForm} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BlurView intensity={40} style={styles.formBlur}>
            {/* Location - Step 1 */}
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>1. Stadt wählen (Pflicht)</Text>
              <LocationAutocomplete
                onSelect={(location) => {
                  setSelectedLocation(location);
                  console.log('📍 Standort gewählt:', location);
                }}
                placeholder="Stadt suchen (z.B. Berlin, Hamburg, Istanbul)..."
                initialValue={selectedLocation}
              />
              {selectedLocation && (
                <Text style={styles.locationHint}>
                  📍 {selectedLocation.displayName}
                </Text>
              )}
            </View>

            {/* Category - Step 2 (only if location selected) */}
            {selectedLocation && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>2. Kategorie wählen</Text>
                <View style={styles.categoryList}>
                  {MARKET_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryTextButton}
                      onPress={() => {
                        setSelectedCategory(cat.id);
                        setSelectedSubcategory(null);
                      }}
                    >
                      <Text style={[
                        styles.categorySimpleText,
                        selectedCategory === cat.id && styles.categoryTextActive
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Subcategory - Step 3 (only if category selected) */}
            {selectedCategory && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>3. Unterkategorie wählen</Text>
                <View style={styles.categoryList}>
                  {MARKET_CATEGORIES.find(cat => cat.id === selectedCategory)?.subcategories.map((sub, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.categoryTextButton}
                      onPress={() => setSelectedSubcategory(sub)}
                    >
                      <Text style={[
                        styles.categorySimpleText,
                        selectedSubcategory === sub && styles.categoryTextActive
                      ]}>
                        {sub}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Description - Step 4 (only if subcategory selected) */}
            {selectedSubcategory && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>4. Beschreibung</Text>
                <TextInput
                  style={styles.descriptionInput}
                  placeholder="Beschreibe dein Produkt..."
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  maxLength={2000}
                />
                <Text style={styles.charCount}>{description.length}/2000</Text>
              </View>
            )}
          </BlurView>
        </ScrollView>
      )}

      {/* Right Toolbar - TikTok Style */}
      <View style={styles.rightToolbar}>
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              selectedTool === tool.id && styles.toolButtonActive
            ]}
            onPress={() => setSelectedTool(tool.id === selectedTool ? null : tool.id)}
          >
            <BlurView intensity={20} style={styles.toolBlur}>
              <Ionicons 
                name={tool.icon as any} 
                size={22} 
                color={selectedTool === tool.id ? '#00D9FF' : '#FFFFFF'} 
              />
            </BlurView>
            <Text style={styles.toolLabel}>{tool.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Timeline + Buttons */}
      <View style={styles.bottomPanel}>
        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineTrack}>
            <View style={[styles.timelineProgress, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.timeText}>
            {Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.storyButton}>
            <BlurView intensity={20} style={styles.storyBlur}>
              <View style={styles.storyAvatar} />
              <Text style={styles.storyText}>Deine Story</Text>
            </BlurView>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleUpload}>
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

      {/* Upload Progress Overlay */}
      {uploading && (
        <View style={styles.uploadOverlay}>
          <BlurView intensity={90} style={styles.uploadBlur}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.uploadTitle}>Video wird hochgeladen</Text>
            <Text style={styles.uploadPercent}>{uploadProgress}%</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
            
            <Text style={styles.uploadHint}>Bitte warten...</Text>
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
  
  // Top Panel
  topPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 101,
  },
  soundPanel: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  soundBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  soundText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  
  // Market Toggle
  marketToggle: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  marketToggleActive: {
    borderWidth: 2,
    borderColor: '#00D9FF',
  },
  marketToggleBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  marketText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  marketTextActive: {
    color: '#00D9FF',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: '#00D9FF',
    borderColor: '#00D9FF',
  },
  
  // Market Form
  marketForm: {
    position: 'absolute',
    top: 220,
    left: 16,
    right: 16,
    maxHeight: SCREEN_HEIGHT - 400,
    zIndex: 99,
  },
  formBlur: {
    borderRadius: 16,
    padding: 16,
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  locationHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  categoryList: {
    gap: 0,
  },
  categoryTextButton: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categorySimpleText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  categoryTextActive: {
    color: '#00D9FF',
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Right Toolbar
  rightToolbar: {
    position: 'absolute',
    right: 16,
    bottom: 200,
    gap: 16,
    zIndex: 98,
  },
  toolButton: {
    alignItems: 'center',
    gap: 4,
  },
  toolButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  toolBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toolLabel: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  
  // Bottom Panel
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 40,
    zIndex: 97,
  },
  timeline: {
    marginBottom: 16,
  },
  timelineTrack: {
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  storyButton: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
  storyBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  storyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00D9FF',
  },
  storyText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  nextButton: {
    flex: 1.2,
    borderRadius: 28,
    overflow: 'hidden',
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
  },
  
  // Upload Overlay
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
  },
  uploadBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 24,
  },
  uploadPercent: {
    color: '#00D9FF',
    fontSize: 48,
    fontWeight: '800',
    marginTop: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00D9FF',
  },
  uploadHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 16,
  },
});
