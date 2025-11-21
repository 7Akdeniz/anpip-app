/**
 * SEO FOOTER COMPONENT 2025
 * Strukturierte Links für SEO: Länder, Städte, Kategorien
 */

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { TOP_LOCATIONS } from '@/lib/geo-seo-2025';

export interface SEOFooterProps {
  categories?: Array<{ id: string; name: string; slug: string }>;
  showLocations?: boolean;
  showCategories?: boolean;
}

/**
 * SEO Footer Component
 */
export function SEOFooter(props: SEOFooterProps) {
  const { 
    categories = [], 
    showLocations = true, 
    showCategories = true 
  } = props;

  const topCountries = TOP_LOCATIONS.slice(0, 4); // Top 4 Länder

  return (
    <View style={styles.footer}>
      <View style={styles.container}>
        {/* Top Länder */}
        {showLocations && (
          <View style={styles.section}>
            <Text style={styles.heading}>Top Regionen</Text>
            <View style={styles.grid}>
              {topCountries.map(location => (
                <View key={location.countryCode} style={styles.countrySection}>
                  <Link 
                    href={`/${location.countryCode.toLowerCase()}` as any}
                    style={styles.countryLink}
                  >
                    <Text style={styles.countryName}>{location.country}</Text>
                  </Link>
                  
                  <View style={styles.cities}>
                    {location.cities.slice(0, 5).map(city => (
                      <Link
                        key={city.slug}
                        href={`/${location.countryCode.toLowerCase()}/${city.slug}` as any}
                        style={styles.cityLink}
                      >
                        <Text style={styles.cityName}>{city.name}</Text>
                      </Link>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Kategorien */}
        {showCategories && categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Beliebte Kategorien</Text>
            <View style={styles.grid}>
              {categories.map(category => (
                <Link
                  key={category.id}
                  href={`/kategorie/${category.slug}` as any}
                  style={styles.categoryLink}
                >
                  <Text style={styles.categoryName}>{category.name}</Text>
                </Link>
              ))}
            </View>
          </View>
        )}

        {/* Links */}
        <View style={styles.section}>
          <Text style={styles.heading}>Anpip</Text>
          <View style={styles.links}>
            <Link href="/(tabs)/explore" style={styles.link}>
              <Text style={styles.linkText}>Entdecken</Text>
            </Link>
            <Link href="/(tabs)/feed" style={styles.link}>
              <Text style={styles.linkText}>Feed</Text>
            </Link>
            <Link href="/(tabs)/upload" style={styles.link}>
              <Text style={styles.linkText}>Upload</Text>
            </Link>
          </View>
        </View>

        {/* Legal */}
        <View style={styles.section}>
          <Text style={styles.heading}>Rechtliches</Text>
          <View style={styles.links}>
            <Text style={styles.linkText}>Impressum</Text>
            <Text style={styles.linkText}>Datenschutz</Text>
            <Text style={styles.linkText}>AGB</Text>
            <Text style={styles.linkText}>Kontakt</Text>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyright}>
          <Text style={styles.copyrightText}>
            © {new Date().getFullYear()} Anpip.com - Alle Rechte vorbehalten
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 40,
    paddingHorizontal: 20,
    marginTop: 60,
  },
  container: {
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  section: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  countrySection: {
    minWidth: 200,
  },
  countryLink: {
    marginBottom: 8,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    textDecorationLine: 'underline',
  },
  cities: {
    flexDirection: 'column',
    gap: 6,
  },
  cityLink: {
    paddingVertical: 2,
  },
  cityName: {
    fontSize: 14,
    color: '#cccccc',
  },
  categoryLink: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  categoryName: {
    fontSize: 14,
    color: '#ffffff',
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  link: {
    paddingVertical: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#cccccc',
  },
  copyright: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 12,
    color: '#888888',
  },
});

export default SEOFooter;
