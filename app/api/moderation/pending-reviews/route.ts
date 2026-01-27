import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Get pending peer reviews (auth required)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    const pendingVerifications = await prisma.analysisVerification.findMany({
      where: {
        status: 'PENDING_REVIEW',
        analysis: {
          userId: { not: userId },
        },
        peerReviews: {
          none: {
            reviewerId: userId,
          },
        },
      },
      take: 5,
      include: {
        analysis: {
          select: {
            id: true,
            mediaItems: {
              where: { type: 'VIDEO' },
              select: { url: true },
              take: 1,
            },
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const result = pendingVerifications.map((v) => ({
      id: v.id,
      analysisId: v.analysis.id,
      videoUrl: v.analysis.mediaItems[0]?.url || null,
      userName: v.analysis.user.name,
      createdAt: v.createdAt,
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('Pending reviews error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
