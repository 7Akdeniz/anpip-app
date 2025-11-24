/**
 * 🛡️ DDOS PROTECTION & ADVANCED RATE LIMITING
 * 
 * Militärische Sicherheit gegen:
 * - DDoS-Attacken
 * - Distributed Brute-Force
 * - Bot-Networks
 * - API Abuse
 */

import { supabase } from '../supabase';

// ============================================================================
// TYPES
// ============================================================================

interface RateLimitRule {
  endpoint: string;
  maxRequests: number;
  windowMs: number;
  blockDurationMs: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ThreatLevel {
  score: number; // 0-100
  reasons: string[];
  action: 'allow' | 'challenge' | 'block';
}

interface RequestFingerprint {
  ip: string;
  userAgent: string;
  path: string;
  method: string;
  timestamp: number;
}

// ============================================================================
// RATE LIMIT RULES (Nach Endpoint-Sensitivität)
// ============================================================================

const RATE_LIMIT_RULES: RateLimitRule[] = [
  // KRITISCH: Auth & Account
  {
    endpoint: '/api/auth/login',
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 min
    blockDurationMs: 60 * 60 * 1000, // 1 hour
    severity: 'critical',
  },
  {
    endpoint: '/api/auth/signup',
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
    severity: 'critical',
  },
  {
    endpoint: '/api/auth/reset-password',
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
    severity: 'high',
  },
  
  // HOCH: Upload & Write Operations
  {
    endpoint: '/api/videos/create-upload',
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 60 * 60 * 1000,
    severity: 'high',
  },
  {
    endpoint: '/api/comments',
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
    severity: 'medium',
  },
  
  // MITTEL: API Calls
  {
    endpoint: '/api/videos',
    maxRequests: 100,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
    severity: 'medium',
  },
  {
    endpoint: '/api/search',
    maxRequests: 60,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 15 * 60 * 1000,
    severity: 'medium',
  },
  
  // NIEDRIG: Read Operations
  {
    endpoint: '/api/feed',
    maxRequests: 200,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 5 * 60 * 1000,
    severity: 'low',
  },
];

// ============================================================================
// DDOS PROTECTION CLASS
// ============================================================================

class DDoSProtection {
  private requestLog: Map<string, RequestFingerprint[]> = new Map();
  private blockedIPs: Map<string, number> = new Map();
  private suspiciousIPs: Set<string> = new Set();
  
  /**
   * Check if request should be allowed
   */
  async checkRequest(request: Request): Promise<{ allowed: boolean; reason?: string; challengeRequired?: boolean }> {
    const ip = this.getClientIP(request);
    const path = new URL(request.url).pathname;
    const method = request.method;
    
    // 1. Check if IP is blocked
    if (this.isIPBlocked(ip)) {
      await this.logSecurityEvent(ip, 'blocked_ip_attempt', path);
      return { allowed: false, reason: 'IP blocked due to previous violations' };
    }
    
    // 2. Calculate threat level
    const threatLevel = await this.calculateThreatLevel(request);
    
    if (threatLevel.action === 'block') {
      await this.blockIP(ip, 60 * 60 * 1000); // 1 hour
      await this.logSecurityEvent(ip, 'threat_blocked', path, threatLevel.reasons.join(', '));
      return { allowed: false, reason: threatLevel.reasons.join(', ') };
    }
    
    if (threatLevel.action === 'challenge') {
      return { allowed: true, challengeRequired: true };
    }
    
    // 3. Apply rate limiting
    const rateLimitResult = await this.checkRateLimit(ip, path, method);
    
    if (!rateLimitResult.allowed) {
      await this.logSecurityEvent(ip, 'rate_limit_exceeded', path);
      return { allowed: false, reason: rateLimitResult.reason };
    }
    
    // 4. Log request
    this.logRequest({
      ip,
      userAgent: request.headers.get('user-agent') || 'unknown',
      path,
      method,
      timestamp: Date.now(),
    });
    
    return { allowed: true };
  }
  
  /**
   * Calculate threat level based on multiple factors
   */
  private async calculateThreatLevel(request: Request): Promise<ThreatLevel> {
    const ip = this.getClientIP(request);
    const userAgent = request.headers.get('user-agent') || '';
    let score = 0;
    const reasons: string[] = [];
    
    // 1. Bot Detection
    if (this.isBot(userAgent)) {
      score += 30;
      reasons.push('Bot user agent detected');
    }
    
    // 2. Suspicious IP
    if (this.suspiciousIPs.has(ip)) {
      score += 20;
      reasons.push('Suspicious IP history');
    }
    
    // 3. Request Pattern Analysis
    const recentRequests = this.requestLog.get(ip) || [];
    
    // Too many requests in short time
    const last10Seconds = recentRequests.filter(r => Date.now() - r.timestamp < 10000);
    if (last10Seconds.length > 20) {
      score += 40;
      reasons.push('Rapid request pattern detected');
    }
    
    // Distributed attack pattern (same path, different IPs)
    const samePath = Array.from(this.requestLog.values())
      .flat()
      .filter(r => r.path === new URL(request.url).pathname && Date.now() - r.timestamp < 60000);
    
    if (samePath.length > 100) {
      score += 30;
      reasons.push('Possible distributed attack pattern');
    }
    
    // 4. IP Reputation Check (would integrate with external service in production)
    const isVPN = await this.checkIPReputation(ip);
    if (isVPN) {
      score += 15;
      reasons.push('VPN/Proxy detected');
    }
    
    // 5. Missing or suspicious headers
    if (!request.headers.get('accept-language') || !request.headers.get('accept')) {
      score += 10;
      reasons.push('Suspicious headers');
    }
    
    // Determine action
    let action: 'allow' | 'challenge' | 'block' = 'allow';
    if (score >= 70) {
      action = 'block';
    } else if (score >= 40) {
      action = 'challenge';
    }
    
    return { score, reasons, action };
  }
  
