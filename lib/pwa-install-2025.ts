/**
 * PWA INSTALL PROMPT 2025
 * Smart Install-Banner für alle Browser & Geräte
 */

import { Platform } from 'react-native';

export interface PWAInstallConfig {
  appName: string;
  appIcon: string;
  showDelay?: number; // ms bis Banner erscheint
  minVisits?: number; // Minimum Anzahl Besuche vor Banner
  dismissDuration?: number; // Tage bis Banner nach Dismiss wieder erscheint
}

/**
 * PWA Install Manager
 */
export class PWAInstallManager {
  private config: PWAInstallConfig;
  private deferredPrompt: any = null;
  private installed = false;
  
  constructor(config: PWAInstallConfig) {
    this.config = {
      showDelay: 3000,
      minVisits: 2,
      dismissDuration: 7,
      ...config,
    };
    
    if (Platform.OS === 'web') {
      this.init();
    }
  }

  private init() {
    // Check if already installed
    if (this.isInstalled()) {
      this.installed = true;
      console.log('✅ PWA already installed');
      return;
    }

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      console.log('💡 PWA install prompt available');
      
      // Show custom banner
      this.maybeShowInstallPrompt();
    });

    // Listen for app installation
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      this.installed = true;
      this.hideInstallPrompt();
      this.trackInstallation();
    });

    // iOS Detection & Custom Prompt
    if (this.isIOS() && !this.isInStandaloneMode()) {
      this.maybeShowIOSPrompt();
    }
  }

  /**
   * Check if user should see install prompt
   */
  private maybeShowInstallPrompt() {
    // Check if dismissed recently
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissTime = new Date(dismissed).getTime();
      const now = Date.now();
      const daysSinceDismiss = (now - dismissTime) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismiss < (this.config.dismissDuration || 7)) {
        console.log('⏸️ PWA prompt dismissed recently');
        return;
      }
    }

    // Check visit count
    const visitCount = this.getVisitCount();
    this.incrementVisitCount();
    
    if (visitCount < (this.config.minVisits || 2)) {
      console.log(`⏸️ Not enough visits yet (${visitCount}/${this.config.minVisits})`);
      return;
    }

    // Show after delay
    setTimeout(() => {
      this.showInstallPrompt();
    }, this.config.showDelay || 3000);
  }

  /**
   * Show install prompt
   */
  public async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('No install prompt available');
      return false;
    }

    try {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`PWA install outcome: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.installed = true;
        this.trackInstallation();
        return true;
      } else {
        this.markDismissed();
        return false;
      }
    } catch (error) {
      console.error('PWA install error:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  /**
   * iOS-specific install prompt
   */
  private maybeShowIOSPrompt() {
    const dismissed = localStorage.getItem('pwa-ios-prompt-dismissed');
    if (dismissed) return;

    const visitCount = this.getVisitCount();
    if (visitCount < (this.config.minVisits || 2)) return;

    setTimeout(() => {
      this.showIOSInstallBanner();
    }, this.config.showDelay || 3000);
  }

  private showIOSInstallBanner() {
    // Custom iOS install banner
    const banner = document.createElement('div');
    banner.id = 'ios-pwa-install-banner';
    banner.innerHTML = `
      <div class="ios-install-prompt">
        <div class="ios-install-content">
          <img src="${this.config.appIcon}" alt="${this.config.appName}" class="ios-install-icon" />
          <div class="ios-install-text">
            <strong>${this.config.appName}</strong> installieren
            <p>Tippe auf <svg width="16" height="16" viewBox="0 0 16 16"><path d="M8 0L8 11M8 11L4 7M8 11L12 7" stroke="currentColor" stroke-width="2" fill="none"/></svg> und dann auf "Zum Home-Bildschirm"</p>
          </div>
          <button class="ios-install-close" onclick="document.getElementById('ios-pwa-install-banner').remove(); localStorage.setItem('pwa-ios-prompt-dismissed', new Date().toISOString())">×</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(banner);
  }

  /**
   * Hide install prompt
   */
  private hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    
    const iosBanner = document.getElementById('ios-pwa-install-banner');
    if (iosBanner) iosBanner.remove();
  }

  /**
   * Check if app is installed
   */
  public isInstalled(): boolean {
    if (this.installed) return true;
    
    // Check if running in standalone mode
    if (this.isInStandaloneMode()) {
      this.installed = true;
      return true;
    }

    return false;
  }

  /**
   * Check if running in standalone mode
   */
  private isInStandaloneMode(): boolean {
    if (Platform.OS !== 'web') return false;
    
    return (
      ('standalone' in window.navigator && (window.navigator as any).standalone) ||
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches
    );
  }

  /**
   * iOS Detection
   */
  private isIOS(): boolean {
    if (Platform.OS !== 'web') return false;
    
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  }

  /**
   * Visit Tracking
   */
  private getVisitCount(): number {
    const count = localStorage.getItem('pwa-visit-count');
    return count ? parseInt(count, 10) : 0;
  }

  private incrementVisitCount() {
    const count = this.getVisitCount();
    localStorage.setItem('pwa-visit-count', (count + 1).toString());
  }

  /**
   * Dismissal Tracking
   */
  private markDismissed() {
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  }

  /**
   * Installation Analytics
   */
  private trackInstallation() {
    // Send to analytics
    fetch('/api/analytics/pwa-install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        platform: this.isIOS() ? 'iOS' : 'other',
      }),
    }).catch(console.error);
  }

  /**
   * Can prompt for install
   */
  public canPrompt(): boolean {
    return this.deferredPrompt !== null || (this.isIOS() && !this.isInStandaloneMode());
  }
}

/**
 * Initialize PWA Install Manager
 */
export function initPWAInstall(config: PWAInstallConfig): PWAInstallManager {
  return new PWAInstallManager(config);
}

/**
 * Check if PWA features are supported
 */
export function isPWASupported(): boolean {
  if (Platform.OS !== 'web') return false;
  
  return (
    'serviceWorker' in navigator &&
    'caches' in window &&
    'fetch' in window
  );
}

/**
 * Register Service Worker
 */
export async function registerServiceWorker(path = '/service-worker.js'): Promise<ServiceWorkerRegistration | null> {
  if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(path, {
      scope: '/',
    });
    
    console.log('✅ Service Worker registered:', registration.scope);
    
    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🔄 New version available');
            // Optional: Show update notification
            if (confirm('Neue Version verfügbar! Jetzt aktualisieren?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister Service Worker
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (Platform.OS !== 'web' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      console.log('Service Worker unregistered:', success);
      return success;
    }
    return false;
  } catch (error) {
    console.error('Service Worker unregistration failed:', error);
    return false;
  }
}

export default {
  PWAInstallManager,
  initPWAInstall,
  isPWASupported,
  registerServiceWorker,
  unregisterServiceWorker,
};
