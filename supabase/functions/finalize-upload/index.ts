/**
 * SUPABASE EDGE FUNCTION: FINALIZE UPLOAD
 * Kombiniert Chunks und startet Video-Processing
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
    const { uploadPath, uploadId, fileName, fileSize } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Auth prüfen
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload-Session finalisieren
    await supabaseClient
      .from('upload_sessions')
      .update({
        status: 'combining',
        completed_at: new Date().toISOString(),
      })
      .eq('upload_id', uploadId);

    // Video-Eintrag in DB erstellen
    const { data: video, error: videoError } = await supabaseClient
      .from('videos')
      .insert({
        user_id: user.id,
        title: fileName.replace(/\.[^/.]+$/, ''), // Dateiendung entfernen
        file_path: uploadPath,
        file_size: fileSize,
        status: 'processing',
        upload_id: uploadId,
      })
      .select()
      .single();

    if (videoError) throw videoError;

    // Trigger Video-Processing Queue
    await supabaseClient.functions.invoke('process-video', {
      body: {
        videoId: video.id,
        uploadPath,
        uploadId,
      },
    });

    return new Response(
      JSON.stringify({
        videoUrl: uploadPath,
        videoId: video.id,
        message: 'Upload successful, processing started',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
