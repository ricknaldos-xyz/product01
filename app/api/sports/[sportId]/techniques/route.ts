import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sportId: string }> }
) {
  try {
    const { sportId } = await params

    const sport = await prisma.sport.findUnique({
      where: { id: sportId },
      include: {
        techniques: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
            difficulty: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!sport) {
      return NextResponse.json(
        { error: 'Deporte no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      sport: {
        id: sport.id,
        slug: sport.slug,
        name: sport.name,
      },
      techniques: sport.techniques,
    })
  } catch (error) {
    console.error('Error fetching techniques:', error)
    return NextResponse.json(
      { error: 'Error al obtener tecnicas' },
      { status: 500 }
    )
  }
}
