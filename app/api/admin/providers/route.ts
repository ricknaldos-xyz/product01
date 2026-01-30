import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { ProviderStatus, ProviderType } from '@prisma/client'

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
    const statusFilter = searchParams.get('status') as ProviderStatus | null
    const typeFilter = searchParams.get('type') as ProviderType | null

    const where: Record<string, unknown> = {}
    if (statusFilter) where.status = statusFilter
    if (typeFilter) where.type = typeFilter

    const [applications, total] = await Promise.all([
      prisma.providerApplication.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.providerApplication.count({ where }),
    ])

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Admin providers list error:', error)
    return NextResponse.json(
      { error: 'Error al listar solicitudes de proveedores' },
      { status: 500 }
    )
  }
}
