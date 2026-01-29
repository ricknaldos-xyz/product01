import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get 1-3 recommended coaches for the current user
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get the user's city from their player profile
    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { city: true },
    })

    const selectFields = {
      id: true,
      userId: true,
      headline: true,
      specialties: true,
      yearsExperience: true,
      city: true,
      hourlyRate: true,
      currency: true,
      averageRating: true,
      totalReviews: true,
      verificationStatus: true,
      user: {
        select: { name: true, image: true },
      },
    } as const

    const baseWhere = {
      isAvailable: true,
      verificationStatus: 'VERIFIED' as const,
    }

    const baseOrderBy = [
      { averageRating: 'desc' as const },
      { totalReviews: 'desc' as const },
    ]

    // Try to find coaches in the same city first
    let coaches = playerProfile?.city
      ? await prisma.coachProfile.findMany({
          where: { ...baseWhere, city: playerProfile.city },
          orderBy: baseOrderBy,
          take: 3,
          select: selectFields,
        })
      : []

    // If no coaches in the same city, find top rated coaches anywhere
    if (coaches.length === 0) {
      coaches = await prisma.coachProfile.findMany({
        where: baseWhere,
        orderBy: baseOrderBy,
        take: 3,
        select: selectFields,
      })
    }

    return NextResponse.json({ coaches })
  } catch (error) {
    console.error('Recommend coaches error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
