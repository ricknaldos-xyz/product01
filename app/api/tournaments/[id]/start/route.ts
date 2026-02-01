import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { generateBracket } from '@/lib/tournaments'
import { validateId } from '@/lib/validation'

// POST - Start tournament (generate bracket)
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

    if (!validateId(tournamentId)) {
      return NextResponse.json({ error: 'ID de torneo invalido' }, { status: 400 })
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, status: true, organizerId: true },
    })

    if (!tournament) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    if (tournament.organizerId !== profile.id) {
      return NextResponse.json({ error: 'Solo el organizador puede iniciar el torneo' }, { status: 403 })
    }

    if (tournament.status !== 'REGISTRATION') {
      return NextResponse.json(
        { error: 'El torneo no puede ser iniciado en su estado actual' },
        { status: 400 }
      )
    }

    await generateBracket(tournamentId)

    return NextResponse.json({ message: 'Torneo iniciado y bracket generado' })
  } catch (error) {
    logger.error('Start tournament error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
