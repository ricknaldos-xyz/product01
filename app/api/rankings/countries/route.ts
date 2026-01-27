import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - List distinct countries with ranked players
export async function GET(_request: NextRequest) {
  try {
    const countries = await prisma.playerProfile.groupBy({
      by: ['country'],
      where: {
        compositeScore: { not: null },
      },
      _count: {
        country: true,
      },
      orderBy: {
        _count: {
          country: 'desc',
        },
      },
    })

    const result = countries.map((entry) => ({
      country: entry.country,
      count: entry._count.country,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Get ranking countries error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
