/**
 * SEO HEAD COMPONENT 2025
 * Vollständige Meta-Tags, Schemas und Social Sharing
 */

import Head from 'expo-router/head';
import { Platform } from 'react-native';
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateWebPageSchema,
  generateVideoSchema,
  generateBreadcrumbSchema,
  type VideoObject,
  type BreadcrumbList,
} from '@/lib/ai-seo-2025';

export interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
  
  // Open Graph
  ogType?: 'website' | 'video.other' | 'article' | 'product';
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogVideo?: string;
  ogLocale?: string;
  
  // Twitter
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  
  // GEO
  geoPosition?: { lat: number; lng: number };
  geoPlacename?: string;
  geoRegion?: string;
  
  // Structured Data
  video?: VideoObject;
  breadcrumbs?: BreadcrumbList;
  
  // Additional
  noindex?: boolean;
  nofollow?: boolean;
  lang?: string;
}

/**
 * SEO Head Component
 */
export function SEOHead(props: SEOHeadProps) {
  if (Platform.OS !== 'web') {
    return null; // Head nur für Web
  }

  const {
    title,
    description,
    canonical,
    keywords = [],
    ogType = 'website',
    ogTitle,
    ogDescription,
    ogImage,
    ogVideo,
    ogLocale = 'de_DE',
    twitterCard = 'summary_large_image',
    twitterTitle,
    twitterDescription,
    twitterImage,
    geoPosition,
    geoPlacename,
    geoRegion,
    video,
    breadcrumbs,
    noindex = false,
    nofollow = false,
    lang = 'de',
  } = props;

  const baseUrl = typeof window !== 'undefined' 
    ? `${window.location.protocol}//${window.location.host}`
    : 'https://anpip.com';

  const fullCanonical = canonical || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  // Organization Schema (einmalig)
  const organizationSchema = generateOrganizationSchema({
    name: 'Anpip',
    url: baseUrl,
    logo: `${baseUrl}/assets/images/icon.png`,
    sameAs: [
      'https://facebook.com/anpip',
      'https://instagram.com/anpip',
      'https://twitter.com/anpip',
    ],
  });

  // Website Schema (einmalig)
  const websiteSchema = generateWebSiteSchema({
    url: baseUrl,
    name: 'Anpip - Share Your Moments',
    description: 'Dein lokaler Marktplatz für Videos, Produkte und Dienstleistungen',
  });

  // WebPage Schema
  const webPageSchema = generateWebPageSchema({
    url: fullCanonical,
    name: title,
    description,
    inLanguage: lang,
    isPartOf: baseUrl,
  });

  // Video Schema (wenn vorhanden)
  const videoSchema = video ? generateVideoSchema(video) : null;

  // Breadcrumb Schema
  const breadcrumbSchema = breadcrumbs ? generateBreadcrumbSchema(breadcrumbs) : null;

  return (
    <Head>
      {/* Basic Meta */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      <meta name="language" content={lang} />
      
      {/* Robots */}
      <meta 
        name="robots" 
        content={`${noindex ? 'noindex' : 'index'}, ${nofollow ? 'nofollow' : 'follow'}, max-image-preview:large, max-snippet:-1, max-video-preview:-1`} 
      />
      <meta name="googlebot" content="index, follow" />
      
      {/* Canonical */}
      <link rel="canonical" href={fullCanonical} />
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content="Anpip" />
      <meta property="og:locale" content={ogLocale} />
      
      {ogImage && (
        <>
          <meta property="og:image" content={ogImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content={title} />
        </>
      )}
      
      {ogVideo && (
        <>
          <meta property="og:video" content={ogVideo} />
          <meta property="og:video:type" content="video/mp4" />
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle || title} />
      <meta name="twitter:description" content={twitterDescription || description} />
      {(twitterImage || ogImage) && (
        <meta name="twitter:image" content={twitterImage || ogImage} />
      )}
      <meta name="twitter:site" content="@anpip" />
      <meta name="twitter:creator" content="@anpip" />
      
      {/* GEO Meta */}
      {geoPosition && (
        <>
          <meta name="geo.position" content={`${geoPosition.lat};${geoPosition.lng}`} />
          <meta name="ICBM" content={`${geoPosition.lat}, ${geoPosition.lng}`} />
        </>
      )}
      {geoPlacename && <meta name="geo.placename" content={geoPlacename} />}
      {geoRegion && <meta name="geo.region" content={geoRegion} />}
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Anpip" />
      
      {/* Theme */}
      <meta name="theme-color" content="#9C27B0" />
      <meta name="msapplication-TileColor" content="#9C27B0" />
      
      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: webPageSchema }} />
      {videoSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: videoSchema }} />
      )}
      {breadcrumbSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      )}
      
      {/* PWA */}
      <link rel="manifest" href="/manifest.webmanifest" />
      
      {/* Icons */}
      <link rel="icon" type="image/png" sizes="32x32" href="/assets/images/favicon.png" />
      <link rel="icon" type="image/png" sizes="192x192" href="/assets/images/icon-192x192.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/assets/images/icon-192x192.png" />
      
      {/* Preconnect für Performance */}
      <link rel="preconnect" href="https://fkmhucsjybyhjrgodwcx.supabase.co" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://fkmhucsjybyhjrgodwcx.supabase.co" />
    </Head>
  );
}

export default SEOHead;
