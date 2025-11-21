/**
 * Supabase Edge Function: AI Content Generator
 * Generiert automatisch Thumbnails, Titel, Beschreibungen, Hashtags
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIContentRequest {
  videoId: string;
  videoUrl: string;
  existingTitle?: string;
  existingDescription?: string;
  category?: string;
  location?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { videoId, videoUrl, existingTitle, existingDescription, category, location } =
      await req.json() as AIContentRequest;

    console.log('Generating AI content for video:', videoId);

    // 1. Thumbnails extrahieren (mit FFmpeg)
    const thumbnails = await extractThumbnailsWithFFmpeg(videoUrl);
    const bestThumbnail = thumbnails[2] || thumbnails[0]; // Mittleres Thumbnail

    // 2. Audio extrahieren für Transkription
    const audioUrl = await extractAudio(videoUrl);

    // 3. Transcript mit OpenAI Whisper
    const transcript = await generateTranscriptWithWhisper(audioUrl);

    // 4. Titel mit GPT-4 generieren
    const title = await generateTitleWithGPT4(
      transcript,
      existingTitle,
      category,
      location
    );

    // 5. Beschreibung generieren
    const description = await generateDescriptionWithGPT4(
      transcript,
      title,
      category,
      location
    );

    // 6. Hashtags & Keywords
    const { hashtags, keywords } = await generateHashtagsWithGPT4(
      title,
      description,
      transcript,
      category,
      location
    );

    // 7. SEO Metadata
    const seoMetadata = {
      metaTitle: `${title}${location ? ` | ${location}` : ''} - Anpip.com`,
      metaDescription: description.substring(0, 160),
      ogTitle: title,
      ogDescription: description.substring(0, 200),
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        name: title,
        description: description.substring(0, 160),
        thumbnailUrl: bestThumbnail,
        keywords: keywords.join(', '),
      },
    };

    // 8. In Datenbank speichern
    const { error: updateError } = await supabase
      .from('videos')
      .update({
        title,
        description,
        thumbnail_url: bestThumbnail,
        hashtags,
        keywords,
        seo_metadata: seoMetadata,
        transcript,
        ai_generated: true,
        ai_generated_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          title,
          description,
          thumbnailUrl: bestThumbnail,
          hashtags,
          keywords,
          seoMetadata,
          transcript: transcript.substring(0, 200) + '...',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('AI content generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Extrahiert Thumbnails mit FFmpeg
 */
async function extractThumbnailsWithFFmpeg(videoUrl: string): Promise<string[]> {
  const thumbnails: string[] = [];
  const positions = [10, 30, 50, 70, 90]; // Prozentuale Positionen

  for (const pos of positions) {
    try {
      // FFmpeg Command
      const cmd = [
        'ffmpeg',
        '-i',
        videoUrl,
        '-vf',
        `select='gte(n\\,${pos})'`,
        '-frames:v',
        '1',
        '-f',
        'image2pipe',
        '-vcodec',
        'png',
        'pipe:1',
      ];

      const process = Deno.run({ cmd, stdout: 'piped', stderr: 'null' });
      const output = await process.output();
      process.close();

      // Upload zu Supabase Storage
      const fileName = `thumbnail_${pos}.png`;
      const { data, error } = await createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
        .storage.from('thumbnails')
        .upload(fileName, output, { contentType: 'image/png' });

      if (!error && data) {
        const publicUrl = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
          .storage.from('thumbnails')
          .getPublicUrl(data.path).data.publicUrl;

        thumbnails.push(publicUrl);
      }
    } catch (error) {
      console.error(`Thumbnail extraction failed at ${pos}%:`, error);
    }
  }

  return thumbnails;
}

/**
 * Extrahiert Audio mit FFmpeg
 */
