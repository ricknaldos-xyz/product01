import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// GET - List user's orders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const paginated = searchParams.has('page')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where = { userId: session.user.id }
    const include = {
      items: {
        include: {
          product: {
            select: {
              name: true,
              thumbnailUrl: true,
            },
          },
        },
      },
    }

    if (!paginated) {
      const orders = await prisma.shopOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
      })
      return NextResponse.json({ orders })
    }

    const [orders, total] = await Promise.all([
      prisma.shopOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include,
        skip,
        take: limit,
      }),
      prisma.shopOrder.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    logger.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
