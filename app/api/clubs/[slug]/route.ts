import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Club detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const club = await prisma.club.findUnique({
      where: { slug },
      include: {
        owner: {
          select: { userId: true, displayName: true, avatarUrl: true, skillTier: true },
        },
        members: {
          include: {
            profile: {
              select: {
                userId: true,
                displayName: true,
                avatarUrl: true,
                skillTier: true,
                compositeScore: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        _count: { select: { members: true } },
      },
    })

    if (!club) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    return NextResponse.json(club)
  } catch (error) {
    logger.error('Get club error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
