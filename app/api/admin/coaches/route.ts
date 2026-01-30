import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { CoachVerificationStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit
    const statusFilter = searchParams.get('status') as CoachVerificationStatus | null

    const where = statusFilter
      ? { verificationStatus: statusFilter }
      : {}

    const [coaches, total] = await Promise.all([
      prisma.coachProfile.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { students: true } },
        },
        orderBy: [
          { verificationStatus: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.coachProfile.count({ where }),
    ])

    return NextResponse.json({
      data: coaches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Admin coaches list error:', error)
    return NextResponse.json({ error: 'Error al listar coaches' }, { status: 500 })
  }
}
