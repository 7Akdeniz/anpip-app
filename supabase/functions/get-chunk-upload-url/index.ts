/**
 * SUPABASE EDGE FUNCTION: GET CHUNK UPLOAD URL
 * Generiert Presigned URL für Chunk-Upload
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
    const { uploadPath, chunkIndex, uploadId } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generiere Presigned URL für Chunk
    const chunkPath = `${uploadPath}/chunk_${chunkIndex}`;
    const { data, error } = await supabaseClient.storage
      .from('videos')
      .createSignedUploadUrl(chunkPath);

    if (error) throw error;

    // Update Session
    await supabaseClient
      .from('upload_sessions')
      .update({
        status: 'uploading',
        updated_at: new Date().toISOString(),
      })
      .eq('upload_id', uploadId);

    return new Response(
      JSON.stringify({ uploadUrl: data.signedUrl, path: data.path }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
