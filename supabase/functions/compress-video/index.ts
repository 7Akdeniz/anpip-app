// Supabase Edge Function: Video Komprimierung mit FFmpeg
// Triggert automatisch wenn Video in 'videos-raw' hochgeladen wird

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Supabase Client initialisieren (automatisch verfügbar in Edge Functions)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Request Body parsen
    const { videoPath, userId, videoId } = await req.json()
    
    if (!videoPath || !userId || !videoId) {
      throw new Error('Missing required parameters: videoPath, userId, videoId')
    }

    console.log(`🎬 Starte Komprimierung: ${videoPath}`)

    // 1. Original Video von videos-raw Bucket laden
    const { data: rawVideo, error: downloadError } = await supabase
      .storage
      .from('videos-raw')
      .download(videoPath)

    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`)
    }

    console.log(`📥 Video heruntergeladen: ${rawVideo.size} bytes`)

    // 2. Video als Blob zu ArrayBuffer konvertieren
    const arrayBuffer = await rawVideo.arrayBuffer()
    const videoBuffer = new Uint8Array(arrayBuffer)

    // 3. FFmpeg Komprimierung durchführen
    // Temporäre Dateien erstellen
    const inputPath = `/tmp/input_${Date.now()}.mp4`
    const outputPath = `/tmp/output_${Date.now()}.mp4`

    // Input Video speichern
    await Deno.writeFile(inputPath, videoBuffer)

    console.log(`🔄 Starte FFmpeg Komprimierung...`)

    // FFmpeg Command mit hoher Qualität (CRF 23 = visuell verlustfrei)
    const ffmpegCommand = new Deno.Command('ffmpeg', {
      args: [
        '-i', inputPath,                    // Input
        '-c:v', 'libx265',                  // H.265 Codec (bessere Kompression als H.264)
        '-preset', 'medium',                // Balance zwischen Speed und Kompression
        '-crf', '23',                       // Constant Rate Factor (18-28, 23 = hohe Qualität)
        '-vf', 'scale=-2:min(1080\\,ih)',  // Max 1080p Höhe, Breite automatisch
        '-c:a', 'aac',                      // Audio: AAC
        '-b:a', '128k',                     // Audio Bitrate
        '-movflags', '+faststart',          // Web-optimiert (Metadaten vorne)
        '-y',                               // Überschreiben ohne Nachfrage
        outputPath
      ],
      stdout: 'piped',
      stderr: 'piped',
    })

    const { code, stdout, stderr } = await ffmpegCommand.output()

    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr)
      console.error(`❌ FFmpeg Fehler:`, errorOutput)
      throw new Error(`FFmpeg failed with code ${code}`)
    }

    console.log(`✅ Komprimierung abgeschlossen`)

    // 4. Komprimiertes Video laden
    const compressedVideo = await Deno.readFile(outputPath)
    const originalSizeMB = (videoBuffer.length / 1024 / 1024).toFixed(2)
    const compressedSizeMB = (compressedVideo.length / 1024 / 1024).toFixed(2)
    const reductionPercent = ((1 - compressedVideo.length / videoBuffer.length) * 100).toFixed(1)

    console.log(`📦 Original: ${originalSizeMB} MB → Komprimiert: ${compressedSizeMB} MB (${reductionPercent}% kleiner)`)

    // 5. Komprimiertes Video zu 'videos' Bucket hochladen
    const finalPath = videoPath.replace('videos-raw/', '') // Entferne Prefix falls vorhanden
    const { error: uploadError } = await supabase
      .storage
      .from('videos')
      .upload(finalPath, compressedVideo, {
        contentType: 'video/mp4',
        upsert: true,
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`)
    }

    console.log(`📤 Komprimiertes Video hochgeladen: ${finalPath}`)

    // 6. Original Video aus videos-raw löschen (Speicherplatz sparen)
    const { error: deleteError } = await supabase
      .storage
      .from('videos-raw')
      .remove([videoPath])

    if (deleteError) {
      console.warn(`⚠️ Raw Video konnte nicht gelöscht werden: ${deleteError.message}`)
    }

    // 7. Database Entry aktualisieren (status: compressed)
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        video_url: finalPath,
        compression_status: 'completed',
        original_size_mb: parseFloat(originalSizeMB),
        compressed_size_mb: parseFloat(compressedSizeMB),
      })
      .eq('id', videoId)

    if (updateError) {
      console.warn(`⚠️ Database Update fehlgeschlagen: ${updateError.message}`)
    }

    // 8. Temporäre Dateien löschen
    try {
      await Deno.remove(inputPath)
      await Deno.remove(outputPath)
    } catch (e) {
      console.warn(`⚠️ Temp Files cleanup failed:`, e)
    }

    return new Response(
      JSON.stringify({
        success: true,
        originalSize: originalSizeMB,
        compressedSize: compressedSizeMB,
        reduction: reductionPercent,
        path: finalPath,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Compression Error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
