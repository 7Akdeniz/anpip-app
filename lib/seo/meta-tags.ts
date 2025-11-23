/**
 * DYNAMIC META TAGS GENERATOR
 * Generiert dynamische Meta Tags für Videos, Profile, Market
 * Optimiert für Social Sharing (OG, Twitter Cards)
 */

import type { VideoMetadata } from './video-schema';

export interface MetaTags {
  title: string;
  description: string;
  keywords?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogVideo?: string;
  ogType: 'website' | 'video.other' | 'article' | 'profile';
  twitterCard: 'summary' | 'summary_large_image' | 'player';
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterPlayer?: string;
  canonical: string;
}

/**
 * Generiert Meta Tags für einzelnes Video
 */
export function generateVideoMetaTags(video: VideoMetadata): MetaTags {
  const baseUrl = 'https://anpip.com';
  const videoUrl = `${baseUrl}/video/${video.id}`;
  
  // Titel optimieren (max 60 Zeichen)
  const title = `${video.title.substring(0, 50)} - @${video.username || 'Anpip'} | Anpip`;
  
  // Beschreibung optimieren (max 160 Zeichen)
  const description = video.description.length > 150 
    ? `${video.description.substring(0, 147)}...` 
    : video.description;
  
  // Keywords aus Hashtags + Kategorie
  const keywords = [
    ...(video.hashtags || []),
    video.category,
    'anpip',
    'video',
    '9:16 video',
    video.location?.city,
    video.is_market ? 'marketplace' : undefined
  ].filter(Boolean).join(', ');

  return {
    title,
    description,
    keywords,
    ogTitle: video.title,
    ogDescription: description,
    ogImage: video.thumbnail_url || `${baseUrl}/assets/og-default.png`,
    ogVideo: video.video_url,
    ogType: 'video.other',
    twitterCard: 'player',
    twitterTitle: video.title,
    twitterDescription: description,
    twitterImage: video.thumbnail_url || `${baseUrl}/assets/twitter-default.png`,
    twitterPlayer: `${baseUrl}/embed/${video.id}`,
    canonical: videoUrl
  };
}

/**
 * Generiert Meta Tags für Creator Profile
 */
export function generateProfileMetaTags(profile: {
  user_id: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  followers_count?: number;
  videos_count?: number;
}): MetaTags {
  const baseUrl = 'https://anpip.com';
  const profileUrl = `${baseUrl}/profile/${profile.user_id}`;
  
  const title = `@${profile.username} - ${profile.followers_count?.toLocaleString() || 0} Follower | Anpip Creator`;
  const description = profile.bio 
    ? `${profile.bio.substring(0, 147)}... • ${profile.videos_count || 0} Videos • ${profile.followers_count || 0} Follower`
    : `Folge @${profile.username} auf Anpip. ${profile.videos_count || 0} Videos • ${profile.followers_count || 0} Follower`;

  return {
    title,
    description,
    keywords: `${profile.username}, anpip creator, video creator, ${profile.bio || ''}`,
    ogTitle: `@${profile.username}`,
    ogDescription: description,
    ogImage: profile.avatar_url || `${baseUrl}/assets/avatar-default.png`,
    ogType: 'profile',
    twitterCard: 'summary_large_image',
    twitterTitle: `@${profile.username}`,
    twitterDescription: description,
    twitterImage: profile.avatar_url || `${baseUrl}/assets/avatar-default.png`,
    canonical: profileUrl
  };
}

/**
 * Generiert Meta Tags für Market Kategorien
 */
export function generateMarketCategoryMetaTags(category: {
  id: string;
  name: string;
  description: string;
  video_count?: number;
  location?: string;
}): MetaTags {
  const baseUrl = 'https://anpip.com';
  const categoryUrl = `${baseUrl}/market/${category.id}`;
  
  const locationSuffix = category.location ? ` in ${category.location}` : '';
  const title = `${category.name}${locationSuffix} - ${category.video_count || 0} Angebote | Anpip Market`;
  const description = `${category.description} Entdecke ${category.video_count || 0} Video-Angebote${locationSuffix}. Lokale Deals, Produkte & Services auf Anpip Market.`;

  return {
    title,
    description,
    keywords: `${category.name}, anpip market, video marketplace, local deals, ${category.location || 'deutschland'}`,
    ogTitle: `${category.name} - Anpip Market`,
    ogDescription: description,
    ogImage: `${baseUrl}/assets/market/${category.id}.png`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: `${category.name} - Anpip Market`,
    twitterDescription: description,
    twitterImage: `${baseUrl}/assets/market/${category.id}.png`,
    canonical: categoryUrl
  };
}

