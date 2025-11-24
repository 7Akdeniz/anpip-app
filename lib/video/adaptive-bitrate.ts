/**
 * ============================================================================
 * ADAPTIVE BITRATE (ABR) MANAGER
 * ============================================================================
 * 
 * Intelligente Qualitäts-Anpassung basierend auf:
 * - Netzwerk-Geschwindigkeit (Bandwidth Estimation)
 * - Buffer-Level
 * - Latenz
 * - Gerät-Capabilities
 * 
 * Algorithmus: Hybrid zwischen BOLA und MPC
 * - BOLA: Buffer Occupancy based Lyapunov Algorithm
 * - MPC: Model Predictive Control
 */

import { ABR_CONFIG, getOptimalQuality } from './cdn-config';

// ============================================================================
// TYPES
// ============================================================================

interface NetworkMetrics {
  bandwidth: number;        // Mbps
  latency: number;          // ms
  bufferLevel: number;      // seconds
  droppedFrames: number;
  playbackRate: number;
}

interface QualityLevel {
  height: number;
  bitrate: number;
  name: string;
  url?: string;
}

interface ABRDecision {
  selectedQuality: QualityLevel;
  reason: string;
  confidence: number;       // 0-1
  switchCost: number;       // Switching penalty
}

// ============================================================================
// ADAPTIVE BITRATE MANAGER
// ============================================================================

export class AdaptiveBitrateManager {
  private currentQuality: number = 720;
  private bandwidthHistory: number[] = [];
  private latencyHistory: number[] = [];
  private bufferHistory: number[] = [];
  private lastSwitch: number = Date.now();
  private switchCount: number = 0;

  // Konstanten
  private readonly BANDWIDTH_HISTORY_SIZE = 5;
  private readonly MIN_SWITCH_INTERVAL = 3000; // 3 Sekunden zwischen Switches
  private readonly SWITCH_PENALTY = 0.2;        // 20% Penalty für jeden Switch

  /**
   * Berechnet optimale Qualität basierend auf aktuellen Metriken
   */
  selectQuality(metrics: NetworkMetrics): ABRDecision {
    // Update History
    this.updateHistory(metrics);

    // Berechne gewichteten Score für jede Qualität
    const scores = ABR_CONFIG.QUALITIES.map(quality => {
      const score = this.calculateQualityScore(quality, metrics);
      return { quality, score };
    });

    // Sortiere nach Score (höher = besser)
    scores.sort((a, b) => b.score - a.score);

    // Beste Qualität wählen
    const selectedQuality = scores[0].quality;

    // Prüfe ob Switch sinnvoll ist
    const shouldSwitch = this.shouldSwitchQuality(
      this.currentQuality,
      selectedQuality.height,
      metrics
    );

    if (!shouldSwitch) {
      // Behalte aktuelle Qualität
      const currentLevel = ABR_CONFIG.QUALITIES.find(q => q.height === this.currentQuality)!;
      return {
        selectedQuality: currentLevel,
        reason: 'Staying at current quality (stable)',
        confidence: 0.8,
        switchCost: 0,
      };
    }

    // Update State
    this.currentQuality = selectedQuality.height;
    this.lastSwitch = Date.now();
    this.switchCount++;

    return {
      selectedQuality,
      reason: this.getDecisionReason(selectedQuality, metrics),
      confidence: scores[0].score,
      switchCost: this.calculateSwitchCost(selectedQuality.height),
    };
  }

  /**
   * Berechnet Score für eine Qualitätsstufe
   */
  private calculateQualityScore(quality: QualityLevel, metrics: NetworkMetrics): number {
    const { WEIGHTS } = ABR_CONFIG;

    // 1. Bandwidth Score (kann die Qualität gestreamt werden?)
    const avgBandwidth = this.getAverageBandwidth();
    const bandwidthRatio = avgBandwidth / (quality.bitrate / 1000); // kbps → Mbps
    const bandwidthScore = Math.min(bandwidthRatio, 1.5); // Cap at 1.5x

    // 2. Buffer Score (genug Buffer für diese Qualität?)
    const bufferScore = this.calculateBufferScore(metrics.bufferLevel, quality.bitrate);

    // 3. Latency Score (niedrige Latenz = besser)
    const avgLatency = this.getAverageLatency();
    const latencyScore = Math.max(0, 1 - (avgLatency / 500)); // 500ms = worst case

    // 4. Quality Score (höher = besser, aber diminishing returns)
    const qualityScore = Math.log10(quality.height / 240); // Normalisiert

    // Gewichteter Gesamt-Score
    const totalScore = 
      (bandwidthScore * WEIGHTS.bandwidth) +
      (bufferScore * WEIGHTS.buffer) +
      (latencyScore * WEIGHTS.latency) +
      (qualityScore * 0.3); // Bonus für höhere Qualität

    // Penalty für zu viele Switches
    const switchPenalty = this.switchCount > 5 ? this.SWITCH_PENALTY : 0;

    return Math.max(0, totalScore - switchPenalty);
  }

