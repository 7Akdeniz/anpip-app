/**
 * ============================================================================
 * VIDEO LIMITS CONFIGURATION
 * ============================================================================
 * 
 * Zentrale Konfiguration für Video-Upload-Limits.
 * Ermöglicht einfache Anpassung ohne Code-Änderungen.
 * 
 * WICHTIG:
 * - TECHNICAL_MAX: Systemarchitektur unterstützt bis zu diesem Wert
 * - ACTIVE_MAX: Aktuell aktives Limit für User-Uploads
 * 
 * Um Limits zu ändern:
 * 1. .env Datei anpassen (z.B. VIDEO_MAX_DURATION_SECONDS=120)
 * 2. App neu starten
 * 3. Fertig! ✅
 */

// ============================================================================
// ENVIRONMENT VARIABLES (mit Fallback-Werten)
// ============================================================================

/**
 * Technisches Maximum - Systemarchitektur unterstützt bis zu diesem Wert
 * Default: 7200 Sekunden = 2 Stunden
 * 
 * Dies ist das absolute Maximum, das die Infrastruktur verarbeiten kann.
 * Cloudflare Stream, Storage, Transcoding-Pipeline sind darauf ausgelegt.
 */
const TECHNICAL_MAX_DURATION_SECONDS = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_TECHNICAL_MAX_DURATION_SECONDS || '7200', 10);

/**
 * Aktives Maximum - Aktuell für User-Uploads erlaubt
 * Default: 60 Sekunden = 1 Minute
 * 
 * Dies ist das Limit, das Nutzer sehen und einhalten müssen.
 * Kann jederzeit erhöht werden (bis zu TECHNICAL_MAX).
 */
const ACTIVE_MAX_DURATION_SECONDS = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_MAX_DURATION_SECONDS || '60', 10);

/**
 * Maximale Dateigröße in Bytes
 * Default: 10 GB (10 * 1024 * 1024 * 1024)
 * 
 * Cloudflare Stream unterstützt bis zu 30 GB, aber 10 GB ist
 * ein vernünftiges Limit für die meisten Use Cases.
 */
const MAX_SIZE_BYTES = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_MAX_SIZE_BYTES || String(10 * 1024 * 1024 * 1024), 10);

/**
 * Minimale Videodauer in Sekunden
 * Default: 1 Sekunde
 */
const MIN_DURATION_SECONDS = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_MIN_DURATION_SECONDS || '1', 10);

/**
 * Chunk-Größe für Upload (für große Videos)
 * Default: 10 MB
 */
const UPLOAD_CHUNK_SIZE_BYTES = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_UPLOAD_CHUNK_SIZE || String(10 * 1024 * 1024), 10);

/**
 * Upload-Timeout in Millisekunden
 * Default: 5 Minuten für 2-Stunden-Videos (sehr großzügig)
 */
const UPLOAD_TIMEOUT_MS = 
  parseInt(process.env.EXPO_PUBLIC_VIDEO_UPLOAD_TIMEOUT_MS || String(5 * 60 * 1000), 10);

// ============================================================================
// VALIDIERUNG
// ============================================================================

// Validiere, dass ACTIVE_MAX nicht größer als TECHNICAL_MAX ist
if (ACTIVE_MAX_DURATION_SECONDS > TECHNICAL_MAX_DURATION_SECONDS) {
  console.warn(
    `⚠️ VIDEO CONFIG WARNING:\n` +
    `ACTIVE_MAX (${ACTIVE_MAX_DURATION_SECONDS}s) ist größer als TECHNICAL_MAX (${TECHNICAL_MAX_DURATION_SECONDS}s).\n` +
    `ACTIVE_MAX wird auf TECHNICAL_MAX begrenzt.`
  );
}

const VALIDATED_ACTIVE_MAX = Math.min(
  ACTIVE_MAX_DURATION_SECONDS, 
  TECHNICAL_MAX_DURATION_SECONDS
);

// ============================================================================
// EXPORT
// ============================================================================

