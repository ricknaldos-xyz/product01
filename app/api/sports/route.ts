import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const sports = await prisma.sport.findMany({
      orderBy: { order: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        isActive: true,
      },
    })

    return NextResponse.json(sports)
  } catch (error) {
    logger.error('Error fetching sports:', error)
    return NextResponse.json(
      { error: 'Error al obtener deportes' },
      { status: 500 }
    )
  }
}
