/**
 * 🔐 AUTH SERVICE - Complete Authentication Service
 * 
 * Zentrale Business-Logik für Authentication
 * Supabase Auth + Custom Logic für erweiterte Features
 */

import { supabase } from './supabase';
import type {
  RegistrationData,
  RegistrationResult,
  LoginCredentials,
  LoginResult,
  SocialLoginOptions,
  SocialLoginResult,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordResetResult,
  AccountUpdate,
  AccountUpdateResult,
  AccountDeletionRequest,
  AccountDeletionResult,
  UserProfile,
  AuthError,
} from '@/types/auth';

class AuthService {
  // ===========================
  // REGISTRATION
  // ===========================

  async signUp(data: RegistrationData): Promise<RegistrationResult> {
    try {
      // 1. Validate Input
      const validation = this.validateRegistration(data);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: validation.error || 'Ungültige Eingaben',
          },
        };
      }

      // 2. Create User in Supabase Auth
      // Note: Supabase automatically checks if email exists and returns an error
      console.log('[AuthService] Creating user in Supabase...');
      
      // Registrierung OHNE E-Mail-Verifizierung (autoConfirm)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
        options: {
          // E-Mail-Verifizierung deaktiviert - User wird sofort bestätigt
          emailRedirectTo: undefined,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: `${data.firstName} ${data.lastName}`,
            country: data.country,
            preferred_language: data.preferredLanguage,
            company_name: data.companyName,
            consent_given: data.acceptTerms && data.acceptPrivacy,
            consent_date: new Date().toISOString(),
            data_processing_consent: data.acceptDataProcessing,
          },
        },
      });

      if (authError) {
        console.error('[AuthService] Supabase signUp error:', authError);
        console.error('[AuthService] Error code:', authError.code);
        console.error('[AuthService] Error status:', authError.status);
        
        // Wenn es ein "Database error" ist, könnte der User trotzdem erstellt worden sein
        // Versuche Login stattdessen
        if (authError.message?.includes('Database error') || authError.code === 'unexpected_failure') {
          console.log('[AuthService] Trying login instead due to database error...');
          
          // Warte kurz, dann versuche Login
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const loginResult = await this.signIn({
            email: data.email.toLowerCase(),
            password: data.password,
          });
          
          if (loginResult.success) {
            console.log('[AuthService] Login successful after database error - user was created');
            return {
              success: true,
              data: {
                user: loginResult.data!.user,
                session: loginResult.data!.session,
                requiresVerification: false,
              },
            };
          }
        }
        
        return {
          success: false,
          error: this.parseSupabaseError(authError),
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: {
            code: 'REGISTRATION_FAILED',
            message: 'Registrierung fehlgeschlagen',
          },
        };
      }

      // 3. Upload Avatar if provided
      if (data.avatarFile) {
        await this.uploadAvatar(authData.user.id, data.avatarFile);
      }

      // 4. Create User Profile
      const profile = this.mapSupabaseUserToProfile(authData.user);

      console.log('[AuthService] Registration successful:', profile.email);

      return {
        success: true,
        data: {
          user: profile,
          session: authData.session || undefined,
          requiresVerification: !authData.session, // Wenn keine Session, dann Verifizierung erforderlich
        },
      };
    } catch (error: any) {
      console.error('[AuthService] Registration error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Ein unbekannter Fehler ist aufgetreten',
        },
      };
    }
  }

  // ===========================
  // LOGIN
  // ===========================

  async signIn(credentials: LoginCredentials): Promise<LoginResult> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.toLowerCase(),
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      if (!data.user || !data.session) {
        return {
          success: false,
          error: {
            code: 'LOGIN_FAILED',
            message: 'Anmeldung fehlgeschlagen',
          },
        };
      }

      const profile = this.mapSupabaseUserToProfile(data.user);

      // Track login
      await this.trackLogin(data.user.id);

      return {
        success: true,
        data: {
          user: profile,
          session: data.session,
        },
      };
    } catch (error: any) {
      console.error('[AuthService] Login error:', error);
      return {
        success: false,
        error: {
          code: 'UNKNOWN_ERROR',
          message: error.message || 'Ein unbekannter Fehler ist aufgetreten',
        },
      };
    }
  }

  // ===========================
  // SOCIAL LOGIN
  // ===========================

  async signInWithProvider(options: SocialLoginOptions): Promise<SocialLoginResult> {
    try {
      // Map our provider names to Supabase provider names
      const providerMap: Record<string, any> = {
        'google': 'google',
        'apple': 'apple',
        'facebook': 'facebook',
        'microsoft': 'azure', // Supabase uses 'azure' for Microsoft
        'linkedin': 'linkedin_oidc',
        'github': 'github',
      };

      const supabaseProvider = providerMap[options.provider];
      if (!supabaseProvider) {
        return {
          success: false,
          error: {
            code: 'UNSUPPORTED_PROVIDER',
            message: `Provider ${options.provider} wird nicht unterstützt`,
          },
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: supabaseProvider,
        options: {
          redirectTo: options.redirectTo || `${this.getBaseUrl()}/auth/callback`,
          scopes: options.scopes?.join(' '),
        },
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      return {
        success: true,
        data: {
          url: data.url,
        },
      };
    } catch (error: any) {
      console.error('[AuthService] Social login error:', error);
      return {
        success: false,
        error: {
          code: 'SOCIAL_LOGIN_FAILED',
          message: error.message || 'Social Login fehlgeschlagen',
        },
      };
    }
  }

  // ===========================
  // LOGOUT
  // ===========================

  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
      // Ignore logout errors, clear local state anyway
    }
  }

  // ===========================
  // PASSWORD RESET
  // ===========================

  async requestPasswordReset(data: PasswordResetRequest): Promise<PasswordResetResult> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email.toLowerCase(), {
        redirectTo: `${this.getBaseUrl()}/auth/reset-password`,
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthService] Password reset request error:', error);
      return {
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: error.message || 'Fehler beim Zurücksetzen des Passworts',
        },
      };
    }
  }

  async resetPassword(data: PasswordResetConfirm): Promise<PasswordResetResult> {
    try {
      // Validate password strength
      const validation = this.validatePassword(data.newPassword);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: validation.error || 'Passwort ist zu schwach',
          },
        };
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthService] Password reset error:', error);
      return {
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: error.message || 'Fehler beim Zurücksetzen des Passworts',
        },
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<PasswordResetResult> {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Nicht angemeldet',
          },
        };
      }

      // Verify current password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (verifyError) {
        return {
          success: false,
          error: {
            code: 'WRONG_PASSWORD',
            message: 'Aktuelles Passwort ist falsch',
          },
        };
      }

      // Validate new password
      const validation = this.validatePassword(newPassword);
      if (!validation.valid) {
        return {
          success: false,
          error: {
            code: 'WEAK_PASSWORD',
            message: validation.error || 'Neues Passwort ist zu schwach',
          },
        };
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthService] Change password error:', error);
      return {
        success: false,
        error: {
          code: 'CHANGE_PASSWORD_FAILED',
          message: error.message || 'Fehler beim Ändern des Passworts',
        },
      };
    }
  }

  // ===========================
  // PROFILE UPDATE
  // ===========================

  async updateProfile(data: AccountUpdate): Promise<AccountUpdateResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Nicht angemeldet',
          },
        };
      }

      // Update user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          display_name: data.displayName,
          avatar_url: data.avatarUrl,
          phone: data.phone,
          country: data.country,
          preferred_language: data.preferredLanguage,
          company_name: data.companyName,
        },
      });

      if (error) {
        return {
          success: false,
          error: this.parseSupabaseError(error),
        };
      }

      // Reload user
      const { data: { user: updatedUser } } = await supabase.auth.getUser();
      if (!updatedUser) {
        return {
          success: false,
          error: {
            code: 'UPDATE_FAILED',
            message: 'Profil-Aktualisierung fehlgeschlagen',
          },
        };
      }

      const profile = this.mapSupabaseUserToProfile(updatedUser);

      return {
        success: true,
        data: profile,
      };
    } catch (error: any) {
      console.error('[AuthService] Profile update error:', error);
      return {
        success: false,
        error: {
          code: 'UPDATE_FAILED',
          message: error.message || 'Fehler beim Aktualisieren des Profils',
        },
      };
    }
  }

  // ===========================
  // ACCOUNT DELETION
  // ===========================

  async deleteAccount(data: AccountDeletionRequest): Promise<AccountDeletionResult> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return {
          success: false,
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'Nicht angemeldet',
          },
        };
      }

      // Verify password
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.password,
      });

      if (verifyError) {
        return {
          success: false,
          error: {
            code: 'WRONG_PASSWORD',
            message: 'Passwort ist falsch',
          },
        };
      }

      // Log deletion reason (for analytics)
      if (data.reason || data.feedback) {
        await this.logAccountDeletion(user.id, data.reason, data.feedback);
      }

      // TODO: Implement actual account deletion
      // This requires server-side function in Supabase
      // For now, we mark the account for deletion
      await supabase.auth.updateUser({
        data: {
          account_deletion_requested: true,
          account_deletion_date: new Date().toISOString(),
          account_deletion_reason: data.reason,
        },
      });

      return {
        success: true,
      };
    } catch (error: any) {
      console.error('[AuthService] Account deletion error:', error);
      return {
        success: false,
        error: {
          code: 'DELETION_FAILED',
          message: error.message || 'Fehler beim Löschen des Kontos',
        },
      };
    }
  }

  // ===========================
  // HELPER METHODS
  // ===========================

  private mapSupabaseUserToProfile(user: any): UserProfile {
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
      linkedProviders: this.getLinkedProviders(user),
      consentGiven: metadata.consent_given || false,
      consentDate: metadata.consent_date ? new Date(metadata.consent_date) : undefined,
      dataProcessingConsent: metadata.data_processing_consent || false,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : undefined,
    };
  }

  private getLinkedProviders(user: any): any[] {
    const providers: any[] = [];
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
  }

  private validateRegistration(data: RegistrationData): { valid: boolean; error?: string } {
    if (!data.firstName || data.firstName.trim().length < 2) {
      return { valid: false, error: 'Vorname muss mindestens 2 Zeichen lang sein' };
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      return { valid: false, error: 'Nachname muss mindestens 2 Zeichen lang sein' };
    }

    if (!this.isValidEmail(data.email)) {
      return { valid: false, error: 'Ungültige E-Mail-Adresse' };
    }

    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      return passwordValidation;
    }

    if (!data.country || data.country.length !== 2) {
      return { valid: false, error: 'Bitte wähle ein Land' };
    }

    if (!data.acceptTerms || !data.acceptPrivacy) {
      return { valid: false, error: 'Bitte akzeptiere die AGB und Datenschutzerklärung' };
    }

    return { valid: true };
  }

  private validatePassword(password: string): { valid: boolean; error?: string } {
    if (password.length < 8) {
      return { valid: false, error: 'Passwort muss mindestens 8 Zeichen lang sein' };
    }

    if (!/[a-z]/.test(password)) {
      return { valid: false, error: 'Passwort muss mindestens einen Kleinbuchstaben enthalten' };
    }

    if (!/[A-Z]/.test(password)) {
      return { valid: false, error: 'Passwort muss mindestens einen Großbuchstaben enthalten' };
    }

    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Passwort muss mindestens eine Zahl enthalten' };
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return { valid: false, error: 'Passwort muss mindestens ein Sonderzeichen enthalten' };
    }

    return { valid: true };
  }

  private isValidEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  private parseSupabaseError(error: any): AuthError {
    const message = error.message || 'Ein Fehler ist aufgetreten';
    
    // Common Supabase error codes
    if (message.includes('Invalid login credentials')) {
      return {
        code: 'INVALID_CREDENTIALS',
        message: 'E-Mail oder Passwort ist falsch',
      };
    }

    if (message.includes('Email not confirmed')) {
      return {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'E-Mail-Adresse noch nicht verifiziert',
      };
    }

    if (message.includes('User already registered')) {
      return {
        code: 'EMAIL_EXISTS',
        message: 'Diese E-Mail-Adresse ist bereits registriert',
      };
    }

    return {
      code: error.code || 'UNKNOWN_ERROR',
      message,
      details: error,
    };
  }

  private async uploadAvatar(userId: string, file: File): Promise<void> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[AuthService] Avatar upload error:', uploadError);
        return;
      }

      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl },
      });
    } catch (error) {
      console.error('[AuthService] Avatar upload error:', error);
    }
  }

  private async trackLogin(userId: string): Promise<void> {
    try {
      // Update last login timestamp
      await supabase.auth.updateUser({
        data: {
          last_login_at: new Date().toISOString(),
        },
      });

      // TODO: Track in analytics table
      // await supabase.from('user_logins').insert({
      //   user_id: userId,
      //   timestamp: new Date().toISOString(),
      // });
    } catch (error) {
      console.error('[AuthService] Login tracking error:', error);
    }
  }

  private async logAccountDeletion(userId: string, reason?: string, feedback?: string): Promise<void> {
    try {
      // TODO: Log to analytics
      console.log('[AuthService] Account deletion:', { userId, reason, feedback });
    } catch (error) {
      console.error('[AuthService] Account deletion logging error:', error);
    }
  }

  private getBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return process.env.EXPO_PUBLIC_APP_URL || 'https://www.anpip.com';
  }
}

// Export singleton instance
export default new AuthService();
