// @ts-nocheck - This is a Deno Edge Function, not TypeScript
// Deno-specific APIs (Deno.env, serve) are only available at runtime in Supabase Edge Functions

// Pixabay Music API Edge Function
// Schützt API-Key, implementiert Rate-Limiting & Caching

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const PIXABAY_API_KEY = Deno.env.get('PIXABAY_API_KEY')!
const PIXABAY_MUSIC_API = 'https://pixabay.com/api/music/'

// Rate Limiting Cache (In-Memory für Edge Function)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 100 // Max requests per window
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

// Response Cache
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface PixabayMusicParams {
  q?: string
  lang?: string
  page?: number
  per_page?: number
  music_type?: string // genre, mood, artist
  order?: 'popular' | 'latest'
  min_duration?: number
  max_duration?: number
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitCache.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitCache.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }

  userLimit.count++
  return true
}

function getCachedResponse(cacheKey: string): any | null {
  const cached = responseCache.get(cacheKey)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_TTL) {
    responseCache.delete(cacheKey)
    return null
  }

  return cached.data
}

function setCachedResponse(cacheKey: string, data: any): void {
  responseCache.set(cacheKey, { data, timestamp: Date.now() })
}

serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authentifizierung prüfen
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Rate Limiting
    if (!checkRateLimit(user.id)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Request Parameter parsen
    const url = new URL(req.url)
    const action = url.searchParams.get('action') || 'search'

    if (action === 'search') {
      const params: PixabayMusicParams = {
        q: url.searchParams.get('q') || '',
        lang: url.searchParams.get('lang') || 'en',
        page: parseInt(url.searchParams.get('page') || '1'),
        per_page: parseInt(url.searchParams.get('per_page') || '20'),
        music_type: url.searchParams.get('music_type') || '',
        order: (url.searchParams.get('order') as 'popular' | 'latest') || 'popular',
        min_duration: parseInt(url.searchParams.get('min_duration') || '0'),
        max_duration: parseInt(url.searchParams.get('max_duration') || '0'),
      }

      // Cache Key generieren
      const cacheKey = JSON.stringify(params)
      const cachedData = getCachedResponse(cacheKey)
      
      if (cachedData) {
        return new Response(
          JSON.stringify({ ...cachedData, cached: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Pixabay API Call
      const pixabayUrl = new URL(PIXABAY_MUSIC_API)
      pixabayUrl.searchParams.set('key', PIXABAY_API_KEY)
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) pixabayUrl.searchParams.set(key, String(value))
      })

      const response = await fetch(pixabayUrl.toString())
      
      if (!response.ok) {
        throw new Error(`Pixabay API error: ${response.statusText}`)
      }

      const data = await response.json()

      // Transform für App-Struktur
      const transformedData = {
        total: data.total || 0,
        totalHits: data.totalHits || 0,
        tracks: (data.hits || []).map((track: any) => ({
          id: track.id,
          name: track.name,
          artist: track.artist || 'Unknown Artist',
          genre: track.genre || 'General',
          tags: track.tags || '',
          duration: track.duration || 0,
          tempo: track.tempo || 0,
          audioUrl: track.audio || '',
          downloadUrl: track.download_url || '',
          previewUrl: track.preview_url || '',
          thumbnail: track.thumbnail || '',
          userImageUrl: track.userImageURL || '',
          pageUrl: track.pageURL || '',
        })),
      }

      // Cache speichern
      setCachedResponse(cacheKey, transformedData)

      return new Response(
        JSON.stringify(transformedData),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_track') {
      const trackId = url.searchParams.get('id')
      if (!trackId) {
        return new Response(
          JSON.stringify({ error: 'Track ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Einzelnen Track abrufen
      const pixabayUrl = new URL(PIXABAY_MUSIC_API)
      pixabayUrl.searchParams.set('key', PIXABAY_API_KEY)
      pixabayUrl.searchParams.set('id', trackId)

      const response = await fetch(pixabayUrl.toString())
      const data = await response.json()

      if (data.hits && data.hits.length > 0) {
        const track = data.hits[0]
        return new Response(
          JSON.stringify({
            id: track.id,
            name: track.name,
            artist: track.artist || 'Unknown Artist',
            genre: track.genre || 'General',
            tags: track.tags || '',
            duration: track.duration || 0,
            tempo: track.tempo || 0,
            audioUrl: track.audio || '',
            downloadUrl: track.download_url || '',
            previewUrl: track.preview_url || '',
            thumbnail: track.thumbnail || '',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } else {
        return new Response(
          JSON.stringify({ error: 'Track not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Pixabay Music API Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
