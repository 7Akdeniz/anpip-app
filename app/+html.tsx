import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" dir="ltr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5, user-scalable=yes" />
        
        {/* ==================== PRIMARY META TAGS - 2025 SEO OPTIMIZED ==================== */}
        <title>Anpip - Social Video Platform 2025 | Teile Momente, Videos & lokale Angebote weltweit</title>
        <meta name="title" content="Anpip - Social Video Platform 2025 | Teile Momente, Videos & lokale Angebote weltweit" />
        <meta name="description" content="Anpip ist die moderne Social Video Plattform 2025 zum Teilen von Momenten, kurzen Videos und lokalen Angeboten. Entdecke Inhalte aus deiner Stadt und weltweit. Live-Streaming, Marketplace, Duett-Videos. Jetzt kostenlos starten! Optimiert für ChatGPT, Perplexity, Google Gemini & AI-Search." />
        <meta name="keywords" content="social media, video platform, short videos, lokale angebote, marketplace, video sharing, anpip, social network, 9:16 videos, tiktok alternative, vertical videos, mobile video, live streaming, duett videos, video marketplace, local business, geo-targeting, KI-optimiert, AI-ready, ChatGPT, Perplexity, Google Gemini" />
        <meta name="author" content="Anpip - Social Video Platform" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="color-scheme" content="dark light" />
        <meta name="application-name" content="Anpip" />
        <meta name="apple-mobile-web-app-title" content="Anpip" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* ==================== ROBOTS & CRAWLING - AI-OPTIMIZED 2025 ==================== */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        <meta name="bingbot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        
        {/* AI Search Engines - 2025 */}
        <meta name="GPTBot" content="index, follow" />
        <meta name="ChatGPT-User" content="index, follow" />
        <meta name="PerplexityBot" content="index, follow" />
        <meta name="Claude-Web" content="index, follow" />
        <meta name="anthropic-ai" content="index, follow" />
        <meta name="Bard" content="index, follow" />
        <meta name="Gemini" content="index, follow" />
        
        {/* ==================== OPEN GRAPH / FACEBOOK - ENHANCED 2025 ==================== */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://anpip.com/" />
        <meta property="og:title" content="Anpip - Social Video Platform 2025 | Teile Videos & lokale Angebote" />
        <meta property="og:description" content="Moderne Social Video Plattform für 9:16 Videos. Teile Momente, entdecke lokale Angebote, streame live. Die Video-Community für deine Stadt und die Welt." />
        <meta property="og:image" content="https://anpip.com/assets/og-image-1200x630.png" />
        <meta property="og:image:secure_url" content="https://anpip.com/assets/og-image-1200x630.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Anpip - Social Video Platform 2025" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:locale:alternate" content="es_ES" />
        <meta property="og:locale:alternate" content="fr_FR" />
        <meta property="og:site_name" content="Anpip" />
        <meta property="og:video" content="https://anpip.com/assets/intro-video.mp4" />
        <meta property="og:video:type" content="video/mp4" />
        <meta property="og:video:width" content="1080" />
        <meta property="og:video:height" content="1920" />
        
        {/* Facebook App ID (optional - ersetze mit deiner ID) */}
        {/* <meta property="fb:app_id" content="YOUR_FB_APP_ID" /> */}
        
        {/* ==================== TWITTER CARD - ENHANCED 2025 ==================== */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@anpip" />
        <meta name="twitter:creator" content="@anpip" />
        <meta name="twitter:url" content="https://anpip.com/" />
        <meta name="twitter:title" content="Anpip - Social Video Platform 2025" />
        <meta name="twitter:description" content="Teile Videos, Momente und lokale Angebote weltweit. Die moderne Social Media Plattform für 9:16 Videos." />
        <meta name="twitter:image" content="https://anpip.com/assets/twitter-card-1200x600.png" />
        <meta name="twitter:image:alt" content="Anpip Social Video Platform" />
        
        {/* ==================== CANONICAL & ALTERNATE URLS ==================== */}
        <link rel="canonical" href="https://anpip.com/" />
        
        {/* Alternate Languages - Multilingual SEO */}
        <link rel="alternate" hrefLang="de" href="https://anpip.com/?lang=de" />
        <link rel="alternate" hrefLang="en" href="https://anpip.com/?lang=en" />
        <link rel="alternate" hrefLang="es" href="https://anpip.com/?lang=es" />
        <link rel="alternate" hrefLang="fr" href="https://anpip.com/?lang=fr" />
        <link rel="alternate" hrefLang="x-default" href="https://anpip.com/" />
        
        {/* ==================== GEO & LOCAL SEO - 2025 ==================== */}
        <meta name="geo.region" content="DE-BE" />
        <meta name="geo.placename" content="Berlin, Germany" />
        <meta name="geo.position" content="52.520008;13.404954" />
        <meta name="ICBM" content="52.520008, 13.404954" />
        <meta name="geo.country" content="Germany" />
        
        {/* ==================== PWA MANIFEST ==================== */}
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* ==================== ICONS - ALL SIZES 2025 ==================== */}
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/assets/icons/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/assets/icons/icon-512x512.png" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="57x57" href="/assets/icons/icon-57x57.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/assets/icons/icon-60x60.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/assets/icons/icon-72x72.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/assets/icons/icon-76x76.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/assets/icons/icon-114x114.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/assets/icons/icon-120x120.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/assets/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180x180.png" />
        
        {/* Safari Pinned Tab */}
        <link rel="mask-icon" href="/assets/icons/safari-pinned-tab.svg" color="#0ea5e9" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-TileImage" content="/assets/icons/icon-144x144.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-starturl" content="/" />
        <meta name="msapplication-tooltip" content="Anpip - Social Video Platform" />
        
        {/* ==================== DNS PREFETCH & PRECONNECT - PERFORMANCE 2025 ==================== */}
        
        {/* Google Services */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Google Identity Services */}
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://accounts.google.com" crossOrigin="anonymous" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        
        {/* Supabase CDN */}
        <link rel="dns-prefetch" href="https://fkmhucsjybyhjrgodwcx.supabase.co" />
        <link rel="preconnect" href="https://fkmhucsjybyhjrgodwcx.supabase.co" crossOrigin="anonymous" />
        
        {/* Cloudflare */}
        <link rel="dns-prefetch" href="https://cloudflare.com" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        
        {/* Analytics (wenn verwendet) */}
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* ==================== PRELOAD CRITICAL RESOURCES ==================== */}
        <link rel="preload" as="image" href="/assets/icons/icon-512x512.png" />
        <link rel="preload" as="image" href="/splash-screen.png" />
        
        {/* ==================== SCHEMA.ORG JSON-LD - AI & SEARCH OPTIMIZATION 2025 ==================== */}
        
        {/* ==================== SCHEMA.ORG JSON-LD - AI & SEARCH OPTIMIZATION 2025 ==================== */}
        
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Anpip',
              alternateName: 'Anpip - Social Video Platform',
              description: 'Global Social Video Platform - Teile Videos, Momente und lokale Angebote weltweit',
              url: 'https://anpip.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://anpip.com/assets/icons/icon-512x512.png',
                width: 512,
                height: 512,
              },
              sameAs: [
                'https://twitter.com/anpip',
                'https://facebook.com/anpip',
                'https://instagram.com/anpip',
                'https://linkedin.com/company/anpip',
                'https://youtube.com/@anpip',
              ],
              contactPoint: [{
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['German', 'English', 'Spanish', 'French'],
                areaServed: 'Worldwide',
              }],
              foundingDate: '2024',
              slogan: 'Teile deine Momente mit der Welt',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '12500',
                bestRating: '5',
                worstRating: '1',
              },
            }),
          }}
        />
        
        {/* WebSite Schema with SearchAction for AI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Anpip',
              alternateName: 'Anpip Social Video Platform',
              description: 'Social Video Platform - Teile Momente, Videos und lokale Angebote weltweit',
              url: 'https://anpip.com',
              potentialAction: [{
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://anpip.com/explore?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              }],
              inLanguage: ['de-DE', 'en-US', 'es-ES', 'fr-FR'],
              publisher: {
                '@type': 'Organization',
                name: 'Anpip',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://anpip.com/assets/icons/icon-512x512.png',
                },
              },
            }),
          }}
        />
        
        {/* MobileApplication Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MobileApplication',
              name: 'Anpip',
              applicationCategory: 'SocialNetworkingApplication',
              operatingSystem: 'iOS, Android, Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '12500',
              },
              screenshot: 'https://anpip.com/assets/screenshots/feed.png',
              downloadUrl: 'https://anpip.com',
              installUrl: 'https://anpip.com',
            }),
          }}
        />
        
        {/* VideoObject Schema for Platform */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'VideoGallery',
              name: 'Anpip Video Feed',
              description: 'Entdecke tausende von Videos aus deiner Stadt und der ganzen Welt',
              url: 'https://anpip.com',
              thumbnailUrl: 'https://anpip.com/assets/feed-preview.png',
            }),
          }}
        />
        
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: 'Anpip',
              image: 'https://anpip.com/assets/icons/icon-512x512.png',
              '@id': 'https://anpip.com',
              url: 'https://anpip.com',
              telephone: '+49-30-12345678',
              priceRange: 'Kostenlos',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Beispielstraße 123',
                addressLocality: 'Berlin',
                addressRegion: 'Berlin',
                postalCode: '10115',
                addressCountry: 'DE',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 52.520008,
                longitude: 13.404954,
              },
              openingHoursSpecification: [{
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: '00:00',
                closes: '23:59',
              }],
              sameAs: [
                'https://twitter.com/anpip',
                'https://facebook.com/anpip',
                'https://instagram.com/anpip',
              ],
            }),
          }}
        />
        
        {/* FAQ Schema for AI Answer Engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [{
                '@type': 'Question',
                name: 'Was ist Anpip?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Anpip ist eine moderne Social Video Plattform zum Teilen von kurzen Videos im 9:16 Format. Nutzer können Videos hochladen, live streamen, lokale Angebote im Marketplace verkaufen und mit der Community interagieren.',
                },
              }, {
                '@type': 'Question',
                name: 'Ist Anpip kostenlos?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ja, Anpip ist komplett kostenlos. Du kannst Videos hochladen, teilen, kommentieren und mit anderen Nutzern interagieren ohne Kosten.',
                },
              }, {
                '@type': 'Question',
                name: 'Welche Videoformate werden unterstützt?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Anpip unterstützt primär vertikale Videos im 9:16 Format (1080x1920px). Die Videos werden automatisch optimiert und in verschiedenen Qualitätsstufen bereitgestellt.',
                },
              }, {
                '@type': 'Question',
                name: 'Kann ich lokale Produkte verkaufen?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Ja, Anpip hat einen integrierten Marketplace. Du kannst Produkte und Dienstleistungen mit Videos präsentieren und in deiner Region oder weltweit verkaufen.',
                },
              }, {
                '@type': 'Question',
                name: 'Wie funktioniert Live-Streaming auf Anpip?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Mit Anpip kannst du direkt von deinem Smartphone oder Desktop live streamen. Deine Follower werden benachrichtigt und können in Echtzeit interagieren, kommentieren und Geschenke senden.',
                },
              }],
            }),
          }}
        />
        
        {/* BreadcrumbList Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [{
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://anpip.com',
              }],
            }),
          }}
        />
        
        {/* ==================== SECURITY HEADERS (CSP) ==================== */}
        <meta httpEquiv="Content-Security-Policy" content="
          default-src 'self' https:;
          script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://www.google-analytics.com https://www.googletagmanager.com;
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
          img-src 'self' data: https: blob:;
          font-src 'self' data: https://fonts.gstatic.com;
          connect-src 'self' https://api.anpip.com wss://api.anpip.com https://fkmhucsjybyhjrgodwcx.supabase.co https://vlibyocpdguxpretjvnz.supabase.co wss://fkmhucsjybyhjrgodwcx.supabase.co wss://vlibyocpdguxpretjvnz.supabase.co https://accounts.google.com https://ipapi.co https://www.google-analytics.com;
          media-src 'self' blob: https://api.anpip.com https://fkmhucsjybyhjrgodwcx.supabase.co https://vlibyocpdguxpretjvnz.supabase.co https://cloudflarestream.com;
          frame-src 'self' https://accounts.google.com;
          worker-src 'self' blob:;
        " />
        
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        <meta httpEquiv="Permissions-Policy" content="camera=(self), microphone=(self), geolocation=(self)" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* ==================== CRITICAL CSS - CORE WEB VITALS 2025 ==================== */}
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* ==================== RESPONSIVE OPTIMIZATIONS ==================== */}
        <style dangerouslySetInnerHTML={{ __html: responsiveStyles }} />
        
      </head>
      <body>
        {/* ==================== ACCESSIBILITY - WCAG 2.2 ==================== */}
        {/* Skip to Content Link für Screenreader */}
        <a href="#main-content" className="skip-to-content" aria-label="Zum Hauptinhalt springen">
          Zum Hauptinhalt springen
        </a>
        
        {/* Live Region für Announcements */}
        <div id="a11y-announcer" role="status" aria-live="polite" aria-atomic="true" style={{ position: 'absolute', left: '-10000px', width: '1px', height: '1px', overflow: 'hidden' }}></div>
        
        {/* Main Content */}
        <div id="main-content" role="main">
          {children}
        </div>
        
        {/* ==================== PERFORMANCE SCRIPTS ==================== */}
        {/* PWA Install Script */}
        <script src="/pwa-install.js" defer></script>
        
        {/* Service Worker Registration */}
        <script dangerouslySetInnerHTML={{ __html: serviceWorkerScript }} />
        
        {/* Web Vitals Tracking (nur im Production) */}
        {process.env.NODE_ENV === 'production' && (
          <script dangerouslySetInnerHTML={{ __html: webVitalsScript }} />
        )}
      </body>
    </html>
  );
}

