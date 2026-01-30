import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// POST - Block a profile
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { profileId } = await params

    const myProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!myProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    if (myProfile.id === profileId) {
      return NextResponse.json({ error: 'No puedes bloquearte a ti mismo' }, { status: 400 })
    }

    await prisma.block.create({
      data: {
        blockerId: myProfile.id,
        blockedId: profileId,
      },
    })

    return NextResponse.json({ blocked: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya bloqueaste a este usuario' }, { status: 400 })
    }
    logger.error('Block error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Unblock a profile
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ profileId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { profileId } = await params

    const myProfile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!myProfile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    await prisma.block.deleteMany({
      where: {
        blockerId: myProfile.id,
        blockedId: profileId,
      },
    })

    return NextResponse.json({ blocked: false })
  } catch (error) {
    logger.error('Unblock error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
