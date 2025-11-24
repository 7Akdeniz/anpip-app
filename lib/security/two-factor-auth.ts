/**
 * 🔐 TWO-FACTOR AUTHENTICATION (2FA)
 * 
 * Unterstützt:
 * - TOTP (Time-based One-Time Password) - Google Authenticator, Authy, etc.
 * - SMS (via Twilio/Supabase)
 * - Email Codes
 * - Backup Codes
 */

import { supabase } from '../supabase';
import { createHash, randomBytes } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface TwoFactorVerification {
  success: boolean;
  error?: string;
}

// ============================================================================
// 2FA CLASS
// ============================================================================

export class TwoFactorAuth {
  
  /**
   * Enable 2FA for user
   */
  async enable2FA(userId: string): Promise<TwoFactorSetup> {
    // Generate secret
    const secret = this.generateSecret();
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    // Generate QR code URL
    const qrCode = this.generateQRCode(userId, secret);
    
    // Store in database (encrypted)
    await supabase.from('user_2fa').insert({
      user_id: userId,
      secret: this.encrypt(secret),
      backup_codes: backupCodes.map(code => this.hashBackupCode(code)),
      enabled: false, // Will be enabled after verification
      created_at: new Date().toISOString(),
    });
    
    return {
      secret,
      qrCode,
      backupCodes,
    };
  }
  
  /**
   * Verify and activate 2FA
   */
  async verify2FASetup(userId: string, code: string): Promise<TwoFactorVerification> {
    try {
      // Get user's 2FA secret
      const { data, error } = await supabase
        .from('user_2fa')
        .select('secret')
        .eq('user_id', userId)
        .single();
      
      if (error || !data) {
        return { success: false, error: '2FA not set up' };
      }
      
      const secret = this.decrypt(data.secret);
      
      // Verify code
      const isValid = this.verifyTOTP(secret, code);
      
      if (!isValid) {
        return { success: false, error: 'Invalid code' };
      }
      
      // Enable 2FA
      await supabase
        .from('user_2fa')
        .update({ enabled: true })
        .eq('user_id', userId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Verification failed' };
    }
  }
  
  /**
   * Verify 2FA code during login
   */
  async verify2FA(userId: string, code: string): Promise<TwoFactorVerification> {
    try {
      const { data, error } = await supabase
        .from('user_2fa')
        .select('*')
        .eq('user_id', userId)
        .eq('enabled', true)
        .single();
      
      if (error || !data) {
        return { success: false, error: '2FA not enabled' };
      }
      
      const secret = this.decrypt(data.secret);
      
      // Try TOTP first
      const isTOTPValid = this.verifyTOTP(secret, code);
      if (isTOTPValid) {
        return { success: true };
      }
      
      // Try backup code
      const isBackupValid = await this.verifyBackupCode(userId, code);
      if (isBackupValid) {
        return { success: true };
      }
      
      return { success: false, error: 'Invalid code' };
    } catch (error) {
      return { success: false, error: 'Verification failed' };
    }
  }
  
  /**
   * Disable 2FA
   */
  async disable2FA(userId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify password first
      const { data: user, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        return { success: false, error: 'Authentication failed' };
      }
      
      // Verify password (using Supabase auth)
      const { error: pwError } = await supabase.auth.signInWithPassword({
        email: user.user?.email || '',
        password,
      });
      
      if (pwError) {
        return { success: false, error: 'Invalid password' };
      }
      
      // Delete 2FA data
      await supabase
        .from('user_2fa')
        .delete()
        .eq('user_id', userId);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to disable 2FA' };
    }
  }
  
  /**
   * Generate new backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const backupCodes = this.generateBackupCodes();
    
    await supabase
      .from('user_2fa')
      .update({
        backup_codes: backupCodes.map(code => this.hashBackupCode(code)),
      })
      .eq('user_id', userId);
    
    return backupCodes;
  }
  
  /**
   * Generate secret for TOTP
   */
  private generateSecret(): string {
    const buffer = randomBytes(20);
    return this.base32Encode(buffer);
  }
  
