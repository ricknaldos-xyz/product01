import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'
import { TournamentStatus } from '@prisma/client'

const updateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  status: z.nativeEnum(TournamentStatus).optional(),
  maxPlayers: z.number().int().min(2).optional(),
  venue: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  registrationEnd: z.string().datetime().optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            displayName: true,
            avatarUrl: true,
            user: { select: { name: true, email: true } },
          },
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
    logger.error('Admin get tournament error:', error)
    return NextResponse.json({ error: 'Error al obtener torneo' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }
    const body = await request.json()

    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.tournament.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    const data: Record<string, unknown> = { ...parsed.data }

    if (data.startDate) data.startDate = new Date(data.startDate as string)
    if (data.endDate) data.endDate = new Date(data.endDate as string)
    if (data.registrationEnd) data.registrationEnd = new Date(data.registrationEnd as string)

    const tournament = await prisma.tournament.update({
      where: { id },
      data,
      include: {
        organizer: {
          select: {
            displayName: true,
            avatarUrl: true,
            user: { select: { name: true, email: true } },
          },
        },
        _count: { select: { participants: true } },
      },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    logger.error('Admin update tournament error:', error)
    return NextResponse.json({ error: 'Error al actualizar torneo' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const existing = await prisma.tournament.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Torneo no encontrado' }, { status: 404 })
    }

    const tournament = await prisma.tournament.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json(tournament)
  } catch (error) {
    logger.error('Admin delete tournament error:', error)
    return NextResponse.json({ error: 'Error al cancelar torneo' }, { status: 500 })
  }
}
