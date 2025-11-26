import React, { useState, useRef, useEffect } from "react";
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
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  LocationAutocomplete,
  Location,
} from "@/components/LocationAutocomplete";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const TOOLS = [
  { id: "trim", icon: "cut", label: "Schneiden" },
  { id: "text", icon: "text", label: "Text" },
  { id: "sticker", icon: "happy-outline", label: "Sticker" },
  { id: "filter", icon: "color-filter-outline", label: "Filter" },
  { id: "beauty", icon: "sparkles-outline", label: "Beauty" },
];

const MARKET_CATEGORIES = [
  {
    id: "vehicles",
    name: "Fahrzeuge",
    icon: "car-outline",
    subcategories: [
      "Autos",
      "Motorräder & Roller",
      "Transporter & Nutzfahrzeuge",
      "Fahrräder & E-Bikes",
      "Wohnmobile & Camping",
      "Bootsfahrzeuge",
      "Autoteile & Zubehör",
      "Reifen & Felgen",
    ],
  },
  {
    id: "real-estate",
    name: "Immobilien",
    icon: "home-outline",
    subcategories: [
      "Wohnung mieten",
      "Wohnung kaufen",
      "Haus mieten",
      "Haus kaufen",
      "WG & Zimmer",
      "Gewerbeimmobilien",
      "Grundstücke",
      "Ferienwohnungen",
    ],
  },
  {
    id: "electronics",
    name: "Elektronik",
    icon: "phone-portrait-outline",
    subcategories: [
      "Smartphones",
      "Laptops & Computer",
      "Spielekonsolen & Gaming",
      "TV & Audio",
      "Kameras",
      "Smart Home",
      "Haushaltsgeräte",
      "Zubehör & Kabel",
    ],
  },
  {
    id: "home-garden",
    name: "Haus & Garten",
    icon: "leaf-outline",
    subcategories: [
      "Möbel",
      "Küche & Esszimmer",
      "Garten & Pflanzen",
      "Werkzeuge",
      "Heimwerken & Baumaterial",
      "Deko & Wohnen",
      "Haushaltsgeräte",
      "Bad & Sanitär",
    ],
  },
  {
    id: "fashion-beauty",
    name: "Mode & Beauty",
    icon: "shirt-outline",
    subcategories: [
      "Damenmode",
      "Herrenmode",
      "Schuhe",
      "Taschen & Accessoires",
      "Schmuck",
      "Beauty & Pflege",
      "Luxusmode",
      "Uhren",
    ],
  },
  {
    id: "family-baby",
    name: "Familie & Baby",
    icon: "people-outline",
    subcategories: [
      "Kinderkleidung",
      "Kinderwagen & Buggys",
      "Babyzimmer & Möbel",
      "Spielzeug",
      "Schulbedarf",
      "Sicherheit & Überwachung",
      "Umstandsmode",
      "Babyzubehör",
    ],
  },
  {
    id: "animals",
    name: "Tiere",
    icon: "paw-outline",
    subcategories: [
      "Hunde",
      "Katzen",
      "Kleintiere",
      "Vögel",
      "Fische & Aquaristik",
      "Terraristik",
      "Tierfutter",
      "Tierzubehör",
    ],
  },
  {
    id: "leisure-hobby",
    name: "Freizeit & Hobby",
    icon: "basketball-outline",
    subcategories: [
      "Sport & Fitness",
      "Outdoor & Camping",
      "Spiele & Brettspiele",
      "Sammeln & Raritäten",
      "Modellbau",
      "Events & Aktivitäten",
      "Kunst & Basteln",
      "Fahrräder",
    ],
  },
  {
    id: "music-media",
    name: "Musik & Medien",
    icon: "musical-notes-outline",
    subcategories: [
      "Bücher",
      "Filme & DVDs",
      "Musik & CDs",
      "Musikinstrumente",
      "Games",
      "Vinyl",
      "Noten & Musikzubehör",
      "Hörbücher",
    ],
  },
  {
    id: "jobs-services",
    name: "Jobs & Dienstleistungen",
    icon: "briefcase-outline",
    subcategories: [
      "Jobangebote",
      "Nebenjobs & Minijobs",
      "Dienstleistungen privat",
      "Handwerk & Bau",
      "Reinigung & Haushalt",
      "Umzug & Transport",
      "Coaching & Unterricht",
      "Beauty & Wellness Services",
    ],
  },
  {
    id: "business",
    name: "Business & Gewerbe",
    icon: "business-outline",
    subcategories: [
      "Büroausstattung",
      "Maschinen & Industrie",
      "Ladeneinrichtung",
      "Gastronomie & Küche",
      "Computer & IT",
      "Großhandelsposten",
      "Werkzeuge",
      "Verpackung & Versand",
    ],
  },
  {
    id: "free-exchange",
    name: "Verschenken / Tauschen",
    icon: "gift-outline",
    subcategories: [
      "Zu verschenken",
      "Tauschangebote",
      "Möbel",
      "Kleidung",
      "Bücher & Medien",
      "Baby & Kinder",
      "Haushaltsartikel",
      "Sonstiges",
    ],
  },
];

