/**
 * VIDEO SERVICE
 * Zentrale API für alle Video-Interaktionen
 */

import { supabase } from './supabase';

export interface VideoInteraction {
  user_id: string;
  video_id: string;
  created_at?: string;
}

export interface Follow {
  follower_id: string;
  following_id: string;
  created_at?: string;
}

export interface ActivityLog {
  user_id: string;
  action_type: 'view' | 'like' | 'comment' | 'share' | 'gift';
  video_id?: string;
  target_user_id?: string;
  metadata?: any;
  created_at?: string;
}

/**
 * LIKE SYSTEM
 */
export async function likeVideo(userId: string, videoId: string): Promise<boolean> {
  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('video_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (existing) {
      // Unlike
      await supabase
        .from('video_likes')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', videoId);

      // Decrement counter
      await supabase.rpc('decrement_likes', { video_id: videoId });

      return false;
    } else {
      // Like
      await supabase
        .from('video_likes')
        .insert({ user_id: userId, video_id: videoId });

      // Increment counter
      await supabase.rpc('increment_likes', { video_id: videoId });

      // Log activity
      await logActivity(userId, 'like', videoId);

      return true;
    }
  } catch (error) {
    console.error('Like error:', error);
    throw error;
  }
}

export async function getUserLikes(userId: string): Promise<string[]> {
  try {
    // Skip if temp user ID (not a valid UUID)
    if (!userId || userId.startsWith('temp-')) {
      return [];
    }

    const { data, error } = await supabase
      .from('video_likes')
      .select('video_id')
      .eq('user_id', userId);

    if (error) {
      // Silently handle missing table errors
      if (error.code === 'PGRST205' || error.code === '22P02') {
        return [];
      }
      throw error;
    }
    return data?.map(item => item.video_id) || [];
  } catch (error) {
    const err = error as any;
    if (err?.code !== 'PGRST205' && err?.code !== '22P02') {
      console.error('Get likes error:', error);
    }
    return [];
  }
}

/**
 * FOLLOW SYSTEM
 */
export async function followUser(followerId: string, followingId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (existing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', followerId)
        .eq('following_id', followingId);

      return false;
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({ follower_id: followerId, following_id: followingId });

      return true;
    }
  } catch (error) {
    console.error('Follow error:', error);
    throw error;
  }
}

export async function getUserFollows(userId: string): Promise<string[]> {
  try {
    // Skip if temp user ID (not a valid UUID)
    if (!userId || userId.startsWith('temp-')) {
      return [];
    }

    const { data, error } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (error) {
      // Silently handle missing table errors
      if (error.code === 'PGRST205' || error.code === '22P02') {
        return [];
      }
      throw error;
    }
    return data?.map(item => item.following_id) || [];
  } catch (error) {
    const err = error as any;
    if (err?.code !== 'PGRST205' && err?.code !== '22P02') {
      console.error('Get follows error:', error);
    }
    return [];
  }
}

export async function getFollowingFeed(userId: string, limit = 50) {
  try {
    // Get users that current user follows
    const { data: follows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (!follows || follows.length === 0) {
      return [];
    }

    const followingIds = follows.map(f => f.following_id);

    // Get videos from followed users
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .in('user_id', followingIds)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Following feed error:', error);
    return [];
  }
}

/**
 * SAVE/BOOKMARK SYSTEM
 */
export async function saveVideo(userId: string, videoId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('saved_videos')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .single();

    if (existing) {
      // Unsave
      await supabase
        .from('saved_videos')
        .delete()
        .eq('user_id', userId)
        .eq('video_id', videoId);

      return false;
    } else {
      // Save
      await supabase
        .from('saved_videos')
        .insert({ user_id: userId, video_id: videoId });

      return true;
    }
  } catch (error) {
    console.error('Save error:', error);
    throw error;
  }
}

export async function getUserSavedVideos(userId: string): Promise<string[]> {
  try {
    // Skip if temp user ID (not a valid UUID)
    if (!userId || userId.startsWith('temp-')) {
      return [];
    }

    const { data, error } = await supabase
      .from('saved_videos')
      .select('video_id')
      .eq('user_id', userId);

    if (error) {
      // Silently handle missing table errors
      if (error.code === 'PGRST205' || error.code === '22P02') {
        return [];
      }
      throw error;
    }
    return data?.map(item => item.video_id) || [];
  } catch (error) {
    const err = error as any;
    if (err?.code !== 'PGRST205' && err?.code !== '22P02') {
      console.error('Get saved videos error:', error);
    }
    return [];
  }
}

/**
 * ACTIVITY TRACKING
 */
export async function logActivity(
  userId: string,
  actionType: 'view' | 'like' | 'comment' | 'share' | 'gift',
  videoId?: string,
  targetUserId?: string,
  metadata?: any
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: actionType,
      video_id: videoId,
      target_user_id: targetUserId,
      metadata: metadata,
    });
  } catch (error) {
    console.error('Log activity error:', error);
  }
}

export async function getUserActivity(userId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select(`
        *,
        video:videos(id, thumbnail_url, description),
        target_user:profiles!target_user_id(id, username, avatar_url)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get activity error:', error);
    return [];
  }
}

export async function getRecentlyViewedVideos(userId: string, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('video_id, videos(*)')
      .eq('user_id', userId)
      .eq('action_type', 'view')
      .not('video_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data?.map(item => item.videos).filter(Boolean) || [];
  } catch (error) {
    console.error('Get recently viewed error:', error);
    return [];
  }
}

/**
 * LIVE VIDEOS
 */
export async function getLiveVideos(limit = 50) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_live', true)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get live videos error:', error);
    return [];
  }
}

/**
 * NEARBY USERS (GPS-basiert)
 */
export async function getNearbyUsers(
  userLat: number,
  userLon: number,
  radiusKm = 50,
  limit = 50
) {
  try {
    // Using PostGIS earthdistance extension or custom calculation
    const { data, error } = await supabase.rpc('get_nearby_users', {
      user_lat: userLat,
      user_lon: userLon,
      radius_km: radiusKm,
      result_limit: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get nearby users error:', error);
    // Fallback: Get all users and calculate distance client-side
    return [];
  }
}

/**
 * FRIEND SUGGESTIONS
 */
export async function getFriendSuggestions(userId: string, limit = 20) {
  try {
    // Get users that:
    // 1. Current user doesn't follow
    // 2. Have mutual followers
    // 3. Are active recently
    const { data, error } = await supabase.rpc('get_friend_suggestions', {
      current_user_id: userId,
      result_limit: limit,
    });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get friend suggestions error:', error);
    return [];
  }
}

/**
 * SHARE TRACKING
 */
export async function trackShare(userId: string, videoId: string, platform?: string): Promise<void> {
  try {
    // Increment share counter
    await supabase.rpc('increment_shares', { video_id: videoId });

    // Log activity
    await logActivity(userId, 'share', videoId, undefined, { platform });
  } catch (error) {
    console.error('Track share error:', error);
  }
}

/**
 * VIEW TRACKING
 */
export async function trackView(userId: string, videoId: string): Promise<void> {
  try {
    // Increment view counter (with debounce check)
    const { data: recentView } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('video_id', videoId)
      .eq('action_type', 'view')
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Last 1 minute
      .single();

    if (!recentView) {
      await supabase.rpc('increment_views', { video_id: videoId });
      await logActivity(userId, 'view', videoId);
    }
  } catch (error) {
    console.error('Track view error:', error);
  }
}