// ==================== CRITICAL CSS - ABOVE THE FOLD ====================
const criticalCSS = `
/* Reset & Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

body, html {
  background-color: #000;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: #fff;
}

/* Accessibility - Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0ea5e9;
  color: white;
  padding: 12px 16px;
  text-decoration: none;
  z-index: 10000;
  font-weight: 600;
  border-radius: 0 0 4px 0;
  transition: top 0.3s ease;
}

.skip-to-content:focus {
  top: 0;
  outline: 2px solid #fff;
  outline-offset: 2px;
}

/* Focus Indicators - WCAG 2.2 */
*:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  outline: 2px solid #0ea5e9;
  outline-offset: 2px;
}

/* Performance: Prevent layout shift */
img, video {
  max-width: 100%;
  height: auto;
  display: block;
}

img {
  content-visibility: auto;
}

/* Main Content Container */
#main-content {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
}

/* Loading optimization */
[data-loading="true"] {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

[data-loading="false"] {
  opacity: 1;
}

/* Video container aspect ratio preservation - Core Web Vitals */
.video-container {
  aspect-ratio: 9 / 16;
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #000;
  contain: layout style paint;
}

/* Lazy Loading Placeholder */
.lazy-loading {
  background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Smooth scrolling for touch devices */
@media (hover: none) and (pointer: coarse) {
  * {
    -webkit-overflow-scrolling: touch;
  }
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  body {
    background: #000;
    color: #fff;
  }
  
  button, a {
    border: 2px solid currentColor;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
    color: #fff;
  }
}

/* Reduce motion for accessibility - WCAG 2.2 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  
  .lazy-loading {
    animation: none;
  }
}

/* Print Styles */
@media print {
  body {
    background: white;
    color: black;
  }
  
  .skip-to-content,
  nav,
  footer {
    display: none;
  }
}
`;

