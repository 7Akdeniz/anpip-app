/**
 * AUTH CONTEXT - React Context für Authentication
 * 
 * Zentrale State-Verwaltung für Auth in der gesamten App
 */

import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import AuthService from '@/lib/auth-service';
import type {
  AuthState,
  AuthContextType,
  AuthAction,
  RegistrationData,
  LoginCredentials,
  SocialLoginOptions,
  PasswordResetRequest,
  PasswordResetConfirm,
  AccountUpdate,
  TwoFactorSetup,
  TwoFactorVerification,
  DeviceSession,
  AccountDeletionRequest,
  DataExportRequest,
  UserProfile,
  AuthProvider,
} from '@/types/auth';
import { Session } from '@supabase/supabase-js';

// ===========================
// INITIAL STATE
// ===========================

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// ===========================
// REDUCER
// ===========================

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };

    case 'SET_SESSION':
      return {
        ...state,
        session: action.payload,
        isAuthenticated: !!action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case 'SIGN_OUT':
      return {
        ...initialState,
        loading: false,
      };

    default:
      return state;
  }
}

// ===========================
// CONTEXT
// ===========================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===========================
// PROVIDER
// ===========================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ===========================
  // INIT - Session wiederherstellen
  // ===========================

  useEffect(() => {
    // Skip während SSR
    if (typeof window === 'undefined') {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    let mounted = true;

    async function initAuth() {
      try {
        // Session wiederherstellen
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          dispatch({ type: 'SET_SESSION', payload: session });
          
          // User Profil laden
          const profile = await loadUserProfile(session.user.id);
          if (mounted && profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          }
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Auth init error:', error);
        if (mounted) {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    }

    initAuth();

    // Auth State Changes listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('[AUTH] State change:', event);

        dispatch({ type: 'SET_SESSION', payload: session });

        if (session?.user) {
          const profile = await loadUserProfile(session.user.id);
          if (mounted && profile) {
            dispatch({ type: 'SET_USER', payload: profile });
          }
        } else {
          dispatch({ type: 'SIGN_OUT' });
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ===========================
  // HELPER: Load User Profile
  // ===========================

  const loadUserProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const metadata = user.user_metadata || {};

      return {
        id: user.id,
        email: user.email || '',
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
        displayName: metadata.display_name || `${metadata.first_name} ${metadata.last_name}`,
        avatarUrl: metadata.avatar_url,
        phone: metadata.phone,
        country: metadata.country || '',
        preferredLanguage: metadata.preferred_language || 'de',
        companyName: metadata.company_name,
        emailVerified: !!user.email_confirmed_at,
        phoneVerified: !!user.phone_confirmed_at,
        twoFactorEnabled: metadata.two_factor_enabled || false,
        twoFactorMethod: metadata.two_factor_method,
        linkedProviders: getLinkedProviders(user),
        consentGiven: metadata.consent_given || false,
        consentDate: metadata.consent_date ? new Date(metadata.consent_date) : undefined,
        dataProcessingConsent: metadata.data_processing_consent || false,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at || user.created_at),
        lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
      };
    } catch (error) {
      console.error('Failed to load user profile:', error);
      return null;
    }
  };

  const getLinkedProviders = (user: any): AuthProvider[] => {
    const providers: AuthProvider[] = [];
    if (user.email) providers.push('email');

    const identities = user.identities || [];
    for (const identity of identities) {
      const provider = identity.provider;
      if (provider === 'google') providers.push('google');
      else if (provider === 'apple') providers.push('apple');
      else if (provider === 'facebook') providers.push('facebook');
      else if (provider === 'azure') providers.push('microsoft');
      else if (provider === 'linkedin_oidc') providers.push('linkedin');
      else if (provider === 'github') providers.push('github');
    }

    return providers;
  };

  // ===========================
  // AUTH ACTIONS
  // ===========================

  const signUp = useCallback(async (data: RegistrationData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await AuthService.signUp(data);
    
    if (result.success && result.data) {
      dispatch({ type: 'SET_USER', payload: result.data.user });
      if (result.data.session) {
        dispatch({ type: 'SET_SESSION', payload: result.data.session });
      }
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', payload: result.error });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, []);

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await AuthService.signIn(credentials);
    
    if (result.success && result.data) {
      dispatch({ type: 'SET_USER', payload: result.data.user });
      dispatch({ type: 'SET_SESSION', payload: result.data.session });
    } else if (result.error) {
      dispatch({ type: 'SET_ERROR', payload: result.error });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, []);

  const signInWithProvider = useCallback(async (options: SocialLoginOptions) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const result = await AuthService.signInWithProvider(options);
    dispatch({ type: 'SET_LOADING', payload: false });
    return result;
  }, []);

  const signOut = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await AuthService.signOut();
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const requestPasswordReset = useCallback(async (data: PasswordResetRequest) => {
    return await AuthService.requestPasswordReset(data);
  }, []);

  const resetPassword = useCallback(async (data: PasswordResetConfirm) => {
    return await AuthService.resetPassword(data);
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    return await AuthService.changePassword(currentPassword, newPassword);
  }, []);

  const updateProfile = useCallback(async (data: AccountUpdate) => {
    const result = await AuthService.updateProfile(data);
    
    if (result.success && result.data) {
      dispatch({ type: 'SET_USER', payload: result.data });
    }
    
    return result;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    
    const profile = await loadUserProfile(state.user.id);
    if (profile) {
      dispatch({ type: 'SET_USER', payload: profile });
    }
  }, [state.user]);

  // ===========================
  // 2FA (Placeholder - TODO)
  // ===========================

  const setup2FA = useCallback(async (method: TwoFactorSetup['method']) => {
    // TODO: Implement 2FA setup
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: '2FA noch nicht implementiert' },
    };
  }, []);

  const verify2FA = useCallback(async (data: TwoFactorVerification) => {
    // TODO: Implement 2FA verification
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: '2FA noch nicht implementiert' },
    };
  }, []);

  const disable2FA = useCallback(async (password: string) => {
    // TODO: Implement 2FA disable
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: '2FA noch nicht implementiert' },
    };
  }, []);

  // ===========================
  // SOCIAL PROVIDERS (Placeholder)
  // ===========================

  const linkProvider = useCallback(async (provider: AuthProvider) => {
    // TODO: Implement provider linking
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Provider linking noch nicht implementiert' },
    };
  }, []);

  const unlinkProvider = useCallback(async (provider: AuthProvider) => {
    // TODO: Implement provider unlinking
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Provider unlinking noch nicht implementiert' },
    };
  }, []);

  // ===========================
  // SESSION MANAGEMENT (Placeholder)
  // ===========================

  const getSessions = useCallback(async (): Promise<DeviceSession[]> => {
    // TODO: Implement session management
    return [];
  }, []);

  const revokeSession = useCallback(async (sessionId: string) => {
    // TODO: Implement session revocation
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Session Management noch nicht implementiert' },
    };
  }, []);

  const revokeAllSessions = useCallback(async () => {
    // TODO: Implement all sessions revocation
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Session Management noch nicht implementiert' },
    };
  }, []);

  // ===========================
  // ACCOUNT DELETION
  // ===========================

  const deleteAccount = useCallback(async (data: AccountDeletionRequest) => {
    const result = await AuthService.deleteAccount(data);
    
    if (result.success) {
      dispatch({ type: 'SIGN_OUT' });
    }
    
    return result;
  }, []);

  const exportData = useCallback(async (request: DataExportRequest) => {
    // TODO: Implement data export
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Datenexport noch nicht implementiert' },
    };
  }, []);

  // ===========================
  // EMAIL VERIFICATION
  // ===========================

  const resendVerificationEmail = useCallback(async () => {
    // TODO: Implement resend verification
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'E-Mail Verifizierung noch nicht implementiert' },
    };
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    // TODO: Implement email verification
    return {
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'E-Mail Verifizierung noch nicht implementiert' },
    };
  }, []);

  // ===========================
  // CONTEXT VALUE
  // ===========================

  const value: AuthContextType = {
    state,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
    requestPasswordReset,
    resetPassword,
    changePassword,
    updateProfile,
    refreshProfile,
    setup2FA,
    verify2FA,
    disable2FA,
    linkProvider,
    unlinkProvider,
    getSessions,
    revokeSession,
    revokeAllSessions,
    deleteAccount,
    exportData,
    resendVerificationEmail,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===========================
// HOOK
// ===========================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// ===========================
// CONVENIENCE HOOKS
// ===========================

export function useUser() {
  const { state } = useAuth();
  return state.user;
}

export function useSession() {
  const { state } = useAuth();
  return state.session;
}

export function useIsAuthenticated() {
  const { state } = useAuth();
  return state.isAuthenticated;
}
