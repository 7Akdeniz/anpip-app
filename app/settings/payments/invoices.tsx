// ============================================================================
// 🧾 RECHNUNGSÜBERSICHT
// ============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

type Invoice = {
  id: string;
  invoice_number: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  description: string;
  pdf_url?: string;
};

export default function InvoicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
        
        if (data) {
          setInvoices(data);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Rechnungen:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (invoice: Invoice) => {
    if (invoice.pdf_url) {
      // Download-Logik hier
      Alert.alert('Download', `Rechnung ${invoice.invoice_number} wird heruntergeladen`);
    } else {
      Alert.alert('Fehler', 'Rechnung nicht verfügbar');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#34C759';
      case 'pending':
        return '#FF9500';
      case 'failed':
        return '#FF3B30';
      default:
        return '#8E8E93';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Bezahlt';
      case 'pending':
        return 'Ausstehend';
      case 'failed':
        return 'Fehlgeschlagen';
      default:
        return 'Unbekannt';
    }
  };

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={[styles.invoiceCard, isDark && styles.invoiceCardDark]}>
      <View style={styles.invoiceHeader}>
        <View style={styles.invoiceInfo}>
          <Text style={[styles.invoiceNumber, isDark && styles.invoiceNumberDark]}>
            {item.invoice_number}
          </Text>
          <Text style={[styles.invoiceDate, isDark && styles.invoiceDateDark]}>
            {new Date(item.date).toLocaleDateString('de-DE')}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>

      <Text style={[styles.invoiceDescription, isDark && styles.invoiceDescriptionDark]}>
        {item.description}
      </Text>

      <View style={styles.invoiceFooter}>
        <Text style={[styles.invoiceAmount, isDark && styles.invoiceAmountDark]}>
          {item.amount.toFixed(2)} {item.currency}
        </Text>
        <TouchableOpacity
          style={styles.downloadButton}
          onPress={() => handleDownload(item)}
        >
          <Ionicons name="download-outline" size={20} color="#007AFF" />
          <Text style={styles.downloadText}>PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, isDark && styles.containerDark]}>
      <Stack.Screen
        options={{
          title: 'Rechnungsübersicht',
          headerStyle: {
            backgroundColor: isDark ? '#000000' : '#FFFFFF',
          },
          headerTintColor: isDark ? '#FFFFFF' : '#000000',
        }}
      />

      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="receipt-outline"
              size={64}
              color={isDark ? '#8E8E93' : '#C7C7CC'}
            />
            <Text style={[styles.emptyText, isDark && styles.emptyTextDark]}>
              Keine Rechnungen vorhanden
            </Text>
            <Text style={[styles.emptySubtext, isDark && styles.emptySubtextDark]}>
              Hier erscheinen deine Rechnungen für Premium-Abos
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  invoiceCardDark: {
    backgroundColor: '#1C1C1E',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  invoiceNumberDark: {
    color: '#FFFFFF',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  invoiceDateDark: {
    color: '#8E8E93',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  invoiceDescription: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 12,
  },
  invoiceDescriptionDark: {
    color: '#E5E5E7',
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E7',
    paddingTop: 12,
  },
  invoiceAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  invoiceAmountDark: {
    color: '#FFFFFF',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  downloadText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    marginTop: 16,
  },
  emptyTextDark: {
    color: '#FFFFFF',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  emptySubtextDark: {
    color: '#8E8E93',
  },
});
