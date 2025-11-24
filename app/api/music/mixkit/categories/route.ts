/**
 * MIXKIT API - Categories (Genres & Moods)
 * GET /api/music/mixkit/categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { mixkitService } from '@/lib/mixkit-service'

export async function GET(request: NextRequest) {
  try {
    const [genres, moods] = await Promise.all([
      mixkitService.getGenres(),
      mixkitService.getMoods(),
    ])

    return NextResponse.json({
      success: true,
      data: {
        genres,
        moods,
      },
    })

  } catch (error) {
    console.error('Mixkit Categories API Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch categories',
      },
      { status: 500 }
    )
  }
}
