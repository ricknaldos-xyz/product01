import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Public stats (no auth required)
export async function GET() {
  try {
    const [players, analyses, matches, coaches] = await Promise.all([
      prisma.playerProfile.count(),
      prisma.analysis.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.match.count(),
      prisma.coachProfile.count(),
    ])

    return NextResponse.json({
      players,
      analyses,
      matches,
      coaches,
    })
  } catch (error) {
    logger.error('Public stats error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
