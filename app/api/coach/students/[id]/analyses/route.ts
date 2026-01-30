import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - View a student's analyses (coach only)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id: coachStudentId } = await params

    const coachProfile = await prisma.coachProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!coachProfile) {
      return NextResponse.json({ error: 'No eres entrenador' }, { status: 403 })
    }

    const relation = await prisma.coachStudent.findUnique({
      where: { id: coachStudentId },
      include: {
        student: { select: { userId: true } },
      },
    })

    if (!relation || relation.coachId !== coachProfile.id) {
      return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
    }

    if (!relation.canViewAnalyses) {
      return NextResponse.json({ error: 'Sin permiso para ver analisis' }, { status: 403 })
    }

    const analyses = await prisma.analysis.findMany({
      where: {
        userId: relation.student.userId,
        status: 'COMPLETED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        technique: {
          select: { name: true, slug: true },
        },
        issues: {
          orderBy: { severity: 'desc' },
          take: 5,
        },
      },
    })

    return NextResponse.json(analyses)
  } catch (error) {
    logger.error('Get student analyses error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
