// ============================================================================
// ⭐ ABONNEMENTS VERWALTEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import type { Subscription } from '@/types/settings';

export default function SubscriptionsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) {
          setSubscriptions(data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Abonnements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = (subscription: Subscription) => {
    Alert.alert(
      'Abonnement kündigen',
      `Möchtest du ${subscription.plan_name} wirklich kündigen? Das Abo läuft bis ${new Date(subscription.next_billing_date || '').toLocaleDateString('de-DE')} weiter.`,
      [
        { text: 'Zurück', style: 'cancel' },
        {
          text: 'Kündigen',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('subscriptions')
                .update({ cancel_at_period_end: true })
                .eq('id', subscription.id);
              
              loadSubscriptions();
              Alert.alert('Erfolg', 'Abonnement wurde gekündigt');
            } catch (error) {
              Alert.alert('Fehler', 'Abonnement konnte nicht gekündigt werden');
            }
          },
        },
      ]
    );
  };

  const handleReactivate = async (subscriptionId: string) => {
    try {
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('id', subscriptionId);
      
      loadSubscriptions();
      Alert.alert('Erfolg', 'Abonnement wurde reaktiviert');
    } catch (error) {
      Alert.alert('Fehler', 'Abonnement konnte nicht reaktiviert werden');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'cancelled':
        return '#FF9500';
      case 'expired':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktiv';
      case 'cancelled':
        return 'Gekündigt';
      case 'expired':
        return 'Abgelaufen';
      default:
        return status;
    }
  };

  const plans = [
    {
      name: 'Anpip Premium',
      price: 9.99,
      features: [
        'Werbefrei',
        'Erweiterte Statistiken',
        'Exklusive Filter',
        'Priorisierter Support',
        'HD-Uploads',
      ],
    },
    {
      name: 'Anpip Pro',
      price: 19.99,
      features: [
        'Alle Premium Features',
        'Analytics Dashboard',
        'Verifiziertes Profil',
        '24/7 Support',
        'API-Zugriff',
        'White-Label Option',
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Abonnements',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        {/* Aktive Abonnements */}
        {subscriptions.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
              DEINE ABONNEMENTS
            </Text>
            {subscriptions.map((sub) => (
              <View key={sub.id} style={[styles.subscriptionCard, isDark && styles.subscriptionCardDark]}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={[styles.planName, isDark && styles.planNameDark]}>
                      {sub.plan_name}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sub.status) }]}>
                      <Text style={styles.statusText}>{getStatusLabel(sub.status)}</Text>
                    </View>
                  </View>
                  <Text style={[styles.price, isDark && styles.priceDark]}>
                    {sub.price.toFixed(2)} {sub.currency}
                    <Text style={styles.priceInterval}> /Monat</Text>
                  </Text>
                </View>

                {sub.next_billing_date && (
                  <Text style={[styles.billingDate, isDark && styles.billingDateDark]}>
                    {sub.cancel_at_period_end 
                      ? `Endet am ${new Date(sub.next_billing_date).toLocaleDateString('de-DE')}`
                      : `Nächste Zahlung: ${new Date(sub.next_billing_date).toLocaleDateString('de-DE')}`
                    }
                  </Text>
                )}

                <View style={styles.actions}>
                  {sub.status === 'active' && !sub.cancel_at_period_end && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancelSubscription(sub)}
                    >
                      <Text style={styles.cancelButtonText}>Kündigen</Text>
                    </TouchableOpacity>
                  )}
                  {sub.cancel_at_period_end && (
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reactivateButton]}
                      onPress={() => handleReactivate(sub.id)}
                    >
                      <Text style={styles.reactivateButtonText}>Reaktivieren</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Verfügbare Pläne */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDark && styles.sectionTitleDark]}>
            VERFÜGBARE PLÄNE
          </Text>
          {plans.map((plan, index) => (
            <View key={index} style={[styles.planCard, isDark && styles.planCardDark]}>
              <View style={styles.planHeader}>
                <Ionicons
                  name="star"
                  size={24}
                  color="#FF3B30"
                  style={styles.planIcon}
                />
                <Text style={[styles.planTitle, isDark && styles.planTitleDark]}>
                  {plan.name}
                </Text>
              </View>

              <Text style={[styles.planPrice, isDark && styles.planPriceDark]}>
                {plan.price.toFixed(2)} EUR
                <Text style={styles.planPriceInterval}> /Monat</Text>
              </Text>

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    <Text style={[styles.featureText, isDark && styles.featureTextDark]}>
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => Alert.alert('Info', 'Upgrade-Funktion in Entwicklung')}
              >
                <Text style={styles.upgradeButtonText}>Jetzt upgraden</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitleDark: {
    color: '#8E8E93',
  },
  subscriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  subscriptionCardDark: {
    backgroundColor: '#1C1C1E',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  planNameDark: {
    color: '#FFFFFF',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  priceDark: {
    color: '#FFFFFF',
  },
  priceInterval: {
    fontSize: 14,
    fontWeight: '400',
    color: '#8E8E93',
  },
  billingDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  billingDateDark: {
    color: '#8E8E93',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFE5E5',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  reactivateButton: {
    backgroundColor: '#E5F8EC',
  },
  reactivateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  planCardDark: {
    backgroundColor: '#1C1C1E',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIcon: {
    marginRight: 8,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  planTitleDark: {
    color: '#FFFFFF',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  planPriceDark: {
    color: '#FFFFFF',
  },
  planPriceInterval: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
  },
  featuresList: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#000000',
    marginLeft: 8,
  },
  featureTextDark: {
    color: '#FFFFFF',
  },
  upgradeButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
