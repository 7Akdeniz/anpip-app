/**
 * LocationAutocomplete Component
 * 
 * City autocomplete search using OpenStreetMap Nominatim
 * Features: debounced search, dropdown suggestions, clean UX
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Typography } from './ui';

export interface Location {
  id: number;
  city: string;
  country: string;
  lat: number;
  lon: number;
  displayName: string;
  postcode?: string;
}

interface LocationAutocompleteProps {
  onSelect: (location: Location) => void;
  placeholder?: string;
  disabled?: boolean;
  initialValue?: Location | null;
}

export function LocationAutocomplete({
  onSelect,
  placeholder = 'Stadt suchen...',
  disabled = false,
  initialValue = null,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(initialValue);
  const [error, setError] = useState<string | null>(null);
  
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search locations via API
  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Direct Nominatim API call - WELTWEIT (keine countrycodes Beschränkung)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(searchQuery)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=10`,
        {
          headers: {
            'User-Agent': 'Anpip.com Mobile App',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }

      const data = await response.json();
      
      // Transform Nominatim response to our format
      const transformedResults = data.map((item: any, index: number) => ({
        id: index,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        city: item.address?.city || item.address?.town || item.address?.village || '',
        country: item.address?.country || '',
        postcode: item.address?.postcode || '',
      }));

      setResults(transformedResults);
      setShowDropdown(true);
    } catch (err: any) {
      console.error('Location search error:', err);
      setError('Verbindungsfehler. Bitte versuche es erneut.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query && query.trim().length >= 2) {
      debounceTimerRef.current = setTimeout(() => {
        searchLocations(query.trim());
      }, 500); // 500ms debounce
    } else {
      setResults([]);
      setShowDropdown(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  // Handle location selection
  const handleSelect = (location: Location) => {
    setSelectedLocation(location);
    setQuery(location.displayName);
    setShowDropdown(false);
    setResults([]);
    Keyboard.dismiss();
    onSelect(location);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setSelectedLocation(null);
    setResults([]);
    setShowDropdown(false);
    setError(null);
  };

  // Render suggestion item
  const renderItem = ({ item }: { item: Location }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Ionicons name="location-outline" size={20} color={Colors.primary} />
      <View style={styles.suggestionText}>
        <Typography variant="body" style={styles.cityName}>
          {item.city}
        </Typography>
        <Typography variant="caption" style={styles.countryName}>
          {item.country}
        </Typography>
      </View>
      <Ionicons name="chevron-forward-outline" size={16} color="rgba(255,255,255,0.4)" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Input Field */}
      <View style={[
        styles.inputContainer,
        selectedLocation && styles.inputContainerSelected,
        disabled && styles.inputContainerDisabled
      ]}>
        <Ionicons 
          name={selectedLocation ? "checkmark-circle" : "search-outline"} 
          size={20} 
          color={selectedLocation ? Colors.primary : 'rgba(255,255,255,0.6)'} 
        />
        
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={selectedLocation ? selectedLocation.displayName : query}
          onChangeText={(text) => {
            setQuery(text);
            if (selectedLocation) {
              setSelectedLocation(null);
            }
          }}
          onFocus={() => {
            if (query && query.length >= 2 && results.length > 0) {
              setShowDropdown(true);
            }
          }}
          editable={!disabled}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {loading && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}

        {((query?.length > 0) || selectedLocation) && !loading && !disabled && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
          <Typography variant="caption" style={styles.errorText}>
            {error}
          </Typography>
        </View>
      )}

      {/* Dropdown Suggestions - now in normal flow */}
      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            scrollEnabled={false}
            nestedScrollEnabled={true}
            style={styles.dropdownList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}

      {/* No Results Message */}
      {showDropdown && !loading && query.length >= 2 && results.length === 0 && !error && (
        <View style={styles.noResults}>
          <Ionicons name="location-outline" size={24} color="rgba(255,255,255,0.4)" />
          <Typography variant="caption" style={styles.noResultsText}>
            Keine Städte gefunden
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(28,28,30,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  inputContainerSelected: {
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderColor: Colors.primary,
    borderWidth: 1.5,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  dropdown: {
    marginTop: 6,
    backgroundColor: 'rgba(28,28,30,0.98)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    maxHeight: 250,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    flex: 1,
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  countryName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  noResults: {
    marginTop: 8,
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(28,28,30,0.5)',
    borderRadius: 14,
  },
  noResultsText: {
    color: 'rgba(255,255,255,0.6)',
    marginTop: 6,
  },
});
