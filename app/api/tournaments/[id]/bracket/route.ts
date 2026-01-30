import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - Get tournament bracket
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: {
        brackets: {
          orderBy: [{ round: 'asc' }, { position: 'asc' }],
          include: {
            match: {
              select: {
                id: true,
                score: true,
                player1Confirmed: true,
                player2Confirmed: true,
              },
            },
          },
        },
        participants: {
          include: {
            profile: {
              select: {
                id: true,
                userId: true,
                displayName: true,
                avatarUrl: true,
                skillTier: true,
              },
            },
          },
          orderBy: { seed: 'asc' },
        },
      },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      tournament: {
        id: tournament.id,
        name: tournament.name,
        status: tournament.status,
        format: tournament.format,
        maxPlayers: tournament.maxPlayers,
      },
      brackets: tournament.brackets,
      participants: tournament.participants,
    })
  } catch (error) {
    logger.error('Get bracket error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
