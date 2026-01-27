import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    await prisma.block.create({
      data: {
        blockerId: session.user.id,
        blockedId: profileId,
      },
    })

    return NextResponse.json({ blocked: true }, { status: 201 })
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Ya bloqueaste a este usuario' }, { status: 400 })
    }
    console.error('Block error:', error)
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

    await prisma.block.deleteMany({
      where: {
        blockerId: session.user.id,
        blockedId: profileId,
      },
    })

    return NextResponse.json({ blocked: false })
  } catch (error) {
    console.error('Unblock error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
