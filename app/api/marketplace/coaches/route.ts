import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Browse coaches (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const country = searchParams.get('country') || 'PE'
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const skip = (page - 1) * limit

    const where = {
      isAvailable: true,
      verificationStatus: 'VERIFIED' as const,
      ...(country ? { country } : {}),
      ...(city ? { city } : {}),
    }

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        where,
        orderBy: [{ averageRating: 'desc' }, { totalReviews: 'desc' }],
        skip,
        take: limit,
        select: {
          id: true,
          userId: true,
          headline: true,
          bio: true,
          certifications: true,
          yearsExperience: true,
          specialties: true,
          country: true,
          city: true,
          hourlyRate: true,
          currency: true,
          averageRating: true,
          totalReviews: true,
          verificationStatus: true,
          user: {
            select: { name: true, image: true },
          },
          _count: { select: { students: true } },
        },
      }),
      prisma.coachProfile.count({ where }),
    ])

    return NextResponse.json({
      coaches,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    logger.error('Browse coaches error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
