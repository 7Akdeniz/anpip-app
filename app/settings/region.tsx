// ============================================================================
// 🌎 REGION & WELTKARTE AUSWÄHLEN - ALLE LÄNDER
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Region = {
  code: string;
  name: string;
  flag: string;
  continent: string;
};

export default function RegionScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedRegion, setSelectedRegion] = useState('DE');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRegion();
  }, []);

  const loadRegion = async () => {
    try {
      const saved = await AsyncStorage.getItem('app_region');
      if (saved) {
        setSelectedRegion(saved);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Region:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRegion = async (code: string) => {
    try {
      setSelectedRegion(code);
      await AsyncStorage.setItem('app_region', code);
      const region = regions.find(r => r.code === code);
      Alert.alert(
        'Region geändert',
        `${region?.flag} ${region?.name} wurde als deine Region festgelegt.`
      );
    } catch (error) {
      console.error('Fehler beim Speichern der Region:', error);
      Alert.alert('Fehler', 'Region konnte nicht gespeichert werden');
    }
  };

  const regions: Region[] = [
    // Europa
    { code: 'DE', name: 'Deutschland', flag: '🇩🇪', continent: 'Europa' },
    { code: 'AT', name: 'Österreich', flag: '🇦🇹', continent: 'Europa' },
    { code: 'CH', name: 'Schweiz', flag: '🇨🇭', continent: 'Europa' },
    { code: 'GB', name: 'Vereinigtes Königreich', flag: '🇬🇧', continent: 'Europa' },
    { code: 'FR', name: 'Frankreich', flag: '🇫🇷', continent: 'Europa' },
    { code: 'ES', name: 'Spanien', flag: '🇪🇸', continent: 'Europa' },
    { code: 'IT', name: 'Italien', flag: '🇮🇹', continent: 'Europa' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹', continent: 'Europa' },
    { code: 'NL', name: 'Niederlande', flag: '🇳🇱', continent: 'Europa' },
    { code: 'BE', name: 'Belgien', flag: '🇧🇪', continent: 'Europa' },
    { code: 'PL', name: 'Polen', flag: '🇵🇱', continent: 'Europa' },
    { code: 'CZ', name: 'Tschechien', flag: '🇨🇿', continent: 'Europa' },
    { code: 'SK', name: 'Slowakei', flag: '🇸🇰', continent: 'Europa' },
    { code: 'HU', name: 'Ungarn', flag: '🇭🇺', continent: 'Europa' },
    { code: 'RO', name: 'Rumänien', flag: '🇷🇴', continent: 'Europa' },
    { code: 'BG', name: 'Bulgarien', flag: '🇧🇬', continent: 'Europa' },
    { code: 'GR', name: 'Griechenland', flag: '🇬🇷', continent: 'Europa' },
    { code: 'SE', name: 'Schweden', flag: '🇸🇪', continent: 'Europa' },
    { code: 'NO', name: 'Norwegen', flag: '🇳🇴', continent: 'Europa' },
    { code: 'DK', name: 'Dänemark', flag: '🇩🇰', continent: 'Europa' },
    { code: 'FI', name: 'Finnland', flag: '🇫🇮', continent: 'Europa' },
    { code: 'IE', name: 'Irland', flag: '🇮🇪', continent: 'Europa' },
    { code: 'HR', name: 'Kroatien', flag: '🇭🇷', continent: 'Europa' },
    { code: 'RS', name: 'Serbien', flag: '🇷🇸', continent: 'Europa' },
    { code: 'UA', name: 'Ukraine', flag: '🇺🇦', continent: 'Europa' },
    { code: 'RU', name: 'Russland', flag: '🇷🇺', continent: 'Europa' },
    
    // Amerika
    { code: 'US', name: 'USA', flag: '🇺🇸', continent: 'Amerika' },
    { code: 'CA', name: 'Kanada', flag: '🇨🇦', continent: 'Amerika' },
    { code: 'MX', name: 'Mexiko', flag: '🇲🇽', continent: 'Amerika' },
    { code: 'BR', name: 'Brasilien', flag: '🇧🇷', continent: 'Amerika' },
    { code: 'AR', name: 'Argentinien', flag: '🇦🇷', continent: 'Amerika' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱', continent: 'Amerika' },
    { code: 'CO', name: 'Kolumbien', flag: '🇨🇴', continent: 'Amerika' },
    { code: 'PE', name: 'Peru', flag: '🇵🇪', continent: 'Amerika' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪', continent: 'Amerika' },
    
    // Asien
    { code: 'TR', name: 'Türkei', flag: '🇹🇷', continent: 'Asien' },
    { code: 'CN', name: 'China', flag: '🇨🇳', continent: 'Asien' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', continent: 'Asien' },
    { code: 'KR', name: 'Südkorea', flag: '🇰🇷', continent: 'Asien' },
    { code: 'IN', name: 'Indien', flag: '🇮🇳', continent: 'Asien' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰', continent: 'Asien' },
    { code: 'BD', name: 'Bangladesch', flag: '🇧🇩', continent: 'Asien' },
    { code: 'ID', name: 'Indonesien', flag: '🇮🇩', continent: 'Asien' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', continent: 'Asien' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳', continent: 'Asien' },
    { code: 'PH', name: 'Philippinen', flag: '🇵🇭', continent: 'Asien' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', continent: 'Asien' },
    { code: 'SG', name: 'Singapur', flag: '🇸🇬', continent: 'Asien' },
    { code: 'SA', name: 'Saudi-Arabien', flag: '🇸🇦', continent: 'Asien' },
    { code: 'AE', name: 'VAE', flag: '🇦🇪', continent: 'Asien' },
    { code: 'IL', name: 'Israel', flag: '🇮🇱', continent: 'Asien' },
    { code: 'IR', name: 'Iran', flag: '🇮🇷', continent: 'Asien' },
    
    // Afrika
    { code: 'ZA', name: 'Südafrika', flag: '🇿🇦', continent: 'Afrika' },
    { code: 'EG', name: 'Ägypten', flag: '🇪🇬', continent: 'Afrika' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬', continent: 'Afrika' },
    { code: 'KE', name: 'Kenia', flag: '🇰🇪', continent: 'Afrika' },
    { code: 'MA', name: 'Marokko', flag: '🇲🇦', continent: 'Afrika' },
    { code: 'ET', name: 'Äthiopien', flag: '🇪🇹', continent: 'Afrika' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭', continent: 'Afrika' },
    
    // Ozeanien
    { code: 'AU', name: 'Australien', flag: '🇦🇺', continent: 'Ozeanien' },
    { code: 'NZ', name: 'Neuseeland', flag: '🇳🇿', continent: 'Ozeanien' },
  ];

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    region.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedRegions = filteredRegions.reduce((acc, region) => {
    if (!acc[region.continent]) {
      acc[region.continent] = [];
    }
    acc[region.continent].push(region);
    return acc;
  }, {} as Record<string, Region[]>);

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Region wählen',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8E8E93" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, isDark && styles.searchInputDark]}
          placeholder="Land suchen..."
          placeholderTextColor="#8E8E93"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoBox, isDark && styles.infoBoxDark]}>
          <Ionicons name="globe" size={20} color="#34C759" />
          <Text style={[styles.infoText, isDark && styles.infoTextDark]}>
            {regions.length} Länder weltweit • {filteredRegions.length} angezeigt
          </Text>
        </View>

        {Object.keys(groupedRegions).map((continent) => (
          <View key={continent} style={styles.continentSection}>
            <Text style={[styles.continentTitle, isDark && styles.continentTitleDark]}>
              {continent}
            </Text>
            <View style={[styles.regionList, isDark && styles.regionListDark]}>
              {groupedRegions[continent].map((region, index) => (
                <TouchableOpacity
                  key={region.code}
                  style={[
                    styles.regionItem,
                    isDark && styles.regionItemDark,
                    index < groupedRegions[continent].length - 1 && styles.borderBottom,
                    selectedRegion === region.code && styles.selectedItem,
                  ]}
                  onPress={() => handleSelectRegion(region.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.flag}>{region.flag}</Text>
                  <Text style={[styles.regionName, isDark && styles.regionNameDark]}>
                    {region.name}
                  </Text>
                  {selectedRegion === region.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#FF3B30" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  containerDark: {
    backgroundColor: '#000000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  searchInputDark: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
  },
  infoBoxDark: {
    backgroundColor: '#1A2E1A',
  },
  infoText: {
    fontSize: 14,
    color: '#34C759',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoTextDark: {
    color: '#81C784',
  },
  continentSection: {
    marginBottom: 16,
  },
  continentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  continentTitleDark: {
    color: '#8E8E93',
  },
  regionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  regionListDark: {
    backgroundColor: '#1C1C1E',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  regionItemDark: {
    backgroundColor: '#1C1C1E',
  },
  selectedItem: {
    backgroundColor: '#FFF5F5',
  },
  borderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
    width: 40,
    textAlign: 'center',
  },
  regionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    flex: 1,
  },
  regionNameDark: {
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
