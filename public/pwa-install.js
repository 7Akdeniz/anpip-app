/**
 * ANPIP PWA INSTALLER
 * Fordert Nutzer auf, die App zu installieren
 * Funktioniert auf allen Geräten
 */

console.log('[Anpip PWA] 🚀 Installation System geladen');

let deferredPrompt = null;

// Warte auf beforeinstallprompt (Chrome/Edge)
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[Anpip PWA] ✅ beforeinstallprompt empfangen - App ist installierbar!');
  e.preventDefault();
  deferredPrompt = e;
  
  // Zeige Install-Button nach 3 Sekunden
  setTimeout(showInstallPromotion, 3000);
});

// Zeige Installation Promotion
function showInstallPromotion() {
  // Bereits installiert?
  if (window.matchMedia('(display-mode: standalone)').matches) {
    console.log('[Anpip PWA] ✅ App bereits installiert - kein Prompt');
    return;
  }
  
  // Kürzlich abgelehnt?
  const dismissed = localStorage.getItem('anpip-install-dismissed');
  if (dismissed) {
    const hoursSince = (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60);
    if (hoursSince < 72) { // 3 Tage
      console.log('[Anpip PWA] ⏸️  Installation vor ' + hoursSince.toFixed(0) + ' Stunden abgelehnt');
      return;
    }
  }
  
  console.log('[Anpip PWA] 📱 Zeige Install-Promotion...');
  
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  createInstallBanner(isIOS, isMobile);
}

function createInstallBanner(isIOS, isMobile) {
  const banner = document.createElement('div');
  banner.id = 'anpip-install-banner';
  banner.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 999999;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px 20px;
    box-shadow: 0 -8px 32px rgba(0,0,0,0.4);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `;
  
  let instructionHTML = '';
  
  if (isIOS) {
    instructionHTML = `
      <div style="font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
        <strong>📱 Anpip als App installieren:</strong><br>
        1. Tippe auf <span style="background: rgba(255,255,255,0.3); padding: 2px 8px; border-radius: 4px; font-weight: bold;">⎙ Teilen</span> (unten)<br>
        2. Wähle <strong>"Zum Home-Bildschirm"</strong><br>
        3. Tippe <strong>"Hinzufügen"</strong>
      </div>
    `;
  } else if (deferredPrompt) {
    instructionHTML = `
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
        📱 Anpip App installieren
      </div>
      <div style="font-size: 14px; opacity: 0.95; margin-bottom: 16px;">
        Installiere Anpip wie eine richtige App - funktioniert auch offline!
      </div>
      <button id="anpip-install-btn" style="
        background: white;
        color: #667eea;
        border: none;
        padding: 12px 32px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        margin-right: 12px;
      ">
        Jetzt installieren
      </button>
    `;
  } else {
    instructionHTML = `
      <div style="font-size: 15px; line-height: 1.6; margin-bottom: 12px;">
        <strong>📱 Anpip als App installieren:</strong><br>
        ${isMobile 
          ? '1. Tippe auf <strong>⋮ Menü</strong> (oben rechts)<br>2. Wähle <strong>"App installieren"</strong> oder<br>&nbsp;&nbsp;&nbsp;&nbsp;<strong>"Zum Startbildschirm hinzufügen"</strong>' 
          : '1. Klicke auf <strong>⋮ Menü</strong><br>2. Wähle <strong>"Anpip installieren"</strong>'}
      </div>
    `;
  }
  
  banner.innerHTML = `
    <style>
      @keyframes slideUp {
        from { transform: translateY(100%); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translateY(0); opacity: 1; }
        to { transform: translateY(100%); opacity: 0; }
      }
      #anpip-install-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.3);
      }
      #anpip-install-btn:active {
        transform: translateY(0);
      }
    </style>
    <div style="max-width: 640px; margin: 0 auto;">
      <div style="display: flex; align-items: flex-start; gap: 16px;">
        <img src="/assets/icons/icon-192x192.png" 
             style="width: 64px; height: 64px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.3); flex-shrink: 0;" 
             alt="Anpip">
        <div style="flex: 1; min-width: 0;">
          ${instructionHTML}
        </div>
        <button id="anpip-dismiss-btn" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          flex-shrink: 0;
        ">
          Später
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(banner);
  console.log('[Anpip PWA] ✅ Banner angezeigt');
  
  // Install Button (Chrome/Edge)
  const installBtn = document.getElementById('anpip-install-btn');
  if (installBtn && deferredPrompt) {
    installBtn.addEventListener('click', async () => {
      console.log('[Anpip PWA] 🎯 Install-Button geklickt');
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('[Anpip PWA] Benutzer-Entscheidung:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[Anpip PWA] ✅ Installation akzeptiert!');
      }
      
      deferredPrompt = null;
      dismissBanner();
    });
  }
  
  // Dismiss Button
  document.getElementById('anpip-dismiss-btn').addEventListener('click', () => {
    dismissBanner();
    localStorage.setItem('anpip-install-dismissed', Date.now().toString());
  });
}

function dismissBanner() {
  const banner = document.getElementById('anpip-install-banner');
  if (banner) {
    banner.style.animation = 'slideDown 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    setTimeout(() => banner.remove(), 300);
  }
}

// App erfolgreich installiert
window.addEventListener('appinstalled', () => {
  console.log('[Anpip PWA] 🎉 App wurde erfolgreich installiert!');
  const banner = document.getElementById('anpip-install-banner');
  if (banner) banner.remove();
  
  // Zeige Erfolgs-Nachricht
  const success = document.createElement('div');
  success.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #10b981;
    color: white;
    padding: 16px 32px;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    z-index: 999999;
  `;
  success.textContent = '✅ Anpip wurde installiert!';
  document.body.appendChild(success);
  
  setTimeout(() => success.remove(), 3000);
});

// Prüfe ob bereits installiert
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('[Anpip PWA] ✅ App läuft im Standalone-Modus (installiert)');
} else {
  console.log('[Anpip PWA] 🌐 App läuft im Browser');
  // Für iOS/Safari - zeige Banner auch ohne beforeinstallprompt
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    setTimeout(showInstallPromotion, 3000);
  }
}

console.log('[Anpip PWA] ✅ Installation System bereit');
