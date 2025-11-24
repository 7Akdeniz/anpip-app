/**
 * PROFILE SEO OPTIMIZER
 * Person-Schema, ProfilePage-Schema, Social-Links-Markup
 */

import { supabase } from './supabase';

// ==================== PROFILE DATA ====================
export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  stats?: {
    followers: number;
    following: number;
    videos: number;
    likes: number;
  };
  verified?: boolean;
  createdAt: string;
}

// ==================== PERSON SCHEMA ====================
export function generatePersonSchema(profile: UserProfile) {
  const sameAs: string[] = [];
  
  // Social Links sammeln
  if (profile.socialLinks) {
    if (profile.socialLinks.instagram) sameAs.push(profile.socialLinks.instagram);
    if (profile.socialLinks.twitter) sameAs.push(profile.socialLinks.twitter);
    if (profile.socialLinks.youtube) sameAs.push(profile.socialLinks.youtube);
    if (profile.socialLinks.tiktok) sameAs.push(profile.socialLinks.tiktok);
  }
  if (profile.website) sameAs.push(profile.website);
  
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": profile.fullName || profile.username,
    "alternateName": profile.username,
    "description": profile.bio || `Video Creator auf Anpip - ${profile.stats?.videos || 0} Videos`,
    "url": `https://anpip.com/profile/${profile.username}`,
    "image": profile.avatarUrl || `https://anpip.com/api/avatar/${profile.id}`,
    "sameAs": sameAs.length > 0 ? sameAs : undefined,
    "mainEntityOfPage": {
      "@type": "ProfilePage",
      "@id": `https://anpip.com/profile/${profile.username}`
    },
    "address": profile.location ? {
      "@type": "PostalAddress",
      "addressLocality": profile.location
    } : undefined,
    "interactionStatistic": [
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/FollowAction",
        "userInteractionCount": profile.stats?.followers || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/CreateAction",
        "userInteractionCount": profile.stats?.videos || 0
      },
      {
        "@type": "InteractionCounter",
        "interactionType": "https://schema.org/LikeAction",
        "userInteractionCount": profile.stats?.likes || 0
      }
    ],
    "knowsAbout": ["Video Creation", "Content Creation", "Social Media"],
    "memberOf": {
      "@type": "Organization",
      "name": "Anpip Community"
    }
  };
}

// ==================== PROFILE PAGE SCHEMA ====================
export function generateProfilePageSchema(profile: UserProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": generatePersonSchema(profile),
    "url": `https://anpip.com/profile/${profile.username}`,
    "name": `${profile.fullName || profile.username} auf Anpip`,
    "description": profile.bio || `Video Creator auf Anpip mit ${profile.stats?.videos || 0} Videos und ${profile.stats?.followers || 0} Followern.`,
    "dateCreated": profile.createdAt,
    "dateModified": new Date().toISOString(),
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://anpip.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Profile",
          "item": `https://anpip.com/profile/${profile.username}`
        }
      ]
    },
    "author": generatePersonSchema(profile)
  };
}

// ==================== VIDEO COLLECTION SCHEMA ====================
export function generateVideoCollectionSchema(profile: UserProfile, videos: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Videos von ${profile.fullName || profile.username}`,
    "description": `Alle ${videos.length} Videos von ${profile.username} auf Anpip`,
    "numberOfItems": videos.length,
    "itemListElement": videos.slice(0, 10).map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `https://anpip.com/video/${video.id}`,
      "name": video.title || `Video ${index + 1}`,
      "item": {
        "@type": "VideoObject",
        "name": video.title || `Video ${index + 1}`,
        "thumbnailUrl": `https://anpip.com/api/thumbnail/${video.id}.jpg`,
        "uploadDate": video.created_at
      }
    }))
  };
}

// ==================== SOCIAL PROFILE LINKS ====================
export function generateSocialProfileLinks(profile: UserProfile) {
  const links: Array<{ platform: string; url: string; icon: string }> = [];
  
  if (profile.socialLinks) {
    if (profile.socialLinks.instagram) {
      links.push({
        platform: 'Instagram',
        url: profile.socialLinks.instagram,
        icon: '📷'
      });
    }
    if (profile.socialLinks.twitter) {
      links.push({
        platform: 'Twitter',
        url: profile.socialLinks.twitter,
        icon: '🐦'
      });
    }
    if (profile.socialLinks.youtube) {
      links.push({
        platform: 'YouTube',
        url: profile.socialLinks.youtube,
        icon: '📺'
      });
    }
    if (profile.socialLinks.tiktok) {
      links.push({
        platform: 'TikTok',
        url: profile.socialLinks.tiktok,
        icon: '🎵'
      });
    }
  }
  
  if (profile.website) {
    links.push({
      platform: 'Website',
      url: profile.website,
      icon: '🌐'
    });
  }
  
  return links;
}

