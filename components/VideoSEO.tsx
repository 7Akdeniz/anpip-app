/**
 * ============================================================================
 * VIDEO SEO & STRUCTURED DATA
 * ============================================================================
 * 
 * VideoObject Schema.org Markup für maximale SEO:
 * - Google Video Search
 * - YouTube-ähnliche Rich Snippets
 * - Social Media Previews (OG Tags)
 * - JSON-LD Structured Data
 */

import React from 'react';
import Head from 'expo-router/head';

// ============================================================================
// TYPES
// ============================================================================

export interface VideoSEOProps {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;          // ISO 8601 format
  duration: string;            // ISO 8601 duration (PT1M30S = 1:30)
  contentUrl: string;          // Video URL
  embedUrl?: string;           // Embed URL
  
  // Optional
  category?: string;
  tags?: string[];
  views?: number;
  likes?: number;
  author?: {
    name: string;
    url?: string;
  };
  width?: number;
  height?: number;
  
  // SEO
  canonicalUrl?: string;
  siteUrl?: string;
}

// ============================================================================
// VIDEO SEO COMPONENT
// ============================================================================

export default function VideoSEO({
  videoId,
  title,
  description,
  thumbnailUrl,
  uploadDate,
  duration,
  contentUrl,
  embedUrl,
  category,
  tags = [],
  views = 0,
  likes = 0,
  author,
  width = 1080,
  height = 1920,
  canonicalUrl,
  siteUrl = 'https://anpip.com',
}: VideoSEOProps) {
  
  // Generate URLs
  const videoUrl = canonicalUrl || `${siteUrl}/video/${videoId}`;
  const embed = embedUrl || `${siteUrl}/embed/${videoId}`;
  
  // ============================================================================
  // SCHEMA.ORG VideoObject
  // ============================================================================
  
  const videoSchema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "@id": videoUrl,
    "name": title,
    "description": description,
    "thumbnailUrl": [thumbnailUrl],
    "uploadDate": uploadDate,
    "duration": duration,
    "contentUrl": contentUrl,
    "embedUrl": embed,
    "width": width,
    "height": height,
    
    // Engagement
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/WatchAction",
        "userInteractionCount": views
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": likes
      }
    ],
    
    // Author
    ...(author && {
      "author": {
        "@type": "Person",
        "name": author.name,
        ...(author.url && { "url": author.url })
      }
    }),
    
    // Category & Tags
    ...(category && { "genre": category }),
    ...(tags.length > 0 && { "keywords": tags.join(', ') }),
    
    // Publisher
    "publisher": {
      "@type": "Organization",
      "name": "Anpip",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/logo-512.png`
      }
    },
    
    // Quality Signals
    "encodingFormat": "video/mp4",
    "playerType": "HTML5 Flash",
    "videoQuality": "HD",
    "requiresSubscription": false,
    "isAccessibleForFree": true,
    "isFamilyFriendly": true,
  };
  
  // ============================================================================
  // BreadcrumbList Schema
  // ============================================================================
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Videos",
        "item": `${siteUrl}/videos`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": videoUrl
      }
    ]
  };
  
  return (
    <Head>
      {/* Title & Description */}
      <title>{title} - Anpip</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={videoUrl} />
      
      {/* Open Graph (Facebook, LinkedIn) */}
      <meta property="og:type" content="video.other" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={videoUrl} />
      <meta property="og:image" content={thumbnailUrl} />
      <meta property="og:image:width" content={width.toString()} />
      <meta property="og:image:height" content={height.toString()} />
      <meta property="og:video" content={contentUrl} />
      <meta property="og:video:secure_url" content={contentUrl} />
      <meta property="og:video:type" content="video/mp4" />
      <meta property="og:video:width" content={width.toString()} />
      <meta property="og:video:height" content={height.toString()} />
      <meta property="og:site_name" content="Anpip" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="player" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={thumbnailUrl} />
      <meta name="twitter:player" content={embed} />
      <meta name="twitter:player:width" content={width.toString()} />
      <meta name="twitter:player:height" content={height.toString()} />
      
      {/* Video Specific Meta Tags */}
      <meta property="video:duration" content={duration} />
      <meta property="video:release_date" content={uploadDate} />
      {category && <meta property="video:tag" content={category} />}
      {tags.map(tag => (
        <meta key={tag} property="video:tag" content={tag} />
      ))}
      
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(videoSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      {/* Preload Video */}
      <link rel="preload" as="video" href={contentUrl} />
      <link rel="dns-prefetch" href="https://customer-*.cloudflarestream.com" />
      <link rel="preconnect" href="https://customer-*.cloudflarestream.com" />
    </Head>
  );
}

// ============================================================================
// HELPER: Generate ISO 8601 Duration
// ============================================================================

/**
 * Converts seconds to ISO 8601 duration format
 * Example: 90 seconds → "PT1M30S"
 */
export function secondsToISO8601Duration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  let duration = 'PT';
  if (hours > 0) duration += `${hours}H`;
  if (minutes > 0) duration += `${minutes}M`;
  if (secs > 0 || duration === 'PT') duration += `${secs}S`;
  
  return duration;
}

/**
 * Converts Date to ISO 8601 format
 */
export function dateToISO8601(date: Date): string {
  return date.toISOString();
}
