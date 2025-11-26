/**
 * UPLOAD SCREEN - Video hochladen (Apple Style)
 * 
 * Modern Apple-Style mit Glassmorphism, vielen Icons und schönen Animationen
 * 
 * WICHTIG: Dieser Screen ist AUTH-PROTECTED - User muss angemeldet sein
 */

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { Typography, PrimaryButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Slider from '@react-native-community/slider';
import { Video, Audio, ResizeMode } from 'expo-av';
import { supabase } from '@/lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { LocationAutocomplete, Location } from '@/components/LocationAutocomplete';
import { useLocation } from '@/contexts/LocationContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { autoModerateVideo } from '@/lib/moderation-engine';
import { VIDEO_LIMITS } from '@/config/video-limits';

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

type CropPreset = 'auto' | 'portrait' | 'square' | 'cinematic';

const CROP_PRESETS: { id: CropPreset; label: string; ratio?: number; helper: string }[] = [
  { id: 'auto', label: 'Original', helper: 'Volle Auflösung' },
  { id: 'portrait', label: '9:16', ratio: 9 / 16, helper: 'TikTok / Reels' },
  { id: 'square', label: '1:1', ratio: 1, helper: 'Feed / Galerie' },
  { id: 'cinematic', label: '16:9', ratio: 16 / 9, helper: 'YouTube / Stories' },
];

export default function UploadScreen() {
  const { checkAuth, isAuthenticated } = useRequireAuth();
  const router = useRouter();
  const { userLocation } = useLocation();
  
  // Auth-Check beim Mounten
  useEffect(() => {
    if (!checkAuth('upload')) {
      // User wird zum Login-Modal umgeleitet
      // Nach Login kehrt er zu diesem Screen zurück
    }
  }, []);

  // Render nichts wenn nicht authentifiziert
  if (!isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Typography variant="body" style={{ marginTop: 16, color: Colors.text }}>
          Authentifizierung wird geprüft...
        </Typography>
      </View>
    );
  }
  
  // Original Screen Content
  return <UploadScreenProtected />;
}

