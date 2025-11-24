/**
 * 🔐 JWT & TOKEN SECURITY
 * 
 * Sichere Token-Verwaltung:
 * - JWT Validation
 * - Token Rotation
 * - Refresh Token Management
 * - Token Revocation
 * - Secure Cookie Handling
 */

import { supabase } from '../supabase';
import { createHash, randomBytes } from 'crypto';

// ============================================================================
// TYPES
// ============================================================================

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface TokenValidation {
  valid: boolean;
  userId?: string;
  sessionId?: string;
  error?: string;
}

interface SessionInfo {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  lastActive: Date;
  expiresAt: Date;
}

interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  os: string;
  deviceId: string;
}

// ============================================================================
// TOKEN SECURITY CLASS
// ============================================================================

export class TokenSecurity {
  
  // Token lifetimes
  private readonly ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
  private readonly REFRESH_TOKEN_LIFETIME = 30 * 24 * 60 * 60 * 1000; // 30 days
  private readonly SESSION_LIFETIME = 30 * 24 * 60 * 60 * 1000; // 30 days
  
  /**
   * Validate access token
   */
  async validateAccessToken(token: string): Promise<TokenValidation> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return { valid: false, error: 'Invalid token' };
      }
      
      // Check if token is expired (Supabase handles this, but double-check)
      const session = await this.getSessionInfo(user.id);
      if (session && new Date() > session.expiresAt) {
        return { valid: false, error: 'Token expired' };
      }
      
      return { valid: true, userId: user.id };
    } catch (error) {
      return { valid: false, error: 'Token validation failed' };
    }
  }
  
  /**
   * Rotate tokens (when refresh token is used)
   */
  async rotateTokens(refreshToken: string): Promise<{ success: boolean; tokens?: TokenPair; error?: string }> {
    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });
      
      if (error || !data.session) {
        return { success: false, error: 'Invalid refresh token' };
      }
      
      return {
        success: true,
        tokens: {
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
          expiresIn: this.ACCESS_TOKEN_LIFETIME,
        },
      };
    } catch (error) {
      return { success: false, error: 'Token rotation failed' };
    }
  }
  
  /**
   * Revoke all tokens for a user
   */
  async revokeAllTokens(userId: string): Promise<void> {
    try {
      // Sign out all sessions
      await supabase.auth.admin.signOut(userId, 'global');
      
      // Delete all user sessions from database
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);
    } catch (error) {
      console.error('Failed to revoke tokens:', error);
    }
  }
  
  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    try {
      await supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId);
    } catch (error) {
      console.error('Failed to revoke session:', error);
    }
  }
  
  /**
   * Create secure session
   */
  async createSession(userId: string, request: Request): Promise<SessionInfo> {
    const deviceInfo = this.getDeviceInfo(request);
    const sessionId = this.generateSessionId();
    const expiresAt = new Date(Date.now() + this.SESSION_LIFETIME);
    
    const session: SessionInfo = {
      id: sessionId,
      userId,
      deviceInfo,
      ipAddress: this.getClientIP(request),
      lastActive: new Date(),
      expiresAt,
    };
    
    // Store in database
    await supabase.from('user_sessions').insert({
      id: sessionId,
      user_id: userId,
      device_info: deviceInfo,
      ip_address: session.ipAddress,
      last_active: session.lastActive.toISOString(),
      expires_at: expiresAt.toISOString(),
    });
    
    return session;
  }
  
  /**
   * Get session info
   */
  private async getSessionInfo(userId: string): Promise<SessionInfo | null> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_active', { ascending: false })
        .limit(1)
        .single();
      
      if (error || !data) return null;
      
      return {
        id: data.id,
        userId: data.user_id,
        deviceInfo: data.device_info,
        ipAddress: data.ip_address,
        lastActive: new Date(data.last_active),
        expiresAt: new Date(data.expires_at),
      };
    } catch {
      return null;
    }
  }
  
  /**
   * Get all active sessions for user
   */
  async getActiveSessions(userId: string): Promise<SessionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .gt('expires_at', new Date().toISOString())
        .order('last_active', { ascending: false });
      
      if (error || !data) return [];
      
      return data.map(session => ({
        id: session.id,
        userId: session.user_id,
        deviceInfo: session.device_info,
        ipAddress: session.ip_address,
        lastActive: new Date(session.last_active),
        expiresAt: new Date(session.expires_at),
      }));
    } catch {
      return [];
    }
  }
  
  /**
   * Detect suspicious login (new device/location)
   */
  async detectSuspiciousLogin(userId: string, request: Request): Promise<boolean> {
    const currentIP = this.getClientIP(request);
    const currentDevice = this.getDeviceInfo(request);
    
    // Get recent sessions
    const sessions = await this.getActiveSessions(userId);
    
    // No previous sessions = first login, not suspicious
    if (sessions.length === 0) return false;
    
    // Check if IP has been used before
    const knownIP = sessions.some(s => s.ipAddress === currentIP);
    
    // Check if device has been used before
    const knownDevice = sessions.some(s => 
      s.deviceInfo.deviceId === currentDevice.deviceId
    );
    
    // Suspicious if both IP and device are unknown
    return !knownIP && !knownDevice;
  }
  
  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return randomBytes(32).toString('hex');
  }
  
  /**
   * Get device info from request
   */
  private getDeviceInfo(request: Request): DeviceInfo {
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Simple parsing (use ua-parser-js in production)
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const isWindows = /windows/i.test(userAgent);
    const isMac = /mac/i.test(userAgent);
    const isLinux = /linux/i.test(userAgent);
    
    const platform = isMobile ? 'mobile' : 'desktop';
    const os = isWindows ? 'Windows' : isMac ? 'macOS' : isLinux ? 'Linux' : 'Unknown';
    
    // Generate device ID (fingerprint)
    const deviceId = this.generateDeviceFingerprint(userAgent);
    
    return {
      userAgent,
      platform,
      browser: this.getBrowser(userAgent),
      os,
      deviceId,
    };
  }
  
  /**
   * Get browser from user agent
   */
  private getBrowser(userAgent: string): string {
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/edge/i.test(userAgent)) return 'Edge';
    if (/opera/i.test(userAgent)) return 'Opera';
    return 'Unknown';
  }
  
  /**
   * Generate device fingerprint
   */
  private generateDeviceFingerprint(userAgent: string): string {
    return createHash('sha256')
      .update(userAgent)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Get client IP
   */
  private getClientIP(request: Request): string {
    const headers = [
      'cf-connecting-ip',
      'x-real-ip',
      'x-forwarded-for',
    ];
    
    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        return value.split(',')[0].trim();
      }
    }
    
    return 'unknown';
  }
}

