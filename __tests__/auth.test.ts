/**
 * 🧪 AUTH SYSTEM - E2E Tests
 * 
 * Comprehensive test suite for authentication flows
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import AuthService from '@/lib/auth-service';
import { securityMiddleware } from '@/lib/security-middleware';
import type { RegistrationData, LoginCredentials } from '@/types/auth';

// Test User Data
const testUser: RegistrationData = {
  firstName: 'Test',
  lastName: 'User',
  email: `test-${Date.now()}@anpip.com`,
  password: 'TestPassword123!',
  country: 'DE',
  preferredLanguage: 'de',
  acceptTerms: true,
  acceptPrivacy: true,
  acceptDataProcessing: true,
};

describe('Auth System E2E Tests', () => {
  let userId: string;
  let sessionToken: string;

  // ===========================
  // REGISTRATION TESTS
  // ===========================

  describe('Registration', () => {
    it('should validate registration data', async () => {
      const invalidData = { ...testUser, firstName: '' };
      const result = await AuthService.signUp(invalidData);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_ERROR');
    });

    it('should require strong password', async () => {
      const weakPassword = { ...testUser, password: 'weak' };
      const result = await AuthService.signUp(weakPassword);
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Passwort');
    });

    it('should register new user successfully', async () => {
      const result = await AuthService.signUp(testUser);
      
      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.user.email).toBe(testUser.email.toLowerCase());
      
      if (result.data?.user) {
        userId = result.data.user.id;
      }
    });

    it('should prevent duplicate email registration', async () => {
      const result = await AuthService.signUp(testUser);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('EMAIL_EXISTS');
    });

    it('should require consent checkboxes', async () => {
      const noConsent = {
        ...testUser,
        email: `test-noconsent-${Date.now()}@anpip.com`,
        acceptTerms: false,
      };
      
      const result = await AuthService.signUp(noConsent);
      
      expect(result.success).toBe(false);
    });
  });

  // ===========================
  // LOGIN TESTS
  // ===========================

  describe('Login', () => {
    it('should login with correct credentials', async () => {
      const credentials: LoginCredentials = {
        email: testUser.email,
        password: testUser.password,
        rememberMe: true,
      };
      
      const result = await AuthService.signIn(credentials);
      
      expect(result.success).toBe(true);
      expect(result.data?.user).toBeDefined();
      expect(result.data?.session).toBeDefined();
      
      if (result.data?.session) {
        sessionToken = result.data.session.access_token;
      }
    });

    it('should reject wrong password', async () => {
      const wrongPassword: LoginCredentials = {
        email: testUser.email,
        password: 'WrongPassword123!',
      };
      
      const result = await AuthService.signIn(wrongPassword);
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent email', async () => {
      const nonExistent: LoginCredentials = {
        email: 'nonexistent@anpip.com',
        password: 'SomePassword123!',
      };
      
      const result = await AuthService.signIn(nonExistent);
      
      expect(result.success).toBe(false);
    });
  });

  // ===========================
  // PASSWORD RESET TESTS
  // ===========================

  describe('Password Reset', () => {
    it('should send password reset email', async () => {
      const result = await AuthService.requestPasswordReset({
        email: testUser.email,
      });
      
      expect(result.success).toBe(true);
    });

    it('should handle non-existent email gracefully', async () => {
      // Should not reveal if email exists (security)
      const result = await AuthService.requestPasswordReset({
        email: 'nonexistent@anpip.com',
      });
      
      // Should still return success to prevent email enumeration
      expect(result.success).toBe(true);
    });

    it('should reject weak new password', async () => {
      const result = await AuthService.resetPassword({
        token: 'dummy-token',
        newPassword: 'weak',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('WEAK_PASSWORD');
    });
  });

  // ===========================
  // SECURITY TESTS
  // ===========================

  describe('Security & Rate Limiting', () => {
    it('should detect bot user agents', () => {
      const botAgent = 'Mozilla/5.0 (compatible; Googlebot/2.1)';
      const isBot = securityMiddleware.detectBot(botAgent);
      
      expect(isBot).toBe(true);
    });

    it('should allow normal user agents', () => {
      const normalAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const isBot = securityMiddleware.detectBot(normalAgent);
      
      expect(isBot).toBe(false);
    });

    it('should rate limit after multiple failed attempts', async () => {
      const identifier = 'test-rate-limit';
      
      // Make 6 attempts (limit is 5)
      for (let i = 0; i < 6; i++) {
        await securityMiddleware.checkRateLimit(identifier);
      }
      
      const result = await securityMiddleware.checkRateLimit(identifier);
      
      expect(result.allowed).toBe(false);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should reset rate limit on successful login', async () => {
      const identifier = 'test-reset';
      
      // Use up attempts
      await securityMiddleware.checkRateLimit(identifier);
      await securityMiddleware.checkRateLimit(identifier);
      
      // Reset
      securityMiddleware.resetRateLimit(identifier);
      
      // Should be allowed again
      const result = await securityMiddleware.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
    });

    it('should generate valid CSRF tokens', () => {
      const token1 = securityMiddleware.generateCSRFToken();
      const token2 = securityMiddleware.generateCSRFToken();
      
      expect(token1).toBeTruthy();
      expect(token2).toBeTruthy();
      expect(token1).not.toBe(token2); // Should be unique
      expect(token1.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should validate CSRF tokens correctly', () => {
      const token = 'test-token-123';
      
      // Valid
      expect(securityMiddleware.validateCSRFToken(token, token)).toBe(true);
      
      // Invalid
      expect(securityMiddleware.validateCSRFToken(token, 'different-token')).toBe(false);
    });
  });

  // ===========================
  // PROFILE TESTS
  // ===========================

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const result = await AuthService.updateProfile({
        firstName: 'Updated',
        lastName: 'Name',
        country: 'AT',
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.firstName).toBe('Updated');
      expect(result.data?.lastName).toBe('Name');
    });

    it('should change password with correct current password', async () => {
      const result = await AuthService.changePassword(
        testUser.password,
        'NewPassword123!'
      );
      
      expect(result.success).toBe(true);
      
      // Update test data
      testUser.password = 'NewPassword123!';
    });

    it('should reject password change with wrong current password', async () => {
      const result = await AuthService.changePassword(
        'WrongPassword123!',
        'NewPassword123!'
      );
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('WRONG_PASSWORD');
    });
  });

  // ===========================
  // SOCIAL LOGIN TESTS
  // ===========================

  describe('Social Login', () => {
    it('should generate OAuth URL for Google', async () => {
      const result = await AuthService.signInWithProvider({
        provider: 'google',
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toContain('google');
    });

    it('should generate OAuth URL for Apple', async () => {
      const result = await AuthService.signInWithProvider({
        provider: 'apple',
      });
      
      expect(result.success).toBe(true);
      expect(result.data?.url).toBeDefined();
    });

    it('should handle unsupported providers', async () => {
      const result = await AuthService.signInWithProvider({
        provider: 'invalid-provider' as any,
      });
      
      expect(result.success).toBe(false);
    });
  });

  // ===========================
  // ACCOUNT DELETION TESTS
  // ===========================

  describe('Account Deletion (GDPR)', () => {
    it('should request account deletion with correct password', async () => {
      const result = await AuthService.deleteAccount({
        password: testUser.password,
        reason: 'testing',
        feedback: 'E2E test cleanup',
      });
      
      expect(result.success).toBe(true);
    });

    it('should reject deletion with wrong password', async () => {
      const result = await AuthService.deleteAccount({
        password: 'WrongPassword123!',
      });
      
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('WRONG_PASSWORD');
    });
  });

  // ===========================
  // CLEANUP
  // ===========================

  afterAll(async () => {
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    // Note: Actual cleanup would be done via Supabase admin API
  });
});

// ===========================
// INTEGRATION TEST SUITE
// ===========================

describe('Auth Integration Tests', () => {
  it('should complete full registration-to-deletion flow', async () => {
    // 1. Register
    const uniqueEmail = `integration-test-${Date.now()}@anpip.com`;
    const registrationResult = await AuthService.signUp({
      ...testUser,
      email: uniqueEmail,
    });
    
    expect(registrationResult.success).toBe(true);
    
    // 2. Login
    const loginResult = await AuthService.signIn({
      email: uniqueEmail,
      password: testUser.password,
    });
    
    expect(loginResult.success).toBe(true);
    
    // 3. Update Profile
    const updateResult = await AuthService.updateProfile({
      firstName: 'Integration',
      lastName: 'Test',
    });
    
    expect(updateResult.success).toBe(true);
    
    // 4. Change Password
    const passwordResult = await AuthService.changePassword(
      testUser.password,
      'NewIntegrationPassword123!'
    );
    
    expect(passwordResult.success).toBe(true);
    
    // 5. Delete Account
    const deletionResult = await AuthService.deleteAccount({
      password: 'NewIntegrationPassword123!',
      reason: 'integration_test',
    });
    
    expect(deletionResult.success).toBe(true);
  });
});
