import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - List sports the current user is enrolled in
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userSports = await prisma.userSport.findMany({
      where: { userId: session.user.id },
      include: {
        sport: {
          select: {
            id: true,
            slug: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const sports = userSports.map((us) => us.sport)

    return NextResponse.json(sports)
  } catch (error) {
    logger.error('Fetch user sports error:', error)
    return NextResponse.json(
      { error: 'Error al obtener deportes' },
      { status: 500 }
    )
  }
}
