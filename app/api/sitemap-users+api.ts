/**
 * USERS SITEMAP API
 * Öffentliche User-Profile
 */

import { generateUsersSitemap, generateXMLFromURLs, UserProfile } from '@/lib/sitemap-2025';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  // Nur öffentliche Profile mit mindestens 1 Video
  const { data: users, error } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      display_name,
      bio,
      avatar_url,
      updated_at,
      videos:videos(count),
      followers:followers(count)
    `)
    .eq('is_public', true)
    .gt('videos.count', 0)
    .order('followers.count', { ascending: false })
    .limit(10000); // Max 10k User-Profile

  if (error) {
    console.error('Error loading users:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }

  const userProfiles: UserProfile[] = (users || []).map(user => ({
    id: user.id,
    username: user.username,
    displayName: user.display_name || user.username,
    bio: user.bio,
    avatarUrl: user.avatar_url,
    videoCount: (user.videos as any)?.[0]?.count || 0,
    followerCount: (user.followers as any)?.[0]?.count || 0,
    updatedAt: user.updated_at,
  }));

  const urls = generateUsersSitemap(baseUrl, userProfiles);
  const xml = generateXMLFromURLs(urls);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=7200, s-maxage=14400',
    },
  });
}
