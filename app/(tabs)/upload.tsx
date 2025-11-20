/**
 * UPLOAD SCREEN - Video hochladen (Apple Style)
 * 
 * Modern Apple-Style mit Glassmorphism, vielen Icons und schönen Animationen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { Typography, PrimaryButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Hauptkategorien mit Unterkategorien für Market
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

export default function UploadScreen() {
  const router = useRouter();
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isForMarket, setIsForMarket] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const pickVideo = async () => {
    // Berechtigungen anfragen
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Berechtigung erforderlich', 'Bitte erlaube den Zugriff auf deine Galerie, um Videos auszuwählen.');
      return;
    }

    // Video aus Galerie wählen
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 60, // Max 60 Sekunden
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Prüfe Video-Dauer (falls verfügbar)
      if (asset.duration && asset.duration > 60000) { // 60000ms = 60 Sekunden
        Alert.alert(
          'Video zu lang', 
          'Dein Video darf maximal 60 Sekunden lang sein. Bitte schneide es kürzer.'
        );
        return;
      }
      
      setVideoUri(asset.uri);
      console.log('Video ausgewählt:', asset.uri, 'Dauer:', asset.duration, 'Größe:', asset.fileSize);
    }
  };

  const uploadVideo = async () => {
    if (!videoUri) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Video aus.');
      return;
    }

    setUploading(true);
    setUploadProgress('Video wird vorbereitet...');

    try {
      console.log('🎬 Starte Upload...', videoUri);
      
      // Video-Datei vorbereiten
      const videoName = `video_${Date.now()}.mp4`;
      
      setUploadProgress('Video wird hochgeladen...');
      
      // Verwende fetch mit arrayBuffer für React Native Kompatibilität
      const response = await fetch(videoUri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      const originalSize = uint8Array.length;
      console.log('📦 Video Größe:', (originalSize / 1024 / 1024).toFixed(2), 'MB');

      // Wenn Video größer als 50 MB, informiere User
      if (originalSize > 50 * 1024 * 1024) {
        setUploadProgress(`Großes Video (${(originalSize / 1024 / 1024).toFixed(0)} MB) - Upload läuft...`);
      }

      // Upload zu Supabase Storage mit Uint8Array
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('videos')
        .upload(videoName, uint8Array, {
          contentType: 'video/mp4',
          upsert: false,
        });

      if (uploadError) {
        console.error('❌ Storage Upload Fehler:', uploadError);
        throw uploadError;
      }

      console.log('✅ Upload erfolgreich:', uploadData);
      setUploadProgress('Video wird in Datenbank gespeichert...');

      // Public URL vom hochgeladenen Video
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(videoName);

      console.log('🔗 Public URL:', publicUrl);

      // Video-Eintrag in Datenbank erstellen
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          video_url: publicUrl,
          thumbnail_url: publicUrl,
          description: description,
          visibility: visibility,
          duration: 0,
          is_market_item: isForMarket,
          market_category: isForMarket ? selectedCategory : null,
          market_subcategory: isForMarket ? selectedSubcategory : null,
        })
        .select()
        .single();

      if (dbError) {
        console.error('❌ Datenbank Fehler:', dbError);
        throw dbError;
      }

      console.log('✅ Video in Datenbank gespeichert:', videoData);

      setUploadProgress('Fertig!');

      // Formular zurücksetzen
      setVideoUri(null);
      setDescription('');
      setVisibility('public');
      setIsForMarket(false);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      
      // Direkt zur Startseite wechseln (OHNE Bestätigung)
      router.push('/(tabs)/feed');

    } catch (error: any) {
      console.error('Upload-Fehler:', error);
      Alert.alert('Upload fehlgeschlagen', error.message || 'Ein Fehler ist aufgetreten.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Modern Apple Style */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Typography variant="h2" style={styles.headerTitle}>Video erstellen</Typography>
          <Typography variant="caption" style={styles.headerSubtitle}>
            Teile deine Kreativität mit der Welt
          </Typography>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Upload Bereich mit großen Icons */}
        <View style={styles.uploadSection}>
          {uploading ? (
            <View style={styles.uploadCard}>
              <View style={styles.uploadingContent}>
                <View style={styles.uploadIconContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                </View>
                <Typography variant="h3" align="center" style={styles.uploadingTitle}>
                  {uploadProgress || 'Video wird hochgeladen...'}
                </Typography>
                <Typography variant="caption" align="center" style={styles.uploadingSubtitle}>
                  Bitte nicht schließen
                </Typography>
                
                {/* Progress Icons */}
                <View style={styles.progressIcons}>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="cloud-upload" size={24} color={Colors.primary} />
                    <Typography variant="caption" style={styles.progressText}>Upload</Typography>
                  </View>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="film" size={24} color="rgba(255,255,255,0.5)" />
                    <Typography variant="caption" style={styles.progressText}>Verarbeiten</Typography>
                  </View>
                  <View style={styles.progressIconItem}>
                    <Ionicons name="checkmark-circle" size={24} color="rgba(255,255,255,0.5)" />
                    <Typography variant="caption" style={styles.progressText}>Fertig</Typography>
                  </View>
                </View>
              </View>
            </View>
          ) : videoUri ? (
            <View style={styles.uploadCard}>
              <View style={styles.videoPreview}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Typography variant="h3" align="center" style={styles.videoSelectedTitle}>
                  Video ausgewählt ✓
                </Typography>
                <TouchableOpacity style={styles.changeVideoButton} onPress={pickVideo}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Typography variant="body" style={styles.changeVideoText}>
                    Anderes Video wählen
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={pickVideo} activeOpacity={0.8}>
              <View style={styles.uploadCard}>
                <View style={styles.uploadEmptyContent}>
                  <View style={styles.uploadIconCircle}>
                    <Ionicons name="cloud-upload-outline" size={48} color="#FFFFFF" />
                  </View>
                  <Typography variant="h3" align="center" style={styles.uploadTitle}>
                    Video auswählen
                  </Typography>
                  <Typography variant="caption" align="center" style={styles.uploadSubtitle}>
                    Tippe hier, um dein Video hochzuladen
                  </Typography>
                  
                  {/* Feature Icons */}
                  <View style={styles.featureIcons}>
                    <View style={styles.featureItem}>
                      <Ionicons name="time-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>Max 60s</Typography>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="videocam-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>HD Qualität</Typography>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="musical-notes-outline" size={20} color={Colors.primary} />
                      <Typography variant="caption" style={styles.featureText}>Mit Sound</Typography>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions mit Icons */}
        <View style={styles.quickActions}>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard} onPress={pickVideo}>
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="images-outline" size={26} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionLabel}>Galerie</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="camera-outline" size={26} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionLabel}>Kamera</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="cut-outline" size={26} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionLabel}>Schneiden</Typography>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.quickActionCard}>
              <View style={styles.quickActionIconCircle}>
                <Ionicons name="color-filter-outline" size={26} color="#FFFFFF" />
              </View>
              <Typography variant="caption" style={styles.quickActionLabel}>Filter</Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Market Kategorie */}
        <View style={styles.section}>
          <TouchableOpacity 
            onPress={() => setIsForMarket(!isForMarket)} 
            activeOpacity={0.7}
          >
            <View style={[
              styles.marketToggleCard,
              isForMarket && styles.marketToggleCardActive
            ]}>
              <View style={styles.marketToggleLeft}>
                <Ionicons name="pricetag-outline" size={24} color="#FFFFFF" />
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>
                    Für Market verwenden
                  </Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Zeige dein Video im Marketplace
                  </Typography>
                </View>
              </View>
              {isForMarket ? (
                <View style={styles.checkmarkCircleLarge}>
                  <Ionicons name="checkmark" size={24} color="#FFFFFF" />
                </View>
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
            </View>
          </TouchableOpacity>

          {/* Kategorien Auswahl */}
          {isForMarket && (
            <View style={styles.categoriesContainer}>
              <Typography variant="caption" style={styles.categoriesLabel}>
                Wähle eine Kategorie:
              </Typography>
              <View style={styles.categoriesGrid}>
                {MARKET_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.categoryCardActive
                    ]}
                    onPress={() => {
                      setSelectedCategory(category.id);
                      setSelectedSubcategory(null); // Reset subcategory when changing main category
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={category.icon as any} 
                      size={20} 
                      color={selectedCategory === category.id ? Colors.primary : '#FFFFFF'} 
                    />
                    <Typography 
                      variant="caption" 
                      style={
                        selectedCategory === category.id 
                          ? styles.categoryTextActive 
                          : styles.categoryText
                      }
                    >
                      {category.name}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Unterkategorien Auswahl */}
          {isForMarket && selectedCategory && (
            <View style={styles.categoriesContainer}>
              <Typography variant="caption" style={styles.categoriesLabel}>
                Wähle eine Unterkategorie:
              </Typography>
              <View style={styles.subcategoriesGrid}>
                {MARKET_CATEGORIES.find(cat => cat.id === selectedCategory)?.subcategories.map((subcategory, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.subcategoryChip,
                      selectedSubcategory === subcategory && styles.subcategoryChipActive
                    ]}
                    onPress={() => setSelectedSubcategory(subcategory)}
                    activeOpacity={0.7}
                  >
                    <Typography 
                      variant="caption" 
                      style={
                        selectedSubcategory === subcategory 
                          ? styles.subcategoryTextActive 
                          : styles.subcategoryText
                      }
                    >
                      {subcategory}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Beschreibung */}
        <View style={styles.section}>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.textArea}
              placeholder="Erzähl mehr über dein Video... 
Du kannst auch #hashtags und @mentions verwenden"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={6}
              maxLength={2000}
            />
            <View style={styles.inputFooter}>
              <View style={styles.inputIcons}>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="happy-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="at-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.inputIconButton}>
                  <Ionicons name="pricetag-outline" size={22} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              <Typography variant="caption" style={styles.charCount}>
                {description.length}/2000
              </Typography>
            </View>
          </View>
        </View>

        {/* Sichtbarkeit mit Icons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="eye-outline" size={22} color="#FFFFFF" />
            <Typography variant="h3" style={styles.sectionTitleInline}>Sichtbarkeit</Typography>
          </View>
          
          <TouchableOpacity onPress={() => setVisibility('public')} activeOpacity={0.7}>
            <View style={[
              styles.visibilityCard,
              visibility === 'public' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <Ionicons name="globe" size={24} color="#FFFFFF" />
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Öffentlich</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Jeder kann dein Video sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'public' && (
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisibility('friends')} activeOpacity={0.7}>
            <View style={[
              styles.visibilityCard,
              visibility === 'friends' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <Ionicons name="people" size={24} color="#FFFFFF" />
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Freunde</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Nur deine Freunde können es sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'friends' && (
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setVisibility('private')} activeOpacity={0.7}>
            <View style={[
              styles.visibilityCard,
              visibility === 'private' && styles.visibilityCardActive
            ]}>
              <View style={styles.visibilityLeft}>
                <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                <View>
                  <Typography variant="body" style={styles.visibilityTitle}>Privat</Typography>
                  <Typography variant="caption" style={styles.visibilitySubtitle}>
                    Nur du kannst es sehen
                  </Typography>
                </View>
              </View>
              {visibility === 'private' && (
                <View style={styles.checkmarkCircle}>
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Veröffentlichen Button */}
        <TouchableOpacity
          style={[
            styles.publishButton,
            (uploading || !videoUri) && styles.publishButtonDisabled
          ]}
          onPress={uploadVideo}
          disabled={uploading || !videoUri}
          activeOpacity={0.8}
        >
          <View style={styles.publishButtonContent}>
            {uploading ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Typography variant="h3" style={styles.publishButtonText}>
                  Wird hochgeladen...
                </Typography>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={24} color="#FFFFFF" />
                <Typography variant="h3" style={styles.publishButtonText}>
                  Veröffentlichen
                </Typography>
              </>
            )}
          </View>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 44,
    paddingBottom: 8,
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(20,20,20,0.95)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.15)',
  },
  headerContent: {
    gap: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  content: {
    flex: 1,
  },
  
  // Upload Section
  uploadSection: {
    padding: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  uploadCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadingContent: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  uploadIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadingTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  progressIcons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  progressIconItem: {
    alignItems: 'center',
    gap: 4,
  },
  progressText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },
  videoPreview: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  videoSelectedTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
  },
  changeVideoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  changeVideoText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  uploadEmptyContent: {
    padding: Spacing.sm,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  featureIcons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  featureItem: {
    alignItems: 'center',
    gap: 4,
  },
  featureText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },

  // Quick Actions
  quickActions: {
    padding: Spacing.xs,
    paddingTop: 0,
    marginBottom: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  quickActionIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  quickActionLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Sections
  section: {
    padding: Spacing.xs,
    paddingTop: 0,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  sectionTitleInline: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Market Toggle
  marketToggleCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  marketToggleCardActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  marketToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },

  // Categories
  categoriesContainer: {
    marginTop: 6,
  },
  categoriesLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    marginBottom: 6,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  categoryCardActive: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  categoryTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Subcategory Chips
  subcategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  subcategoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  subcategoryChipActive: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  subcategoryText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  subcategoryTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },

  // Input Card
  inputCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 10,
  },
  textArea: {
    color: '#FFFFFF',
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  inputIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  charCount: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
  },

  // Visibility Cards
  visibilityCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  visibilityCardActive: {
    backgroundColor: 'rgba(139,92,246,0.15)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  visibilityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  visibilityTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 1,
  },
  visibilitySubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
  },

  // Checkmark Circle (Apple-Style)
  checkmarkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  // Größerer Checkmark Circle für Market
  checkmarkCircleLarge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  // Unchecked Circle
  uncheckedCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },

  // Publish Button
  publishButton: {
    marginHorizontal: Spacing.xs,
    marginTop: 12,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  publishButtonDisabled: {
    opacity: 0.5,
  },
  publishButtonContent: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

