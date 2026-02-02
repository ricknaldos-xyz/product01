import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const sportSlug = searchParams.get('sport') || 'tennis'

    const sportFilter = { technique: { sport: { slug: sportSlug } } }

    // Get last 30 days of data
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get analyses with scores
    const analyses = await prisma.analysis.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        overallScore: { not: null },
        ...sportFilter,
      },
      select: {
        overallScore: true,
        createdAt: true,
        technique: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get progress logs
    const progressLogs = await prisma.progressLog.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo },
        completed: true,
        exercise: { trainingPlan: { analysis: sportFilter } },
      },
      select: {
        date: true,
      },
      orderBy: { date: 'asc' },
    })

    // Get daily analysis counts
    const analysesLast30Days = await prisma.analysis.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo },
        ...sportFilter,
      },
      select: {
        createdAt: true,
      },
    })

    // Format score data for chart
    const scoreData = analyses.map((a) => ({
      technique: a.technique.name.length > 10
        ? a.technique.name.substring(0, 10) + '...'
        : a.technique.name,
      score: a.overallScore || 0,
      date: a.createdAt.toISOString().split('T')[0],
    })).reverse()

    // Score progression over time (up to 30 analyses for line chart)
    const progressionAnalyses = await prisma.analysis.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        overallScore: { not: null },
        ...sportFilter,
      },
      select: {
        overallScore: true,
        createdAt: true,
        technique: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 30,
    })

    const progressionData = progressionAnalyses.map((a) => ({
      date: a.createdAt.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      fullDate: a.createdAt.toISOString().split('T')[0],
      score: a.overallScore || 0,
      technique: a.technique.name,
    }))

    // Group progress by day
    const progressByDay: Record<string, number> = {}
    progressLogs.forEach((log) => {
      const dateStr = log.date.toISOString().split('T')[0]
      progressByDay[dateStr] = (progressByDay[dateStr] || 0) + 1
    })

    // Group analyses by day
    const analysesByDay: Record<string, number> = {}
    analysesLast30Days.forEach((a) => {
      const dateStr = a.createdAt.toISOString().split('T')[0]
      analysesByDay[dateStr] = (analysesByDay[dateStr] || 0) + 1
    })

    // Create activity data for last 14 days
    const activityData = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const displayDate = date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      })

      activityData.push({
        date: displayDate,
        analyses: analysesByDay[dateStr] || 0,
        exercises: progressByDay[dateStr] || 0,
      })
    }

    // Create progress data for last 14 days
    const progressData = []
    let cumulative = 0
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const displayDate = date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      })

      cumulative += progressByDay[dateStr] || 0

      progressData.push({
        date: displayDate,
        completed: cumulative,
        total: cumulative,
      })
    }

    return NextResponse.json({
      scoreData,
      activityData,
      progressData,
      progressionData,
    })
  } catch (error) {
    logger.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadisticas' },
      { status: 500 }
    )
  }
}
