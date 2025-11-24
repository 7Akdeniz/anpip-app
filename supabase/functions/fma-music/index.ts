// Free Music Archive (FMA) API Edge Function
// Schützt API-Key, implementiert Rate-Limiting & Caching
// FMA API Docs: https://freemusicarchive.org/api

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const FMA_API_KEY = Deno.env.get('FMA_API_KEY')!
const FMA_API_BASE = 'https://freemusicarchive.org/api/get'

// Rate Limiting Cache (In-Memory für Edge Function)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_MAX = 100 // Max requests per hour (FMA Limit ist höher)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour

// Response Cache
const responseCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour

interface FMARequestParams {
  action: 'search' | 'get_track' | 'get_artist' | 'get_album' | 'get_genres' | 'get_playlist'
  // Search params
  q?: string
  genre?: string
  tag?: string
  artist?: string
  album?: string
  playlist?: string
  license?: string
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  per_page?: number
  // Get params
  track_id?: string
  artist_id?: string
  album_id?: string
  playlist_id?: string
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

  console.log('🎵 FMA Cache Hit:', cacheKey)
  return cached.data
}

function setCachedResponse(cacheKey: string, data: any): void {
  responseCache.set(cacheKey, { data, timestamp: Date.now() })
  console.log('💾 FMA Cache Set:', cacheKey)
}

// Parse duration "MM:SS" to seconds
function parseDuration(duration: string): number {
  if (!duration || !duration.includes(':')) return 0
  const [mins, secs] = duration.split(':').map(Number)
  return (mins * 60) + secs
}

// Normalize FMA Track to unified format
function normalizeTrack(track: any): any {
  const duration = parseDuration(track.track_duration || '0:00')
  
  return {
    id: track.track_id,
    name: track.track_title || 'Untitled',
    artist: track.artist_name || 'Unknown Artist',
    genre: track.tags?.[0]?.tag_title || 'Unknown',
    tags: track.tags?.map((t: any) => t.tag_title).join(', ') || '',
    duration,
    tempo: 0, // FMA hat kein BPM in API
    audioUrl: track.track_file || track.track_file_url || '',
    downloadUrl: track.track_file || track.track_file_url || '',
    previewUrl: track.track_file || track.track_file_url || '', // FMA hat kein Preview
    thumbnail: track.album_image_file || track.artist_image_file || '',
    userImageUrl: track.artist_image_file || '',
    pageUrl: track.track_url || '',
    
    // FMA-specific
    fma_track_id: track.track_id,
    fma_artist_id: track.artist_id,
    fma_album_id: track.album_id || null,
    license_title: track.license_title || 'CC BY',
    license_url: track.license_url || '',
    track_listens: track.track_listens || 0,
    track_favorites: track.track_favorites || 0,
    track_date_published: track.track_date_published || track.track_date_created,
  }
}

// FMA API Call
async function callFMAAPI(endpoint: string, params: Record<string, any>): Promise<any> {
  const url = new URL(`${FMA_API_BASE}/${endpoint}.json`)
  url.searchParams.append('api_key', FMA_API_KEY)
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value))
    }
  })

  console.log('🎵 FMA API Call:', endpoint, params)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FMA API Error:', response.status, error)
    throw new Error(`FMA API Error: ${response.status}`)
  }

  return await response.json()
}

// Search Tracks
async function searchTracks(params: FMARequestParams): Promise<any> {
  const searchParams: Record<string, any> = {
    limit: params.per_page || 20,
    page: params.page || 1,
  }

  // Query
  if (params.q) searchParams.searchterm = params.q
  if (params.genre) searchParams.genre_handle = params.genre
  if (params.tag) searchParams.tag = params.tag
  if (params.artist) searchParams.artist_handle = params.artist
  if (params.license) searchParams.license_type = params.license

  // Sorting
  if (params.sort) searchParams.sort = params.sort
  if (params.order) searchParams.order = params.order

  const data = await callFMAAPI('tracks', searchParams)
  
  const tracks = Array.isArray(data.dataset) 
    ? data.dataset.map(normalizeTrack)
    : []

  return {
    total: data.total || 0,
    totalHits: data.total || 0,
    tracks,
    page: params.page || 1,
    per_page: params.per_page || 20,
    source: 'fma',
  }
}

// Get Single Track
async function getTrack(trackId: string): Promise<any> {
  const data = await callFMAAPI('tracks', { track_id: trackId })
  
  if (!data.dataset || !data.dataset[0]) {
    throw new Error('Track not found')
  }

  return normalizeTrack(data.dataset[0])
}

// Get Genres
async function getGenres(): Promise<any> {
  const data = await callFMAAPI('genres', { limit: 50 })
  
  return {
    genres: Array.isArray(data.dataset) ? data.dataset : [],
    total: data.total || 0,
  }
}

// Get Artist
async function getArtist(artistId: string): Promise<any> {
  const data = await callFMAAPI('artists', { artist_id: artistId })
  
  if (!data.dataset || !data.dataset[0]) {
    throw new Error('Artist not found')
  }

  return data.dataset[0]
}

// Get Album
async function getAlbum(albumId: string): Promise<any> {
  const data = await callFMAAPI('albums', { album_id: albumId })
  
  if (!data.dataset || !data.dataset[0]) {
    throw new Error('Album not found')
  }

  return data.dataset[0]
}

// Get Playlist/Curator
async function getPlaylist(playlistId: string): Promise<any> {
  const data = await callFMAAPI('curators', { curator_id: playlistId })
  
  if (!data.dataset || !data.dataset[0]) {
    throw new Error('Playlist not found')
  }

  return data.dataset[0]
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

    // Parse Request
    const url = new URL(req.url)
    const params = Object.fromEntries(url.searchParams.entries()) as FMARequestParams
    const action = params.action || 'search'

    // Cache Key
    const cacheKey = `fma:${action}:${JSON.stringify(params)}`
    const cachedResponse = getCachedResponse(cacheKey)
    if (cachedResponse) {
      return new Response(
        JSON.stringify({ ...cachedResponse, cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route Action
    let result: any

    switch (action) {
      case 'search':
        result = await searchTracks(params)
        break
      
      case 'get_track':
        if (!params.track_id) throw new Error('track_id required')
        result = await getTrack(params.track_id)
        break
      
      case 'get_artist':
        if (!params.artist_id) throw new Error('artist_id required')
        result = await getArtist(params.artist_id)
        break
      
      case 'get_album':
        if (!params.album_id) throw new Error('album_id required')
        result = await getAlbum(params.album_id)
        break
      
      case 'get_genres':
        result = await getGenres()
        break
      
      case 'get_playlist':
        if (!params.playlist_id) throw new Error('playlist_id required')
        result = await getPlaylist(params.playlist_id)
        break
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

    // Cache Response
    setCachedResponse(cacheKey, result)

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('FMA Edge Function Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: error instanceof Error ? error.stack : undefined,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