/**
 * Generiert Meta Tags für Feed (Geo-optimiert)
 */
export function generateFeedMetaTags(location?: {
  city?: string;
  country?: string;
}): MetaTags {
  const baseUrl = 'https://anpip.com';
  
  const locationSuffix = location?.city 
    ? ` aus ${location.city}` 
    : location?.country 
    ? ` aus ${location.country}` 
    : '';
  
  const title = `Entdecke Videos${locationSuffix} - Anpip Feed`;
  const description = `Virale Videos, lokale Momente und Creator${locationSuffix}. Die modernste 9:16 Video Plattform. Live-Streaming, Duette, Marketplace.`;

  return {
    title,
    description,
    keywords: `video feed, viral videos, ${location?.city || 'deutschland'}, anpip, social media`,
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/assets/og-feed.png`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${baseUrl}/assets/twitter-feed.png`,
    canonical: `${baseUrl}/feed`
  };
}

/**
 * Generiert Meta Tags für Hashtag-Seiten
 */
export function generateHashtagMetaTags(hashtag: string, videoCount?: number): MetaTags {
  const baseUrl = 'https://anpip.com';
  const hashtagUrl = `${baseUrl}/hashtag/${encodeURIComponent(hashtag)}`;
  
  const title = `#${hashtag} - ${videoCount?.toLocaleString() || 0} Videos | Anpip`;
  const description = `Entdecke ${videoCount?.toLocaleString() || 0} Videos mit #${hashtag} auf Anpip. Trending Videos, Creator und Momente.`;

  return {
    title,
    description,
    keywords: `${hashtag}, trending hashtag, viral videos, anpip`,
    ogTitle: `#${hashtag}`,
    ogDescription: description,
    ogImage: `${baseUrl}/assets/hashtag-default.png`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: `#${hashtag}`,
    twitterDescription: description,
    twitterImage: `${baseUrl}/assets/hashtag-default.png`,
    canonical: hashtagUrl
  };
}

/**
 * Generiert Meta Tags für Explore/Search
 */
export function generateExploreMetaTags(query?: string): MetaTags {
  const baseUrl = 'https://anpip.com';
  
  const title = query 
    ? `"${query}" - Suchergebnisse | Anpip` 
    : 'Entdecke Videos, Creator & Trends | Anpip Explore';
  
  const description = query
    ? `Suchergebnisse für "${query}". Videos, Creator, Hashtags und Trends auf Anpip.`
    : 'Entdecke trending Videos, beliebte Creator und neue Hashtags. Explore die besten Inhalte auf Anpip.';

  return {
    title,
    description,
    keywords: query ? `${query}, anpip search` : 'explore, trending, discover, anpip',
    ogTitle: title,
    ogDescription: description,
    ogImage: `${baseUrl}/assets/og-explore.png`,
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: `${baseUrl}/assets/twitter-explore.png`,
    canonical: query ? `${baseUrl}/search?q=${encodeURIComponent(query)}` : `${baseUrl}/explore`
  };
}

/**
 * Konvertiert MetaTags zu HTML Head Elements
 */
export function metaTagsToHtml(tags: MetaTags): string {
  return `
    <title>${tags.title}</title>
    <meta name="description" content="${tags.description}" />
    ${tags.keywords ? `<meta name="keywords" content="${tags.keywords}" />` : ''}
    
    <!-- Open Graph -->
    <meta property="og:title" content="${tags.ogTitle}" />
    <meta property="og:description" content="${tags.ogDescription}" />
    <meta property="og:image" content="${tags.ogImage}" />
    <meta property="og:type" content="${tags.ogType}" />
    <meta property="og:url" content="${tags.canonical}" />
    ${tags.ogVideo ? `<meta property="og:video" content="${tags.ogVideo}" />` : ''}
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="${tags.twitterCard}" />
    <meta name="twitter:title" content="${tags.twitterTitle}" />
    <meta name="twitter:description" content="${tags.twitterDescription}" />
    <meta name="twitter:image" content="${tags.twitterImage}" />
    ${tags.twitterPlayer ? `<meta name="twitter:player" content="${tags.twitterPlayer}" />` : ''}
    ${tags.twitterPlayer ? `<meta name="twitter:player:width" content="1080" />` : ''}
    ${tags.twitterPlayer ? `<meta name="twitter:player:height" content="1920" />` : ''}
    
    <!-- Canonical -->
    <link rel="canonical" href="${tags.canonical}" />
  `.trim();
}
