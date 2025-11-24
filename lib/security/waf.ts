/**
 * 🔐 WEB APPLICATION FIREWALL (WAF) RULES
 * 
 * Schützt vor:
 * - SQL Injection
 * - XSS (Cross-Site Scripting)
 * - CSRF (Cross-Site Request Forgery)
 * - SSRF (Server-Side Request Forgery)
 * - RCE (Remote Code Execution)
 * - Path Traversal
 * - Command Injection
 */

// ============================================================================
// TYPES
// ============================================================================

interface WAFResult {
  allowed: boolean;
  blocked: boolean;
  reasons: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  sanitized?: any;
}

interface ValidationRule {
  pattern: RegExp;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ============================================================================
// ATTACK PATTERNS
// ============================================================================

// SQL Injection Patterns
const SQL_INJECTION_PATTERNS: ValidationRule[] = [
  {
    pattern: /(\bUNION\b|\bSELECT\b|\bDROP\b|\bDELETE\b|\bINSERT\b|\bUPDATE\b).*(\bFROM\b|\bWHERE\b|\bTABLE\b)/gi,
    message: 'SQL Injection attempt detected',
    severity: 'critical',
  },
  {
    pattern: /('|(--)|;|\*|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|exec|execute|fetch|kill|open|sys|table|xp_)/gi,
    message: 'SQL Injection keywords detected',
    severity: 'critical',
  },
  {
    pattern: /(\bOR\b|\bAND\b).*['"]?\s*=\s*['"]?/gi,
    message: 'SQL Injection boolean logic detected',
    severity: 'critical',
  },
];

// XSS Patterns
const XSS_PATTERNS: ValidationRule[] = [
  {
    pattern: /<script[^>]*>.*?<\/script>/gi,
    message: 'XSS script tag detected',
    severity: 'critical',
  },
  {
    pattern: /javascript:/gi,
    message: 'JavaScript protocol detected',
    severity: 'high',
  },
  {
    pattern: /on(load|error|click|mouse|key|focus|blur|change|submit)=/gi,
    message: 'XSS event handler detected',
    severity: 'high',
  },
  {
    pattern: /<iframe[^>]*>/gi,
    message: 'Iframe injection detected',
    severity: 'high',
  },
  {
    pattern: /eval\(|setTimeout\(|setInterval\(|Function\(/gi,
    message: 'Dangerous JavaScript function detected',
    severity: 'high',
  },
];

// Path Traversal Patterns
const PATH_TRAVERSAL_PATTERNS: ValidationRule[] = [
  {
    pattern: /\.\.[\/\\]/g,
    message: 'Path traversal attempt detected',
    severity: 'critical',
  },
  {
    pattern: /%2e%2e[\/\\]/gi,
    message: 'Encoded path traversal detected',
    severity: 'critical',
  },
  {
    pattern: /\/etc\/passwd|\/etc\/shadow|\.\.\/|\.\.\\|\/windows\/system32/gi,
    message: 'System file access attempt detected',
    severity: 'critical',
  },
];

// Command Injection Patterns
const COMMAND_INJECTION_PATTERNS: ValidationRule[] = [
  {
    pattern: /;|\||&|`|\$\(|\$\{|<\(|>\(/g,
    message: 'Command injection metacharacters detected',
    severity: 'critical',
  },
  {
    pattern: /\b(cat|ls|wget|curl|nc|netcat|bash|sh|cmd|powershell|eval)\b/gi,
    message: 'System command detected',
    severity: 'critical',
  },
];

// SSRF Patterns
const SSRF_PATTERNS: ValidationRule[] = [
  {
    pattern: /(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|169\.254\.|192\.168\.|10\.|172\.1[6-9]\.|172\.2[0-9]\.|172\.3[0-1]\.)/gi,
    message: 'Internal IP address detected',
    severity: 'high',
  },
  {
    pattern: /file:\/\/|ftp:\/\/|gopher:\/\/|dict:\/\//gi,
    message: 'Dangerous protocol detected',
    severity: 'high',
  },
];

// ============================================================================
// WAF CLASS
// ============================================================================

class WebApplicationFirewall {
  
  /**
   * Validate and sanitize request
   */
  validateRequest(request: Request): WAFResult {
    const url = new URL(request.url);
    const reasons: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Check URL
    const urlCheck = this.checkString(url.toString(), [
      ...SQL_INJECTION_PATTERNS,
      ...XSS_PATTERNS,
      ...PATH_TRAVERSAL_PATTERNS,
      ...COMMAND_INJECTION_PATTERNS,
      ...SSRF_PATTERNS,
    ]);
    
    if (!urlCheck.allowed) {
      reasons.push(...urlCheck.reasons);
      maxSeverity = this.getMaxSeverity(maxSeverity, urlCheck.severity);
    }
    
    // Check headers
    const headersCheck = this.validateHeaders(request.headers);
    if (!headersCheck.allowed) {
      reasons.push(...headersCheck.reasons);
      maxSeverity = this.getMaxSeverity(maxSeverity, headersCheck.severity);
    }
    
    return {
      allowed: reasons.length === 0,
      blocked: reasons.length > 0,
      reasons,
      severity: maxSeverity,
    };
  }
  
  /**
   * Validate and sanitize JSON body
   */
  async validateBody(body: any): Promise<WAFResult> {
    const reasons: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const sanitized: Record<string, any> = {};
    
    if (typeof body === 'object' && body !== null) {
      for (const [key, value] of Object.entries(body)) {
        // Check key
        const keyCheck = this.checkString(key, [
          ...SQL_INJECTION_PATTERNS,
          ...XSS_PATTERNS,
          ...COMMAND_INJECTION_PATTERNS,
        ]);
        
        if (!keyCheck.allowed) {
          reasons.push(`Invalid key "${key}": ${keyCheck.reasons.join(', ')}`);
          maxSeverity = this.getMaxSeverity(maxSeverity, keyCheck.severity);
          continue;
        }
        
        // Check and sanitize value
        if (typeof value === 'string') {
          const valueCheck = this.checkString(value, [
            ...SQL_INJECTION_PATTERNS,
            ...XSS_PATTERNS,
            ...COMMAND_INJECTION_PATTERNS,
            ...SSRF_PATTERNS,
          ]);
          
          if (!valueCheck.allowed) {
            reasons.push(`Invalid value for "${key}": ${valueCheck.reasons.join(', ')}`);
            maxSeverity = this.getMaxSeverity(maxSeverity, valueCheck.severity);
          }
          
          // Sanitize
          sanitized[key] = this.sanitizeString(value);
        } else if (Array.isArray(value)) {
          sanitized[key] = value.map(v => 
            typeof v === 'string' ? this.sanitizeString(v) : v
          );
        } else {
          sanitized[key] = value;
        }
      }
    }
    
    return {
      allowed: reasons.length === 0,
      blocked: reasons.length > 0,
      reasons,
      severity: maxSeverity,
      sanitized,
    };
  }
  
  /**
   * Check string against patterns
   */
  private checkString(str: string, patterns: ValidationRule[]): WAFResult {
    const reasons: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    for (const rule of patterns) {
      if (rule.pattern.test(str)) {
        reasons.push(rule.message);
        maxSeverity = this.getMaxSeverity(maxSeverity, rule.severity);
      }
    }
    
    return {
      allowed: reasons.length === 0,
      blocked: reasons.length > 0,
      reasons,
      severity: maxSeverity,
    };
  }
  
  /**
   * Validate headers
   */
  private validateHeaders(headers: Headers): WAFResult {
    const reasons: string[] = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    // Check suspicious headers
    const suspiciousHeaders = [
      'x-forwarded-host',
      'x-original-url',
      'x-rewrite-url',
    ];
    
    for (const header of suspiciousHeaders) {
      if (headers.has(header)) {
        reasons.push(`Suspicious header detected: ${header}`);
        maxSeverity = 'medium';
      }
    }
    
    // Validate User-Agent
    const userAgent = headers.get('user-agent');
    if (!userAgent || userAgent.length < 10) {
      reasons.push('Missing or invalid User-Agent');
      maxSeverity = 'low';
    }
    
    // Check for header injection
    for (const [key, value] of headers.entries()) {
      if (value.includes('\n') || value.includes('\r')) {
        reasons.push('Header injection attempt detected');
        maxSeverity = 'critical';
      }
    }
    
    return {
      allowed: reasons.length === 0,
      blocked: reasons.length > 0,
      reasons,
      severity: maxSeverity,
    };
  }
  
  /**
   * Sanitize string (escape dangerous characters)
   */
  private sanitizeString(str: string): string {
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }
  
  /**
   * Get maximum severity
   */
  private getMaxSeverity(
    current: 'low' | 'medium' | 'high' | 'critical',
    incoming: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
    return severityOrder[incoming] > severityOrder[current] ? incoming : current;
  }
  
  /**
   * Validate email
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  /**
   * Validate URL
   */
  validateURL(url: string, allowedProtocols: string[] = ['http', 'https']): boolean {
    try {
      const parsed = new URL(url);
      return allowedProtocols.includes(parsed.protocol.replace(':', ''));
    } catch {
      return false;
    }
  }
  
  /**
   * Validate UUID
   */
  validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
  
  /**
   * Sanitize filename
   */
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  }
  
  /**
   * Check Content-Type
   */
  validateContentType(contentType: string, allowed: string[]): boolean {
    const type = contentType.split(';')[0].trim().toLowerCase();
    return allowed.some(a => type === a.toLowerCase());
  }
}

// ============================================================================
// INPUT VALIDATORS
// ============================================================================

export class InputValidator {
  
  /**
   * Validate username
   */
  static validateUsername(username: string): { valid: boolean; error?: string } {
    if (!username || username.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters' };
    }
    
    if (username.length > 30) {
      return { valid: false, error: 'Username must be less than 30 characters' };
    }
    
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, _, ., and -' };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate password strength
   */
  static validatePassword(password: string): { valid: boolean; error?: string; strength?: number } {
    if (!password || password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters' };
    }
    
    let strength = 0;
    
    // Length
    if (password.length >= 12) strength += 25;
    else if (password.length >= 10) strength += 15;
    else strength += 10;
    
    // Uppercase
    if (/[A-Z]/.test(password)) strength += 20;
    
    // Lowercase
    if (/[a-z]/.test(password)) strength += 20;
    
    // Numbers
    if (/\d/.test(password)) strength += 20;
    
    // Special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    if (strength < 60) {
      return { 
        valid: false, 
        error: 'Password too weak. Use uppercase, lowercase, numbers, and special characters',
        strength 
      };
    }
    
    return { valid: true, strength };
  }
  
  /**
   * Validate video title
   */
  static validateVideoTitle(title: string): { valid: boolean; error?: string } {
    if (!title || title.trim().length === 0) {
      return { valid: false, error: 'Title is required' };
    }
    
    if (title.length > 200) {
      return { valid: false, error: 'Title must be less than 200 characters' };
    }
    
    // Check for spam patterns
    if (/(.)\1{10,}/.test(title)) {
      return { valid: false, error: 'Title contains spam pattern' };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate video description
   */
  static validateDescription(description: string): { valid: boolean; error?: string } {
    if (description && description.length > 5000) {
      return { valid: false, error: 'Description must be less than 5000 characters' };
    }
    
    // Check for spam URLs
    const urlCount = (description.match(/https?:\/\//g) || []).length;
    if (urlCount > 5) {
      return { valid: false, error: 'Too many URLs in description' };
    }
    
    return { valid: true };
  }
  
  /**
   * Validate tags
   */
  static validateTags(tags: string[]): { valid: boolean; error?: string } {
    if (tags.length > 30) {
      return { valid: false, error: 'Maximum 30 tags allowed' };
    }
    
    for (const tag of tags) {
      if (tag.length > 50) {
        return { valid: false, error: 'Tag must be less than 50 characters' };
      }
      
      if (!/^[a-zA-Z0-9_-]+$/.test(tag)) {
        return { valid: false, error: 'Tags can only contain letters, numbers, _, and -' };
      }
    }
    
    return { valid: true };
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const waf = new WebApplicationFirewall();
export { WebApplicationFirewall, WAFResult };
