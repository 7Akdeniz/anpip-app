/**
 * ============================================================================
 * COIN SHOP SCREEN
 * ============================================================================
 * 
 * User kann hier Coins kaufen
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Typography, PrimaryButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { buyCoins, getUserCoins, COIN_PACKAGES, CoinPackage } from '@/lib/purchase-engine';

export default function CoinShopScreen() {
  const [currentCoins, setCurrentCoins] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  async function loadUserData() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    setUserId(session.user.id);
    const coins = await getUserCoins(session.user.id);
    setCurrentCoins(coins);
  }

  async function handleBuyCoins(pkg: CoinPackage) {
    if (!userId) {
      Alert.alert('Fehler', 'Bitte melde dich an');
      return;
    }

    setLoading(true);

    try {
      const result = await buyCoins(userId, pkg.id);

      if (result.success) {
        Alert.alert(
          '✅ Kauf erfolgreich!',
          `Du hast ${result.coins} Coins erhalten!`,
          [{ text: 'OK' }]
        );
        
        // Reload Coins
        const newCoins = await getUserCoins(userId);
        setCurrentCoins(newCoins);
      } else {
        Alert.alert('Fehler', result.error || 'Kauf fehlgeschlagen');
      }
    } catch (error) {
      Alert.alert('Fehler', 'Kauf konnte nicht abgeschlossen werden');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Typography variant="h2" style={styles.title}>Coin Shop</Typography>
        <View style={styles.balanceCard}>
          <Ionicons name="cash" size={32} color={Colors.primary} />
          <View style={styles.balanceInfo}>
            <Typography variant="caption" style={styles.balanceLabel}>
              Dein Guthaben
            </Typography>
            <Typography variant="h2" style={styles.balanceAmount}>
              {currentCoins} Coins
            </Typography>
          </View>
        </View>
      </View>

      {/* Packages */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {COIN_PACKAGES.map((pkg) => (
          <TouchableOpacity
            key={pkg.id}
            style={[
              styles.packageCard,
              pkg.popular && styles.popularCard,
            ]}
            onPress={() => handleBuyCoins(pkg)}
            disabled={loading}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Typography variant="caption" style={styles.popularText}>
                  ⭐ Beliebt
                </Typography>
              </View>
            )}

            <View style={styles.packageHeader}>
              <View style={styles.coinIcon}>
                <Ionicons name="cash" size={40} color="#FFD700" />
              </View>
              <View style={styles.packageInfo}>
                <Typography variant="h3" style={styles.packageCoins}>
                  {pkg.coins} Coins
                </Typography>
                {pkg.bonus && (
                  <Typography variant="caption" style={styles.bonusText}>
                    + {pkg.bonus} Bonus
                  </Typography>
                )}
              </View>
            </View>

            <View style={styles.packageFooter}>
              <Typography variant="h3" style={styles.price}>
                €{pkg.price.toFixed(2)}
              </Typography>
              <View style={styles.buyButton}>
                <Typography variant="body" style={styles.buyText}>
                  Kaufen
                </Typography>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* Info */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color={Colors.primary} />
          <Typography variant="caption" style={styles.infoText}>
            Mit Coins kannst du Geschenke an deine Lieblings-Creator senden.
            Creator erhalten 70% des Wertes und können dies auszahlen lassen.
          </Typography>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
  },
  title: {
    marginBottom: Spacing.md,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  balanceInfo: {
    marginLeft: Spacing.md,
  },
  balanceLabel: {
    opacity: 0.7,
  },
  balanceAmount: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  packageCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  popularCard: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(156, 39, 176, 0.05)',
  },
  popularBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  popularText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  coinIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  packageInfo: {
    marginLeft: Spacing.md,
  },
  packageCoins: {
    fontSize: 24,
  },
  bonusText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  packageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    color: Colors.primary,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  buyText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginRight: Spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
    opacity: 0.8,
  },
});
