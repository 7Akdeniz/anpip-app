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
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=5" />
        
        {/* Primary Meta Tags - SEO Optimized */}
        <title>Anpip - Social Video Platform | Teile Momente & lokale Angebote weltweit</title>
        <meta name="title" content="Anpip - Social Video Platform | Teile Momente & lokale Angebote weltweit" />
        <meta name="description" content="Anpip ist die moderne Social Video Plattform zum Teilen von Momenten, Videos und lokalen Angeboten. Entdecke Inhalte aus deiner Stadt und weltweit. Jetzt kostenlos starten!" />
        <meta name="keywords" content="social media, video platform, short videos, lokale angebote, marketplace, video sharing, anpip, social network, 9:16 videos, tiktok alternative" />
        <meta name="author" content="Anpip" />
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="color-scheme" content="dark light" />
        
        {/* Robots & Crawling - AI-Optimized */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        <meta name="bingbot" content="index, follow, max-video-preview:-1, max-image-preview:large, max-snippet:-1" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://anpip.com/" />
        <meta property="og:title" content="Anpip - Social Video Platform" />
        <meta property="og:description" content="Teile Videos, Momente und lokale Angebote mit Freunden weltweit. Die moderne Social Media Plattform für 9:16 Videos." />
        <meta property="og:image" content="https://anpip.com/assets/icons/icon-512x512.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:locale" content="de_DE" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta property="og:site_name" content="Anpip" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://anpip.com/" />
        <meta name="twitter:title" content="Anpip - Social Video Platform" />
        <meta name="twitter:description" content="Teile Videos, Momente und lokale Angebote weltweit" />
        <meta name="twitter:image" content="https://anpip.com/assets/icons/icon-512x512.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://anpip.com/" />
        
        {/* Alternate Languages - Multilingual SEO */}
        <link rel="alternate" hrefLang="de" href="https://anpip.com/?lang=de" />
        <link rel="alternate" hrefLang="en" href="https://anpip.com/?lang=en" />
        <link rel="alternate" hrefLang="x-default" href="https://anpip.com/" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.webmanifest" />
        
        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/icon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/icon-180x180.png" />
        <link rel="mask-icon" href="/assets/icons/icon-512x512.png" color="#0ea5e9" />
        
        {/* Microsoft */}
        <meta name="msapplication-TileColor" content="#0ea5e9" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* DNS Prefetch & Preconnect - Performance */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Supabase CDN */}
        <link rel="dns-prefetch" href="https://fkmhucsjybyhjrgodwcx.supabase.co" />
        <link rel="preconnect" href="https://fkmhucsjybyhjrgodwcx.supabase.co" crossOrigin="anonymous" />
        
        {/* Schema.org JSON-LD - AI & Search Optimization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Anpip',
              description: 'Social Video Platform - Teile Momente, Videos und lokale Angebote weltweit',
              url: 'https://anpip.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://anpip.com/explore?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
              inLanguage: ['de', 'en'],
            }),
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Anpip',
              description: 'Global Social Video Platform',
              url: 'https://anpip.com',
              logo: 'https://anpip.com/assets/icons/icon-512x512.png',
              sameAs: [],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: ['German', 'English'],
              },
            }),
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'MobileApplication',
              name: 'Anpip',
              operatingSystem: 'iOS, Android, Web',
              applicationCategory: 'SocialNetworkingApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
            }),
          }}
        />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Performance & Core Web Vitals Optimization */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        <style dangerouslySetInnerHTML={{ __html: criticalCSS }} />
        
        {/* Preload critical resources */}
        <link rel="preload" as="image" href="/assets/icons/icon-512x512.png" />
        
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>
        {/* Accessibility Skip Link */}
        <a href="#main-content" className="skip-to-content">Zum Hauptinhalt springen</a>
        
        <div id="main-content">
          {children}
        </div>
        
        {/* PWA Install Script */}
        <script src="/pwa-install.js" defer></script>
      </body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;

const criticalCSS = `
/* Critical CSS for Core Web Vitals */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  -webkit-text-size-adjust: 100%;
}

/* Accessibility - Skip to Content Link */
.skip-to-content {
  position: absolute;
  top: -40px;
  left: 0;
  background: #0ea5e9;
  color: white;
  padding: 8px;
  text-decoration: none;
  z-index: 100;
  font-weight: 600;
}

.skip-to-content:focus {
  top: 0;
}

/* Performance: Prevent layout shift */
img, video {
  max-width: 100%;
  height: auto;
}

/* Prevent flash of unstyled content */
#main-content {
  min-height: 100vh;
}

/* Loading optimization */
[data-loading="true"] {
  opacity: 0;
  transition: opacity 0.3s ease-in-out;
}

[data-loading="false"] {
  opacity: 1;
}

/* Video container aspect ratio preservation */
.video-container {
  aspect-ratio: 9 / 16;
  width: 100%;
  position: relative;
  overflow: hidden;
}

/* Smooth scrolling for touch devices */
@media (hover: none) and (pointer: coarse) {
  * {
    -webkit-overflow-scrolling: touch;
  }
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;
