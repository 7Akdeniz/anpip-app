/**
 * AI Content Generator für automatische Video-Optimierung
 * - Thumbnail-Extraktion & Auswahl
 * - Titel-Generierung
 * - Beschreibungs-Generierung
 * - Hashtag & Keyword-Extraktion
 * - SEO & GEO Meta-Daten
 */

import OpenAI from 'openai';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export interface AIGeneratedContent {
  title: string;
  description: string;
  hashtags: string[];
  keywords: string[];
  category: string;
  thumbnailUrl: string;
  chapters?: VideoChapter[];
  seoMetadata: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    structuredData: any;
  };
  geoMetadata?: {
    detectedLocation?: string;
    suggestedLocations: string[];
    localKeywords: string[];
  };
}

export interface VideoChapter {
  timestamp: number;
  title: string;
  description: string;
  thumbnailUrl?: string;
}

/**
 * Extrahiert mehrere Thumbnails aus einem Video
 */
export async function extractThumbnails(
  videoUri: string,
  count: number = 5
): Promise<string[]> {
  const thumbnails: string[] = [];
  const videoDuration = await getVideoDuration(videoUri);
  
  // Extrahiere Thumbnails an strategischen Punkten
  const positions = [
    0.1, // 10% - Skip intro
    0.3, // 30% - Early content
    0.5, // 50% - Mid-point
    0.7, // 70% - Late content
    0.9  // 90% - Before outro
  ];

  for (let i = 0; i < count; i++) {
    try {
      const time = videoDuration * positions[i];
      const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
        time: time * 1000, // Convert to ms
        quality: 0.9,
      });
      thumbnails.push(uri);
    } catch (error) {
      console.error(`Thumbnail extraction failed at position ${i}:`, error);
    }
  }

  return thumbnails;
}

/**
 * Wählt das beste Thumbnail mittels KI-Analyse
 */
export async function selectBestThumbnail(
  thumbnails: string[],
  videoContext?: string
): Promise<string> {
  if (thumbnails.length === 0) return '';
  if (thumbnails.length === 1) return thumbnails[0];

  try {
    // Vision API nutzen um beste Thumbnail zu wählen
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze these video thumbnails and select the most engaging one. Consider:
              - Visual clarity and composition
              - Emotional appeal and human interest
              - Action or movement
              - Contrast and color vibrancy
              - Relevance to context: ${videoContext || 'general video'}
              
              Return only the index number (0-${thumbnails.length - 1}) of the best thumbnail.`,
            },
            ...thumbnails.map(url => ({
              type: 'image_url' as const,
              image_url: { url },
            })),
          ],
        },
      ],
      max_tokens: 50,
    });

    const selectedIndex = parseInt(response.choices[0]?.message?.content || '0');
    return thumbnails[selectedIndex] || thumbnails[0];
  } catch (error) {
    console.error('AI thumbnail selection failed:', error);
    // Fallback: Wähle mittleres Thumbnail
    return thumbnails[Math.floor(thumbnails.length / 2)];
  }
}

/**
 * Generiert optimierten Titel mit KI
 */
export async function generateTitle(
  videoTranscript: string,
  existingTitle?: string,
  category?: string,
  location?: string
): Promise<string> {
  try {
    const prompt = `Generate an engaging, SEO-optimized video title based on:
    
    ${existingTitle ? `Original title: ${existingTitle}` : ''}
    ${category ? `Category: ${category}` : ''}
    ${location ? `Location: ${location}` : ''}
    
    Transcript excerpt: ${videoTranscript.substring(0, 1000)}
    
    Requirements:
    - 50-70 characters optimal length
    - Include location if relevant
    - Front-load important keywords
    - Emotional hook or curiosity gap
    - Natural language (avoid clickbait)
    - SEO-friendly but human-readable
    
    Return only the title, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || existingTitle || 'Untitled Video';
  } catch (error) {
    console.error('Title generation failed:', error);
    return existingTitle || 'Untitled Video';
  }
}

/**
 * Generiert optimierte Beschreibung mit KI
 */
