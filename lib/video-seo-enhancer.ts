/**
 * ANPIP VIDEO SEO ENHANCER
 * Optimiert Video-Metadaten für maximale Sichtbarkeit
 */

import { supabase } from './supabase';
import { generateVideoSchema } from './ai-seo-2025';

export interface VideoMetadata {
  id: string;
  title?: string;
  description?: string;
  location_name?: string;
  location_country?: string;
  location_lat?: number;
  location_lng?: number;
  duration?: number;
  created_at: string;
  creator_id: string;
  creator_name?: string;
  views?: number;
  likes?: number;
}

/**
 * Generiert SEO-optimierte Video-Titel
 */
export function generateVideoTitle(video: VideoMetadata): string {
  const parts: string[] = [];
  
  // Location
  if (video.location_name) {
    parts.push(`📍 ${video.location_name}`);
  }
  
  // Default title wenn kein custom title
  if (!video.title) {
    parts.push('Vertikales Video');
  } else {
    parts.push(video.title);
  }
  
  // Creator
  if (video.creator_name) {
    parts.push(`von ${video.creator_name}`);
  }
  
  // Platform
  parts.push('| Anpip');
  
  return parts.join(' ');
}

/**
 * Generiert SEO-optimierte Video-Beschreibung
 */
export function generateVideoDescription(video: VideoMetadata): string {
  const parts: string[] = [];
  
  // Custom description
  if (video.description) {
    parts.push(video.description);
    parts.push('');
  }
  
  // Location info
  if (video.location_name) {
    parts.push(`📍 Aufgenommen in ${video.location_name}${video.location_country ? `, ${video.location_country}` : ''}`);
  }
  
  // Creator info
  if (video.creator_name) {
    parts.push(`👤 Creator: ${video.creator_name}`);
  }
  
  // Stats
  if (video.views || video.likes) {
    const stats: string[] = [];
    if (video.views) stats.push(`${video.views.toLocaleString('de-DE')} Aufrufe`);
    if (video.likes) stats.push(`${video.likes.toLocaleString('de-DE')} Likes`);
    parts.push(`📊 ${stats.join(' • ')}`);
  }
  
  // Platform CTA
  parts.push('');
  parts.push('🎬 Entdecke mehr vertikale Videos auf Anpip - der weltweit führenden Plattform für 9:16 Content!');
  parts.push('');
  parts.push('🔗 anpip.com');
  parts.push('#vertikalevideo #anpip #shortvideos #9:16');
  
  return parts.join('\n');
}

/**
 * Generiert Video-Keywords für SEO
 */
export function generateVideoKeywords(video: VideoMetadata): string[] {
  const keywords: string[] = [
    'vertikales video',
    'vertical video',
    '9:16 video',
    'short video',
    'anpip',
  ];
  
  // Location keywords
  if (video.location_name) {
    keywords.push(video.location_name.toLowerCase());
    keywords.push(`video ${video.location_name.toLowerCase()}`);
    keywords.push(`${video.location_name.toLowerCase()} video`);
  }
  
  if (video.location_country) {
    keywords.push(video.location_country.toLowerCase());
    keywords.push(`video ${video.location_country.toLowerCase()}`);
  }
  
  // Creator keywords
  if (video.creator_name) {
    keywords.push(video.creator_name.toLowerCase());
  }
  
  return keywords;
}

/**
 * Generiert vollständiges Video-Schema für SEO
 */
export function generateCompleteVideoSchema(video: VideoMetadata) {
  const baseUrl = 'https://anpip.com';
  
  return generateVideoSchema({
    id: video.id,
    title: generateVideoTitle(video),
    description: generateVideoDescription(video),
    thumbnailUrl: `${baseUrl}/api/thumbnail/${video.id}.jpg`,
    contentUrl: `${baseUrl}/api/video/${video.id}.mp4`,
    embedUrl: `${baseUrl}/video/${video.id}`,
    uploadDate: video.created_at,
    duration: video.duration || 60,
    width: 1080,
    height: 1920,
    location: video.location_name ? {
      name: video.location_name,
      lat: video.location_lat,
      lng: video.location_lng,
      country: video.location_country,
    } : undefined,
    creator: video.creator_name ? {
      name: video.creator_name,
      url: `${baseUrl}/profile/${video.creator_id}`,
    } : undefined,
    views: video.views,
    likes: video.likes,
  });
}

/**
 * Aktualisiert Video-Metadaten in der Datenbank
 */
export async function updateVideoSEOMetadata(videoId: string) {
  try {
    // Video-Daten abrufen
    const { data: video, error } = await supabase
      .from('videos')
      .select(`
        id,
        title,
        description,
        location_name,
        location_country,
        location_lat,
        location_lng,
        duration,
        created_at,
        user_id,
        profiles!videos_user_id_fkey (
          username,
          full_name
        )
      `)
      .eq('id', videoId)
      .single();
    
    if (error || !video) {
      console.error('Video not found:', error);
      return null;
    }
    
    // SEO-Metadaten generieren
    const profile = Array.isArray(video.profiles) ? video.profiles[0] : video.profiles;
    const metadata: VideoMetadata = {
      id: video.id,
      title: video.title,
      description: video.description,
      location_name: video.location_name,
      location_country: video.location_country,
      location_lat: video.location_lat,
      location_lng: video.location_lng,
      duration: video.duration,
      created_at: video.created_at,
      creator_id: video.user_id,
      creator_name: profile?.username || profile?.full_name,
    };
    
    const seoTitle = generateVideoTitle(metadata);
    const seoDescription = generateVideoDescription(metadata);
    const keywords = generateVideoKeywords(metadata);
    const schema = generateCompleteVideoSchema(metadata);
    
    // SEO-Daten in DB speichern
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        seo_title: seoTitle,
        seo_description: seoDescription,
        seo_keywords: keywords,
        seo_schema: schema,
      })
      .eq('id', videoId);
    
    if (updateError) {
      console.error('Error updating SEO metadata:', updateError);
      return null;
    }
    
    return {
      seoTitle,
      seoDescription,
      keywords,
      schema,
    };
    
  } catch (error) {
    console.error('Error in updateVideoSEOMetadata:', error);
    return null;
  }
}

/**
 * Batch-Update für alle Videos ohne SEO-Metadaten
 */
export async function bulkUpdateVideoSEO() {
  try {
    const { data: videos } = await supabase
      .from('videos')
      .select('id')
      .is('seo_title', null)
      .limit(100);
    
    if (!videos || videos.length === 0) {
      console.log('No videos need SEO update');
      return;
    }
    
    console.log(`Updating SEO for ${videos.length} videos...`);
    
    for (const video of videos) {
      await updateVideoSEOMetadata(video.id);
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Bulk SEO update completed');
    
  } catch (error) {
    console.error('Error in bulkUpdateVideoSEO:', error);
  }
}

export default {
  generateVideoTitle,
  generateVideoDescription,
  generateVideoKeywords,
  generateCompleteVideoSchema,
  updateVideoSEOMetadata,
  bulkUpdateVideoSEO,
};
