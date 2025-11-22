/**
 * 🛡️ RATE LIMITING & SECURITY MIDDLEWARE
 * 
 * Verhindert Brute-Force-Attacken und Bot-Aktivitäten
 */

import { supabase } from './supabase';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 Minuten
  blockDurationMs: 60 * 60 * 1000, // 1 Stunde
};

class SecurityMiddleware {
  private attempts: Map<string, { count: number; firstAttempt: number }> = new Map();
  private blockedIPs: Set<string> = new Set();

  /**
   * Check if IP is rate limited
   */
  async checkRateLimit(identifier: string, config: RateLimitConfig = DEFAULT_CONFIG): Promise<{
    allowed: boolean;
    remainingAttempts?: number;
    resetTime?: number;
  }> {
    // Check if IP is blocked in database
    const blocked = await this.isIPBlocked(identifier);
    if (blocked) {
      return {
        allowed: false,
        remainingAttempts: 0,
      };
    }

    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt) {
      // First attempt
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
      };
    }

    // Check if window has expired
    if (now - attempt.firstAttempt > config.windowMs) {
      // Reset counter
      this.attempts.set(identifier, { count: 1, firstAttempt: now });
      return {
        allowed: true,
        remainingAttempts: config.maxAttempts - 1,
      };
    }

    // Increment counter
    attempt.count++;

    if (attempt.count > config.maxAttempts) {
      // Block IP
      await this.blockIP(identifier, config.blockDurationMs);
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: now + config.blockDurationMs,
      };
    }

    return {
      allowed: true,
      remainingAttempts: config.maxAttempts - attempt.count,
    };
  }

  /**
   * Record successful login (resets rate limit)
   */
  resetRateLimit(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Block IP address
   */
  private async blockIP(ip: string, durationMs: number): Promise<void> {
    const blockedUntil = new Date(Date.now() + durationMs);

    try {
      await supabase.from('blocked_ips').upsert({
        ip_address: ip,
        reason: 'Rate limit exceeded',
        blocked_until: blockedUntil.toISOString(),
      });

      this.blockedIPs.add(ip);
      console.log(`🛡️ IP blocked: ${ip} until ${blockedUntil.toISOString()}`);
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  }

  /**
   * Check if IP is currently blocked
   */
  private async isIPBlocked(ip: string): Promise<boolean> {
    // Check in-memory cache first
    if (this.blockedIPs.has(ip)) {
      return true;
    }

    try {
      const { data } = await supabase
        .from('blocked_ips')
        .select('blocked_until')
        .eq('ip_address', ip)
        .single();

      if (!data) return false;

      const blockedUntil = new Date(data.blocked_until);
      const now = new Date();

      if (now < blockedUntil) {
        this.blockedIPs.add(ip);
        return true;
      } else {
        // Block expired, remove from DB
        await supabase.from('blocked_ips').delete().eq('ip_address', ip);
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Get client IP address
   */
  getClientIP(req?: any): string {
    if (typeof window !== 'undefined') {
      // Browser - use fingerprinting or session ID
      return this.getBrowserFingerprint();
    }

    if (req) {
      // Server-side
      return (
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.headers['x-real-ip'] ||
        req.connection?.remoteAddress ||
        'unknown'
      );
    }

    return 'unknown';
  }

  /**
   * Browser fingerprinting for rate limiting
   */
  private getBrowserFingerprint(): string {
    if (typeof window === 'undefined') return 'unknown';

    const components = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width,
      screen.height,
      new Date().getTimezoneOffset(),
    ];

    const fingerprint = components.join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return `browser_${Math.abs(hash)}`;
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string, sessionToken: string): boolean {
    // Simple CSRF validation
    // In production, use a more sophisticated approach
    return token === sessionToken;
  }

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Detect bot behavior
   */
  detectBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /axios/i,
      /fetch/i,
    ];

    return botPatterns.some(pattern => pattern.test(userAgent));
  }

  /**
   * Clean up expired data (should be called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const config = DEFAULT_CONFIG;

    for (const [key, attempt] of this.attempts.entries()) {
      if (now - attempt.firstAttempt > config.windowMs) {
        this.attempts.delete(key);
      }
    }
  }
}

// Export singleton
export const securityMiddleware = new SecurityMiddleware();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    securityMiddleware.cleanup();
  }, 5 * 60 * 1000);
}
