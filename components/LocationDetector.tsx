/**
 * Location Detector Component
 * 
 * Zeigt einen Dialog beim ersten App-Start,
 * der den Nutzer fragt, ob er seinen Standort freigeben möchte
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Typography, PrimaryButton } from '@/components/ui';
import { Colors, Spacing, BorderRadius } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/contexts/LocationContext';

export function LocationDetector() {
  const { userLocation, isDetecting, detectLocation, hasLocation } = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  useEffect(() => {
    // Prüfe beim App-Start, ob wir bereits einen Standort haben
    const checkLocation = async () => {
      // Warte kurz, damit die App sich initialisieren kann
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Prüfe ob bereits ein Standort gespeichert ist
      const alreadyAsked = localStorage.getItem('locationAsked') === 'true';
      
      if (!hasLocation && !alreadyAsked && !hasAsked) {
        setShowDialog(true);
      }
    };

    if (Platform.OS === 'web') {
      checkLocation();
    }
  }, []);

  const handleAllow = async () => {
    setShowDialog(false);
    setHasAsked(true);
    localStorage.setItem('locationAsked', 'true');
    
    await detectLocation();
  };

  const handleDecline = () => {
    setShowDialog(false);
    setHasAsked(true);
    localStorage.setItem('locationAsked', 'true');
  };

  if (!showDialog) {
    return null;
  }

  return (
    <Modal
      visible={showDialog}
      transparent
      animationType="fade"
      onRequestClose={handleDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.iconContainer}>
            <Ionicons name="location" size={48} color={Colors.primary} />
          </View>

          <Typography variant="h2" style={styles.title}>
            Standort freigeben?
          </Typography>

          <Typography variant="body" style={styles.description}>
            Anpip möchte deinen Standort verwenden, um dir lokale Market-Anzeigen 
            in deiner Nähe zu zeigen.
          </Typography>

          <View style={styles.benefits}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Typography variant="caption" style={styles.benefitText}>
                Lokale Anzeigen aus deiner Stadt
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Typography variant="caption" style={styles.benefitText}>
                Automatische Stadt-Auswahl beim Upload
              </Typography>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              <Typography variant="caption" style={styles.benefitText}>
                Bessere Relevanz der Inhalte
              </Typography>
            </View>
          </View>

          <View style={styles.buttons}>
            <PrimaryButton
              title={isDetecting ? 'Erkenne Standort...' : 'Standort freigeben'}
              onPress={handleAllow}
              disabled={isDetecting}
              style={styles.allowButton}
            />
            
            <TouchableOpacity
              style={styles.declineButton}
              onPress={handleDecline}
              disabled={isDetecting}
            >
              <Typography variant="body" style={styles.declineText}>
                Später
              </Typography>
            </TouchableOpacity>
          </View>

          <Typography variant="caption" style={styles.privacy}>
            🔒 Deine Daten werden vertraulich behandelt und nicht weitergegeben.
          </Typography>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  dialog: {
    backgroundColor: '#1C1C1E',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxWidth: 400,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  benefits: {
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  benefitText: {
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  buttons: {
    gap: Spacing.sm,
  },
  allowButton: {
    marginBottom: 0,
  },
  declineButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  declineText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  privacy: {
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginTop: Spacing.md,
    fontSize: 11,
  },
});