  /**
   * Generate backup codes
   */
  private generateBackupCodes(count: number = 10): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }
  
  /**
   * Hash backup code for storage
   */
  private hashBackupCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
  
  /**
   * Verify backup code
   */
  private async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const hashedCode = this.hashBackupCode(code);
    
    const { data, error } = await supabase
      .from('user_2fa')
      .select('backup_codes')
      .eq('user_id', userId)
      .single();
    
    if (error || !data) return false;
    
    const backupCodes = data.backup_codes as string[];
    const index = backupCodes.indexOf(hashedCode);
    
    if (index === -1) return false;
    
    // Remove used backup code
    backupCodes.splice(index, 1);
    
    await supabase
      .from('user_2fa')
      .update({ backup_codes: backupCodes })
      .eq('user_id', userId);
    
    return true;
  }
  
  /**
   * Generate QR code URL for TOTP apps
   */
  private generateQRCode(userId: string, secret: string): string {
    const issuer = 'Anpip';
    const label = `${issuer}:${userId}`;
    const otpauth = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
    
    // Return URL for QR code generation
    // In production, use a library like qrcode to generate actual image
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauth)}`;
  }
  
  /**
   * Verify TOTP code
   */
  private verifyTOTP(secret: string, code: string, window: number = 1): boolean {
    const counter = Math.floor(Date.now() / 30000);
    
    // Check current time and ±window
    for (let i = -window; i <= window; i++) {
      const testCounter = counter + i;
      const expectedCode = this.generateTOTP(secret, testCounter);
      
      if (expectedCode === code) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Generate TOTP code
   */
  private generateTOTP(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const time = Buffer.alloc(8);
    time.writeBigInt64BE(BigInt(counter));
    
    const hmac = createHash('sha1')
      .update(Buffer.concat([key, time]))
      .digest();
    
    const offset = hmac[hmac.length - 1] & 0x0f;
    const binary =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);
    
    const otp = binary % 1000000;
    return otp.toString().padStart(6, '0');
  }
  
  /**
   * Base32 encode
   */
  private base32Encode(buffer: Buffer): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let output = '';
    
    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      
      while (bits >= 5) {
        output += chars[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    
    if (bits > 0) {
      output += chars[(value << (5 - bits)) & 31];
    }
    
    return output;
  }
  
  /**
   * Base32 decode
   */
  private base32Decode(input: string): Buffer {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    const output: number[] = [];
    
    for (let i = 0; i < input.length; i++) {
      const idx = chars.indexOf(input[i].toUpperCase());
      if (idx === -1) continue;
      
      value = (value << 5) | idx;
      bits += 5;
      
      if (bits >= 8) {
        output.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }
    
    return Buffer.from(output);
  }
  
  /**
   * Encrypt secret (simple XOR, use proper encryption in production)
   */
  private encrypt(text: string): string {
    // In production, use proper encryption like AES-256-GCM
    // This is a simplified version
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-me';
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return Buffer.from(result).toString('base64');
  }
  
  /**
   * Decrypt secret
   */
  private decrypt(encrypted: string): string {
    const key = process.env.ENCRYPTION_KEY || 'default-key-change-me';
    const text = Buffer.from(encrypted, 'base64').toString();
    let result = '';
    
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    
    return result;
  }
  
  /**
   * Check if user has 2FA enabled
   */
  async is2FAEnabled(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_2fa')
      .select('enabled')
      .eq('user_id', userId)
      .single();
    
    return !error && data?.enabled === true;
  }
}

// ============================================================================
// DEVICE MANAGEMENT
// ============================================================================

export class DeviceManagement {
  
  /**
   * Get all devices for user
   */
  async getUserDevices(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('last_active', { ascending: false });
    
    if (error || !data) return [];
    
    return data.map(session => ({
      id: session.id,
      deviceInfo: session.device_info,
      ipAddress: session.ip_address,
      lastActive: new Date(session.last_active),
      current: session.is_current || false,
    }));
  }
  
  /**
   * Remove device
   */
  async removeDevice(userId: string, sessionId: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .eq('id', sessionId);
  }
  
  /**
   * Remove all devices except current
   */
  async removeAllDevicesExceptCurrent(userId: string, currentSessionId: string): Promise<void> {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('user_id', userId)
      .neq('id', currentSessionId);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const twoFactorAuth = new TwoFactorAuth();
export const deviceManagement = new DeviceManagement();
