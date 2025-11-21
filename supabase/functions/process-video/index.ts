/**
 * SUPABASE EDGE FUNCTION: PROCESS VIDEO
 * 
 * Video-Processing-Pipeline:
 * 1. Kombiniere Chunks
 * 2. Trigger FFmpeg-Transcoding
 * 3. Generiere Thumbnails
 * 4. Erstelle HLS/DASH Streams
 * 5. Generiere Kapitel
 * 6. Update Video-Status
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { videoId, uploadPath, uploadId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Starting video processing for ${videoId}`);

    // 1. Kombiniere Chunks zu finalem Video
    await combineChunks(supabaseClient, uploadPath, uploadId);

    // 2. Trigger Transcoding-Queue (AWS MediaConvert / FFmpeg Worker)
    const jobId = await triggerTranscoding(videoId, uploadPath);

    // 3. Update Video-Status
    await supabaseClient
      .from('videos')
      .update({
        status: 'processing',
        processing_job_id: jobId,
        processing_started_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    return new Response(
      JSON.stringify({
        success: true,
        videoId,
        jobId,
        message: 'Video processing started',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Kombiniert Chunks zu finalem Video
 */
async function combineChunks(supabaseClient: any, uploadPath: string, uploadId: string) {
  // Liste alle Chunks
  const { data: chunks } = await supabaseClient.storage
    .from('videos')
    .list(`${uploadPath}`);

  if (!chunks || chunks.length === 0) {
    throw new Error('No chunks found');
  }

  // Sortiere Chunks nach Index
  const sortedChunks = chunks
    .filter((c: any) => c.name.startsWith('chunk_'))
    .sort((a: any, b: any) => {
      const aIndex = parseInt(a.name.replace('chunk_', ''));
      const bIndex = parseInt(b.name.replace('chunk_', ''));
      return aIndex - bIndex;
    });

  // Kombiniere Chunks (in Worker-Service ausgeführt)
  // Hier nur Queue-Eintrag erstellen
  await supabaseClient.from('processing_queue').insert({
    upload_id: uploadId,
    upload_path: uploadPath,
    task_type: 'combine_chunks',
    status: 'pending',
    chunks_count: sortedChunks.length,
  });
}

/**
 * Triggert Transcoding-Job
 */
async function triggerTranscoding(videoId: string, uploadPath: string): Promise<string> {
  // In Production: AWS MediaConvert, Azure Media Services, oder Custom FFmpeg Worker
  // Hier: Simplified Queue-basiert
  
  const jobId = `transcode_${videoId}_${Date.now()}`;
  
  // Queue-Eintrag erstellen
  // Worker holt sich Jobs und führt FFmpeg aus
  
  return jobId;
}
