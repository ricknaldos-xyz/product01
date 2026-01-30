import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      newUsersThisWeek,
      newUsersThisMonth,
      totalAnalyses,
      completedAnalyses,
      analysesThisWeek,
      totalCoaches,
      verifiedCoaches,
      subscriptionFree,
      subscriptionPro,
      subscriptionElite,
      accountPlayer,
      accountCoach,
      totalTournaments,
      totalMatches,
      totalChallenges,
      totalShopOrders,
      totalStringingOrders,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: oneMonthAgo } } }),
      prisma.analysis.count(),
      prisma.analysis.count({ where: { status: 'COMPLETED' } }),
      prisma.analysis.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      prisma.coachProfile.count(),
      prisma.coachProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.user.count({ where: { subscription: 'FREE' } }),
      prisma.user.count({ where: { subscription: 'PRO' } }),
      prisma.user.count({ where: { subscription: 'ELITE' } }),
      prisma.user.count({ where: { accountType: 'PLAYER' } }),
      prisma.user.count({ where: { accountType: 'COACH' } }),
      prisma.tournament.count(),
      prisma.match.count(),
      prisma.challenge.count(),
      prisma.shopOrder.count(),
      prisma.stringingOrder.count(),
    ])

    return NextResponse.json({
      totalUsers,
      newUsersThisWeek,
      newUsersThisMonth,
      totalAnalyses,
      completedAnalyses,
      analysesThisWeek,
      totalCoaches,
      verifiedCoaches,
      subscriptionBreakdown: {
        FREE: subscriptionFree,
        PRO: subscriptionPro,
        ELITE: subscriptionElite,
      },
      accountTypeBreakdown: {
        PLAYER: accountPlayer,
        COACH: accountCoach,
      },
      totalTournaments,
      totalMatches,
      totalChallenges,
      totalShopOrders,
      totalStringingOrders,
    })
  } catch (error) {
    logger.error('Admin analytics error:', error)
    return NextResponse.json(
      { error: 'Error al obtener analiticas' },
      { status: 500 }
    )
  }
}
