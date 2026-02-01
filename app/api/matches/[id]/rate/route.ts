import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { validateId } from '@/lib/validation'
import { z } from 'zod'

const ratingSchema = z.object({
  sportsmanship: z.number().int().min(1).max(5),
  punctuality: z.number().int().min(1).max(5),
  skillAccuracy: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

// POST - Rate opponent after a match
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    if (!validateId(id)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const body = await request.json()
    const validated = ratingSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      )
    }

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const match = await prisma.match.findUnique({ where: { id } })

    if (!match) {
      return NextResponse.json({ error: 'Partido no encontrado' }, { status: 404 })
    }

    const isPlayer1 = match.player1Id === profile.id
    const isPlayer2 = match.player2Id === profile.id

    if (!isPlayer1 && !isPlayer2) {
      return NextResponse.json({ error: 'No eres parte de este partido' }, { status: 403 })
    }

    const ratedId = isPlayer1 ? match.player2Id : match.player1Id

    const rating = await prisma.$transaction(async (tx) => {
      const newRating = await tx.matchRating.create({
        data: {
          matchId: id,
          raterId: profile.id,
          ratedId,
          ...validated.data,
        },
      })

      // Update sportsmanship rating on rated player's profile using aggregate
      const ratingAgg = await tx.matchRating.aggregate({
        where: { ratedId },
        _avg: { sportsmanship: true, punctuality: true, skillAccuracy: true },
        _count: { _all: true },
      })

      await tx.playerProfile.update({
        where: { id: ratedId },
        data: {
          sportsmanshipRating: ratingAgg._avg.sportsmanship ?? 0,
          totalRatings: ratingAgg._count._all,
        },
      })

      return newRating
    })

    return NextResponse.json(rating, { status: 201 })
  } catch (error) {
    logger.error('Rate match error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
