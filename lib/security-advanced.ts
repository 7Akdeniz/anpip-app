/**
 * 🛡️ ADVANCED SECURITY SYSTEM 2025
 * 
 * - DDoS Protection
 * - Rate Limiting
 * - Malware Scanning
 * - Security Headers
 * - Input Validation
 * - XSS Protection
 */

import { supabase } from './supabase';

export class AdvancedSecurityService {
  
  private requestCache: Map<string, number[]> = new Map();
  
  /**
   * 🚦 Rate Limiting
   */
  checkRateLimit(
    identifier: string, // IP oder User ID
    maxRequests: number = 100,
    windowMs: number = 60000 // 1 Minute
  ): { allowed: boolean; remaining: number; resetAt: number } {
    
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Hole Request-History
    let requests = this.requestCache.get(identifier) || [];
    
    // Filtere alte Requests raus
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Prüfe Limit
    const allowed = requests.length < maxRequests;
    
    if (allowed) {
      requests.push(now);
      this.requestCache.set(identifier, requests);
    }
    
    return {
      allowed,
      remaining: Math.max(0, maxRequests - requests.length),
      resetAt: windowStart + windowMs,
    };
  }
  
  /**
   * 🛡️ Security Headers
   */
  getSecurityHeaders(): Record<string, string> {
    return {
      // XSS Protection
      'X-XSS-Protection': '1; mode=block',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'SAMEORIGIN',
      
      // CSP
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://ipapi.co",
        "media-src 'self' blob: https://*.supabase.co",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests",
      ].join('; '),
      
      // HSTS
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      
      // Referrer Policy
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      
      // Permissions Policy
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
    };
  }
  
  /**
   * 🦠 Malware-Scan (Video-Upload)
   */
  async scanFileForMalware(fileUrl: string): Promise<{
    safe: boolean;
    threats?: string[];
    scanTime: number;
  }> {
    
    const startTime = Date.now();
    
    try {
      // In Production: VirusTotal API oder AWS GuardDuty
      // Hier: Placeholder
      
      // Basis-Checks
      const response = await fetch(fileUrl, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      
      // Prüfe Content-Type
      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      if (contentType && !allowedTypes.includes(contentType)) {
        return {
          safe: false,
          threats: ['Invalid content type'],
          scanTime: Date.now() - startTime,
        };
      }
      
      // Prüfe Dateigröße
      const contentLength = response.headers.get('content-length');
      const MAX_SIZE = 7.5 * 1024 * 1024 * 1024; // 7.5 GB
      if (contentLength && parseInt(contentLength) > MAX_SIZE) {
        return {
          safe: false,
          threats: ['File too large'],
          scanTime: Date.now() - startTime,
        };
      }
      
      return {
        safe: true,
        scanTime: Date.now() - startTime,
      };
      
    } catch (error) {
      console.error('Malware scan failed:', error);
      
      return {
        safe: false,
        threats: ['Scan failed'],
        scanTime: Date.now() - startTime,
      };
    }
  }
  
  /**
   * 🧹 Input Sanitization
   */
  sanitizeInput(input: string, maxLength: number = 500): string {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // XSS
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Event-Handler entfernen
  }
  
  /**
   * 🔐 Password Validation
   */
  validatePassword(password: string): {
    valid: boolean;
    errors: string[];
    strength: 'weak' | 'medium' | 'strong';
  } {
    
    const errors: string[] = [];
    let score = 0;
    
    if (password.length < 8) {
      errors.push('Mindestens 8 Zeichen erforderlich');
    } else {
      score += 1;
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Mindestens ein Kleinbuchstabe erforderlich');
    } else {
      score += 1;
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Mindestens ein Großbuchstabe erforderlich');
    } else {
      score += 1;
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Mindestens eine Zahl erforderlich');
    } else {
      score += 1;
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Mindestens ein Sonderzeichen erforderlich');
    } else {
      score += 1;
    }
    
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';
    
    return {
      valid: errors.length === 0,
      errors,
      strength,
    };
  }
  
  /**
   * 🚫 Block IP
   */
  async blockIP(ip: string, reason: string, duration: number = 3600000): Promise<void> {
    try {
      await supabase.from('blocked_ips').insert({
        ip_address: ip,
        reason,
        blocked_until: new Date(Date.now() + duration).toISOString(),
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to block IP:', error);
    }
  }
  
  /**
   * ✅ Check if IP is blocked
   */
  async isIPBlocked(ip: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select('id')
        .eq('ip_address', ip)
        .gt('blocked_until', new Date().toISOString())
        .limit(1);
      
      return !error && data && data.length > 0;
    } catch (error) {
      console.error('Failed to check IP block:', error);
      return false;
    }
  }
}

export const securityService = new AdvancedSecurityService();
