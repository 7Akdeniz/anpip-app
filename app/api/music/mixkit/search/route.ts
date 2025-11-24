/**
 * MIXKIT API - Search Tracks
 * GET /api/music/mixkit/search
 * 
 * Query Params:
 * - q: Search query
 * - genre: Filter by genre
 * - mood: Filter by mood
 * - tags: Comma-separated tags
 * - minBpm: Minimum BPM
 * - maxBpm: Maximum BPM
 * - limit: Results per page
 * - offset: Pagination
 */

// @ts-ignore - Next.js API routes are optional for Expo projects
import { NextRequest, NextResponse } from 'next/server'
import { mixkitService } from '@/lib/mixkit-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const query = searchParams.get('q') || undefined
    const genre = searchParams.get('genre') || undefined
    const mood = searchParams.get('mood') || undefined
    const tagsParam = searchParams.get('tags')
    const tags = tagsParam ? tagsParam.split(',') : undefined
    const minBpm = searchParams.get('minBpm')
      ? parseInt(searchParams.get('minBpm')!)
      : undefined
    const maxBpm = searchParams.get('maxBpm')
      ? parseInt(searchParams.get('maxBpm')!)
      : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const result = await mixkitService.searchTracks({
      query,
      genre,
      mood,
      tags,
      minBpm,
      maxBpm,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: result.tracks,
      meta: {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        hasMore: result.hasMore,
      },
    })

  } catch (error) {
    console.error('Mixkit Search API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Search failed',
      },
      { status: 500 }
    )
  }
}
