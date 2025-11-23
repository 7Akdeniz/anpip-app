/**
 * SECURITY HEADERS 2025
 * CSP, HSTS, XSS Protection, etc.
 */

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  csp?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    fontSrc?: string[];
    connectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
    objectSrc?: string[];
  };
  enableHSTS?: boolean;
  hsts?: {
    maxAge?: number;
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  enableXSSProtection?: boolean;
  enableNoSniff?: boolean;
  enableFrameGuard?: boolean;
}

/**
 * Generiert Security Headers
 */
export function generateSecurityHeaders(config: SecurityHeadersConfig = {}): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content Security Policy
  if (config.enableCSP !== false) {
    const csp = config.csp || {};
    const cspParts: string[] = [];

    const addDirective = (name: string, values: string[]) => {
      if (values.length > 0) {
        cspParts.push(`${name} ${values.join(' ')}`);
      }
    };

    addDirective('default-src', csp.defaultSrc || ["'self'"]);
    addDirective('script-src', csp.scriptSrc || ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://vercel.live']);
    addDirective('style-src', csp.styleSrc || ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com']);
    addDirective('img-src', csp.imgSrc || ["'self'", 'data:', 'https:', 'blob:']);
    addDirective('font-src', csp.fontSrc || ["'self'", 'https://fonts.gstatic.com']);
    addDirective('connect-src', csp.connectSrc || ["'self'", 'https://fkmhucsjybyhjrgodwcx.supabase.co', 'https://vlibyocpdguxpretjvnz.supabase.co', 'wss://*.supabase.co']);
    addDirective('media-src', csp.mediaSrc || ["'self'", 'https:', 'blob:', 'data:']);
    addDirective('frame-src', csp.frameSrc || ["'self'"]);
    addDirective('object-src', csp.objectSrc || ["'none'"]);

    headers['Content-Security-Policy'] = cspParts.join('; ');
  }

  // HTTP Strict Transport Security
  if (config.enableHSTS !== false) {
    const hsts = config.hsts || {};
    const maxAge = hsts.maxAge || 31536000; // 1 Jahr
    const includeSubDomains = hsts.includeSubDomains !== false;
    const preload = hsts.preload || false;

    let hstsValue = `max-age=${maxAge}`;
    if (includeSubDomains) hstsValue += '; includeSubDomains';
    if (preload) hstsValue += '; preload';

    headers['Strict-Transport-Security'] = hstsValue;
  }

  // XSS Protection
  if (config.enableXSSProtection !== false) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Content Type Sniffing Protection
  if (config.enableNoSniff !== false) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // Clickjacking Protection
  if (config.enableFrameGuard !== false) {
    headers['X-Frame-Options'] = 'SAMEORIGIN';
  }

  // Referrer Policy
  headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';

  // Permissions Policy (früher Feature-Policy)
  headers['Permissions-Policy'] = [
    'camera=(self)',
    'microphone=(self)',
    'geolocation=(self)',
    'payment=()',
    'usb=()',
    'magnetometer=()',
  ].join(', ');

  return headers;
}

/**
 * Middleware für Next.js oder Vercel
 */
export function createSecurityHeadersMiddleware(config?: SecurityHeadersConfig) {
  const headers = generateSecurityHeaders(config);

  return (response: Response): Response => {
    const newHeaders = new Headers(response.headers);
    
    Object.entries(headers).forEach(([key, value]) => {
      newHeaders.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Vercel Config für next.config.js / vercel.json
 */
export function generateVercelSecurityConfig(config?: SecurityHeadersConfig): any {
  const headers = generateSecurityHeaders(config);

  return {
    headers: [
      {
        source: '/(.*)',
        headers: Object.entries(headers).map(([key, value]) => ({
          key,
          value,
        })),
      },
    ],
  };
}

export default {
  generateSecurityHeaders,
  createSecurityHeadersMiddleware,
  generateVercelSecurityConfig,
};
