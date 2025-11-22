/**
 * MUSIC/SOUND SERVICE
 * Verwaltet Sounds und Audio-Tracks für Videos
 */

import { supabase } from './supabase';

export interface Sound {
  id: string;
  name: string;
  artist?: string;
  duration?: number;
  audio_url?: string;
  thumbnail_url?: string;
  usage_count?: number;
  created_at?: string;
}

/**
 * Get sound info by ID
 */
export async function getSound(soundId: string) {
  try {
    const { data, error } = await supabase
      .from('sounds')
      .select('*')
      .eq('id', soundId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Get sound error:', error);
    return null;
  }
}

/**
 * Get all videos using a specific sound
 */
export async function getVideosBySound(soundId: string, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('sound_id', soundId)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get videos by sound error:', error);
    return [];
  }
}

/**
 * Save sound to user's favorites
 */
export async function saveSound(userId: string, soundId: string): Promise<boolean> {
  try {
    const { data: existing } = await supabase
      .from('saved_sounds')
      .select('*')
      .eq('user_id', userId)
      .eq('sound_id', soundId)
      .single();

    if (existing) {
      // Unsave
      await supabase
        .from('saved_sounds')
        .delete()
        .eq('user_id', userId)
        .eq('sound_id', soundId);

      return false;
    } else {
      // Save
      await supabase
        .from('saved_sounds')
        .insert({ user_id: userId, sound_id: soundId });

      return true;
    }
  } catch (error) {
    console.error('Save sound error:', error);
    throw error;
  }
}

/**
 * Get user's saved sounds
 */
export async function getUserSavedSounds(userId: string) {
  try {
    const { data, error } = await supabase
      .from('saved_sounds')
      .select(`
        sound_id,
        sounds(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data?.map(item => item.sounds).filter(Boolean) || [];
  } catch (error) {
    console.error('Get saved sounds error:', error);
    return [];
  }
}

/**
 * Get trending sounds
 */
export async function getTrendingSounds(limit = 30) {
  try {
    const { data, error } = await supabase
      .from('sounds')
      .select('*')
      .order('usage_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Get trending sounds error:', error);
    return [];
  }
}

/**
 * Create or get sound from video
 */
export async function createSoundFromVideo(
  videoId: string,
  name: string,
  audioUrl: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('sounds')
      .insert({
        name: name,
        audio_url: audioUrl,
        source_video_id: videoId,
      })
      .select()
      .single();

    if (error) throw error;
    return data?.id || null;
  } catch (error) {
    console.error('Create sound error:', error);
    return null;
  }
}