  /**
   * Berechnet Buffer-Score
   */
  private calculateBufferScore(bufferLevel: number, bitrate: number): number {
    const { BUFFER } = ABR_CONFIG;

    // Zu wenig Buffer = niedrigerer Score
    if (bufferLevel < BUFFER.MIN) {
      return 0.2;
    }

    // Ideal buffer range
    if (bufferLevel >= BUFFER.TARGET && bufferLevel <= BUFFER.MAX) {
      return 1.0;
    }

    // Buffer zwischen MIN und TARGET
    if (bufferLevel < BUFFER.TARGET) {
      return 0.5 + (bufferLevel - BUFFER.MIN) / (BUFFER.TARGET - BUFFER.MIN) * 0.5;
    }

    // Buffer über MAX (zu viel gebuffert)
    return 0.8;
  }

  /**
   * Prüft ob Quality-Switch sinnvoll ist
   */
  private shouldSwitchQuality(
    currentHeight: number,
    targetHeight: number,
    metrics: NetworkMetrics
  ): boolean {
    // Keine Änderung
    if (currentHeight === targetHeight) {
      return false;
    }

    // Zu kurz seit letztem Switch
    const timeSinceSwitch = Date.now() - this.lastSwitch;
    if (timeSinceSwitch < this.MIN_SWITCH_INTERVAL) {
      return false;
    }

    // Buffer kritisch niedrig → sofort downgrade
    if (metrics.bufferLevel < ABR_CONFIG.BUFFER.MIN && targetHeight < currentHeight) {
      return true;
    }

    // Zu viele dropped frames → downgrade
    if (metrics.droppedFrames > 10 && targetHeight < currentHeight) {
      return true;
    }

    // Upgrade nur bei stabilem Buffer
    if (targetHeight > currentHeight) {
      return metrics.bufferLevel >= ABR_CONFIG.BUFFER.TARGET;
    }

    return true;
  }

  /**
   * Berechnet Switch-Kosten (mehr Switches = schlechter)
   */
  private calculateSwitchCost(targetHeight: number): number {
    const heightDiff = Math.abs(this.currentQuality - targetHeight);
    const baseCost = heightDiff / 1080; // Normalisiert
    const switchPenalty = this.switchCount * 0.1;
    
    return Math.min(1, baseCost + switchPenalty);
  }

  /**
   * Gibt Begründung für Entscheidung
   */
  private getDecisionReason(quality: QualityLevel, metrics: NetworkMetrics): string {
    const avgBandwidth = this.getAverageBandwidth();

    if (metrics.bufferLevel < ABR_CONFIG.BUFFER.MIN) {
      return `Low buffer (${metrics.bufferLevel.toFixed(1)}s) - reducing quality`;
    }

    if (metrics.droppedFrames > 10) {
      return `Dropped frames (${metrics.droppedFrames}) - reducing quality`;
    }

    if (avgBandwidth < quality.bitrate / 1000) {
      return `Insufficient bandwidth (${avgBandwidth.toFixed(1)} Mbps) - adjusting`;
    }

    if (metrics.bufferLevel >= ABR_CONFIG.BUFFER.TARGET && avgBandwidth > quality.bitrate / 1000 * 1.5) {
      return `Good conditions - upgrading to ${quality.name}`;
    }

    return `Optimal quality for current conditions`;
  }

