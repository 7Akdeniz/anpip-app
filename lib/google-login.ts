/**
 * 🔐 GOOGLE LOGIN SERVICE
 * 
 * Frontend-Service für Google OAuth mit Google Identity Services (neuestes System)
 * Unterstützt Web & Mobile Browser
 */

import { Platform } from 'react-native';

// Google Client ID (aus .env)
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

interface GoogleLoginResponse {
  success: boolean;
  credential?: string; // ID Token
  error?: string;
}

interface GoogleUser {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export class GoogleLoginService {
  private static instance: GoogleLoginService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): GoogleLoginService {
    if (!GoogleLoginService.instance) {
      GoogleLoginService.instance = new GoogleLoginService();
    }
    return GoogleLoginService.instance;
  }

  /**
   * 🚀 INITIALISIERE GOOGLE IDENTITY SERVICES
   * Muss einmal beim App-Start aufgerufen werden (nur Web)
   */
  public async initialize(): Promise<void> {
    if (Platform.OS !== 'web') {
      console.log('⚠️ Google Login nur auf Web verfügbar');
      return;
    }

    if (this.isInitialized) {
      return;
    }

    try {
      // Lade Google Identity Services Script
      await this.loadGoogleScript();

      // Initialisiere Google Identity Services
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: () => {}, // Callback wird bei Login gesetzt
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        this.isInitialized = true;
        console.log('✅ Google Identity Services initialized');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Login:', error);
      throw error;
    }
  }

  /**
   * 🔐 LOGIN MIT GOOGLE (POPUP)
   * Öffnet Google Login Popup und gibt ID-Token zurück
   */
  public async loginWithPopup(): Promise<GoogleLoginResponse> {
    if (Platform.OS !== 'web') {
      return {
        success: false,
        error: 'Google Login nur auf Web verfügbar',
      };
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      try {
        // Callback für erfolgreichen Login
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response: any) => {
            if (response.credential) {
              resolve({
                success: true,
                credential: response.credential,
              });
            } else {
              resolve({
                success: false,
                error: 'Kein Token erhalten',
              });
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Öffne Popup
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // User hat Popup geschlossen oder es wurde nicht angezeigt
            resolve({
              success: false,
              error: 'Login abgebrochen',
            });
          }
        });
      } catch (error) {
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        });
      }
    });
  }

  /**
   * 🔐 LOGIN MIT GOOGLE (BUTTON)
   * Rendert Google's eigenen Login-Button
   * 
   * Verwendung:
   * ```tsx
   * <div id="google-login-button"></div>
   * googleLoginService.renderButton('google-login-button', handleLogin);
   * ```
   */
  public async renderButton(
    elementId: string,
    onSuccess: (credential: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (Platform.OS !== 'web') {
      onError?.('Google Login nur auf Web verfügbar');
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      (window as any).google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'filled_black',
          size: 'large',
          type: 'standard',
          shape: 'rectangular',
          text: 'signin_with',
          logo_alignment: 'left',
          width: 300,
        }
      );

      // Setze Callback
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            if (onError) {
              onError('Kein Token erhalten');
            }
          }
        },
      });
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      }
    }
  }

  /**
   * 🔐 LOGIN MIT ONE-TAP
   * Zeigt Google's "One Tap" Login an (automatisch wenn User eingeloggt ist)
   */
  public async showOneTap(
    onSuccess: (credential: string) => void,
    onError?: (error: string) => void
  ): Promise<void> {
    if (Platform.OS !== 'web') {
      if (onError) {
        onError('Google Login nur auf Web verfügbar');
      }
      return;
    }

    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          if (response.credential) {
            onSuccess(response.credential);
          } else {
            if (onError) {
              onError('Kein Token erhalten');
            }
          }
        },
        auto_select: true,
      });

      (window as any).google.accounts.id.prompt();
    } catch (error) {
      if (onError) {
        onError(error instanceof Error ? error.message : 'Unbekannter Fehler');
      }
    }
  }

  /**
   * 🔄 SENDE TOKEN AN BACKEND
   * Schickt ID-Token an unser Backend zur Validierung
   */
  public async authenticateWithBackend(
    credential: string,
    returnUrl?: string
  ): Promise<{
    success: boolean;
    user?: GoogleUser;
    session?: any;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: credential,
          returnUrl: returnUrl || '/(tabs)',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Backend-Authentifizierung fehlgeschlagen',
        };
      }

      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Netzwerkfehler',
      };
    }
  }

  /**
   * 📜 LADE GOOGLE SCRIPT
   * Lädt das Google Identity Services Script dynamisch
   */
  private async loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Prüfe, ob Script schon geladen ist
      if (typeof window !== 'undefined' && (window as any).google) {
        resolve();
        return;
      }

      // Erstelle Script-Tag
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('✅ Google Script loaded');
        resolve();
      };

      script.onerror = () => {
        console.error('❌ Failed to load Google Script');
        reject(new Error('Failed to load Google Script'));
      };

      document.head.appendChild(script);
    });
  }
}

// Singleton Export
export const googleLoginService = GoogleLoginService.getInstance();
