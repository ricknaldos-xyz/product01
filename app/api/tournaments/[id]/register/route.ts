import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isPlayerTierAllowed } from '@/lib/tiers'

// POST - Register for tournament
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: tournamentId } = await params

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true, skillTier: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { participants: true } } },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json({ error: 'El registro esta cerrado' }, { status: 400 })
    }

    if (new Date() > tournament.registrationEnd) {
      return NextResponse.json({ error: 'El plazo de inscripcion termino' }, { status: 400 })
    }

    if (tournament._count.participants >= tournament.maxPlayers) {
      return NextResponse.json({ error: 'El torneo esta lleno' }, { status: 400 })
    }

    // Validate skill tier requirements
    if (!isPlayerTierAllowed(profile.skillTier, tournament.minTier, tournament.maxTier)) {
      const playerTierIndex = ['BRONCE', 'PLATA', 'ORO', 'PLATINO', 'DIAMANTE'].indexOf(profile.skillTier)
      const minIndex = tournament.minTier ? ['BRONCE', 'PLATA', 'ORO', 'PLATINO', 'DIAMANTE'].indexOf(tournament.minTier) : -1
      if (tournament.minTier && playerTierIndex < minIndex) {
        return NextResponse.json({ error: 'Tu nivel es menor al requerido' }, { status: 403 })
      }
      return NextResponse.json({ error: 'Tu nivel excede el maximo permitido' }, { status: 403 })
    }

    const participant = await prisma.tournamentParticipant.create({
      data: {
        tournamentId,
        profileId: profile.id,
      },
    })

    return NextResponse.json(participant, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya estas inscrito' }, { status: 400 })
    }
    logger.error('Tournament register error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
