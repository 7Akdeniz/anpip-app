/**
 * 🔐 AUTH TYPES - Complete Type Definitions
 * 
 * Vollständige TypeScript-Typen für das gesamte Auth-System
 */

import { Session, User } from '@supabase/supabase-js';

// ===========================
// PROVIDERS
// ===========================

export type AuthProvider = 
  | 'email'
  | 'google'
  | 'apple'
  | 'facebook'
  | 'microsoft'
  | 'linkedin'
  | 'github';

// ===========================
// USER PROFILE
// ===========================

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl?: string;
  phone?: string;
  country: string;
  preferredLanguage: string;
  companyName?: string;
  
  // Verification Status
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Security
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'totp' | 'sms' | 'email';
  
  // Social Logins
  linkedProviders: AuthProvider[];
  
  // Consent (DSGVO)
  consentGiven: boolean;
  consentDate?: Date;
  dataProcessingConsent: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ===========================
// AUTH STATE
// ===========================

export interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  isAuthenticated: boolean;
}

// ===========================
// AUTH ERRORS
// ===========================

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

// ===========================
// REGISTRATION
// ===========================

export interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  country: string;
  preferredLanguage: string;
  companyName?: string;
  avatarFile?: File;
  
  // Consent (DSGVO)
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptDataProcessing: boolean;
}

export interface RegistrationResult {
  success: boolean;
  data?: {
    user: UserProfile;
    session?: Session;
    requiresVerification: boolean;
  };
  error?: AuthError;
}

// ===========================
// LOGIN
// ===========================

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResult {
  success: boolean;
  data?: {
    user: UserProfile;
    session: Session;
  };
  error?: AuthError;
}

// ===========================
// SOCIAL LOGIN
// ===========================

export interface SocialLoginOptions {
  provider: Extract<AuthProvider, 'google' | 'apple' | 'facebook' | 'microsoft' | 'linkedin' | 'github'>;
  redirectTo?: string;
  scopes?: string[];
}

export interface SocialLoginResult {
  success: boolean;
  data?: {
    url?: string; // OAuth URL für Redirect
    user?: UserProfile;
    session?: Session;
  };
  error?: AuthError;
}

// ===========================
// PASSWORD RESET
// ===========================

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

export interface PasswordResetResult {
  success: boolean;
  error?: AuthError;
}

// ===========================
// ACCOUNT UPDATE
// ===========================

export interface AccountUpdate {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatarUrl?: string;
  phone?: string;
  country?: string;
  preferredLanguage?: string;
  companyName?: string;
}

export interface AccountUpdateResult {
  success: boolean;
  data?: UserProfile;
  error?: AuthError;
}

// ===========================
// 2FA (Two-Factor Auth)
// ===========================

export interface TwoFactorSetup {
  method: 'totp' | 'sms' | 'email';
}

export interface TwoFactorSetupResult {
  success: boolean;
  data?: {
    qrCode?: string; // Für TOTP
    secret?: string; // Für TOTP
    backupCodes?: string[];
  };
  error?: AuthError;
}

export interface TwoFactorVerification {
  code: string;
  method: 'totp' | 'sms' | 'email';
}

export interface TwoFactorResult {
  success: boolean;
  error?: AuthError;
}

// ===========================
// SESSION MANAGEMENT
// ===========================

export interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  os: string;
  location?: string;
  ipAddress: string;
  current: boolean;
  lastActive: Date;
  createdAt: Date;
}

export interface SessionResult {
  success: boolean;
  error?: AuthError;
}

// ===========================
// ACCOUNT DELETION
// ===========================

export interface AccountDeletionRequest {
  password: string;
  reason?: string;
  feedback?: string;
}

export interface AccountDeletionResult {
  success: boolean;
  error?: AuthError;
}

// ===========================
// DATA EXPORT (DSGVO)
// ===========================

export interface DataExportRequest {
  format: 'json' | 'csv';
  includeVideos?: boolean;
  includeComments?: boolean;
  includeLikes?: boolean;
}

export interface DataExportResult {
  success: boolean;
  data?: {
    downloadUrl: string;
    expiresAt: Date;
  };
  error?: AuthError;
}

// ===========================
// VERIFICATION
// ===========================

export interface VerificationResult {
  success: boolean;
  error?: AuthError;
}

// ===========================
// CONTEXT ACTIONS
// ===========================

export type AuthAction =
  | { type: 'SET_USER'; payload: UserProfile }
  | { type: 'SET_SESSION'; payload: Session | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: AuthError | null }
  | { type: 'SIGN_OUT' };

// ===========================
// CONTEXT TYPE
// ===========================

export interface AuthContextType {
  state: AuthState;
  
  // Registration & Login
  signUp: (data: RegistrationData) => Promise<RegistrationResult>;
  signIn: (credentials: LoginCredentials) => Promise<LoginResult>;
  signInWithProvider: (options: SocialLoginOptions) => Promise<SocialLoginResult>;
  signOut: () => Promise<void>;
  
  // Password Management
  requestPasswordReset: (data: PasswordResetRequest) => Promise<PasswordResetResult>;
  resetPassword: (data: PasswordResetConfirm) => Promise<PasswordResetResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<PasswordResetResult>;
  
  // Profile Management
  updateProfile: (data: AccountUpdate) => Promise<AccountUpdateResult>;
  refreshProfile: () => Promise<void>;
  
  // 2FA
  setup2FA: (method: TwoFactorSetup['method']) => Promise<TwoFactorSetupResult>;
  verify2FA: (data: TwoFactorVerification) => Promise<TwoFactorResult>;
  disable2FA: (password: string) => Promise<TwoFactorResult>;
  
  // Social Providers
  linkProvider: (provider: AuthProvider) => Promise<SessionResult>;
  unlinkProvider: (provider: AuthProvider) => Promise<SessionResult>;
  
  // Session Management
  getSessions: () => Promise<DeviceSession[]>;
  revokeSession: (sessionId: string) => Promise<SessionResult>;
  revokeAllSessions: () => Promise<SessionResult>;
  
  // Account Management
  deleteAccount: (data: AccountDeletionRequest) => Promise<AccountDeletionResult>;
  exportData: (request: DataExportRequest) => Promise<DataExportResult>;
  
  // Verification
  resendVerificationEmail: () => Promise<VerificationResult>;
  verifyEmail: (token: string) => Promise<VerificationResult>;
}