  /**
   * Update Metriken-History
   */
  private updateHistory(metrics: NetworkMetrics): void {
    // Bandwidth
    this.bandwidthHistory.push(metrics.bandwidth);
    if (this.bandwidthHistory.length > this.BANDWIDTH_HISTORY_SIZE) {
      this.bandwidthHistory.shift();
    }

    // Latency
    this.latencyHistory.push(metrics.latency);
    if (this.latencyHistory.length > this.BANDWIDTH_HISTORY_SIZE) {
      this.latencyHistory.shift();
    }

    // Buffer
    this.bufferHistory.push(metrics.bufferLevel);
    if (this.bufferHistory.length > this.BANDWIDTH_HISTORY_SIZE) {
      this.bufferHistory.shift();
    }
  }

  /**
   * Durchschnittliche Bandwidth
   */
  private getAverageBandwidth(): number {
    if (this.bandwidthHistory.length === 0) return 10; // Default: 10 Mbps
    const sum = this.bandwidthHistory.reduce((a, b) => a + b, 0);
    return sum / this.bandwidthHistory.length;
  }

  /**
   * Durchschnittliche Latency
   */
  private getAverageLatency(): number {
    if (this.latencyHistory.length === 0) return 50; // Default: 50ms
    const sum = this.latencyHistory.reduce((a, b) => a + b, 0);
    return sum / this.latencyHistory.length;
  }

  /**
   * Durchschnittlicher Buffer
   */
  private getAverageBuffer(): number {
    if (this.bufferHistory.length === 0) return 10;
    const sum = this.bufferHistory.reduce((a, b) => a + b, 0);
    return sum / this.bufferHistory.length;
  }

  /**
   * Reset State (z.B. bei neuem Video)
   */
  reset(): void {
    this.bandwidthHistory = [];
    this.latencyHistory = [];
    this.bufferHistory = [];
    this.switchCount = 0;
    this.lastSwitch = Date.now();
  }

  /**
   * Get Current State
   */
  getState() {
    return {
      currentQuality: this.currentQuality,
      avgBandwidth: this.getAverageBandwidth(),
      avgLatency: this.getAverageLatency(),
      avgBuffer: this.getAverageBuffer(),
      switchCount: this.switchCount,
    };
  }
}

// ============================================================================
// BANDWIDTH ESTIMATOR
// ============================================================================

export class BandwidthEstimator {
  private downloadSize: number = 0;
  private downloadTime: number = 0;
  private estimates: number[] = [];
  private readonly MAX_ESTIMATES = 10;

  /**
   * Messe Bandwidth durch Download
   */
  async measureBandwidth(url: string, signal?: AbortSignal): Promise<number> {
    const startTime = performance.now();
    
    try {
      const response = await fetch(url, { signal });
      const blob = await response.blob();
      
      const endTime = performance.now();
      const durationSeconds = (endTime - startTime) / 1000;
      const sizeBytes = blob.size;
      const sizeMegabits = (sizeBytes * 8) / 1000000;
      const bandwidthMbps = sizeMegabits / durationSeconds;

      // Update estimates
      this.estimates.push(bandwidthMbps);
      if (this.estimates.length > this.MAX_ESTIMATES) {
        this.estimates.shift();
      }

      return bandwidthMbps;
    } catch (error) {
      console.error('Bandwidth measurement failed:', error);
      return this.getEstimate();
    }
  }

  /**
   * Get aktuelle Bandwidth Estimate
   */
  getEstimate(): number {
    if (this.estimates.length === 0) return 10; // Default: 10 Mbps

    // Verwende Median statt Average (robuster gegen Ausreißer)
    const sorted = [...this.estimates].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
  }

  /**
   * Get Confidence (0-1)
   */
  getConfidence(): number {
    return Math.min(1, this.estimates.length / this.MAX_ESTIMATES);
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

let abrManagerInstance: AdaptiveBitrateManager | null = null;
let bandwidthEstimatorInstance: BandwidthEstimator | null = null;

export function getABRManager(): AdaptiveBitrateManager {
  if (!abrManagerInstance) {
    abrManagerInstance = new AdaptiveBitrateManager();
  }
  return abrManagerInstance;
}

export function getBandwidthEstimator(): BandwidthEstimator {
  if (!bandwidthEstimatorInstance) {
    bandwidthEstimatorInstance = new BandwidthEstimator();
  }
  return bandwidthEstimatorInstance;
}

export default AdaptiveBitrateManager;