// ============================================================================
// COOKIE SECURITY
// ============================================================================

export class CookieSecurity {
  
  /**
   * Set secure cookie
   */
  setSecureCookie(
    response: Response,
    name: string,
    value: string,
    options: {
      maxAge?: number;
      path?: string;
      sameSite?: 'strict' | 'lax' | 'none';
      secure?: boolean;
    } = {}
  ): Response {
    const defaults = {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
      sameSite: 'lax' as const,
      secure: true,
      httpOnly: true,
    };
    
    const cookieOptions = { ...defaults, ...options };
    
    const cookie = [
      `${name}=${value}`,
      `Max-Age=${cookieOptions.maxAge}`,
      `Path=${cookieOptions.path}`,
      `SameSite=${cookieOptions.sameSite}`,
      cookieOptions.secure ? 'Secure' : '',
      cookieOptions.httpOnly ? 'HttpOnly' : '',
    ]
      .filter(Boolean)
      .join('; ');
    
    const headers = new Headers(response.headers);
    headers.append('Set-Cookie', cookie);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
  
  /**
   * Delete cookie
   */
  deleteCookie(response: Response, name: string, path: string = '/'): Response {
    return this.setSecureCookie(response, name, '', {
      maxAge: 0,
      path,
    });
  }
  
  /**
   * Parse cookies from request
   */
  parseCookies(request: Request): Record<string, string> {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return {};
    
    const cookies: Record<string, string> = {};
    
    cookieHeader.split(';').forEach(cookie => {
      const [name, ...rest] = cookie.trim().split('=');
      if (name && rest.length > 0) {
        cookies[name] = rest.join('=');
      }
    });
    
    return cookies;
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const tokenSecurity = new TokenSecurity();
export const cookieSecurity = new CookieSecurity();
