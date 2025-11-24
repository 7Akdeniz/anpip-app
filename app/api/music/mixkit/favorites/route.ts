/**
 * MIXKIT API - Favorites
 * GET /api/music/mixkit/favorites - Get user favorites
 * POST /api/music/mixkit/favorites - Add to favorites
 * DELETE /api/music/mixkit/favorites - Remove from favorites
 */

// @ts-ignore - Next.js API routes are optional for Expo projects
import { NextRequest, NextResponse } from 'next/server'
import { mixkitService } from '@/lib/mixkit-service'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const favorites = await mixkitService.getFavorites(user.id)

    return NextResponse.json({
      success: true,
      data: favorites,
    })

  } catch (error) {
    console.error('Get Favorites Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch favorites' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { trackId } = body

    if (!trackId) {
      return NextResponse.json(
        { success: false, error: 'trackId required' },
        { status: 400 }
      )
    }

    const track = await mixkitService.getTrackById(trackId)
    if (!track) {
      return NextResponse.json(
        { success: false, error: 'Track not found' },
        { status: 404 }
      )
    }

    await mixkitService.addToFavorites(track)
    await mixkitService.trackAction(trackId, 'favorite')

    return NextResponse.json({
      success: true,
      message: 'Added to favorites',
    })

  } catch (error) {
    console.error('Add Favorite Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('trackId')

    if (!trackId) {
      return NextResponse.json(
        { success: false, error: 'trackId required' },
        { status: 400 }
      )
    }

    await mixkitService.removeFromFavorites(trackId)

    return NextResponse.json({
      success: true,
      message: 'Removed from favorites',
    })

  } catch (error) {
    console.error('Remove Favorite Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    )
  }
}
