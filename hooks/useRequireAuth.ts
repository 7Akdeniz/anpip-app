/**
 * Auth-Guard Hook für Anpip.com
 * 
 * Prüft ob User authentifiziert ist und öffnet Login-Modal falls nötig.
 * Speichert die beabsichtigte Aktion für Redirect nach erfolgreichem Login.
 * 
 * Features:
 * - Prüft Auth-Status
 * - Öffnet Login-Modal automatisch
 * - Speichert Return-Action
 * - Freundliche UX-Messages
 */

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthModal } from '@/contexts/AuthModalContext';

export interface AuthActionConfig {
  /** Name der Aktion für UX-Message */
  actionName: string;
  /** Callback der nach erfolgreichem Login ausgeführt wird */
  onAuthSuccess?: () => void | Promise<void>;
  /** Custom Message für Login-Modal */
  message?: string;
}

export function useRequireAuth() {
  const { state, signIn, signInWithProvider } = useAuth();
  const { isAuthenticated, loading, user } = state;
  const { openAuthModal } = useAuthModal();

  /**
   * Prüft Auth und führt Aktion aus oder öffnet Login-Modal
   * 
   * @example
   * const requireAuth = useRequireAuth();
   * 
   * const handleLike = () => {
   *   requireAuth({
   *     actionName: 'like',
   *     onAuthSuccess: async () => {
   *       await likeVideo(videoId);
   *     },
   *     message: 'Melde dich an, um Videos zu liken'
   *   });
   * };
   */
  const requireAuth = useCallback(
    (config: AuthActionConfig) => {
      const { actionName, onAuthSuccess, message } = config;

      // Loading State - warte bis Auth-Status bekannt ist
      if (loading) {
        console.log('[Auth] Warte auf Auth-Status...');
        return false;
      }

      // Nicht authentifiziert - öffne Login-Modal
      if (!isAuthenticated || !user) {
        console.log('[Auth] User nicht authentifiziert - öffne Login-Modal für:', actionName);
        
        openAuthModal({
          message: message || getDefaultMessage(actionName),
          onSuccess: onAuthSuccess,
          actionName,
        });

        return false;
      }

      // Authentifiziert - führe Aktion sofort aus
      console.log('[Auth] User authentifiziert - führe Aktion aus:', actionName);
      if (onAuthSuccess) {
        Promise.resolve(onAuthSuccess()).catch((error) => {
          console.error('[Auth] Fehler bei Aktion nach Auth:', error);
        });
      }

      return true;
    },
    [isAuthenticated, loading, user, openAuthModal]
  );

  /**
   * Sync-Version für einfache Checks ohne Action
   * 
   * @example
   * const { checkAuth } = useRequireAuth();
   * if (!checkAuth('upload')) return;
   */
  const checkAuth = useCallback(
    (actionName: string, message?: string): boolean => {
      if (loading) return false;
      
      if (!isAuthenticated || !user) {
        openAuthModal({
          message: message || getDefaultMessage(actionName),
          actionName,
        });
        return false;
      }

      return true;
    },
    [isAuthenticated, loading, user, openAuthModal]
  );

  return {
    /** Führt Auth-Check aus und öffnet Modal falls nötig */
    requireAuth,
    /** Einfacher Auth-Check ohne Action-Callback */
    checkAuth,
    /** Ist User authentifiziert? */
    isAuthenticated,
    /** Auth wird noch geladen? */
    loading,
    /** Aktueller User */
    user,
  };
}

/**
 * Standard-Messages für verschiedene Aktionen
 */
function getDefaultMessage(actionName: string): string {
  const messages: Record<string, string> = {
    like: 'Melde dich an, um Videos zu liken',
    comment: 'Melde dich an, um zu kommentieren',
    share: 'Melde dich an, um Videos zu teilen',
    save: 'Melde dich an, um Videos zu speichern',
    follow: 'Melde dich an, um Creator:innen zu folgen',
    gift: 'Melde dich an, um Geschenke zu senden',
    upload: 'Melde dich an, um Videos hochzuladen',
    message: 'Melde dich an, um Nachrichten zu senden',
    profile: 'Melde dich an, um dein Profil zu sehen',
    settings: 'Melde dich an, um Einstellungen zu ändern',
    marketplace: 'Melde dich an, um auf dem Marktplatz zu verkaufen',
    default: 'Melde dich an, um fortzufahren',
  };

  return messages[actionName.toLowerCase()] || messages.default;
}
