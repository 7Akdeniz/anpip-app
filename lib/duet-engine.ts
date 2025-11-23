/**
 * ============================================================================
 * VIDEO DUET ENGINE
 * ============================================================================
 * 
 * TikTok's Killer-Feature: Split-Screen Video Recording
 * 
 * Flow:
 * 1. User wählt Original-Video aus
 * 2. Split-Screen: Links = Original, Rechts = Aufnahme
 * 3. Beide Videos parallel abspielen/aufnehmen
 * 4. Videos kombinieren mit FFmpeg
 * 5. Upload als neues Video
 * 
 * Features:
 * - Side-by-Side Layout
 * - Synchronisierte Wiedergabe
 * - Audio aus beiden Videos
 * - Verschiedene Layouts (Split, Green Screen, Picture-in-Picture)
 */

import { supabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export type DuetLayout = 
  | 'side-by-side'      // Beide Videos nebeneinander
  | 'top-bottom'        // Übereinander
  | 'picture-in-picture' // Klein über groß
  | 'green-screen';     // Mit Green-Screen-Effekt

export interface DuetOptions {
  originalVideoId: string;
  originalVideoUrl: string;
  recordedVideoUrl: string;
  layout: DuetLayout;
  audioMix: 'both' | 'original' | 'recorded';
}

export interface DuetResult {
  success: boolean;
  videoUrl?: string;
  videoId?: string;
  error?: string;
}

// ============================================================================
// CREATE DUET (Simplified - Client-Side)
// ============================================================================

/**
 * Erstellt Duet-Video (Simplified Version ohne FFmpeg)
 * 
 * WICHTIG: Echte FFmpeg-Integration braucht Backend/Edge Function
 * Diese Version speichert nur die Referenz
 */
export async function createDuet(
  userId: string,
  options: DuetOptions
): Promise<DuetResult> {
  try {
    console.log('🎬 Creating duet video...');

    // In Produktion: Edge Function für FFmpeg-Processing
    // Für jetzt: Speichere beide Videos als "Duet"
    
    const { data: videoData, error } = await supabase
      .from('videos')
      .insert({
        user_id: userId,
        video_url: options.recordedVideoUrl,
        description: `Duet with original video`,
        visibility: 'public',
        is_duet: true,
        duet_original_video_id: options.originalVideoId,
        duet_layout: options.layout,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Sende Notification an Original-Creator
    const { data: originalVideo } = await supabase
      .from('videos')
      .select('user_id')
      .eq('id', options.originalVideoId)
      .single();

    if (originalVideo) {
      // TODO: Send Push Notification
      // await sendPushNotification(originalVideo.user_id, { type: 'duet', ... });
    }

    console.log('✅ Duet created:', videoData.id);

    return {
      success: true,
      videoId: videoData.id,
      videoUrl: options.recordedVideoUrl,
    };

  } catch (error) {
    console.error('Failed to create duet:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create duet',
    };
  }
}

// ============================================================================
// FFMPEG VIDEO PROCESSING (Backend/Edge Function)
// ============================================================================

/**
 * Backend Edge Function für FFmpeg-Processing
 * 
 * Diese Funktion würde auf Supabase Edge Functions laufen:
 * supabase/functions/create-duet/index.ts
 */
export const FFMPEG_DUET_EXAMPLE = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { originalVideoUrl, recordedVideoUrl, layout } = await req.json()

  // 1. Download beide Videos
  const original = await fetch(originalVideoUrl).then(r => r.arrayBuffer())
  const recorded = await fetch(recordedVideoUrl).then(r => r.arrayBuffer())

  // 2. FFmpeg Command (Deno FFmpeg)
  const command = layout === 'side-by-side'
    ? \`ffmpeg -i original.mp4 -i recorded.mp4 -filter_complex "[0:v][1:v]hstack" output.mp4\`
    : \`ffmpeg -i original.mp4 -i recorded.mp4 -filter_complex "[0:v][1:v]vstack" output.mp4\`

  // 3. Execute FFmpeg
  const process = Deno.run({
    cmd: command.split(' '),
    stdout: 'piped',
  })

  await process.status()

  // 4. Upload kombiniertes Video
  const supabase = createClient(...)
  const { data } = await supabase.storage
    .from('videos')
    .upload(\`duets/\${Date.now()}.mp4\`, output)

  return new Response(JSON.stringify({ videoUrl: data.path }))
})
`;

// ============================================================================
// GET DUETS FOR VIDEO
// ============================================================================

/**
 * Hole alle Duets die mit diesem Video erstellt wurden
 */
export async function getDuetsForVideo(videoId: string): Promise<any[]> {
  const { data } = await supabase
    .from('videos')
    .select(`
      *,
      user:users(id, username, avatar_url)
    `)
    .eq('duet_original_video_id', videoId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false })
    .limit(50);

  return data || [];
}

// ============================================================================
// CHECK IF USER CAN DUET
// ============================================================================

/**
 * Prüft ob User ein Duet erstellen darf
 */
export async function canUserDuet(
  userId: string,
  videoId: string
): Promise<{ allowed: boolean; reason?: string }> {
  
  // 1. Check ob Video existiert
  const { data: video } = await supabase
    .from('videos')
    .select('id, visibility, allow_duets, user_id')
    .eq('id', videoId)
    .single();

  if (!video) {
    return { allowed: false, reason: 'Video not found' };
  }

  // 2. Check ob Duets erlaubt sind
  if (video.allow_duets === false) {
    return { allowed: false, reason: 'Duets are disabled for this video' };
  }

  // 3. Check ob Video privat ist
  if (video.visibility !== 'public') {
    return { allowed: false, reason: 'Cannot duet private videos' };
  }

  // 4. Check ob User sich selbst dueted (optional erlauben)
  if (video.user_id === userId) {
    return { allowed: false, reason: 'Cannot duet your own video' };
  }

  return { allowed: true };
}

// ============================================================================
// DUET STATISTICS
// ============================================================================

/**
 * Hole Duet-Stats für ein Video
 */
export async function getDuetStats(videoId: string): Promise<{
  totalDuets: number;
  recentDuets: any[];
}> {
  
  const { count } = await supabase
    .from('videos')
    .select('*', { count: 'exact', head: true })
    .eq('duet_original_video_id', videoId);

  const { data: recent } = await supabase
    .from('videos')
    .select(`
      id,
      created_at,
      user:users(username, avatar_url)
    `)
    .eq('duet_original_video_id', videoId)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalDuets: count || 0,
    recentDuets: recent || [],
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const duetEngine = {
  createDuet,
  getDuetsForVideo,
  canUserDuet,
  getDuetStats,
};