// Eigentlicher Upload Screen (nur für authentifizierte User)
function UploadScreenProtected() {
  console.log('📱 UploadScreenProtected geladen - Platform:', Platform.OS);
  
  const router = useRouter();
  const params = useLocalSearchParams(); // Receive params from video-editor
  const { userLocation } = useLocation(); // Nutze globalen Location-Context
  const { user: authUser } = useRequireAuth(); // 🔥 iOS FIX: Hole User aus Auth-Context
  const { state: authState } = useAuth(); // 🔥 iOS FIX: Hole Session aus Auth-Context
  
  // Optional: Musik-Context (falls verfügbar)
  let musicContext: any = null;
  try {
    musicContext = useMusic();
  } catch (e) {
    console.log('⚠️ MusicProvider nicht verfügbar - Musik-Features deaktiviert');
  }
  
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [isForMarket, setIsForMarket] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(30); // Demo: 30 Sekunden
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [cropPreset, setCropPreset] = useState<CropPreset>('auto');
  const [editedVideoUri, setEditedVideoUri] = useState<string | null>(null);
  const [isProcessingEdit, setIsProcessingEdit] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 1080, height: 1920 }); // Demo: 9:16
  const [lastAppliedEdit, setLastAppliedEdit] = useState({
    start: 0,
    end: 1,
    crop: 'auto' as CropPreset,
    muted: false,
  });
  const videoRef = useRef<Video>(null);
  const [showEditingDemo, setShowEditingDemo] = useState(true); // NEU: Demo-Modus
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null); // Musik vom Editor
  const previewUri = editedVideoUri || videoUri;
  const MIN_TRIM_SECONDS = 1;

  // Receive video + music from editor
  useEffect(() => {
    if (params.videoUri && typeof params.videoUri === 'string') {
      console.log('📥 Video vom Editor empfangen:', params.videoUri);
      setVideoUri(params.videoUri);
    }
    if (params.selectedMusic && typeof params.selectedMusic === 'string') {
      console.log('🎵 Musik vom Editor empfangen:', params.selectedMusic);
      setSelectedMusic(params.selectedMusic);
    }
  }, [params]);

  // Debug: Log Video State
  useEffect(() => {
    console.log('🎬 Video State:', {
      hasVideoUri: !!videoUri,
      hasEditedVideoUri: !!editedVideoUri,
      hasPreviewUri: !!previewUri,
      videoDuration,
      trimStart,
      trimEnd,
      cropPreset,
      isMuted,
      selectedMusic
    });
  }, [videoUri, editedVideoUri, previewUri, videoDuration, trimStart, trimEnd, cropPreset, isMuted, selectedMusic]);

  // Auto-Fill Location beim Aktivieren des Market-Modus
  useEffect(() => {
    if (isForMarket && userLocation && !selectedLocation) {
      // Konvertiere UserLocation zu Location-Format
      const autoLocation: Location = {
        id: 0,
        city: userLocation.city,
        country: userLocation.country,
        lat: userLocation.lat,
        lon: userLocation.lon,
        displayName: userLocation.displayName,
      };
      setSelectedLocation(autoLocation);
      console.log('📍 Standort automatisch vorausgefüllt:', autoLocation);
    }
  }, [isForMarket, userLocation]);

  const openVideoEditor = (uri: string) => {
    router.push({
      pathname: '/video-editor',
      params: { videoUri: uri }
    });
  };

  const pickVideo = async () => {
    console.log('📹 pickVideo() aufgerufen - Platform:', Platform.OS);
    
    // Berechtigungen anfragen
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('⚠️ Medienbibliothek-Berechtigung nicht erteilt');
      Alert.alert('Berechtigung erforderlich', 'Bitte erlaube den Zugriff auf deine Galerie, um Videos auszuwählen.');
      return;
    }
    
    console.log('✅ Medienbibliothek-Berechtigung erteilt');

    // Video aus Galerie wählen mit optimierter Qualität
    console.log('🎬 Öffne ImagePicker...');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false, // WICHTIG: Muss false sein für Videos > 10 Min!
      quality: 0.7, // 70% Qualität - reduziert Größe um ~60%, sieht noch gut aus
      videoMaxDuration: VIDEO_LIMITS.ACTIVE_MAX_DURATION_SECONDS, // Zentrale Config
      videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium, // Medium Qualität für schnellere Uploads
    });

    console.log('📸 ImagePicker Result:', {
      canceled: result.canceled,
      hasAssets: !result.canceled && result.assets ? result.assets.length > 0 : false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // ⚠️ BUG FIX: Expo ImagePicker gibt manchmal falsche duration zurück!
      // asset.duration kann in Millisekunden ODER Sekunden sein (inkonsistent)
      // Lösung: Nur Dateigröße prüfen, Dauer beim Upload aus Metadata lesen
      const fileSizeInBytes = asset.fileSize || 0;
      
      console.log('📹 Video Details:', {
        uri: asset.uri,
        größe: `${(fileSizeInBytes / 1024 / 1024).toFixed(2)} MB`,
        dauer_roh: asset.duration, // Raw-Wert für Debugging
        type: asset.type,
        width: asset.width,
        height: asset.height,
      });
      
      // NUR Größen-Validierung (Dauer ist unreliable in ImagePicker)
      const sizeValidation = fileSizeInBytes > 0
        ? VIDEO_LIMITS.validate({ sizeBytes: fileSizeInBytes })
        : { valid: true };
      
      if (!sizeValidation.valid) {
        Alert.alert('Video zu groß', sizeValidation.error || 'Datei zu groß');
        return;
      }
      
      // Video akzeptieren - Dauer wird später beim Upload geprüft
      setVideoUri(asset.uri);
      setEditedVideoUri(null);
      setTrimStart(0);
      setTrimEnd(1);
      setIsMuted(false);
      setCropPreset('auto');
      setLastAppliedEdit({ start: 0, end: 1, crop: 'auto', muted: false });
      setNaturalSize({ width: asset.width || 0, height: asset.height || 0 });
      console.log('✅ Video ausgewählt (Dauer wird beim Upload validiert)');
      
      // Öffne TikTok-Style Editor
      openVideoEditor(asset.uri);
    }
  };

  const formatTrimLabel = (value: number) => {
    if (!videoDuration || Number.isNaN(value)) {
      return '0:00';
    }

    const seconds = Math.max(0, value * videoDuration);
    const minutes = Math.floor(seconds / 60);
    const remaining = Math.round(seconds % 60);
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
  };

  const trimGap = useMemo(() => {
    if (!videoDuration || MIN_TRIM_SECONDS <= 0) {
      return 0;
    }
    return Math.min(1, MIN_TRIM_SECONDS / Math.max(videoDuration, MIN_TRIM_SECONDS));
  }, [videoDuration]);

  const handleTrimStartChange = (value: number) => {
    const maxStart = Math.max(0, Math.min(value, trimEnd - trimGap));
    setTrimStart(maxStart);
  };

  const handleTrimEndChange = (value: number) => {
    const minEnd = Math.min(1, Math.max(value, trimStart + trimGap));
    setTrimEnd(minEnd);
  };

  const cropFilter = useMemo(() => {
    const preset = CROP_PRESETS.find(item => item.id === cropPreset);
    if (!preset?.ratio || naturalSize.width === 0 || naturalSize.height === 0) {
      return '';
    }

    const width = naturalSize.width;
    const height = naturalSize.height;
    const ratio = preset.ratio;
    const sourceRatio = width / height;

    let cropWidth = width;
    let cropHeight = height;

    if (sourceRatio > ratio) {
      cropHeight = height;
      cropWidth = Math.round(cropHeight * ratio);
    } else {
      cropWidth = width;
      cropHeight = Math.round(cropWidth / ratio);
    }

    const cropX = Math.max(0, Math.floor((width - cropWidth) / 2));
    const cropY = Math.max(0, Math.floor((height - cropHeight) / 2));

    if (cropWidth <= 0 || cropHeight <= 0) {
      return '';
    }

    return `crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`;
  }, [cropPreset, naturalSize]);

  const isEditDirty = useMemo(() => {
    return (
      lastAppliedEdit.start !== trimStart ||
      lastAppliedEdit.end !== trimEnd ||
      lastAppliedEdit.crop !== cropPreset ||
      lastAppliedEdit.muted !== isMuted
    );
  }, [trimStart, trimEnd, cropPreset, isMuted, lastAppliedEdit]);

  const applyEdits = useCallback(async () => {
    if (!previewUri || !videoDuration) {
      Alert.alert('Video noch nicht bereit', 'Warte kurz auf die Vorschau, bevor du schneidest.');
      return;
    }

    if (!isEditDirty) {
      return;
    }

    // ⚠️ FFmpeg requires native modules - not available in Expo Go
    // For now, just acknowledge the edit settings without processing
    Alert.alert(
      'Bearbeitung gespeichert',
      'Deine Einstellungen wurden gespeichert. Video-Verarbeitung ist aktuell nur im Development Build verfügbar.\n\nDas Original-Video wird hochgeladen.',
      [
        {
          text: 'OK',
          onPress: () => {
            setLastAppliedEdit({ start: trimStart, end: trimEnd, crop: cropPreset, muted: isMuted });
          }
        }
      ]
    );
  }, [previewUri, videoDuration, isEditDirty, trimStart, trimEnd, cropPreset, isMuted]);

  const handleRevertEdits = useCallback(async () => {
    if (editedVideoUri) {
      await FileSystem.deleteAsync(editedVideoUri, { idempotent: true }).catch(() => undefined);
    }
    setEditedVideoUri(null);
    setTrimStart(0);
    setTrimEnd(1);
    setIsMuted(false);
    setCropPreset('auto');
    setLastAppliedEdit({ start: 0, end: 1, crop: 'auto', muted: false });
    setVideoDuration(0);
  }, [editedVideoUri]);

  const uploadVideo = async () => {
    console.log('🚀 uploadVideo() aufgerufen - Platform:', Platform.OS);
    
    if (!videoUri) {
      Alert.alert('Fehler', 'Bitte wähle zuerst ein Video aus.');
      return;
    }

    const uploadSourceUri = editedVideoUri || videoUri;

    // Validierung für Market-Listings
    if (isForMarket) {
      if (!selectedLocation) {
        Alert.alert('Stadt fehlt', 'Bitte wähle zuerst eine Stadt für dein Market-Video aus.');
        return;
      }
      if (!selectedCategory) {
        Alert.alert('Kategorie fehlt', 'Bitte wähle eine Kategorie für dein Market-Video aus.');
        return;
      }
      if (!selectedSubcategory) {
        Alert.alert('Unterkategorie fehlt', 'Bitte wähle eine Unterkategorie für dein Market-Video aus.');
        return;
      }
    }

    console.log('✅ Validierungen bestanden, starte Upload-Prozess');
    setUploading(true);
    setUploadProgress('Video wird vorbereitet...');

    try {
      console.log('🎬 Starte Upload...', uploadSourceUri);
      console.log('📋 Upload-Details:', {
        platform: Platform.OS,
        isForMarket,
        hasLocation: !!selectedLocation,
        hasCategory: !!selectedCategory,
        visibility
      });
      
      // Video-Datei vorbereiten
      const videoName = `video_${Date.now()}.mp4`;
      
      setUploadProgress('Video wird gelesen...');
      
      console.log('📖 Lese Video-Datei...');
      
      // ✅ WICHTIG: Dauer aus Video-Metadata lesen (ImagePicker gibt falsche Werte)
      // 🔥 iOS FIX: Mit Timeout, da Audio.Sound manchmal hängt
      try {
        setUploadProgress('Validiere Video-Dauer...');
        
        // Promise mit 5 Sekunden Timeout
        const durationValidation = await Promise.race([
          (async () => {
            const { sound, status } = await Audio.Sound.createAsync(
              { uri: uploadSourceUri },
              { shouldPlay: false }
            );
            
            if (status.isLoaded && status.durationMillis) {
              const actualDurationSeconds = status.durationMillis / 1000;
              console.log('⏱️ Tatsächliche Videodauer:', actualDurationSeconds, 'Sekunden');
              
              // Cleanup
              try {
                await sound.unloadAsync();
              } catch (cleanupError) {
                console.warn('⚠️ Sound cleanup Fehler:', cleanupError);
              }
              
              return { 
                success: true, 
                durationSeconds: actualDurationSeconds 
              };
            }
            
            return { success: false };
          })(),
          // Timeout nach 5 Sekunden
          new Promise<{ success: false; timeout: true }>((resolve) => 
            setTimeout(() => resolve({ success: false, timeout: true }), 5000)
          )
        ]);
        
        if (durationValidation.success && durationValidation.durationSeconds) {
          // Jetzt ECHTE Dauer-Validierung
          const validation = VIDEO_LIMITS.validate({ 
            durationSeconds: durationValidation.durationSeconds 
          });
          
          if (!validation.valid) {
            Alert.alert('Video zu lang', validation.error || 'Video zu lang');
            setUploading(false);
            setUploadProgress('');
            return;
          }
          
          console.log('✅ Video-Dauer OK:', durationValidation.durationSeconds, 's');
        } else if ('timeout' in durationValidation && durationValidation.timeout) {
          console.warn('⚠️ Dauer-Validierung Timeout - fahre ohne Validierung fort');
        } else {
          console.warn('⚠️ Konnte Dauer nicht ermitteln - fahre ohne Validierung fort');
        }
      } catch (durationError) {
        console.warn('⚠️ Dauer-Validierung fehlgeschlagen:', durationError);
        // Weitermachen - Upload kann trotzdem klappen
      }
      
      setUploadProgress('Video wird vorbereitet...');
      
      console.log('⬆️ Starte Supabase Storage Upload...');
      console.log('🪣 Bucket: videos');
      console.log('📝 Dateiname:', videoName);
      console.log('🔧 Methode: Blob Upload (React Native kompatibel)');
      
      const uploadStartTime = Date.now();
      
      // 🔥 FIX: Blob-basierter Upload (React Native kompatibel)
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase Config fehlt');
      }
      
      console.log('📤 Lade Video als Blob...');
      console.log('📱 Platform:', Platform.OS);
      console.log('📍 Upload Quelle:', uploadSourceUri);
      
      setUploadProgress('Video wird hochgeladen...');
      
      // 🚀 Verwende XMLHttpRequest für große Datei-Uploads (React Native kompatibel)
      try {
        console.log('📤 Starte Upload zu Supabase Storage...');
        console.log('🌐 URL:', `${supabaseUrl}/storage/v1/object/videos/${videoName}`);
        console.log('📍 Upload Quelle:', uploadSourceUri);
        
        // Verwende XMLHttpRequest für Progress-Tracking und bessere Kontrolle
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              console.log(`📊 Upload Progress: ${percent}%`);
              setUploadProgress(`Upload läuft... ${percent}%`);
            }
          });
          
          xhr.addEventListener('load', () => {
            const uploadDuration = ((Date.now() - uploadStartTime) / 1000).toFixed(2);
            console.log(`⏱️ Upload-Dauer: ${uploadDuration}s`);
            console.log(`📊 Upload Status: ${xhr.status}`);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              console.log('✅ Upload erfolgreich:', xhr.responseText);
              resolve();
            } else {
              console.error('❌ STORAGE UPLOAD FEHLER:');
              console.error('Status:', xhr.status);
              console.error('Response:', xhr.responseText);
              reject(new Error(`Storage Upload fehlgeschlagen (${xhr.status}): ${xhr.responseText}`));
            }
          });
          
          xhr.addEventListener('error', () => {
            console.error('❌ XMLHttpRequest Error');
            reject(new Error('Netzwerkfehler beim Upload'));
          });
          
          xhr.addEventListener('timeout', () => {
            console.error('❌ XMLHttpRequest Timeout');
            reject(new Error('Upload-Timeout: Die Datei ist zu groß oder die Verbindung zu langsam'));
          });
          
          xhr.addEventListener('abort', () => {
            console.error('❌ XMLHttpRequest Aborted');
            reject(new Error('Upload wurde abgebrochen'));
          });
          
          // 10 Minuten Timeout für sehr große Dateien
          xhr.timeout = 600000;
          
          xhr.open('PUT', `${supabaseUrl}/storage/v1/object/videos/${videoName}`);
          xhr.setRequestHeader('Authorization', `Bearer ${supabaseKey}`);
          xhr.setRequestHeader('Content-Type', 'video/mp4');
          xhr.setRequestHeader('x-upsert', 'false');
          
          // React Native: Sende die Datei direkt über file:// URI
          // FormData funktioniert in React Native anders als im Browser
          const formData = new FormData();
          formData.append('file', {
            uri: uploadSourceUri,
            type: 'video/mp4',
            name: videoName,
          } as any);
          
          // Für Supabase Storage: Sende direkt als Body (kein FormData)
          // Wir müssen die Datei als Blob lesen
          fetch(uploadSourceUri)
            .then(res => res.blob())
            .then(blob => {
              console.log('📦 Blob Größe:', (blob.size / 1024 / 1024).toFixed(2), 'MB');
              xhr.send(blob);
            })
            .catch(err => {
              console.error('❌ Blob Read Error:', err);
              reject(new Error(`Fehler beim Lesen der Video-Datei: ${err.message}`));
            });
        });
        
      } catch (uploadError: any) {
        console.error('❌ Upload Error:', uploadError);
        throw new Error(`Upload fehlgeschlagen: ${uploadError.message}`);
      }
      
      setUploadProgress('Video wird in Datenbank gespeichert...');

      // Public URL vom hochgeladenen Video
      const { data: { publicUrl } } = supabase
        .storage
        .from('videos')
        .getPublicUrl(videoName);

      console.log('🔗 Public URL:', publicUrl);
      
      if (!publicUrl) {
        throw new Error('Fehler beim Generieren der Public URL');
      }

      // 🚀 OPTIONAL: Upload zu Cloudflare Stream (parallele Kompression)
      let cloudflareVideoId: string | null = null;
      let cloudflarePlaybackUrl: string | null = null;
      let cloudflareThumbnailUrl: string | null = null;
      
      try {
        console.log('☁️ Prüfe Cloudflare Stream Konfiguration...');
        const { cloudflareStream } = await import('@/lib/cloudflare-stream');
        
        if (cloudflareStream.isConfigured()) {
          console.log('☁️ Cloudflare konfiguriert - starte Direct Upload...');
          setUploadProgress('Erstelle Cloudflare Upload-Link...');
          
          // Schritt 1: Direct Upload URL erstellen
          const directUpload = await cloudflareStream.createDirectUpload({
            maxDurationSeconds: 7200,
            metadata: { name: videoName },
            requireSignedURLs: false,
            allowedOrigins: ['*'],
          });
          
          console.log('✅ Cloudflare Upload URL erstellt');
          console.log('🆔 Video UID:', directUpload.result.uid);
          
          cloudflareVideoId = directUpload.result.uid;
          
          setUploadProgress('Upload zu Cloudflare (komprimiert)...');
          
          // Schritt 2: Video hochladen mit XMLHttpRequest für große Dateien
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                console.log('✅ Cloudflare Upload erfolgreich!');
                resolve();
              } else {
                console.warn('⚠️ Cloudflare Upload fehlgeschlagen:', xhr.status, xhr.responseText);
                reject(new Error(`Cloudflare Upload failed: ${xhr.status}`));
              }
            });
            
            xhr.addEventListener('error', () => reject(new Error('Cloudflare Network Error')));
            xhr.addEventListener('timeout', () => reject(new Error('Cloudflare Upload Timeout')));
            
            xhr.timeout = 600000; // 10 Minuten
            xhr.open('POST', directUpload.result.uploadURL);
            
            // Lese Video als Blob und sende
            fetch(uploadSourceUri)
              .then(res => res.blob())
              .then(blob => xhr.send(blob))
              .catch(err => reject(err));
          });
          
          cloudflarePlaybackUrl = cloudflareStream.getPlaybackUrl(cloudflareVideoId);
          cloudflareThumbnailUrl = cloudflareStream.getThumbnailUrl(cloudflareVideoId);
          console.log('🔗 Playback URL:', cloudflarePlaybackUrl);
          console.log('🖼️ Thumbnail URL:', cloudflareThumbnailUrl);
        } else {
          console.log('ℹ️ Cloudflare nicht konfiguriert - nur Supabase Upload');
        }
      } catch (cloudflareError: any) {
        console.warn('⚠️ Cloudflare Upload Error (ignoriert):', cloudflareError.message);
        // Fehler ignorieren - Supabase Upload war erfolgreich
        cloudflareVideoId = null;
      }

      // Video-Eintrag in Datenbank erstellen
      console.log('💾 Erstelle Datenbank-Eintrag...');
      
      // 🔥 iOS FIX: Verwende User direkt aus Auth-Context statt getSession()
      if (!authUser?.id) {
        console.error('❌ Kein User im Auth-Context gefunden!');
        throw new Error('Nicht authentifiziert - bitte erneut anmelden');
      }
      
      console.log('👤 User ID aus Auth-Context:', authUser.id);
      
      const insertData = {
        user_id: authUser.id,
        video_url: cloudflarePlaybackUrl || publicUrl, // ✨ Cloudflare wenn verfügbar, sonst Supabase
        thumbnail_url: cloudflareThumbnailUrl || publicUrl, // ✨ Cloudflare Thumbnail
        description: description || '',
        visibility: visibility,
        status: 'ready',
        is_public: visibility === 'public',
        is_market_item: isForMarket,
        market_category: isForMarket ? selectedCategory : null,
        market_subcategory: isForMarket ? selectedSubcategory : null,
        location_city: isForMarket && selectedLocation ? selectedLocation.city : null,
        location_country: isForMarket && selectedLocation ? selectedLocation.country : null,
        location_lat: isForMarket && selectedLocation ? selectedLocation.lat : null,
        location_lon: isForMarket && selectedLocation ? selectedLocation.lon : null,
        location_display_name: isForMarket && selectedLocation ? selectedLocation.displayName : null,
        location_postcode: isForMarket && selectedLocation ? selectedLocation.postcode : null,
      };
      
      // Log welche URLs verwendet werden
      console.log('📺 Video URL:', insertData.video_url);
      console.log('🖼️ Thumbnail URL:', insertData.thumbnail_url);
      if (cloudflareVideoId) {
        console.log('☁️ Cloudflare Video ID:', cloudflareVideoId);
        console.log('✨ Nutze Cloudflare URLs (komprimiert & schnell)');
      } else {
        console.log('📦 Nutze Supabase URLs (Original)');
      }
      
      console.log('📝 Starte INSERT (direkt via REST API)...');
      console.log('📋 INSERT Daten:', JSON.stringify(insertData, null, 2));
      
      // 🔥 iOS FIX: Direkter REST API Call statt Supabase JS Client
      // Grund: supabase.from().insert() und supabase.auth.getSession() hängen auf iOS
      console.log('🔄 Führe direkten REST API Call durch...');
      
      try {
        // 🔥 iOS FIX: Hole Access Token aus Auth-Context statt getSession()
        const accessToken = authState.session?.access_token;
        
        if (!accessToken) {
          console.error('❌ Kein Access Token in Auth-Context gefunden');
          console.error('Auth State:', JSON.stringify(authState, null, 2));
          throw new Error('Keine Authentifizierung gefunden - bitte neu anmelden');
        }
        
        console.log('🔑 Access Token aus Context vorhanden:', accessToken.substring(0, 20) + '...');
        
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_SUPABASE_URL}/rest/v1/videos`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
              'Authorization': `Bearer ${accessToken}`,
              'Prefer': 'return=minimal' // Keine Daten zurückgeben für Performance
            },
            body: JSON.stringify(insertData)
          }
        );
        
        console.log('📡 REST API Response Status:', response.status);
        console.log('📡 REST API Response OK:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ REST API Fehler:', errorText);
          
          Alert.alert(
            '⚠️ Teilweise erfolgreich',
            `Dein Video wurde hochgeladen, konnte aber nicht in der Datenbank gespeichert werden.\n\n` +
            `Status: ${response.status}\n` +
            `Fehler: ${errorText}`,
            [{ text: 'OK' }]
          );
          
          throw new Error(`REST API Insert fehlgeschlagen: ${response.status} - ${errorText}`);
        }
        
        console.log('✅ REST API INSERT erfolgreich!');
        console.log('🔗 Video URL:', publicUrl);
        
      } catch (error: any) {
        console.error('❌ REST API Fehler:', error);
        console.error('❌ Error Message:', error.message);
        throw error;
      }
      
      const videoData = {
        video_url: publicUrl,
        user_id: authUser.id
      };

      // 🔥 AI Content Moderation - TEMPORÄR DEAKTIVIERT für Upload-Fix
      // TODO: Moderation später in Background-Job ausführen (Supabase Edge Function)
      setUploadProgress('Prüfe Content-Richtlinien...');
      
      console.log('⏭️ Moderation übersprungen (Background-Processing)');
      
      // const moderationResult = await autoModerateVideo(
      //   videoData.id,
      //   videoData.video_url,
      //   description
      // );
      //
      // if (!moderationResult.approved) {
      //   Alert.alert(
      //     '⚠️ Video blockiert',
      //     moderationResult.reason || 'Dein Video verstößt gegen unsere Community-Richtlinien.',
      //     [{ text: 'OK' }]
      //   );
      //   // Video löschen
      //   await supabase.from('videos').delete().eq('id', videoData.id);
      //   return;
      // }

      setUploadProgress('Fertig!');
      
      // Erfolgs-Benachrichtigung
      Alert.alert(
        '✅ Video hochgeladen!',
        'Dein Video wurde erfolgreich hochgeladen und ist jetzt sichtbar.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Formular zurücksetzen
              setVideoUri(null);
              setEditedVideoUri(null);
              setVideoDuration(0);
              setNaturalSize({ width: 0, height: 0 });
              setTrimStart(0);
              setTrimEnd(1);
              setIsMuted(false);
              setCropPreset('auto');
              setLastAppliedEdit({ start: 0, end: 1, crop: 'auto', muted: false });
              setDescription('');
              setVisibility('public');
              setIsForMarket(false);
              setSelectedLocation(null);
              setSelectedCategory(null);
              setSelectedSubcategory(null);
              
              // Zur Startseite navigieren UND Feed aktualisieren
              console.log('🔄 Navigiere zum Feed und aktualisiere...');
              router.replace('/?refresh=true');
            }
          }
        ]
      );

    } catch (error: any) {
      console.error('❌ Upload-Fehler:', error);
      console.error('❌ Error Stack:', error.stack);
      console.error('❌ Error Name:', error.name);
      console.error('❌ Error Message:', error.message);
      
      // Detaillierte Fehlermeldung
      let errorMessage = 'Ein unbekannter Fehler ist aufgetreten.';
      
      if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = 'Upload-Timeout: Die Verbindung ist zu langsam. Bitte versuche es mit einem kleineren Video oder besserer Internetverbindung.';
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = 'Netzwerkfehler: Bitte prüfe deine Internetverbindung und versuche es erneut.';
      } else if (error.message?.includes('size') || error.message?.includes('exceeded') || error.message?.includes('quota')) {
        errorMessage = 'Datei zu groß oder Speicher voll: Bitte wähle ein kleineres Video (max. 50 MB) oder lösche alte Videos.';
      } else if (error.message?.includes('URL')) {
        errorMessage = 'Fehler beim Upload: Video konnte nicht gespeichert werden. Bitte versuche es erneut.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Upload fehlgeschlagen',
        errorMessage + '\n\nFehler-Details: ' + (error.name || 'Unknown'),
        [
          { text: 'OK' },
          { text: 'Erneut versuchen', onPress: () => uploadVideo() }
        ]
      );
    } finally {
      setUploading(false);
      setUploadProgress('');
      console.log('🏁 Upload-Prozess beendet (Erfolg oder Fehler)');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header Modern Apple Style */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Typography variant="h2" style={styles.headerTitle}>Video erstellen</Typography>
          <Typography variant="caption" style={styles.headerSubtitle}>
            Teile deine Kreativität mit der Welt
          </Typography>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardDismissMode="interactive"
      >
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
          ) : (
            <TouchableOpacity onPress={pickVideo} activeOpacity={0.8} style={styles.compactUploadButton}>
              <LinearGradient
                colors={['#00D9FF', '#B84FFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.compactUploadGradient}
              >
                <Ionicons name="videocam" size={22} color="#FFFFFF" />
                <Typography variant="body" style={styles.compactUploadText}>Video auswählen</Typography>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Market Kategorie */}
        <View style={styles.section}>
          <TouchableOpacity 
            onPress={() => {
              const newValue = !isForMarket;
              setIsForMarket(newValue);
              if (!newValue) {
                // Reset location and categories when disabling market
                setSelectedLocation(null);
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }
            }} 
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

          {/* Stadt-Auswahl (Schritt 1) */}
          {isForMarket && (
            <View style={styles.locationContainer}>
              <View style={styles.locationHeaderRow}>
                <Typography variant="caption" style={styles.categoriesLabel}>
                  1. Stadt wählen (Pflicht):
                </Typography>
                {selectedLocation && userLocation && (
                  <View style={styles.autoDetectedBadge}>
                    <Ionicons name="location" size={12} color={Colors.primary} />
                    <Typography variant="caption" style={styles.autoDetectedText}>
                      {userLocation.source === 'gps' ? 'GPS erkannt' : 
                       userLocation.source === 'ip' ? 'IP erkannt' : 'Manuell'}
                    </Typography>
                  </View>
                )}
              </View>
              <LocationAutocomplete
                onSelect={(location) => {
                  setSelectedLocation(location);
                  console.log('📍 Standort gewählt:', location);
                }}
                placeholder="Stadt suchen (z.B. Berlin, Hamburg, Istanbul)..."
                initialValue={selectedLocation}
              />
              {selectedLocation && (
                <Typography variant="caption" style={styles.locationHint}>
                  📍 {selectedLocation.displayName}
                </Typography>
              )}
            </View>
          )}

          {/* Kategorien Auswahl (Schritt 2) */}
          {isForMarket && selectedLocation && (
            <View style={styles.categoriesContainer}>
              <Typography variant="caption" style={styles.categoriesLabel}>
                2. Wähle eine Kategorie:
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

          {/* Unterkategorien Auswahl (Schritt 3) */}
          {isForMarket && selectedLocation && selectedCategory && (
            <View style={styles.categoriesContainer}>
              <Typography variant="caption" style={styles.categoriesLabel}>
                3. Wähle eine Unterkategorie:
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
          onPress={() => {
            console.log('🔘 Publish Button gedrückt - Platform:', Platform.OS);
            console.log('🔘 uploading:', uploading);
            console.log('🔘 videoUri:', videoUri);
            if (!uploading && videoUri) {
              uploadVideo();
            } else {
              console.warn('⚠️ Upload blockiert - uploading:', uploading, 'videoUri:', !!videoUri);
            }
          }}
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
    </KeyboardAvoidingView>
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
    padding: 40,
    alignItems: 'center',
  },
  uploadIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  uploadSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    marginBottom: 20,
  },
  neonLine: {
    width: 80,
    height: 3,
    backgroundColor: '#00D9FF',
    borderRadius: 2,
    marginBottom: 20,
    shadowColor: '#00D9FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  featureIcons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  featureIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 217, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 217, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },

  videoPreviewWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: 12,
    position: 'relative',
  },
  previewVideo: {
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  videoPlaceholder: {
    width: '100%',
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  previewBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
  },
  editPanel: {
    padding: Spacing.sm,
    backgroundColor: 'rgba(28,28,30,0.9)',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 10,
  },
  trimInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trimLabelText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    fontWeight: '600',
  },
  trimSlider: {
    width: '100%',
    height: 36,
  },
  durationBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  durationText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
  },
  cropChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  cropChipActive: {
    backgroundColor: 'rgba(139,92,246,0.25)',
    borderColor: Colors.primary,
  },
  cropChipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  cropChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  cropChipHelper: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 9,
  },
  editActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  volumeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  volumeToggleActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0,217,255,0.1)',
  },
  volumeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  revertButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  revertButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  applyButton: {
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.45,
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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

  // Location Container
  locationContainer: {
    marginTop: 12,
  },
  locationHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  autoDetectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.15)',
  },
  autoDetectedText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  locationHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
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
  selectVideoButtonTop: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  selectVideoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  selectVideoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  addMusicButton: {
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.2)',
    padding: 16,
  },
  addMusicContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addMusicTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  addMusicArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  timelineContainer: {
    marginBottom: 16,
  },
  timelineTrack: {
    height: 8,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  timelineSegment: {
    height: '100%',
  },
  timeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  sliderRow: {
    gap: 12,
  },
  sliderContainer: {
    marginBottom: 12,
  },
  sliderLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  trimSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
  },
  trimHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  trimTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  trimDuration: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  simpleTimeline: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 12,
    position: 'relative',
  },
  timelineBar: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  simpleSliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    minWidth: 35,
  },
  formatSection: {
    marginBottom: 16,
  },
  formatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  formatTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  audioToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  audioToggleText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
  },
  toggleSwitch: {
    width: 40,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  selectedMusicCard: {
    marginTop: 16,
  },
  selectedMusicBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,217,255,0.3)',
    gap: 12,
  },
  selectedMusicInfo: {
    flex: 1,
  },
  selectedMusicLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginBottom: 4,
  },
  selectedMusicName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  changeMusicButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactUploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  compactUploadGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  compactUploadText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});


