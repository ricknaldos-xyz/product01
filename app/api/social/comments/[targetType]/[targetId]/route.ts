import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - List comments for a target
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ targetType: string; targetId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { targetType, targetId } = await params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: {
          targetId,
          targetType,
          isHidden: false,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        include: {
          author: {
            select: {
              userId: true,
              displayName: true,
              avatarUrl: true,
              skillTier: true,
              user: { select: { name: true, image: true } },
            },
          },
        },
      }),
      prisma.comment.count({
        where: {
          targetId,
          targetType,
          isHidden: false,
        },
      }),
    ])

    return NextResponse.json({ comments, total, limit, offset })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
