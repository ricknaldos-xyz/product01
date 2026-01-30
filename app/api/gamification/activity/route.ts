import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get last 365 days of activity
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 365)

    const activities = await prisma.activityLog.findMany({
      where: {
        userId: session.user.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(activities)
  } catch (error) {
    logger.error('Get activity error:', error)
    return NextResponse.json(
      { error: 'Error al obtener actividad' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { type } = await request.json() // 'analysis' or 'exercise'

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Upsert activity log for today
    const activity = await prisma.activityLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        analysisCount: type === 'analysis' ? { increment: 1 } : undefined,
        exerciseCount: type === 'exercise' ? { increment: 1 } : undefined,
      },
      create: {
        userId: session.user.id,
        date: today,
        analysisCount: type === 'analysis' ? 1 : 0,
        exerciseCount: type === 'exercise' ? 1 : 0,
      },
    })

    // Also update streak (best-effort, don't crash if it fails)
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL
      await fetch(`${baseUrl}/api/gamification/streak`, {
        method: 'POST',
        headers: {
          Cookie: request.headers.get('cookie') || '',
        },
      })
    } catch (streakError) {
      logger.error('Failed to update streak:', streakError)
    }

    return NextResponse.json(activity)
  } catch (error) {
    logger.error('Log activity error:', error)
    return NextResponse.json(
      { error: 'Error al registrar actividad' },
      { status: 500 }
    )
  }
}