export async function generateDescription(
  videoTranscript: string,
  title: string,
  category?: string,
  location?: string
): Promise<string> {
  try {
    const prompt = `Generate an engaging video description based on:
    
    Title: ${title}
    ${category ? `Category: ${category}` : ''}
    ${location ? `Location: ${location}` : ''}
    
    Transcript: ${videoTranscript.substring(0, 2000)}
    
    Requirements:
    - 150-300 words
    - First sentence is hook (appears in preview)
    - Include relevant keywords naturally
    - Mention location if relevant
    - Call-to-action at the end
    - SEO-optimized but conversational
    - Structured with line breaks
    
    Format:
    [Hook sentence]
    
    [Main description 2-3 paragraphs]
    
    [Call-to-action]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Description generation failed:', error);
    return '';
  }
}

/**
 * Extrahiert Hashtags und Keywords mit KI
 */
export async function generateHashtagsAndKeywords(
  title: string,
  description: string,
  transcript: string,
  category?: string,
  location?: string
): Promise<{ hashtags: string[]; keywords: string[] }> {
  try {
    const prompt = `Extract relevant hashtags and SEO keywords from this video content:
    
    Title: ${title}
    Description: ${description}
    ${category ? `Category: ${category}` : ''}
    ${location ? `Location: ${location}` : ''}
    Transcript excerpt: ${transcript.substring(0, 1000)}
    
    Return JSON format:
    {
      "hashtags": ["tag1", "tag2", ...], // 5-10 hashtags without # symbol
      "keywords": ["keyword1", "keyword2", ...] // 10-15 SEO keywords
    }
    
    Requirements:
    - Mix of broad and specific hashtags
    - Include trending and evergreen tags
    - Location-based hashtags if applicable
    - Category-relevant hashtags
    - Long-tail keywords for SEO`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0]?.message?.content || '{}');
    return {
      hashtags: result.hashtags || [],
      keywords: result.keywords || [],
    };
  } catch (error) {
    console.error('Hashtag/keyword generation failed:', error);
    return { hashtags: [], keywords: [] };
  }
}

/**
 * Generiert SEO Metadata
 */
export async function generateSEOMetadata(
  title: string,
  description: string,
  category: string,
  location?: string,
  keywords?: string[]
): Promise<AIGeneratedContent['seoMetadata']> {
  const metaTitle = `${title}${location ? ` | ${location}` : ''} - Anpip.com`;
  const metaDescription = description.substring(0, 160);

  return {
    metaTitle,
    metaDescription,
    ogTitle: title,
    ogDescription: description.substring(0, 200),
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: title,
      description: metaDescription,
      uploadDate: new Date().toISOString(),
      thumbnailUrl: '',
      contentUrl: '',
      embedUrl: '',
      keywords: keywords?.join(', ') || '',
      ...(location && {
        locationCreated: {
          '@type': 'Place',
          name: location,
        },
      }),
    },
  };
}

/**
 * Generiert alle AI-Inhalte für ein Video
 */
export async function generateAllAIContent(
  videoUri: string,
  options: {
    existingTitle?: string;
    existingDescription?: string;
    category?: string;
    location?: string;
    transcript?: string;
  }
): Promise<AIGeneratedContent> {
  // 1. Thumbnails extrahieren
  const thumbnails = await extractThumbnails(videoUri);
  const thumbnailUrl = await selectBestThumbnail(thumbnails, options.category);

  // 2. Transcript generieren falls nicht vorhanden
  const transcript = options.transcript || await generateTranscript(videoUri);

  // 3. Titel generieren
  const title = await generateTitle(
    transcript,
    options.existingTitle,
    options.category,
    options.location
  );

  // 4. Beschreibung generieren
  const description = await generateDescription(
    transcript,
    title,
    options.category,
    options.location
  );

  // 5. Hashtags & Keywords
  const { hashtags, keywords } = await generateHashtagsAndKeywords(
    title,
    description,
    transcript,
    options.category,
    options.location
  );

  // 6. SEO Metadata
  const seoMetadata = await generateSEOMetadata(
    title,
    description,
    options.category || 'general',
    options.location,
    keywords
  );

  // 7. GEO Metadata
  const geoMetadata = options.location
    ? {
        detectedLocation: options.location,
        suggestedLocations: [options.location],
        localKeywords: extractLocalKeywords(title, description, options.location),
      }
    : undefined;

  return {
    title,
    description,
    hashtags,
    keywords,
    category: options.category || 'general',
    thumbnailUrl,
    seoMetadata,
    geoMetadata,
  };
}

/**
 * Hilfsfunktion: Video-Dauer ermitteln
 */
async function getVideoDuration(videoUri: string): Promise<number> {
  // Implementierung abhängig von Platform
  // Für Web: HTMLVideoElement
  // Für Native: expo-av
  return 60; // Placeholder - 60 Sekunden
}

/**
 * Hilfsfunktion: Transcript generieren (Whisper API)
 */
async function generateTranscript(videoUri: string): Promise<string> {
  try {
    // Extract audio from video
    // Use OpenAI Whisper API
    // Return transcript
    return ''; // Placeholder
  } catch (error) {
    console.error('Transcript generation failed:', error);
    return '';
  }
}

/**
 * Hilfsfunktion: Lokale Keywords extrahieren
 */
function extractLocalKeywords(
  title: string,
  description: string,
  location: string
): string[] {
  const text = `${title} ${description} ${location}`.toLowerCase();
  const localTerms = [
    'near me',
    'in ' + location.toLowerCase(),
    location.toLowerCase() + ' area',
    'local ' + location.toLowerCase(),
  ];

  return localTerms.filter(term => text.includes(term.toLowerCase()));
}
