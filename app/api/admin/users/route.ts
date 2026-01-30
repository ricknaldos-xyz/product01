import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { Prisma } from '@prisma/client'

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

    const search = searchParams.get('search')?.trim() || ''
    const role = searchParams.get('role') || ''
    const accountType = searchParams.get('accountType') || ''
    const subscription = searchParams.get('subscription') || ''

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && ['USER', 'COACH', 'ADMIN'].includes(role)) {
      where.role = role as Prisma.EnumUserRoleFilter
    }

    if (accountType && ['PLAYER', 'COACH'].includes(accountType)) {
      where.accountType = accountType as Prisma.EnumAccountTypeFilter
    }

    if (subscription && ['FREE', 'PRO', 'ELITE'].includes(subscription)) {
      where.subscription = subscription as Prisma.EnumSubscriptionTierFilter
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          accountType: true,
          subscription: true,
          createdAt: true,
          lastLoginAt: true,
          _count: {
            select: {
              analyses: true,
              trainingPlans: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    logger.error('Admin users list error:', error)
    return NextResponse.json({ error: 'Error al listar usuarios' }, { status: 500 })
  }
}
