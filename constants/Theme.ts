/**
 * ANPIP.COM - THEME SYSTEM
 * Google Material Design Style
 * 
 * Hier findest du alle Farben, Schriftgrößen und Abstände für die App.
 * Wenn du etwas ändern willst (z.B. die Hauptfarbe), machst du es hier!
 */

export const Colors = {
  // Hauptfarben (Primary = Lila/Purple)
  primary: '#9C27B0',          // Haupt-Lila
  primaryLight: '#E1BEE7',     // Helles Lila
  primaryDark: '#6A0080',      // Dunkles Lila
  
  // Hintergründe
  background: '#FFFFFF',       // Weiß
  surface: '#FAFAFA',          // Heller Grau-Ton
  surfaceVariant: '#F5F5F5',   // Alternative Oberfläche
  card: '#FFFFFF',             // Card background
  
  // Text-Farben
  text: '#212121',             // Haupt-Text (fast schwarz)
  textSecondary: '#757575',    // Sekundärer Text (grau)
  textDisabled: '#BDBDBD',     // Deaktivierter Text
  textOnPrimary: '#FFFFFF',    // Text auf lila Hintergrund
  textInverse: '#FFFFFF',      // Inverse text color
  
  // Status-Farben
  success: '#4CAF50',          // Grün für Erfolg
  error: '#F44336',            // Rot für Fehler
  warning: '#FF9800',          // Orange für Warnung
  info: '#2196F3',             // Blau für Info
  
  // UI-Elemente
  border: '#E0E0E0',           // Rahmen
  divider: '#EEEEEE',          // Trennlinien
  shadow: 'rgba(0, 0, 0, 0.1)', // Schatten
  overlay: 'rgba(0, 0, 0, 0.5)', // Overlay (z.B. für Modals)
  
  // Likes & Interaktionen
  like: '#E91E63',             // Pink für Likes
  
  // Transparent
  transparent: 'transparent',
};

export const Typography = {
  // Schriftfamilie
  fontFamily: {
    regular: 'System',  // Auf iOS/Android nutzt es System-Font, im Web Roboto
    medium: 'System',
    bold: 'System',
  },
  
  // Schriftgrößen
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },
  
  // Schrift-Gewicht
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Zeilenhöhe
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const Spacing = {
  // Abstände (in Pixeln)
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  // Abrundungen
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 999, // Komplett rund (für Buttons, Avatare)
};

export const Shadows = {
  // Google Material Design Schatten
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1, // Für Android
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const Layout = {
  // Maximale Breiten (für Web)
  maxWidth: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
  },
  
  // Bildschirmgrößen
  breakpoints: {
    mobile: 0,
    tablet: 768,
    desktop: 1024,
  },
};

// Standard-Styles die du oft brauchen wirst
export const CommonStyles = {
  // Container mit Padding
  container: {
    paddingHorizontal: Spacing.md,
  },
  
  // Zentrierter Content
  centerContent: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  
  // Reihe (horizontal)
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  
  // Spalte (vertikal)
  column: {
    flexDirection: 'column' as const,
  },
};

export default {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
  CommonStyles,
};