  /**
   * Rate limiting per endpoint
   */
  private async checkRateLimit(ip: string, path: string, method: string): Promise<{ allowed: boolean; reason?: string }> {
    // Find matching rule
    const rule = RATE_LIMIT_RULES.find(r => path.startsWith(r.endpoint));
    if (!rule) {
      // Default rule for unmatched endpoints
      return this.applyGenericRateLimit(ip);
    }
    
    const key = `${ip}:${rule.endpoint}`;
    const now = Date.now();
    
    // Get request history
    const requests = this.requestLog.get(key) || [];
    const recentRequests = requests.filter(r => now - r.timestamp < rule.windowMs);
    
    if (recentRequests.length >= rule.maxRequests) {
      // Block IP for duration
      await this.blockIP(ip, rule.blockDurationMs);
      
      // Mark as suspicious for repeated violations
      if (recentRequests.length >= rule.maxRequests * 2) {
        this.suspiciousIPs.add(ip);
      }
      
      return {
        allowed: false,
        reason: `Rate limit exceeded for ${rule.endpoint}. Try again later.`,
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Generic rate limit for unmatched endpoints
   */
  private applyGenericRateLimit(ip: string): { allowed: boolean; reason?: string } {
    const requests = this.requestLog.get(ip) || [];
    const last5Minutes = requests.filter(r => Date.now() - r.timestamp < 5 * 60 * 1000);
    
    // Max 500 requests per 5 minutes
    if (last5Minutes.length > 500) {
      return { allowed: false, reason: 'Too many requests. Please slow down.' };
    }
    
    return { allowed: true };
  }
  
  /**
   * Get client IP (handles proxies, Cloudflare, etc.)
   */
  private getClientIP(request: Request): string {
    // Priority order for IP detection
    const headers = [
      'cf-connecting-ip', // Cloudflare
      'x-real-ip',        // Nginx
      'x-forwarded-for',  // Standard proxy
    ];
    
    for (const header of headers) {
      const value = request.headers.get(header);
      if (value) {
        // x-forwarded-for can have multiple IPs, take first
        return value.split(',')[0].trim();
      }
    }
    
    return 'unknown';
  }
  
  /**
   * Bot detection
   */
  private isBot(userAgent: string): boolean {
    const botPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python-requests/i,
      /axios/i,
      /java/i,
      /php/i,
      /ruby/i,
      /go-http-client/i,
    ];
    
    return botPatterns.some(pattern => pattern.test(userAgent));
  }
  
  /**
   * IP Reputation Check (Mock - integrate with real service)
   */
  private async checkIPReputation(ip: string): Promise<boolean> {
    // In production, integrate with services like:
    // - IPQualityScore
    // - AbuseIPDB
    // - MaxMind
    
    // Mock implementation
    return false;
  }
  
  /**
   * Block IP
   */
  private async blockIP(ip: string, durationMs: number): Promise<void> {
    const blockUntil = Date.now() + durationMs;
    this.blockedIPs.set(ip, blockUntil);
    
    // Store in database for persistence
    try {
      await supabase.from('blocked_ips').upsert({
        ip_address: ip,
        blocked_until: new Date(blockUntil).toISOString(),
        reason: 'Automated block - rate limit exceeded',
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to store blocked IP:', error);
    }
  }
  
  /**
   * Check if IP is blocked
   */
  private isIPBlocked(ip: string): boolean {
    const blockUntil = this.blockedIPs.get(ip);
    if (!blockUntil) return false;
    
    if (Date.now() > blockUntil) {
      this.blockedIPs.delete(ip);
      return false;
    }
    
    return true;
  }
  
  /**
   * Log request
   */
  private logRequest(fingerprint: RequestFingerprint): void {
    const key = fingerprint.ip;
    const requests = this.requestLog.get(key) || [];
    requests.push(fingerprint);
    
    // Keep only last 1000 requests per IP
    if (requests.length > 1000) {
      requests.shift();
    }
    
    this.requestLog.set(key, requests);
  }
  
  /**
   * Log security event
   */
  private async logSecurityEvent(ip: string, eventType: string, path: string, details?: string): Promise<void> {
    try {
      await supabase.from('security_events').insert({
        ip_address: ip,
        event_type: eventType,
        path,
        details,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * Cleanup old data
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 60 * 60 * 1000; // 1 hour
    
    // Clean request log
    for (const [key, requests] of this.requestLog.entries()) {
      const recent = requests.filter(r => now - r.timestamp < maxAge);
      if (recent.length === 0) {
        this.requestLog.delete(key);
      } else {
        this.requestLog.set(key, recent);
      }
    }
    
    // Clean blocked IPs
    for (const [ip, blockUntil] of this.blockedIPs.entries()) {
      if (now > blockUntil) {
        this.blockedIPs.delete(ip);
      }
    }
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    totalRequests: number;
    blockedIPs: number;
    suspiciousIPs: number;
    requestsPerSecond: number;
  } {
    const allRequests = Array.from(this.requestLog.values()).flat();
    const last60Seconds = allRequests.filter(r => Date.now() - r.timestamp < 60000);
    
    return {
      totalRequests: allRequests.length,
      blockedIPs: this.blockedIPs.size,
      suspiciousIPs: this.suspiciousIPs.size,
      requestsPerSecond: last60Seconds.length / 60,
    };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const ddosProtection = new DDoSProtection();

// Cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    ddosProtection.cleanup();
  }, 5 * 60 * 1000);
}
