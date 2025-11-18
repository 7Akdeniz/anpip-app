/**
 * FEED SCREEN - "For You" Seite (Hauptseite)
 * 
 * Hier werden später die Videos vertikal angezeigt.
 * Jetzt erst mal nur ein Dummy-Screen mit dem Design.
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography, Card, IconButton } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useI18n } from '@/i18n/I18nContext';

export default function FeedScreen() {
  const { t } = useI18n();
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" color={Colors.primary}>Anpip</Typography>
        <View style={styles.headerTabs}>
          <Typography variant="button" color={Colors.primary}>{t.forYou}</Typography>
          <View style={styles.spacer} />
          <Typography variant="button" color={Colors.textSecondary}>{t.following}</Typography>
        </View>
      </View>

      {/* Video Feed (Dummy) */}
      <ScrollView style={styles.feed}>
        <Card style={styles.videoCard}>
          <View style={styles.videoPlaceholder}>
            <Ionicons name="play-circle" size={80} color={Colors.primary} />
            <Typography variant="h3" align="center" style={{ marginTop: Spacing.md }}>
              Video-Feed kommt hier hin
            </Typography>
            <Typography variant="caption" align="center" style={{ marginTop: Spacing.sm }}>
              Vollbild-Videos im 9:16 Format
            </Typography>
          </View>
          
          {/* Video-Interaktionen (rechts) */}
          <View style={styles.interactions}>
            <IconButton 
              icon="heart-outline" 
              onPress={() => console.log('Like')}
              backgroundColor={Colors.background}
              color={Colors.text}
            />
            <Typography variant="caption" align="center">1.2k</Typography>
            
            <View style={{ height: Spacing.md }} />
            
            <IconButton 
              icon="chatbubble-outline" 
              onPress={() => console.log('Comment')}
              backgroundColor={Colors.background}
              color={Colors.text}
            />
            <Typography variant="caption" align="center">234</Typography>
            
            <View style={{ height: Spacing.md }} />
            
            <IconButton 
              icon="share-outline" 
              onPress={() => console.log('Share')}
              backgroundColor={Colors.background}
              color={Colors.text}
            />
            <Typography variant="caption" align="center">89</Typography>
          </View>

          {/* Video-Info (unten) */}
          <View style={styles.videoInfo}>
            <Typography variant="body" color={Colors.background}>
              @username
            </Typography>
            <Typography variant="caption" color={Colors.background} style={{ marginTop: 4 }}>
              Hier steht der Video-Titel und die Beschreibung...
            </Typography>
            <Typography variant="caption" color={Colors.background} style={{ marginTop: 4 }}>
              #anpip #shortvideo #trending
            </Typography>
          </View>
        </Card>

        <Card style={styles.videoCard}>
          <View style={styles.videoPlaceholder}>
            <Typography variant="body" align="center" color={Colors.textSecondary}>
              Swipe nach oben für nächstes Video
            </Typography>
          </View>
        </Card>
      </ScrollView>

      {/* Sprach-Switcher (Floating Button) */}
      <LanguageSwitcher />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTabs: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  spacer: {
    width: Spacing.lg,
  },
  feed: {
    flex: 1,
  },
  videoCard: {
    margin: Spacing.md,
    height: 600,
    backgroundColor: Colors.surfaceVariant,
    position: 'relative',
  },
  videoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  interactions: {
    position: 'absolute',
    right: Spacing.md,
    bottom: 100,
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
