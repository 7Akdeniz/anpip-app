/**
 * GIFT MODAL - TikTok-Style Geschenke senden
 * 
 * Funktionen:
 * - Virtuelle Geschenke anzeigen
 * - Geschenk auswählen und senden
 * - Creator unterstützen
 * - Animations-Preview
 */

import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui';
import { Colors, Spacing } from '@/constants/Theme';

interface Gift {
  id: string;
  name: string;
  icon: string; // Ionicons name
  coins: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

interface GiftModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  creatorId?: string;
  creatorName?: string;
}

// Verfügbare Geschenke
const GIFTS: Gift[] = [
  { id: '1', name: 'Rose', icon: 'rose-outline', coins: 1, rarity: 'common', color: '#FF6B9D' },
  { id: '2', name: 'Herz', icon: 'heart', coins: 5, rarity: 'common', color: '#FF3B5C' },
  { id: '3', name: 'Daumen', icon: 'thumbs-up', coins: 10, rarity: 'common', color: '#0EA5E9' },
  { id: '4', name: 'Stern', icon: 'star', coins: 20, rarity: 'rare', color: '#FFD700' },
  { id: '5', name: 'Feuerwerk', icon: 'sparkles', coins: 50, rarity: 'rare', color: '#FF4500' },
  { id: '6', name: 'Krone', icon: 'diamond', coins: 100, rarity: 'epic', color: '#9B59B6' },
  { id: '7', name: 'Rakete', icon: 'rocket', coins: 200, rarity: 'epic', color: '#E74C3C' },
  { id: '8', name: 'Trophäe', icon: 'trophy', coins: 500, rarity: 'legendary', color: '#F39C12' },
  { id: '9', name: 'Diamant', icon: 'diamond-outline', coins: 1000, rarity: 'legendary', color: '#3498DB' },
];

export const GiftModal: React.FC<GiftModalProps> = ({
  visible,
  onClose,
  videoId,
  creatorId,
  creatorName = 'Creator',
}) => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [userCoins, setUserCoins] = useState(250); // Beispiel: Nutzer hat 250 Coins
  const [sending, setSending] = useState(false);

  /**
   * Geschenk senden
   */
  const handleSendGift = async () => {
    if (!selectedGift || sending) return;

    if (userCoins < selectedGift.coins) {
      // Nicht genug Coins - TODO: Kaufen-Dialog öffnen
      alert('Nicht genug Coins! Bitte kaufe mehr Coins.');
      return;
    }

    setSending(true);
    try {
      // TODO: Backend-Call zum Senden
      // await supabase.from('gifts').insert(...)
      
      // Coins abziehen
      setUserCoins((prev) => prev - selectedGift.coins);
      
      // Animation zeigen (TODO)
      console.log('Geschenk gesendet:', selectedGift.name);
      
      // Success feedback
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error('Fehler beim Senden:', error);
    } finally {
      setSending(false);
    }
  };

  /**
   * Geschenk-Farbe basierend auf Seltenheit
   */
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'rgba(255,255,255,0.1)';
      case 'rare': return 'rgba(59, 130, 246, 0.2)';
      case 'epic': return 'rgba(168, 85, 247, 0.2)';
      case 'legendary': return 'rgba(251, 191, 36, 0.2)';
      default: return 'rgba(255,255,255,0.1)';
    }
  };

  const getRarityBorder = (rarity: string): string => {
    switch (rarity) {
      case 'common': return 'rgba(255,255,255,0.2)';
      case 'rare': return '#3B82F6';
      case 'epic': return '#A855F7';
      case 'legendary': return '#FBBF24';
      default: return 'rgba(255,255,255,0.2)';
    }
  };

  /**
   * Render einzelnes Geschenk
   */
  const renderGift = ({ item }: { item: Gift }) => {
    const isSelected = selectedGift?.id === item.id;
    const canAfford = userCoins >= item.coins;

    return (
      <TouchableOpacity
        style={[
          styles.giftItem,
          {
            backgroundColor: getRarityColor(item.rarity),
            borderColor: isSelected ? item.color : getRarityBorder(item.rarity),
            borderWidth: isSelected ? 3 : 1,
          },
          !canAfford && styles.giftItemDisabled,
        ]}
        onPress={() => setSelectedGift(item)}
        disabled={!canAfford}
      >
        <Ionicons
          name={item.icon as any}
          size={40}
          color={canAfford ? item.color : 'rgba(255,255,255,0.3)'}
        />
        <Typography
          variant="caption"
          style={!canAfford ? styles.giftNameDisabled : styles.giftName}
        >
          {item.name}
        </Typography>
        <View style={styles.giftCoins}>
          <Ionicons name="diamond-outline" size={12} color={Colors.primary} />
          <Typography variant="caption" style={styles.giftCoinText}>
            {item.coins}
          </Typography>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Typography variant="h3" style={styles.title}>
                Geschenk senden
              </Typography>
              <Typography variant="caption" style={styles.subtitle}>
                an {creatorName}
              </Typography>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Balance */}
          <View style={styles.balanceContainer}>
            <View style={styles.balance}>
              <Ionicons name="diamond" size={20} color={Colors.primary} />
              <Typography variant="body" style={styles.balanceText}>
                {userCoins} Coins
              </Typography>
            </View>
            <TouchableOpacity style={styles.buyButton}>
              <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
              <Typography variant="caption" style={styles.buyButtonText}>
                Kaufen
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Gifts Grid */}
          <FlatList
            data={GIFTS}
            renderItem={renderGift}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.giftsGrid}
            showsVerticalScrollIndicator={false}
          />

          {/* Send Button */}
          <View style={styles.footer}>
            {selectedGift && (
              <View style={styles.selectedGiftInfo}>
                <Ionicons
                  name={selectedGift.icon as any}
                  size={24}
                  color={selectedGift.color}
                />
                <Typography variant="body" style={styles.selectedGiftName}>
                  {selectedGift.name}
                </Typography>
                <View style={styles.selectedGiftCoins}>
                  <Ionicons name="diamond-outline" size={16} color={Colors.primary} />
                  <Typography variant="body" style={styles.selectedGiftCoinText}>
                    {selectedGift.coins}
                  </Typography>
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!selectedGift || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendGift}
              disabled={!selectedGift || sending}
            >
              <Typography variant="body" style={styles.sendButtonText}>
                {sending ? 'Sende...' : selectedGift ? 'Geschenk senden' : 'Wähle ein Geschenk'}
              </Typography>
            </TouchableOpacity>
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
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
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
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  balance: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(14, 165, 233, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  buyButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  giftsGrid: {
    padding: 16,
  },
  giftItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  giftItemDisabled: {
    opacity: 0.4,
  },
  giftName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  giftNameDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
  giftCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  giftCoinText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedGiftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
  },
  selectedGiftName: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedGiftCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedGiftCoinText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
