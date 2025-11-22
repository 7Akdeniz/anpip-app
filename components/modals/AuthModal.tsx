/**
 * Auth Modal Component für Anpip.com
 * 
 * Zeigt Login/Register Screens als Modal-Overlay.
 * Führt Return-Action nach erfolgreichem Login aus.
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthModal } from '@/contexts/AuthModalContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '../auth/LoginScreen';
import { RegisterScreen } from '../auth/RegisterScreen';

export function AuthModal() {
  const { isVisible, config, closeAuthModal, handleAuthSuccess } = useAuthModal();
  const { state } = useAuth();
  const { isAuthenticated, user } = state;
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Setze Initial-Tab basierend auf config
  useEffect(() => {
    if (isVisible && config?.defaultToRegister) {
      setActiveTab('register');
    } else if (isVisible) {
      setActiveTab('login');
    }
  }, [isVisible, config]);

  // Auto-close und Success-Callback wenn User sich authentifiziert hat
  useEffect(() => {
    if (isAuthenticated && user && isVisible) {
      console.log('[AuthModal] User authentifiziert - führe Success-Callback aus');
      handleAuthSuccess();
    }
  }, [isAuthenticated, user, isVisible, handleAuthSuccess]);

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closeAuthModal}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header mit Close-Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={closeAuthModal}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeTab === 'login' ? 'Anmelden' : 'Registrieren'}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Message falls vorhanden */}
        {config?.message && config.message.trim() !== '' && (
          <View style={styles.messageContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.message}>{config.message}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'login' && styles.activeTab]}
            onPress={() => setActiveTab('login')}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>
              Anmelden
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'register' && styles.activeTab]}
            onPress={() => setActiveTab('register')}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.activeTabText]}>
              Registrieren
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'login' ? (
            <LoginScreen embedded onSwitchToRegister={() => setActiveTab('register')} />
          ) : (
            <RegisterScreen embedded onSwitchToLogin={() => setActiveTab('login')} />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F4FF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#007AFF',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
