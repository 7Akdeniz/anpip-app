/**
 * SEA LANDINGPAGE GENERATOR
 * Conversion-optimierte Landingpages für Google Ads, Facebook Ads, etc.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SEOHead } from '@/components/SEOHead';
import { router } from 'expo-router';

export interface LandingPageProps {
  campaign: string;
  source: string;
  medium: string;
  content?: string;
  term?: string;
}

export function SEALandingPage({ campaign, source, medium, content, term }: LandingPageProps) {
  // Tracking
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      // Google Analytics Event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'landing_page_view', {
          campaign_name: campaign,
          source: source,
          medium: medium,
          content: content,
          term: term,
        });
      }
      
      // Facebook Pixel
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'ViewContent', {
          content_name: campaign,
          content_category: 'landing_page',
        });
      }
    }
  }, [campaign, source, medium]);

  const handleCTA = (action: string) => {
    // Conversion Tracking
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          send_to: 'AW-CONVERSION_ID/CONVERSION_LABEL',
          value: 1.0,
          currency: 'EUR',
          campaign_name: campaign,
          action: action,
        });
      }
      
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Lead', {
          content_name: campaign,
          action: action,
        });
      }
    }
    
    // Navigation
    if (action === 'signup') {
      router.push('/(tabs)/' as any);
    } else if (action === 'download') {
      router.push('/(tabs)/' as any);
    } else if (action === 'explore') {
      router.push('/(tabs)/' as any);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SEOHead
        title={`Anpip - ${campaign} | Vertikale Videos entdecken`}
        description="Erstelle und teile vertikale 9:16 Videos auf Anpip. Die weltweit führende Plattform für Short-Form Content."
        keywords={['vertikale videos', 'short videos', 'anpip', campaign.toLowerCase()]}
        noindex={true} // Landing Pages nicht indexieren
      />
      
      {/* Hero Section */}
      <LinearGradient
        colors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        style={styles.hero}
      >
        <Text style={styles.heroTitle}>
          🎬 Erstelle vertikale Videos
        </Text>
        <Text style={styles.heroSubtitle}>
          Die weltweit führende Plattform für 9:16 Content
        </Text>
        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={() => handleCTA('signup')}
        >
          <Text style={styles.ctaText}>Jetzt kostenlos starten</Text>
        </TouchableOpacity>
      </LinearGradient>
      
      {/* Features */}
      <View style={styles.features}>
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>📱</Text>
          <Text style={styles.featureTitle}>Mobile First</Text>
          <Text style={styles.featureDesc}>Optimiert für 9:16 vertikale Videos</Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🌍</Text>
          <Text style={styles.featureTitle}>Weltweit</Text>
          <Text style={styles.featureDesc}>Videos aus über 150 Ländern</Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>🎵</Text>
          <Text style={styles.featureTitle}>Musik Integration</Text>
          <Text style={styles.featureDesc}>10.000+ lizenzfreie Tracks</Text>
        </View>
        
        <View style={styles.feature}>
          <Text style={styles.featureIcon}>💰</Text>
          <Text style={styles.featureTitle}>Monetarisierung</Text>
          <Text style={styles.featureDesc}>Verdiene mit deinen Videos</Text>
        </View>
      </View>
      
      {/* Social Proof */}
      <View style={styles.socialProof}>
        <Text style={styles.socialProofTitle}>
          Über 100.000 Creator vertrauen Anpip
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>10M+</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>150+</Text>
            <Text style={styles.statLabel}>Länder</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>50M+</Text>
            <Text style={styles.statLabel}>Views/Monat</Text>
          </View>
        </View>
      </View>
      
      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Bereit durchzustarten?</Text>
        <TouchableOpacity
          style={styles.ctaPrimary}
          onPress={() => handleCTA('signup')}
        >
          <Text style={styles.ctaText}>Kostenloses Konto erstellen</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaSecondary}
          onPress={() => handleCTA('explore')}
        >
          <Text style={styles.ctaTextSecondary}>Videos entdecken</Text>
        </TouchableOpacity>
      </View>
      
      {/* UTM Parameters Display (nur Development) */}
      {__DEV__ && (
        <View style={styles.debug}>
          <Text style={styles.debugTitle}>UTM Parameters:</Text>
          <Text>Campaign: {campaign}</Text>
          <Text>Source: {source}</Text>
          <Text>Medium: {medium}</Text>
          {content && <Text>Content: {content}</Text>}
          {term && <Text>Term: {term}</Text>}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  hero: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 400,
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  ctaPrimary: {
    backgroundColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  ctaText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'space-around',
  },
  feature: {
    width: '45%',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  featureTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureDesc: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  socialProof: {
    padding: 40,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
  },
  socialProofTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#4ECDC4',
    fontSize: 32,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#999',
    fontSize: 14,
  },
  ctaSection: {
    padding: 40,
    alignItems: 'center',
  },
  ctaTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  ctaSecondary: {
    marginTop: 16,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },
  ctaTextSecondary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  debug: {
    padding: 20,
    backgroundColor: '#333',
    margin: 20,
    borderRadius: 8,
  },
  debugTitle: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default SEALandingPage;