async function extractAudio(videoUrl: string): Promise<string> {
  const cmd = [
    'ffmpeg',
    '-i',
    videoUrl,
    '-vn',
    '-acodec',
    'libmp3lame',
    '-ar',
    '16000',
    '-ac',
    '1',
    '-f',
    'mp3',
    'pipe:1',
  ];

  const process = Deno.run({ cmd, stdout: 'piped', stderr: 'null' });
  const output = await process.output();
  process.close();

  // Upload zu Supabase
  const fileName = `audio_${Date.now()}.mp3`;
  const { data } = await createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
    .storage.from('audio')
    .upload(fileName, output, { contentType: 'audio/mpeg' });

  const publicUrl = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
    .storage.from('audio')
    .getPublicUrl(data!.path).data.publicUrl;

  return publicUrl;
}

/**
 * Generiert Transcript mit OpenAI Whisper
 */
async function generateTranscriptWithWhisper(audioUrl: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      file: audioUrl,
      model: 'whisper-1',
      language: 'de',
    }),
  });

  const data = await response.json();
  return data.text || '';
}

/**
 * Generiert Titel mit GPT-4
 */
async function generateTitleWithGPT4(
  transcript: string,
  existingTitle?: string,
  category?: string,
  location?: string
): Promise<string> {
  const prompt = `Generiere einen ansprechenden, SEO-optimierten Video-Titel basierend auf:
  
  ${existingTitle ? `Bisheriger Titel: ${existingTitle}` : ''}
  ${category ? `Kategorie: ${category}` : ''}
  ${location ? `Ort: ${location}` : ''}
  
  Transkript-Auszug: ${transcript.substring(0, 1000)}
  
  Anforderungen:
  - 50-70 Zeichen optimal
  - Ort einbeziehen wenn relevant
  - Wichtige Keywords vorne
  - Emotionaler Hook oder Neugierde
  - Natürliche Sprache (kein Clickbait)
  - SEO-freundlich aber lesbar
  
  Gib NUR den Titel zurück, nichts anderes.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || existingTitle || 'Unbekanntes Video';
}

/**
 * Generiert Beschreibung mit GPT-4
 */
async function generateDescriptionWithGPT4(
  transcript: string,
  title: string,
  category?: string,
  location?: string
): Promise<string> {
  const prompt = `Generiere eine ansprechende Video-Beschreibung basierend auf:
  
  Titel: ${title}
  ${category ? `Kategorie: ${category}` : ''}
  ${location ? `Ort: ${location}` : ''}
  
  Transkript: ${transcript.substring(0, 2000)}
  
  Anforderungen:
  - 150-300 Wörter
  - Erster Satz ist Hook (erscheint in Vorschau)
  - Relevante Keywords natürlich einbauen
  - Ort erwähnen wenn relevant
  - Call-to-Action am Ende
  - SEO-optimiert aber gesprächig
  - Strukturiert mit Zeilenumbrüchen`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  const data = await response.json();
  return data.choices[0]?.message?.content?.trim() || '';
}

/**
 * Generiert Hashtags & Keywords mit GPT-4
 */
async function generateHashtagsWithGPT4(
  title: string,
  description: string,
  transcript: string,
  category?: string,
  location?: string
): Promise<{ hashtags: string[]; keywords: string[] }> {
  const prompt = `Extrahiere relevante Hashtags und SEO-Keywords aus diesem Video-Inhalt:
  
  Titel: ${title}
  Beschreibung: ${description}
  ${category ? `Kategorie: ${category}` : ''}
  ${location ? `Ort: ${location}` : ''}
  Transkript-Auszug: ${transcript.substring(0, 1000)}
  
  Gib JSON zurück:
  {
    "hashtags": ["tag1", "tag2", ...], // 5-10 Hashtags ohne # Symbol
    "keywords": ["keyword1", "keyword2", ...] // 10-15 SEO Keywords
  }
  
  Anforderungen:
  - Mix aus breiten und spezifischen Hashtags
  - Trending und evergreen Tags
  - Ortsbezogene Hashtags wenn anwendbar
  - Kategorie-relevante Hashtags
  - Long-tail Keywords für SEO`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    }),
  });

  const data = await response.json();
  const result = JSON.parse(data.choices[0]?.message?.content || '{}');
  return {
    hashtags: result.hashtags || [],
    keywords: result.keywords || [],
  };
}