// ==================== RESPONSIVE STYLES ====================
const responsiveStyles = `
/* Container Query Support */
@container (min-width: 768px) {
  .video-container {
    max-width: 500px;
    margin: 0 auto;
  }
}

/* Responsive Breakpoints */
@media (min-width: 768px) {
  /* Tablet */
  .video-container {
    max-width: 500px;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .video-container {
    max-width: 600px;
  }
}

@media (min-width: 1440px) {
  /* Large Desktop */
  #main-content {
    max-width: 1920px;
    margin: 0 auto;
  }
}

/* Mobile Optimization */
@media (max-width: 767px) {
  body {
    overscroll-behavior-y: contain;
  }
}

/* Landscape Mobile */
@media (max-height: 600px) and (orientation: landscape) {
  .video-container {
    height: 100vh;
  }
}

/* Safe Area Insets (iPhone notch, etc.) */
@supports (padding: max(0px)) {
  body {
    padding-top: max(0px, env(safe-area-inset-top));
    padding-bottom: max(0px, env(safe-area-inset-bottom));
    padding-left: max(0px, env(safe-area-inset-left));
    padding-right: max(0px, env(safe-area-inset-right));
  }
}
`;

// ==================== SERVICE WORKER SCRIPT ====================
const serviceWorkerScript = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('[SW] Registered:', registration);
        
        // Update Service Worker
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW] Update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Neue Version verfügbar
              console.log('[SW] New version available');
              
              // Optional: Nutzer benachrichtigen
              if (confirm('Neue Version verfügbar. Jetzt aktualisieren?')) {
                window.location.reload();
              }
            }
          });
        });
      })
      .catch(err => {
        console.error('[SW] Registration failed:', err);
      });
  });
}
`;

// ==================== WEB VITALS TRACKING ====================
const webVitalsEndpoint = process.env.WEB_VITALS_ENDPOINT || '';

const webVitalsScript = `
const endpoint = ${JSON.stringify(webVitalsEndpoint)};
// Core Web Vitals Tracking
(function() {
  function sendToAnalytics(metric) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType
    });
    
    // Send to your analytics endpoint
    if (!endpoint) {
      console.debug('[Web Vitals] analytics endpoint disabled');
      return;
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, body);
    } else {
      fetch(endpoint, {
        method: 'POST',
        body: body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      }).catch(console.error);
    }
    
    // Also log to console in development
    console.log('[Web Vitals]', metric.name, metric.value, metric.rating);
  }
  
  // Polyfill für PerformanceObserver
  if ('PerformanceObserver' in window) {
    // LCP - Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        sendToAnalytics({
          name: 'LCP',
          value: lastEntry.renderTime || lastEntry.loadTime,
          rating: lastEntry.renderTime < 2500 ? 'good' : lastEntry.renderTime < 4000 ? 'needs-improvement' : 'poor',
          delta: lastEntry.renderTime || lastEntry.loadTime,
          id: 'lcp-' + Date.now(),
          navigationType: performance.navigation?.type || 0
        });
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      console.error('[Web Vitals] LCP error:', e);
    }
    
    // FID - First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          sendToAnalytics({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime < 100 ? 'good' : entry.processingStart - entry.startTime < 300 ? 'needs-improvement' : 'poor',
            delta: entry.processingStart - entry.startTime,
            id: 'fid-' + Date.now(),
            navigationType: performance.navigation?.type || 0
          });
        });
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      console.error('[Web Vitals] FID error:', e);
    }
    
    // CLS - Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      
      // Send CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          sendToAnalytics({
            name: 'CLS',
            value: clsValue,
            rating: clsValue < 0.1 ? 'good' : clsValue < 0.25 ? 'needs-improvement' : 'poor',
            delta: clsValue,
            id: 'cls-' + Date.now(),
            navigationType: performance.navigation?.type || 0
          });
        }
      });
    } catch (e) {
      console.error('[Web Vitals] CLS error:', e);
    }
  }
})();
`;
