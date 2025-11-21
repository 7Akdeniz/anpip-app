/**
 * SECURITY & MONITORING SYSTEM
 * 
 * Features:
 * - CSP Headers
 * - Rate Limiting
 * - Anti-Bot Protection
 * - Upload Virus Scan
 * - Error Tracking (Sentry)
 * - Logs & Metrics
 * - Alerts
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Content Security Policy Header
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // CSP
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://*.supabase.co",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org",
      "media-src 'self' https: blob:",
      "frame-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),

    // HSTS
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

    // XSS Protection
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

/**
 * Rate Limiter
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Prüft ob Request erlaubt ist
   */
  isAllowed(
    key: string,
    limit: number = 100,
    windowMs: number = 60000
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Hole bisherige Requests
    let timestamps = this.requests.get(key) || [];

    // Entferne alte Timestamps
    timestamps = timestamps.filter((ts) => ts > windowStart);

    // Prüfe Limit
    if (timestamps.length >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: timestamps[0] + windowMs,
      };
    }

    // Füge neuen Timestamp hinzu
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      allowed: true,
      remaining: limit - timestamps.length,
      resetAt: now + windowMs,
    };
  }

  /**
   * Reset für bestimmten Key
   */
  reset(key: string): void {
    this.requests.delete(key);
  }

  /**
   * Cleanup alte Einträge (regelmäßig aufrufen)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const filtered = timestamps.filter((ts) => ts > now - 3600000); // 1 Stunde
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup alle 5 Minuten
if (typeof setInterval !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 300000);
}

/**
 * Rate Limit Middleware
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: { limit?: number; windowMs?: number } = {}
) {
  return async (req: NextRequest) => {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining, resetAt } = rateLimiter.isAllowed(
      ip,
      options.limit || 100,
      options.windowMs || 60000
    );

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(options.limit || 100),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
          },
        }
      );
    }

    const response = await handler(req);

    // Rate Limit Headers hinzufügen
    response.headers.set('X-RateLimit-Limit', String(options.limit || 100));
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    return response;
  };
}

/**
 * Anti-Bot Protection
 */
export function isBot(userAgent: string): boolean {
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python-requests/i,
  ];

  return botPatterns.some((pattern) => pattern.test(userAgent));
}

/**
 * Virus Scan für Uploads
 * Integration mit ClamAV oder Cloud-Service
 */
export async function scanFileForViruses(fileBuffer: Buffer): Promise<{
  safe: boolean;
  threat?: string;
}> {
  // In Production: ClamAV, VirusTotal API, oder Cloud-basierter Scanner
  // Hier: Simplified

  // Prüfe Dateigröße
  if (fileBuffer.length > 10 * 1024 * 1024 * 1024) {
    // 10 GB
    return { safe: false, threat: 'File too large' };
  }

  // Prüfe Magic Bytes (Datei-Signatur)
  const magicBytes = fileBuffer.slice(0, 12).toString('hex');

  // Video-Formate erlauben
  const allowedFormats = [
    '000000', // MP4
    '1a45df', // WebM
    '664c76', // FLV
  ];

  const isAllowedFormat = allowedFormats.some((fmt) => magicBytes.startsWith(fmt));

  if (!isAllowedFormat) {
    return { safe: false, threat: 'Invalid file format' };
  }

  // Hier würde echter Virus-Scan stattfinden
  // const scanResult = await clamav.scan(fileBuffer);

  return { safe: true };
}

/**
 * Sentry Integration für Error Tracking
 */
export function initSentry(): void {
  if (typeof window === 'undefined') return;

  // Sentry init (vereinfacht)
  // In Production: @sentry/nextjs installieren
  /*
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    beforeSend(event, hint) {
      // Filter sensitive data
      return event;
    },
  });
  */
}

/**
 * Logger mit verschiedenen Levels
 */
export class Logger {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private log(level: string, message: string, meta?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      level,
      message,
      ...meta,
    };

    // In Production: an Log-Service senden (CloudWatch, Datadog, etc.)
    console.log(JSON.stringify(logEntry));
  }

  info(message: string, meta?: any): void {
    this.log('INFO', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('WARN', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('ERROR', message, meta);
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      this.log('DEBUG', message, meta);
    }
  }
}

/**
 * Metrics Collector
 */
export class MetricsCollector {
  private metrics: Map<string, number[]> = new Map();

  /**
   * Track Metrik
   */
  track(name: string, value: number): void {
    const values = this.metrics.get(name) || [];
    values.push(value);
    this.metrics.set(name, values);

    // In Production: an Metrics-Service senden
  }

  /**
   * Hole Durchschnitt
   */
  getAverage(name: string): number {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Reset Metriken
   */
  reset(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }
}

export const metrics = new MetricsCollector();

/**
 * Alert System
 */
export async function sendAlert(params: {
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: any;
}): Promise<void> {
  const { severity, title, message, metadata } = params;

  // In Production: Slack, PagerDuty, Email, etc.
  console.error(`🚨 [${severity.toUpperCase()}] ${title}: ${message}`, metadata);

  // Bei Critical: sofort Benachrichtigung
  if (severity === 'critical') {
    // Send to PagerDuty/Slack
  }
}

/**
 * Health Check Endpoint
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, boolean>;
  timestamp: string;
}> {
  const checks = {
    database: await checkDatabaseConnection(),
    storage: await checkStorageConnection(),
    redis: await checkRedisConnection(),
  };

  const allHealthy = Object.values(checks).every((c) => c);
  const someHealthy = Object.values(checks).some((c) => c);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString(),
  };
}

async function checkDatabaseConnection(): Promise<boolean> {
  // Implementierung
  return true;
}

async function checkStorageConnection(): Promise<boolean> {
  // Implementierung
  return true;
}

async function checkRedisConnection(): Promise<boolean> {
  // Implementierung
  return true;
}
