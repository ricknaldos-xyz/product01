import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sportId: string; techniqueId: string }> }
) {
  try {
    const { techniqueId } = await params

    const technique = await prisma.technique.findUnique({
      where: { id: techniqueId },
      include: {
        sport: {
          select: { id: true, slug: true, name: true },
        },
        variants: {
          select: {
            id: true,
            slug: true,
            name: true,
            description: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    })

    if (!technique) {
      return NextResponse.json(
        { error: 'Tecnica no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: technique.id,
      slug: technique.slug,
      name: technique.name,
      description: technique.description,
      difficulty: technique.difficulty,
      sport: technique.sport,
      variants: technique.variants,
    })
  } catch (error) {
    console.error('Error fetching technique:', error)
    return NextResponse.json(
      { error: 'Error al obtener tecnica' },
      { status: 500 }
    )
  }
}
