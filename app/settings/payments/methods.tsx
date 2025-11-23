// ============================================================================
// 💳 ZAHLUNGSMETHODEN
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
import type { PaymentMethod } from '@/types/settings';

export default function PaymentMethodsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', user.id)
          .order('is_default', { ascending: false });
        
        if (data) {
          setMethods(data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Zahlungsmethoden:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    Alert.alert('Info', 'Zahlungsmethode hinzufügen - in Entwicklung');
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Set all to non-default
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', user.id);
        
        // Set selected as default
        await supabase
          .from('payment_methods')
          .update({ is_default: true })
          .eq('id', id);
        
        loadPaymentMethods();
      }
    } catch (error) {
      console.error('Fehler:', error);
      Alert.alert('Fehler', 'Standard-Zahlungsmethode konnte nicht geändert werden');
    }
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Zahlungsmethode entfernen',
      'Möchtest du diese Zahlungsmethode wirklich entfernen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Entfernen',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase
                .from('payment_methods')
                .delete()
                .eq('id', id);
              loadPaymentMethods();
            } catch (error) {
              Alert.alert('Fehler', 'Zahlungsmethode konnte nicht entfernt werden');
            }
          },
        },
      ]
    );
  };

  const getPaymentIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'card':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      case 'apple_pay':
        return 'logo-apple';
      case 'google_pay':
        return 'logo-google';
      default:
        return 'card-outline';
    }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `•••• ${method.last_four}`;
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      case 'google_pay':
        return 'Google Pay';
      default:
        return 'Zahlungsmethode';
    }
  };

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Zahlungsmethoden',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <ScrollView style={styles.scrollView}>
        {methods.length > 0 ? (
          <View style={styles.methodsList}>
            {methods.map((method) => (
              <View
                key={method.id}
                style={[styles.methodItem, isDark && styles.methodItemDark]}
              >
                <View style={styles.methodHeader}>
                  <Ionicons
                    name={getPaymentIcon(method.type)}
                    size={24}
                    color={isDark ? '#FFFFFF' : '#000000'}
                  />
                  <View style={styles.methodInfo}>
                    <Text style={[styles.methodLabel, isDark && styles.methodLabelDark]}>
                      {getPaymentLabel(method)}
                    </Text>
                    {method.expiry && (
                      <Text style={[styles.methodExpiry, isDark && styles.methodExpiryDark]}>
                        Gültig bis {method.expiry}
                      </Text>
                    )}
                  </View>
                  {method.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Standard</Text>
                    </View>
                  )}
                </View>

                <View style={styles.methodActions}>
                  {!method.is_default && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleSetDefault(method.id)}
                    >
                      <Text style={styles.actionButtonText}>Als Standard</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemove(method.id)}
                  >
                    <Text style={styles.removeButtonText}>Entfernen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons
              name="card-outline"
              size={64}
              color={isDark ? '#8E8E93' : '#C7C7CC'}
            />
            <Text style={[styles.emptyTitle, isDark && styles.emptyTitleDark]}>
              Keine Zahlungsmethoden
            </Text>
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              Füge eine Zahlungsmethode hinzu, um Premium-Features zu nutzen
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddPayment}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FF3B30" />
          <Text style={styles.addButtonText}>Zahlungsmethode hinzufügen</Text>
        </TouchableOpacity>

        <View style={[styles.securityBox, isDark && styles.securityBoxDark]}>
          <Ionicons name="shield-checkmark" size={24} color="#34C759" />
          <Text style={[styles.securityText, isDark && styles.securityTextDark]}>
            Alle Zahlungen werden sicher über Stripe verschlüsselt
          </Text>
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
  methodsList: {
    padding: 16,
  },
  methodItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodItemDark: {
    backgroundColor: '#1C1C1E',
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  methodLabelDark: {
    color: '#FFFFFF',
  },
  methodExpiry: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  methodExpiryDark: {
    color: '#8E8E93',
  },
  defaultBadge: {
    backgroundColor: '#34C759',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  removeButton: {
    backgroundColor: '#FFE5E5',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyTitleDark: {
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyTextDark: {
    color: '#8E8E93',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5F8EC',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  securityBoxDark: {
    backgroundColor: '#1C2E1F',
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#34C759',
    lineHeight: 18,
  },
  securityTextDark: {
    color: '#48D764',
  },
  bottomSpacer: {
    height: 40,
  },
});