const MUSIC_TRACKS = [
  {
    id: "1",
    name: "Summer Vibes",
    artist: "Beach Music",
    duration: "2:45",
    genre: "Pop",
  },
  {
    id: "2",
    name: "Night Drive",
    artist: "Neon Sounds",
    duration: "3:20",
    genre: "Electronic",
  },
  {
    id: "3",
    name: "Happy Days",
    artist: "Sunny Tunes",
    duration: "2:15",
    genre: "Pop",
  },
  {
    id: "4",
    name: "Chill Beats",
    artist: "Lo-Fi Master",
    duration: "3:00",
    genre: "Lo-Fi",
  },
  {
    id: "5",
    name: "Energy Boost",
    artist: "Workout Mix",
    duration: "2:30",
    genre: "Dance",
  },
  {
    id: "6",
    name: "Acoustic Dreams",
    artist: "Guitar Hero",
    duration: "3:45",
    genre: "Acoustic",
  },
  {
    id: "7",
    name: "Urban Flow",
    artist: "Street Beats",
    duration: "2:55",
    genre: "Hip-Hop",
  },
  {
    id: "8",
    name: "Tropical Sunset",
    artist: "Island Vibes",
    duration: "3:10",
    genre: "Reggae",
  },
  {
    id: "9",
    name: "Jazz Lounge",
    artist: "Smooth Jazz",
    duration: "4:20",
    genre: "Jazz",
  },
  {
    id: "10",
    name: "Rock Energy",
    artist: "Power Chords",
    duration: "3:35",
    genre: "Rock",
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
  const [musicPanelVisible, setMusicPanelVisible] = useState(false);
  const [musicSearch, setMusicSearch] = useState("");
  const [categoryExpanded, setCategoryExpanded] = useState(false);

  // Market Form State
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [description, setDescription] = useState("");
  const [subcategoryExpanded, setSubcategoryExpanded] = useState(false);

  // Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const musicQuery = musicSearch.trim().toLowerCase();
  const filteredMusic = MUSIC_TRACKS.filter((track) =>
    `${track.name} ${track.artist} ${track.genre}`
      .toLowerCase()
      .includes(musicQuery)
  );

  useEffect(() => {
    if (selectedLocation) {
      setCategoryExpanded(true);
    } else {
      setCategoryExpanded(false);
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setSubcategoryExpanded(false);
      setDescription("");
    }
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedCategory) {
      setSubcategoryExpanded(true);
    } else {
      setSubcategoryExpanded(false);
      setSelectedSubcategory(null);
    }
  }, [selectedCategory]);

  const handleMusicPress = () => {
    setMusicPanelVisible(true);
  };

  const handleCloseMusicPanel = () => {
    setMusicPanelVisible(false);
  };

  const handleSelectTrack = (track: (typeof MUSIC_TRACKS)[0]) => {
    setSelectedMusic(track.name);
    setMusicPanelVisible(false);
    setMusicSearch("");
  };

  const handleUpload = async () => {
    if (
      isForMarket &&
      (!selectedLocation ||
        !selectedCategory ||
        !selectedSubcategory ||
        !description)
    ) {
      Alert.alert(
        "Fehlende Daten",
        "Bitte fülle alle Market-Felder aus (Stadt, Kategorie, Unterkategorie, Beschreibung)"
      );
      return;
    }

    setUploading(true);

    // Simulate upload with progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setUploading(false);
    Alert.alert("Erfolg!", "Video wurde hochgeladen");
    router.push("/(tabs)");
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Video Background - Fullscreen */}
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

      {/* Top Icons - Alle in einer Zeile */}
      <View style={styles.topPanel} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.backContainer}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.topIconButton}
          onPress={handleMusicPress}
          accessibilityLabel="Sound hinzufügen"
        >
          <View style={styles.iconContainer}>
            <Ionicons name="musical-notes" size={22} color="#FFFFFF" />
            {selectedMusic && <View style={styles.musicBadge} />}
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.topIconButton,
            isForMarket && styles.topIconButtonActive,
          ]}
          onPress={() => setIsForMarket(!isForMarket)}
          accessibilityLabel="Für Market anwenden"
        >
          <View style={styles.iconContainer}>
            <Ionicons
              name={isForMarket ? "pricetag" : "pricetag-outline"}
              size={22}
              color={isForMarket ? "#00D9FF" : "#FFFFFF"}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Music Selection */}
      {musicPanelVisible && (
        <View style={styles.musicPanel}>
          <View style={styles.musicPanelContent}>
            <View style={styles.musicPanelHeader}>
              <TextInput
                style={styles.musicSearchInput}
                placeholder="Musik suchen..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={musicSearch}
                onChangeText={setMusicSearch}
                returnKeyType="search"
              />
              <TouchableOpacity
                onPress={handleCloseMusicPanel}
                style={styles.musicCloseButton}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={styles.musicList}
              contentContainerStyle={styles.musicListContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredMusic.map((track) => (
                <TouchableOpacity
                  key={track.id}
                  style={styles.musicItem}
                  onPress={() => handleSelectTrack(track)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.musicItemContent,
                      selectedMusic === track.name && styles.musicItemSelected,
                    ]}
                  >
                    <View style={styles.musicIcon}>
                      <Ionicons
                        name="musical-notes"
                        size={22}
                        color="#00D9FF"
                      />
                    </View>
                    <View style={styles.musicItemInfo}>
                      <Text style={styles.musicItemTitle}>{track.name}</Text>
                      <Text style={styles.musicItemArtist}>{track.artist}</Text>
                    </View>
                    <View style={styles.musicItemMeta}>
                      <Text style={styles.musicItemGenre}>{track.genre}</Text>
                      <Text style={styles.musicItemDuration}>
                        {track.duration}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Market Panel (keyboard-aware, dropdown-style) */}
      {isForMarket && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
          style={styles.marketPanel}
        >
          <View style={styles.marketPanelContent}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView
                style={styles.marketPanelScroll}
                contentContainerStyle={styles.marketPanelScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                scrollEventThrottle={16}
                automaticallyAdjustKeyboardInsets={true}
              >
              {/* Kompakte Ansicht wenn alle Felder ausgefüllt */}
              {selectedLocation && selectedCategory && selectedSubcategory ? (
                <View style={styles.compactSelectionContainer}>
                  <TouchableOpacity
                    style={styles.compactSelectionRow}
                    onPress={() => {
                      setSelectedLocation(null);
                      setSelectedCategory(null);
                      setSelectedSubcategory(null);
                    }}
                  >
                    <View style={styles.compactSelectionInfo}>
                      <Text style={styles.compactSelectionText} numberOfLines={1}>
                        📍 {selectedLocation.displayName}
                      </Text>
                      <Text style={styles.compactSelectionText} numberOfLines={1}>
                        📌 {MARKET_CATEGORIES.find((c) => c.id === selectedCategory)?.name} › {selectedSubcategory}
                      </Text>
                    </View>
                    <Ionicons name="create-outline" size={18} color="#00D9FF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {/* Ort-Auswahl */}
                  <View style={styles.marketField}>
                    <View style={styles.dropdownLabelRow}>
                      <Text style={styles.dropdownLabel}>1. Ort wählen</Text>
                    </View>
                    <View style={styles.dropdownBody}>
                      <LocationAutocomplete
                        onSelect={(location) => {
                          setSelectedLocation(location);
                          console.log("📍 Standort gewählt:", location);
                        }}
                        placeholder="Stadt (z.B. Berlin, Hamburg, Istanbul)"
                        initialValue={selectedLocation}
                      />
                    </View>
                  </View>

                  {/* Kategorie-Auswahl */}
                  {selectedLocation && (
                    <View style={styles.marketField}>
                      <TouchableOpacity
                        style={styles.dropdownLabelRow}
                        onPress={() => setCategoryExpanded((prev) => !prev)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.dropdownLabel}>2. Kategorie wählen</Text>
                        <Ionicons
                          name={categoryExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                      {categoryExpanded && (
                        <View style={styles.categoryListPanel}>
                          {MARKET_CATEGORIES.map((cat) => (
                            <TouchableOpacity
                              key={cat.id}
                              style={styles.categoryTextButton}
                              onPress={() => {
                                setSelectedCategory(cat.id);
                                setDescription("");
                                setSelectedSubcategory(null);
                                setCategoryExpanded(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.categorySimpleText,
                                  selectedCategory === cat.id &&
                                    styles.categoryTextActive,
                                ]}
                              >
                                {cat.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      {selectedCategory && !categoryExpanded && (
                        <Text style={styles.locationHint}>
                          📌 {MARKET_CATEGORIES.find((c) => c.id === selectedCategory)?.name}
                        </Text>
                      )}
                    </View>
                  )}

                  {/* Unterkategorie-Auswahl */}
                  {selectedCategory && (
                    <View style={styles.marketField}>
                      <TouchableOpacity
                        style={styles.dropdownLabelRow}
                        onPress={() => setSubcategoryExpanded((prev) => !prev)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownLabel}>
                          3. Unterkategorie wählen
                        </Text>
                        <Ionicons
                          name={subcategoryExpanded ? "chevron-up" : "chevron-down"}
                          size={20}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                      {subcategoryExpanded && (
                        <View style={styles.subcategoryListPanel}>
                          {MARKET_CATEGORIES.find(
                            (cat) => cat.id === selectedCategory
                          )?.subcategories.map((sub) => (
                            <TouchableOpacity
                              key={sub}
                              style={styles.categoryTextButton}
                              onPress={() => {
                                setSelectedSubcategory(sub);
                                setDescription("");
                                setSubcategoryExpanded(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.categorySimpleText,
                                  selectedSubcategory === sub &&
                                    styles.categoryTextActive,
                                ]}
                              >
                                {sub}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                      {selectedSubcategory && !subcategoryExpanded && (
                        <Text style={styles.locationHint}>
                          📌 {selectedSubcategory}
                        </Text>
                      )}
                    </View>
                  )}
                </>
              )}

              {/* Beschreibungsfeld - IMMER sichtbar wenn alle Felder ausgefüllt */}
              {selectedSubcategory && (
                <View style={styles.descriptionFieldContainer}>
                  <TextInput
                    style={styles.descriptionInputLarge}
                    placeholder="Beschreibe dein Produkt ausführlich...\n\nZ.B. Zustand, Funktionen, Besonderheiten, etc."
                    placeholderTextColor="rgba(255,255,255,0.4)"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    textAlignVertical="top"
                    maxLength={2000}
                    numberOfLines={15}
                    returnKeyType="done"
                    blurOnSubmit={true}
                    scrollEnabled={false}
                  />
                  <Text style={styles.charCount}>
                    {description.length}/2000 Zeichen
                  </Text>
                </View>
              )}
            </ScrollView>
            </TouchableWithoutFeedback>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Right Toolbar - Icon-only controls */}
      <View style={styles.rightToolbar} pointerEvents="box-none">
        {TOOLS.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={[
              styles.toolButton,
              selectedTool === tool.id && styles.toolButtonActive,
            ]}
            onPress={() =>
              setSelectedTool(tool.id === selectedTool ? null : tool.id)
            }
            accessibilityLabel={tool.label}
          >
            <View style={styles.toolContainer}>
              <Ionicons
                name={tool.icon as any}
                size={26}
                color={selectedTool === tool.id ? "#00D9FF" : "#FFFFFF"}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Timeline + Buttons */}
      <View style={styles.bottomPanel}>
        {/* Timeline */}
        <View style={styles.timeline}>
          <View style={styles.timelineTrack}>
            <View
              style={[styles.timelineProgress, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.timeText}>
            {Math.floor(position / 1000)}s / {Math.floor(duration / 1000)}s
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.storyButton}>
            <View style={styles.storyContainer}>
              <View style={styles.storyAvatar} />
              <Text style={styles.storyText}>Deine Story</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextButton} onPress={handleUpload}>
            <View style={styles.nextContainer}>
              <Text style={styles.nextText}>Weiter</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Upload Progress Overlay */}
      {uploading && (
        <View style={styles.uploadOverlay}>
          <View style={styles.uploadCard}>
            <ActivityIndicator size="large" color="#00D9FF" />
            <Text style={styles.uploadTitle}>Video wird hochgeladen</Text>
            <Text style={styles.uploadPercent}>{uploadProgress}%</Text>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBar, { width: `${uploadProgress}%` }]}
              />
            </View>

            <Text style={styles.uploadHint}>Bitte warten...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  video: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topPanel: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 16,
    pointerEvents: "box-none",
  },
  backButton: {
    width: 48,
    height: 48,
  },
  backContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  topIconButton: {
    width: 48,
    height: 48,
  },
  topIconButtonActive: {
    // Aktiv-Stil für Market-Button
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    position: "relative",
  },
  musicBadge: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00D9FF",
  },

  marketPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 190,
    paddingTop: 100,
    paddingHorizontal: 12,
    paddingBottom: 30,
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  marketPanelContent: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    padding: 14,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  marketPanelScroll: {
    flex: 1,
  },
  marketPanelScrollContent: {
    paddingBottom: 80,
  },
  marketField: {
    marginBottom: 12,
  },
  dropdownLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dropdownLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    letterSpacing: 0.5,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dropdownMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  dropdownBody: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  categoryListPanel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    overflow: "hidden",
  },
  subcategoryListPanel: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    overflow: "hidden",
  },
  descriptionInputExtended: {
    maxHeight: 220,
    minHeight: 140,
  },
  musicPanel: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 195,
    paddingTop: 120,
    paddingHorizontal: 16,
    paddingBottom: 40,
    justifyContent: "flex-start",
    backgroundColor: "transparent",
  },
  musicPanelContent: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    padding: 16,
    backgroundColor: "transparent",
  },
  musicPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  musicSearchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    color: "#FFFFFF",
    backgroundColor: "rgba(255,255,255,0.05)",
    fontSize: 14,
    marginRight: 12,
  },
  musicCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  musicList: {
    flex: 1,
  },
  musicListContent: {
    paddingBottom: 60,
  },
  musicItem: {
    marginBottom: 6,
  },
  musicItemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  musicItemSelected: {
    borderColor: "#00D9FF",
    backgroundColor: "rgba(0,217,255,0.08)",
  },
  musicIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(0,217,255,0.12)",
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  musicItemInfo: {
    flex: 1,
  },
  musicItemTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  musicItemArtist: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
  },
  musicItemMeta: {
    alignItems: "flex-end",
    marginLeft: 10,
  },
  musicItemGenre: {
    color: "#00D9FF",
    fontSize: 11,
    fontWeight: "700",
  },
  musicItemDuration: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  locationHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 8,
  },
  compactSelectionContainer: {
    marginBottom: 8,
  },
  compactSelectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,217,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,217,255,0.3)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  compactSelectionInfo: {
    flex: 1,
    marginRight: 12,
  },
  compactSelectionText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  descriptionFieldContainer: {
    flex: 1,
    minHeight: 350,
    marginTop: 4,
  },
  keyboardDoneButton: {
    backgroundColor: "#00D9FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  keyboardDoneButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "700",
  },
  categoryTextButton: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  categorySimpleText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "400",
  },
  categoryTextActive: {
    color: "#00D9FF",
    fontWeight: "600",
  },
  descriptionInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: "top",
  },
  descriptionInputLarge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    padding: 22,
    paddingTop: 22,
    color: "#FFFFFF",
    fontSize: 18,
    lineHeight: 28,
    minHeight: 380,
    flex: 1,
    textAlignVertical: "top",
    width: "100%",
  },
  charCount: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    textAlign: "right",
    marginTop: 4,
  },

  // Right Toolbar
  rightToolbar: {
    position: "absolute",
    right: 16,
    bottom: 200,
    gap: 14,
    zIndex: 98,
  },
  toolButton: {
    alignItems: "center",
  },
  toolButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  toolContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "transparent",
  },

  // Bottom Panel
  bottomPanel: {
    position: "absolute",
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
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  timelineProgress: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  storyButton: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  storyContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    backgroundColor: "transparent",
  },
  storyAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  storyText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  nextButton: {
    flex: 1.2,
    borderRadius: 28,
    overflow: "hidden",
  },
  nextContainer: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  // Upload Overlay
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  uploadCard: {
    width: "90%",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  uploadTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 24,
  },
  uploadPercent: {
    color: "#00D9FF",
    fontSize: 48,
    fontWeight: "800",
    marginTop: 16,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: 24,
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#00D9FF",
  },
  uploadHint: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginTop: 16,
  },
});
