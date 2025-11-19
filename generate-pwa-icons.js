/**
 * Anpip.com PWA Icon Generator (Node.js Version)
 * Generiert PWA-Icons ohne ImageMagick (nutzt sharp)
 */

const fs = require('fs');
const path = require('path');

// Konfiguration
const SOURCE_ICON = path.join(__dirname, 'assets/images/icon.png');
const OUTPUT_DIR = path.join(__dirname, 'dist/assets/icons');
const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Farben für Console-Output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

console.log(`${colors.blue}╔════════════════════════════════════════════════════════════╗`);
console.log(`║        Anpip.com PWA Icon Generator v2.0 (Node.js)      ║`);
console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);

// Prüfe ob sharp verfügbar ist
let sharp;
try {
  sharp = require('sharp');
  console.log(`${colors.green}✓${colors.reset} sharp library gefunden`);
} catch (error) {
  console.log(`${colors.yellow}⚠${colors.reset} sharp nicht installiert - installiere...`);
  
  // Installiere sharp
  const { execSync } = require('child_process');
  try {
    execSync('npm install sharp --save-dev --legacy-peer-deps', { stdio: 'inherit' });
    sharp = require('sharp');
    console.log(`${colors.green}✓${colors.reset} sharp erfolgreich installiert\n`);
  } catch (installError) {
    console.error(`${colors.red}❌ Fehler beim Installieren von sharp${colors.reset}`);
    console.log('\nAlternative: Nutze das Bash-Script mit ImageMagick:');
    console.log(`  ${colors.yellow}brew install imagemagick${colors.reset}`);
    console.log(`  ${colors.yellow}./generate-pwa-icons.sh${colors.reset}`);
    process.exit(1);
  }
}

// Prüfe ob Quelldatei existiert
if (!fs.existsSync(SOURCE_ICON)) {
  console.error(`${colors.red}❌ Fehler: Quelldatei nicht gefunden!${colors.reset}`);
  console.log(`\nErwartet: ${SOURCE_ICON}`);
  console.log('\nBitte erstelle ein Icon (512x512px PNG) in:');
  console.log(`  ${colors.yellow}assets/images/icon.png${colors.reset}\n`);
  process.exit(1);
}

console.log(`${colors.green}✓${colors.reset} Quelldatei gefunden: ${SOURCE_ICON}`);

// Erstelle Output-Verzeichnis
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
console.log(`${colors.green}✓${colors.reset} Output-Verzeichnis: ${OUTPUT_DIR}\n`);

// Generiere Icons
async function generateIcons() {
  console.log(`${colors.blue}🎨 Generiere PWA-Icons...${colors.reset}\n`);

  const results = [];

  for (const size of SIZES) {
    const outputFile = path.join(OUTPUT_DIR, `icon-${size}x${size}.png`);
    
    process.stdout.write(`   [${size.toString().padStart(4)}] icon-${size}x${size}.png ... `);
    
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 100 })
        .toFile(outputFile);
      
      console.log(`${colors.green}✓${colors.reset}`);
      results.push({ size, success: true, file: outputFile });
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset}`);
      results.push({ size, success: false, error: error.message });
    }
  }

  console.log('');

  // Zusammenfassung
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  if (failed === 0) {
    console.log(`${colors.green}╔════════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅ Alle Icons erfolgreich generiert!                     ║`);
    console.log(`╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
    
    console.log(`📁 Speicherort: ${colors.blue}${OUTPUT_DIR}${colors.reset}\n`);
    
    console.log('Icon-Größen:');
    for (const result of results.filter(r => r.success)) {
      const stats = fs.statSync(result.file);
      const size = (stats.size / 1024).toFixed(1);
      console.log(`   • icon-${result.size}x${result.size}.png → ${size} KB`);
    }
    
    // Erstelle favicon.ico (optional)
    console.log(`\n${colors.blue}🔖 Erstelle favicon.ico...${colors.reset}`);
    const faviconPath = path.join(__dirname, 'dist/favicon.ico');
    
    try {
      await sharp(path.join(OUTPUT_DIR, 'icon-192x192.png'))
        .resize(32, 32)
        .toFile(faviconPath);
      console.log(`   ${colors.green}✓${colors.reset} favicon.ico erstellt`);
    } catch (error) {
      console.log(`   ${colors.yellow}⚠${colors.reset} favicon.ico konnte nicht erstellt werden (optional)`);
    }
    
    console.log('');
    console.log(`${colors.green}Nächste Schritte:${colors.reset}`);
    console.log(`  1. Prüfe die Icons visuell`);
    console.log(`  2. Build erstellen: ${colors.yellow}npm run build:pwa${colors.reset}`);
    console.log(`  3. Deployen: ${colors.yellow}npm run deploy${colors.reset}`);
    console.log(`  4. Testen: ${colors.yellow}https://anpip.com${colors.reset}\n`);
    
    console.log(`${colors.green}✨ Fertig! Deine PWA-Icons sind bereit.${colors.reset}\n`);
    
  } else {
    console.log(`${colors.red}❌ Fehler: ${failed} Icon(s) konnten nicht erstellt werden${colors.reset}\n`);
    process.exit(1);
  }
}

// Führe Generator aus
generateIcons().catch(error => {
  console.error(`${colors.red}❌ Unerwarteter Fehler:${colors.reset}`, error);
  process.exit(1);
});
