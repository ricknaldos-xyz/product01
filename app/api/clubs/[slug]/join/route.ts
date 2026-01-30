import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// POST - Join a club
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { slug } = await params

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const club = await prisma.club.findUnique({
      where: { slug },
      include: { _count: { select: { members: true } } },
    })

    if (!club) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    if (club._count.members >= club.maxMembers) {
      return NextResponse.json({ error: 'El club esta lleno' }, { status: 400 })
    }

    await prisma.clubMember.create({
      data: {
        clubId: club.id,
        profileId: profile.id,
        role: 'member',
      },
    })

    return NextResponse.json({ joined: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya eres miembro de este club' }, { status: 400 })
    }
    logger.error('Join club error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Leave a club
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { slug } = await params

    const profile = await prisma.playerProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 })
    }

    const club = await prisma.club.findUnique({
      where: { slug },
      select: { id: true, ownerId: true },
    })

    if (!club) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    if (club.ownerId === profile.id) {
      return NextResponse.json({ error: 'El dueno no puede abandonar el club' }, { status: 400 })
    }

    await prisma.clubMember.delete({
      where: {
        clubId_profileId: {
          clubId: club.id,
          profileId: profile.id,
        },
      },
    })

    return NextResponse.json({ joined: false })
  } catch (error) {
    logger.error('Leave club error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
