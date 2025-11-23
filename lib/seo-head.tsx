/**
 * SEO HEAD COMPONENT
 * React Component für dynamisches SEO in Expo Router
 * Note: Für Expo Router sollten Meta Tags in +html.tsx definiert werden
 */

import React from 'react';
import type { MetaTags } from './seo/meta-tags';

interface SEOHeadProps {
  metaTags: MetaTags;
  schemas?: any[];
  hreflangTags?: string[];
}

/**
 * Generiert HTML-String für Meta Tags
 * Dieser kann dann in +html.tsx verwendet werden
 */
export function generateSEOHtml({ metaTags, schemas = [], hreflangTags = [] }: SEOHeadProps): string {
  const metaHtml = `
    <title>${metaTags.title}</title>
    <meta name="description" content="${metaTags.description}" />
    ${metaTags.keywords ? `<meta name="keywords" content="${metaTags.keywords}" />` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${metaTags.ogTitle}" />
    <meta property="og:description" content="${metaTags.ogDescription}" />
    <meta property="og:image" content="${metaTags.ogImage}" />
    <meta property="og:type" content="${metaTags.ogType}" />
    <meta property="og:url" content="${metaTags.canonical}" />
    ${metaTags.ogVideo ? `<meta property="og:video" content="${metaTags.ogVideo}" />` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${metaTags.twitterCard}" />
    <meta name="twitter:title" content="${metaTags.twitterTitle}" />
    <meta name="twitter:description" content="${metaTags.twitterDescription}" />
    <meta name="twitter:image" content="${metaTags.twitterImage}" />
    ${metaTags.twitterPlayer ? `<meta name="twitter:player" content="${metaTags.twitterPlayer}" />` : ''}
    ${metaTags.twitterPlayer ? `<meta name="twitter:player:width" content="1080" />` : ''}
    ${metaTags.twitterPlayer ? `<meta name="twitter:player:height" content="1920" />` : ''}
    
    <!-- Canonical -->
    <link rel="canonical" href="${metaTags.canonical}" />
  `.trim();

  const schemaHtml = schemas
    .map(schema => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
    .join('\n');

  const hreflangHtml = hreflangTags.join('\n');

  return `${metaHtml}\n\n${schemaHtml}\n\n${hreflangHtml}`;
}

/**
 * Hook für SEO-Daten
 */
export function useSEO() {
  const [isLoading, setIsLoading] = React.useState(false);
  
  return {
    isLoading,
    setIsLoading
  };
}

/**
 * Beispiel-Usage:
 * 
 * import { SEOHead } from '@/lib/seo-head';
 * import { generateVideoMetaTags, generateVideoSchema } from '@/lib/seo';
 * 
 * export default function VideoPage({ video }) {
 *   const metaTags = generateVideoMetaTags(video);
 *   const schema = generateVideoSchema(video);
 *   
 *   return (
 *     <>
 *       <SEOHead metaTags={metaTags} schemas={[schema]} />
 *       <VideoPlayer video={video} />
 *     </>
 *   );
 * }
 */
