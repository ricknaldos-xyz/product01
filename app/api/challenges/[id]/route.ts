import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'

const updateSchema = z.object({
  action: z.enum(['accept', 'decline', 'cancel']),
  responseMessage: z.string().max(500).optional(),
})

// PATCH - Accept, decline, or cancel a challenge
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validated = updateSchema.safeParse(body)

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

    const challenge = await prisma.challenge.findUnique({
      where: { id },
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Desafio no encontrado' }, { status: 404 })
    }

    if (challenge.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Este desafio ya no esta pendiente' },
        { status: 400 }
      )
    }

    const { action, responseMessage } = validated.data

    if (action === 'cancel') {
      if (challenge.challengerId !== profile.id) {
        return NextResponse.json({ error: 'Solo puedes cancelar tus propios desafios' }, { status: 403 })
      }
      const updated = await prisma.challenge.update({
        where: { id },
        data: { status: 'CANCELLED' },
      })
      return NextResponse.json(updated)
    }

    // Accept or decline - only the challenged player can do this
    if (challenge.challengedId !== profile.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    if (action === 'decline') {
      const updated = await prisma.challenge.update({
        where: { id },
        data: {
          status: 'DECLINED',
          responseMessage,
          respondedAt: new Date(),
        },
      })
      return NextResponse.json(updated)
    }

    // Accept - create match
    const updated = await prisma.challenge.update({
      where: { id },
      data: {
        status: 'ACCEPTED',
        responseMessage,
        respondedAt: new Date(),
        match: {
          create: {
            player1Id: challenge.challengerId,
            player2Id: challenge.challengedId,
            venue: challenge.proposedVenue,
            playedAt: challenge.proposedDate,
          },
        },
      },
      include: { match: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    logger.error('Update challenge error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
