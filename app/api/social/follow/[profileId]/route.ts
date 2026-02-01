import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { isBlocked } from '@/lib/blocks'
import { createNotification } from '@/lib/notifications'
import { socialWriteLimiter } from '@/lib/rate-limit'
import { validateId } from '@/lib/validation'

// POST - Follow a player
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await socialWriteLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const { profileId: targetProfileId } = await params

    if (!validateId(targetProfileId)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const myProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!myProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    if (myProfile.id === targetProfileId) {
      return NextResponse.json({ error: 'No puedes seguirte a ti mismo' }, { status: 400 })
    }

    const targetProfile = await prisma.playerProfile.findUnique({
      where: { id: targetProfileId },
      select: { id: true, userId: true },
    })

    if (!targetProfile) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 })
    }

    // Check if blocked
    if (await isBlocked(myProfile.id, targetProfileId)) {
      return NextResponse.json({ error: 'No puedes realizar esta accion' }, { status: 403 })
    }

    // Create follow + update counts atomically in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.follow.create({
        data: {
          followerId: myProfile.id,
          followingId: targetProfileId,
        },
      })

      await tx.playerProfile.update({
        where: { id: myProfile.id },
        data: { followingCount: { increment: 1 } },
      })

      await tx.playerProfile.update({
        where: { id: targetProfileId },
        data: { followersCount: { increment: 1 } },
      })
    })

    // Notify
    createNotification({
      userId: targetProfile.userId,
      type: 'NEW_FOLLOWER',
      title: 'Nuevo seguidor',
      body: 'Alguien empezo a seguir tu perfil',
      referenceId: myProfile.id,
      referenceType: 'profile',
    }).catch((e) => logger.error('Failed to create new follower notification', e))

    return NextResponse.json({ followed: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya sigues a este jugador' }, { status: 400 })
    }
    logger.error('Follow error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Unfollow a player
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await socialWriteLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const { profileId: targetProfileId } = await params

    if (!validateId(targetProfileId)) {
      return NextResponse.json({ error: 'ID invalido' }, { status: 400 })
    }

    const myProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!myProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    // Delete follow + decrement counts atomically; only decrement if record existed
    await prisma.$transaction(async (tx) => {
      const deleted = await tx.follow.deleteMany({
        where: {
          followerId: myProfile.id,
          followingId: targetProfileId,
        },
      })

      if (deleted.count === 0) {
        throw new Error('NOT_FOLLOWING')
      }

      await tx.playerProfile.update({
        where: { id: myProfile.id },
        data: { followingCount: { decrement: 1 } },
      })

      await tx.playerProfile.update({
        where: { id: targetProfileId },
        data: { followersCount: { decrement: 1 } },
      })
    })

    return NextResponse.json({ followed: false })
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOLLOWING') {
      return NextResponse.json({ error: 'No sigues a este jugador' }, { status: 400 })
    }
    logger.error('Unfollow error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
