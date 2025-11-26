/**
 * Auth Modal Component für Anpip.com
 * 
 * Zeigt Login/Register Screens als Modal-Overlay mit Video-Hintergrund.
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
import ForgotPasswordScreen from '@/app/auth/forgot-password';
import { Video } from 'expo-av';

export function AuthModal() {
  const { isVisible, config, closeAuthModal, handleAuthSuccess } = useAuthModal();
  const { state } = useAuth();
  const { isAuthenticated, user } = state;
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot-password'>('login');

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
      presentationStyle="fullScreen"
      onRequestClose={closeAuthModal}
      transparent={true}
    >
      <View style={styles.container}>
        {/* Video Background - Fullscreen */}
        {Platform.OS === 'web' ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          >
            <source src="https://cdn.pixabay.com/video/2024/05/20/212491_large.mp4" type="video/mp4" />
          </video>
        ) : (
          <Video
            source={{ uri: 'https://cdn.pixabay.com/video/2024/05/20/212491_large.mp4' }}
            style={StyleSheet.absoluteFillObject}
            shouldPlay
            isLooping
            isMuted
            resizeMode="cover"
          />
        )}

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.overlayContainer}
        >
        {/* Header mit Close-Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={closeAuthModal}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {activeTab === 'login' ? 'Anmelden' : activeTab === 'register' ? 'Registrieren' : 'Passwort zurücksetzen'}
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

        {/* Tab Switcher - nur bei login/register */}
        {activeTab !== 'forgot-password' && (
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
        )}

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {activeTab === 'login' ? (
            <LoginScreen 
              embedded 
              onSwitchToRegister={() => setActiveTab('register')}
              onForgotPassword={() => setActiveTab('forgot-password')}
            />
          ) : activeTab === 'register' ? (
            <RegisterScreen embedded onSwitchToLogin={() => setActiveTab('login')} />
          ) : (
            <ForgotPasswordScreen 
              embedded
              onBack={() => setActiveTab('login')}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlayContainer: {
    flex: 1,
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 0,
  },
  closeButton: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.4)',
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: '#ffffff',
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
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    borderBottomColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
});
