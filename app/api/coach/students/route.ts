import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CoachStudentStatus } from '@prisma/client'

// GET - List coach's students
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!coachProfile) {
      return NextResponse.json({ error: 'No eres entrenador' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '50')))
    const skip = (page - 1) * limit

    const where = {
      coachId: coachProfile.id,
      status: { in: [CoachStudentStatus.PENDING_INVITE, CoachStudentStatus.PENDING_REQUEST, CoachStudentStatus.ACTIVE, CoachStudentStatus.PAUSED] },
    }

    const [students, total] = await Promise.all([
      prisma.coachStudent.findMany({
        where,
        include: {
          student: {
            select: {
              userId: true,
              displayName: true,
              avatarUrl: true,
              skillTier: true,
              compositeScore: true,
              totalAnalyses: true,
              totalTechniques: true,
              user: { select: { name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coachStudent.count({ where }),
    ])

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('List students error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
