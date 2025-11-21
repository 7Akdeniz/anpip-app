/**
 * SUPABASE EDGE FUNCTION: INITIALIZE UPLOAD
 * Erstellt Upload-Session für chunked uploads
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName, fileSize, uploadId } = await req.json();

    // Validierung
    if (!fileName || !fileSize || !uploadId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Video-Größen-Limit: 10 GB
    const MAX_FILE_SIZE = 10 * 1024 * 1024 * 1024; // 10 GB
    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 10 GB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Supabase Client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Auth-Token prüfen
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload-Path generieren
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uploadPath = `uploads/${user.id}/${uploadId}/${timestamp}_${sanitizedFileName}`;

    // Upload-Session in DB speichern
    const { data: session, error: sessionError } = await supabaseClient
      .from('upload_sessions')
      .insert({
        upload_id: uploadId,
        user_id: user.id,
        file_name: fileName,
        file_size: fileSize,
        upload_path: uploadPath,
        status: 'initializing',
        chunks_total: Math.ceil(fileSize / (8 * 1024 * 1024)), // 8 MB chunks
        chunks_uploaded: 0,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Failed to create upload session' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        uploadPath,
        uploadId,
        sessionId: session.id,
        message: 'Upload session initialized',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
