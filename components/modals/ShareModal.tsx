/**
 * SHARE MODAL - TikTok-Style
 * 
 * Funktionen:
 * - Link kopieren
 * - Video teilen (native Share API)
 * - QR-Code generieren
 * - Zu anderen Apps teilen
 */

import React from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Share as RNShare,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors } from '@/constants/Theme';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  videoUrl?: string;
  videoTitle?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  videoId,
  videoUrl,
  videoTitle = 'Schau dir dieses Video an!',
}) => {
  const router = useRouter();
  // Generiere Share-URL
  const shareUrl = videoUrl || `https://www.anpip.com/v/${videoId}`;

  /**
   * Duet
   */
  const handleDuet = () => {
    onClose();
    router.push(`/duet/${videoId}`);
  };

  /**
   * Link in Zwischenablage kopieren
   */
  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(shareUrl);
      Alert.alert('Link kopiert', 'Der Link wurde in die Zwischenablage kopiert.');
    } catch (error) {
      console.error('Copy failed:', error);
      Alert.alert('Fehler', 'Link konnte nicht kopiert werden.');
    }
  };

  /**
   * Native Share API
   */
  const handleShare = async () => {
    try {
      const result = await RNShare.share({
        message: `${videoTitle}\n${shareUrl}`,
        url: shareUrl, // Für iOS
        title: videoTitle,
      });

      if (result.action === RNShare.sharedAction) {
        console.log('Shared successfully');
      }
    } catch (error) {
      console.error('Share failed:', error);
      Alert.alert('Fehler', 'Teilen fehlgeschlagen.');
    }
  };

  /**
   * Zu WhatsApp teilen
   */
  const handleShareWhatsApp = async () => {
    const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
      `${videoTitle}\n${shareUrl}`
    )}`;
    
    if (Platform.OS === 'web') {
      window.open(whatsappUrl, '_blank');
    } else {
      // Für Native: Linking.openURL(whatsappUrl)
      handleShare(); // Fallback
    }
  };

  /**
   * Zu Instagram teilen
   */
  const handleShareInstagram = () => {
    Alert.alert('Instagram', 'Instagram-Sharing wird implementiert...');
  };

  /**
   * Zu Facebook teilen
   */
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (Platform.OS === 'web') {
      window.open(fbUrl, '_blank', 'width=600,height=400');
    }
  };

  /**
   * Zu Twitter/X teilen
   */
  const handleShareTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      videoTitle
    )}&url=${encodeURIComponent(shareUrl)}`;
    
    if (Platform.OS === 'web') {
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h3" style={styles.title}>
              Teilen
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Share Options */}
          <View style={styles.optionsContainer}>
            {/* Link kopieren */}
            <TouchableOpacity style={styles.option} onPress={handleCopyLink}>
              <View style={styles.optionIcon}>
                <Ionicons name="link-outline" size={28} color={Colors.primary} />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                Link kopieren
              </Typography>
            </TouchableOpacity>

            {/* Native Share */}
            <TouchableOpacity style={styles.option} onPress={handleShare}>
              <View style={styles.optionIcon}>
                <Ionicons name="share-outline" size={28} color={Colors.primary} />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                Teilen
              </Typography>
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity style={styles.option} onPress={handleShareWhatsApp}>
              <View style={styles.optionIcon}>
                <Ionicons name="logo-whatsapp" size={28} color="#25D366" />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                WhatsApp
              </Typography>
            </TouchableOpacity>

            {/* Facebook */}
            <TouchableOpacity style={styles.option} onPress={handleShareFacebook}>
              <View style={styles.optionIcon}>
                <Ionicons name="logo-facebook" size={28} color="#1877F2" />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                Facebook
              </Typography>
            </TouchableOpacity>

            {/* Twitter/X */}
            <TouchableOpacity style={styles.option} onPress={handleShareTwitter}>
              <View style={styles.optionIcon}>
                <Ionicons name="logo-twitter" size={28} color="#1DA1F2" />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                Twitter
              </Typography>
            </TouchableOpacity>

            {/* Instagram */}
            <TouchableOpacity style={styles.option} onPress={handleShareInstagram}>
              <View style={styles.optionIcon}>
                <Ionicons name="logo-instagram" size={28} color="#E4405F" />
              </View>
              <Typography variant="caption" style={styles.optionText}>
                Instagram
              </Typography>
            </TouchableOpacity>
          </View>

          {/* URL Display */}
          <View style={styles.urlContainer}>
            <Typography variant="caption" style={styles.url} numberOfLines={1}>
              {shareUrl}
            </Typography>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingVertical: 24,
    gap: 16,
  },
  option: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  urlContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  url: {
    color: Colors.primary,
    fontSize: 12,
    textAlign: 'center',
  },
});