// ==================== PROFILE META-DATEN ====================
export function generateProfileMetadata(profile: UserProfile) {
  const stats = profile.stats || { followers: 0, videos: 0, likes: 0 };
  
  return {
    title: `${profile.fullName || profile.username} (@${profile.username}) | Anpip`,
    description: profile.bio 
      ? `${profile.bio} - ${stats.videos} Videos, ${stats.followers} Follower auf Anpip.`
      : `${profile.fullName || profile.username} auf Anpip - ${stats.videos} Videos, ${stats.followers} Follower. Jetzt folgen!`,
    keywords: [
      profile.username.toLowerCase(),
      profile.fullName?.toLowerCase(),
      'anpip creator',
      'video creator',
      profile.location?.toLowerCase(),
    ].filter(Boolean),
    ogType: 'profile' as const,
    ogImage: profile.coverUrl || profile.avatarUrl || `https://anpip.com/api/avatar/${profile.id}`,
    ogProfile: {
      username: profile.username,
      firstName: profile.fullName?.split(' ')[0],
      lastName: profile.fullName?.split(' ').slice(1).join(' '),
    }
  };
}

// ==================== CREATOR BADGE SCHEMA ====================
export function generateCreatorBadgeSchema(profile: UserProfile) {
  if (!profile.verified) return null;
  
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "Verified Creator Badge",
    "description": "Official Anpip Verified Creator",
    "creator": {
      "@type": "Person",
      "name": profile.fullName || profile.username
    },
    "publisher": {
      "@type": "Organization",
      "name": "Anpip"
    }
  };
}

// ==================== PROFILE KEYWORDS ====================
export function generateProfileKeywords(profile: UserProfile): string[] {
  const keywords: string[] = [
    profile.username.toLowerCase(),
    `@${profile.username}`,
    'anpip creator',
    'video creator',
  ];
  
  if (profile.fullName) {
    keywords.push(profile.fullName.toLowerCase());
  }
  
  if (profile.location) {
    keywords.push(profile.location.toLowerCase());
    keywords.push(`creator ${profile.location.toLowerCase()}`);
  }
  
  if (profile.verified) {
    keywords.push('verified creator');
    keywords.push('anpip verified');
  }
  
  // Content-basierte Keywords
  if (profile.stats && profile.stats.videos > 100) {
    keywords.push('popular creator');
  }
  
  if (profile.stats && profile.stats.followers > 10000) {
    keywords.push('influencer');
    keywords.push('top creator');
  }
  
  return keywords;
}

// ==================== FETCH PROFILE WITH SEO ====================
export async function getProfileWithSEO(username: string) {
  try {
    // Profile abrufen
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(`
        *,
        videos (count),
        followers:followers!followers_following_id_fkey (count),
        following:followers!followers_follower_id_fkey (count)
      `)
      .eq('username', username)
      .single();
    
    if (error || !profile) {
      return null;
    }
    
    // Videos zählen
    const videoCount = profile.videos?.[0]?.count || 0;
    const followerCount = profile.followers?.[0]?.count || 0;
    const followingCount = profile.following?.[0]?.count || 0;
    
    // Total Likes berechnen
    const { count: likesCount } = await supabase
      .from('video_likes')
      .select('*', { count: 'exact', head: true })
      .in('video_id', await supabase
        .from('videos')
        .select('id')
        .eq('user_id', profile.id)
        .then(res => res.data?.map(v => v.id) || [])
      );
    
    const profileData: UserProfile = {
      id: profile.id,
      username: profile.username,
      fullName: profile.full_name,
      bio: profile.bio,
      avatarUrl: profile.avatar_url,
      coverUrl: profile.cover_url,
      location: profile.location,
      website: profile.website,
      socialLinks: {
        instagram: profile.instagram_url,
        twitter: profile.twitter_url,
        youtube: profile.youtube_url,
        tiktok: profile.tiktok_url,
      },
      stats: {
        followers: followerCount,
        following: followingCount,
        videos: videoCount,
        likes: likesCount || 0,
      },
      verified: profile.verified,
      createdAt: profile.created_at,
    };
    
    return {
      profile: profileData,
      personSchema: generatePersonSchema(profileData),
      profilePageSchema: generateProfilePageSchema(profileData),
      metadata: generateProfileMetadata(profileData),
      keywords: generateProfileKeywords(profileData),
      socialLinks: generateSocialProfileLinks(profileData),
      creatorBadge: generateCreatorBadgeSchema(profileData),
    };
    
  } catch (error) {
    console.error('Error fetching profile SEO:', error);
    return null;
  }
}

// ==================== BULK UPDATE PROFILE SEO ====================
export async function bulkUpdateProfileSEO() {
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('username')
      .not('username', 'is', null)
      .limit(100);
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles to update');
      return;
    }
    
    console.log(`Updating SEO for ${profiles.length} profiles...`);
    
    for (const profile of profiles) {
      const seoData = await getProfileWithSEO(profile.username);
      if (seoData) {
        // Update in DB (wenn seo_data Spalte existiert)
        await supabase
          .from('profiles')
          .update({
            seo_keywords: seoData.keywords,
            seo_schema: seoData.personSchema,
          })
          .eq('username', profile.username);
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('✅ Bulk profile SEO update completed');
    
  } catch (error) {
    console.error('Error in bulkUpdateProfileSEO:', error);
  }
}

export default {
  generatePersonSchema,
  generateProfilePageSchema,
  generateVideoCollectionSchema,
  generateSocialProfileLinks,
  generateProfileMetadata,
  generateCreatorBadgeSchema,
  generateProfileKeywords,
  getProfileWithSEO,
  bulkUpdateProfileSEO,
};