export const VIDEO_LIMITS = {
  /**
   * Technisches Maximum - System unterstützt bis zu diesem Wert
   * @default 7200 (2 Stunden)
   */
  TECHNICAL_MAX_DURATION_SECONDS,

  /**
   * Aktives Maximum - Aktuell für User erlaubt
   * @default 60 (1 Minute)
   */
  ACTIVE_MAX_DURATION_SECONDS: VALIDATED_ACTIVE_MAX,

  /**
   * Maximale Dateigröße
   * @default 10737418240 (10 GB)
   */
  MAX_SIZE_BYTES,

  /**
   * Minimale Videodauer
   * @default 1 (1 Sekunde)
   */
  MIN_DURATION_SECONDS,

  /**
   * Chunk-Größe für Upload
   * @default 10485760 (10 MB)
   */
  UPLOAD_CHUNK_SIZE_BYTES,

  /**
   * Upload-Timeout
   * @default 300000 (5 Minuten)
   */
  UPLOAD_TIMEOUT_MS,

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Formatiert Bytes in lesbare Größe
   */
  formatBytes: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * Formatiert Sekunden in lesbare Zeit
   */
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  },

  /**
   * Gibt User-freundliche Fehlermeldung zurück
   */
  getErrorMessage: (type: 'duration' | 'size', actualValue: number): string => {
    if (type === 'duration') {
      return (
        `Video ist zu lang!\n\n` +
        `Deine Videodauer: ${VIDEO_LIMITS.formatDuration(actualValue)}\n` +
        `Maximale Länge: ${VIDEO_LIMITS.formatDuration(VALIDATED_ACTIVE_MAX)}\n\n` +
        `Bitte kürze dein Video oder teile es in mehrere Clips auf.`
      );
    } else {
      return (
        `Video ist zu groß!\n\n` +
        `Deine Dateigröße: ${VIDEO_LIMITS.formatBytes(actualValue)}\n` +
        `Maximale Größe: ${VIDEO_LIMITS.formatBytes(MAX_SIZE_BYTES)}\n\n` +
        `Bitte komprimiere dein Video oder reduziere die Auflösung.`
      );
    }
  },

  /**
   * Validiert Video-Parameter
   * @returns { valid: boolean, error?: string }
   */
  validate: (params: {
    durationSeconds?: number;
    sizeBytes?: number;
  }): { valid: boolean; error?: string } => {
    // Dauer-Validierung
    if (params.durationSeconds !== undefined) {
      if (params.durationSeconds < MIN_DURATION_SECONDS) {
        return {
          valid: false,
          error: `Video ist zu kurz! Mindestens ${MIN_DURATION_SECONDS} Sekunde(n) erforderlich.`,
        };
      }

      if (params.durationSeconds > VALIDATED_ACTIVE_MAX) {
        return {
          valid: false,
          error: VIDEO_LIMITS.getErrorMessage('duration', params.durationSeconds),
        };
      }
    }

    // Größen-Validierung
    if (params.sizeBytes !== undefined) {
      if (params.sizeBytes > MAX_SIZE_BYTES) {
        return {
          valid: false,
          error: VIDEO_LIMITS.getErrorMessage('size', params.sizeBytes),
        };
      }
    }

    return { valid: true };
  },
} as const;

// ============================================================================
// CONSOLE INFO (nur im Development)
// ============================================================================

if (process.env.NODE_ENV === 'development') {
  console.log(
    `\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📹 VIDEO UPLOAD LIMITS\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `\n` +
    `🔧 TECHNICAL MAXIMUM (System-Kapazität):\n` +
    `   ${VIDEO_LIMITS.formatDuration(TECHNICAL_MAX_DURATION_SECONDS)} (${TECHNICAL_MAX_DURATION_SECONDS}s)\n` +
    `\n` +
    `✅ ACTIVE MAXIMUM (User-Limit):\n` +
    `   ${VIDEO_LIMITS.formatDuration(VALIDATED_ACTIVE_MAX)} (${VALIDATED_ACTIVE_MAX}s)\n` +
    `\n` +
    `💾 MAX FILE SIZE:\n` +
    `   ${VIDEO_LIMITS.formatBytes(MAX_SIZE_BYTES)}\n` +
    `\n` +
    `📦 CHUNK SIZE:\n` +
    `   ${VIDEO_LIMITS.formatBytes(UPLOAD_CHUNK_SIZE_BYTES)}\n` +
    `\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `\n` +
    `💡 Um Limits zu ändern:\n` +
    `   1. Bearbeite .env Datei\n` +
    `   2. Setze VIDEO_MAX_DURATION_SECONDS=120 (z.B. für 2 Min)\n` +
    `   3. Starte App neu\n` +
    `\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
  );
}

export default VIDEO_LIMITS;
