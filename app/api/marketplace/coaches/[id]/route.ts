import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Public coach profile
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const coach = await prisma.coachProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, image: true },
        },
        reviews: {
          select: {
            rating: true,
            comment: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { students: true, reviews: true },
        },
      },
    })

    if (!coach) {
      return NextResponse.json({ error: 'Entrenador no encontrado' }, { status: 404 })
    }

    return NextResponse.json(coach)
  } catch (error) {
    console.error('Get coach profile error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
