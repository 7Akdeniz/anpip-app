/**
 * MIXKIT API - Get Track by ID
 * GET /api/music/mixkit/[id]
 */

// @ts-ignore - Next.js API routes are optional for Expo projects
import { NextRequest, NextResponse } from 'next/server'
import { mixkitService } from '@/lib/mixkit-service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const track = await mixkitService.getTrackById(id)

    if (!track) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found',
        },
        { status: 404 }
      )
    }

    // Track play analytics
    await mixkitService.trackAction(id, 'preview')

    return NextResponse.json({
      success: true,
      data: track,
    })

  } catch (error) {
    console.error('Mixkit Get Track API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch track',
      },
      { status: 500 }
    )
  }
}
