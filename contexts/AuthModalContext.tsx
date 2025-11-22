/**
 * Auth Modal Context für Anpip.com
 * 
 * Verwaltet den State und die Logik für das Login/Register Modal.
 * Speichert Return-Actions für nahtlosen Redirect nach erfolgreicher Auth.
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AuthModalConfig {
  /** Nachricht die im Modal angezeigt wird */
  message?: string;
  /** Callback der nach erfolgreichem Login ausgeführt wird */
  onSuccess?: () => void | Promise<void>;
  /** Name der Aktion für Tracking */
  actionName?: string;
  /** Initial auf Register-Ansicht öffnen? */
  defaultToRegister?: boolean;
}

interface AuthModalContextValue {
  /** Ist Modal aktuell sichtbar? */
  isVisible: boolean;
  /** Aktuelle Modal-Config */
  config: AuthModalConfig | null;
  /** Öffnet das Auth-Modal */
  openAuthModal: (config?: AuthModalConfig) => void;
  /** Schließt das Auth-Modal */
  closeAuthModal: () => void;
  /** Führt Success-Callback aus nach Login */
  handleAuthSuccess: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<AuthModalConfig | null>(null);

  const openAuthModal = useCallback((modalConfig?: AuthModalConfig) => {
    console.log('[AuthModal] Öffne Modal:', modalConfig?.actionName);
    setConfig(modalConfig || {});
    setIsVisible(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    console.log('[AuthModal] Schließe Modal');
    setIsVisible(false);
    // Config bleibt erhalten für Success-Callback
  }, []);

  const handleAuthSuccess = useCallback(() => {
    console.log('[AuthModal] Auth erfolgreich - führe Return-Action aus');
    
    // Führe Success-Callback aus
    if (config?.onSuccess) {
      Promise.resolve(config.onSuccess())
        .then(() => {
          console.log('[AuthModal] Return-Action erfolgreich');
        })
        .catch((error) => {
          console.error('[AuthModal] Fehler bei Return-Action:', error);
        });
    }

    // Schließe Modal und clear config
    setIsVisible(false);
    setConfig(null);
  }, [config]);

  const value: AuthModalContextValue = {
    isVisible,
    config,
    openAuthModal,
    closeAuthModal,
    handleAuthSuccess,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
