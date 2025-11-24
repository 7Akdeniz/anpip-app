/**
 * MIXKIT API - List Tracks
 * GET /api/music/mixkit/list
 * 
 * Query Params:
 * - genre: Filter by genre
 * - mood: Filter by mood
 * - limit: Results per page (default: 50)
 * - offset: Pagination offset
 * - sort: Sort by (popular, recent, title)
 */

// @ts-ignore - Next.js API routes are optional for Expo projects
import { NextRequest, NextResponse } from 'next/server'
import { mixkitService } from '@/lib/mixkit-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const genre = searchParams.get('genre') || undefined
    const mood = searchParams.get('mood') || undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'recent'

    // Get tracks based on sort
    let tracks

    switch (sort) {
      case 'popular':
        tracks = await mixkitService.getPopularTracks(limit)
        break
      case 'recent':
        tracks = await mixkitService.getRecentlyAdded(limit)
        break
      default:
        const result = await mixkitService.searchTracks({
          genre,
          mood,
          limit,
          offset,
        })
        tracks = result.tracks
    }

    return NextResponse.json({
      success: true,
      data: tracks,
      meta: {
        total: tracks.length,
        limit,
        offset,
        hasMore: tracks.length === limit,
      },
    })

  } catch (error) {
    console.error('Mixkit List API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tracks',
      },
      { status: 500 }
    )
  }
}
