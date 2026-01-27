import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Get tournament by ID (public, no auth)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { displayName: true, avatarUrl: true },
        },
        participants: {
          include: {
            profile: {
              select: {
                displayName: true,
                avatarUrl: true,
                skillTier: true,
                effectiveScore: true,
                user: { select: { name: true } },
              },
            },
          },
          orderBy: { seed: 'asc' },
        },
        brackets: {
          include: { match: true },
          orderBy: [{ round: 'asc' }, { position: 'asc' }],
        },
        _count: { select: { participants: true } },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    return NextResponse.json(tournament)
  } catch (error) {
    console.error('Get tournament error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
