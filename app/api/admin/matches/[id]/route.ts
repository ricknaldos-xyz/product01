import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError, validateId } from '@/lib/validation'

export async function GET(
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

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        player1: {
          include: { user: { select: { name: true, email: true, image: true } } },
        },
        player2: {
          include: { user: { select: { name: true, email: true, image: true } } },
        },
        challenge: true,
        ratings: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
    }

    return NextResponse.json(match)
  } catch (error) {
    logger.error('Admin match detail error:', error)
    return NextResponse.json({ error: 'Error al obtener partido' }, { status: 500 })
  }
}

const updateMatchSchema = z.object({
  player1Result: z.enum(['WIN', 'LOSS', 'NO_SHOW']).nullable().optional(),
  player2Result: z.enum(['WIN', 'LOSS', 'NO_SHOW']).nullable().optional(),
  score: z.string().nullable().optional(),
  player1EloChange: z.number().int().nullable().optional(),
  player2EloChange: z.number().int().nullable().optional(),
  player1Confirmed: z.boolean().optional(),
  player2Confirmed: z.boolean().optional(),
})

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
    const parsed = updateMatchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 }
      )
    }

    const existing = await prisma.match.findUnique({
      where: { id },
      include: { player1: true, player2: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
    }

    const data = parsed.data

    // Build match update data
    const matchUpdateData: Record<string, unknown> = {}
    if (data.player1Result !== undefined) matchUpdateData.player1Result = data.player1Result
    if (data.player2Result !== undefined) matchUpdateData.player2Result = data.player2Result
    if (data.score !== undefined) matchUpdateData.score = data.score
    if (data.player1EloChange !== undefined) matchUpdateData.player1EloChange = data.player1EloChange
    if (data.player2EloChange !== undefined) matchUpdateData.player2EloChange = data.player2EloChange
    if (data.player1Confirmed !== undefined) matchUpdateData.player1Confirmed = data.player1Confirmed
    if (data.player2Confirmed !== undefined) matchUpdateData.player2Confirmed = data.player2Confirmed

    // Use a transaction to update match and player profiles atomically
    const updatedMatch = await prisma.$transaction(async (tx) => {
      // Update player1 Elo if EloChange provided
      if (data.player1EloChange !== undefined && data.player1EloChange !== null) {
        // Calculate the delta: new EloChange minus the old one (if it existed)
        const oldP1EloChange = existing.player1EloChange || 0
        const eloDelta = data.player1EloChange - oldP1EloChange

        if (eloDelta !== 0) {
          await tx.playerProfile.update({
            where: { id: existing.player1Id },
            data: { matchElo: { increment: eloDelta } },
          })
        }
      }

      // Update player2 Elo if EloChange provided
      if (data.player2EloChange !== undefined && data.player2EloChange !== null) {
        const oldP2EloChange = existing.player2EloChange || 0
        const eloDelta = data.player2EloChange - oldP2EloChange

        if (eloDelta !== 0) {
          await tx.playerProfile.update({
            where: { id: existing.player2Id },
            data: { matchElo: { increment: eloDelta } },
          })
        }
      }

      // Update the match
      return tx.match.update({
        where: { id },
        data: matchUpdateData,
        include: {
          player1: {
            include: { user: { select: { name: true, email: true, image: true } } },
          },
          player2: {
            include: { user: { select: { name: true, email: true, image: true } } },
          },
          challenge: true,
          ratings: true,
        },
      })
    })

    return NextResponse.json(updatedMatch)
  } catch (error) {
    logger.error('Admin match update error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar partido' },
      { status: 500 }
    )
  }
}
