import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { BadgeType } from '@prisma/client'
import { BADGE_DEFINITIONS } from '@/lib/badges'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      orderBy: { earnedAt: 'desc' },
    })

    // Add badge definitions to each badge
    const badgesWithDefinitions = badges.map((badge) => ({
      ...badge,
      definition: BADGE_DEFINITIONS[badge.badgeType],
    }))

    return NextResponse.json(badgesWithDefinitions)
  } catch (error) {
    logger.error('Get badges error:', error)
    return NextResponse.json(
      { error: 'Error al obtener badges' },
      { status: 500 }
    )
  }
}

// Check and award badges
export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const newBadges: BadgeType[] = []

    // Get user's existing badges
    const existingBadges = await prisma.userBadge.findMany({
      where: { userId },
      select: { badgeType: true },
    })
    const earnedTypes = new Set(existingBadges.map((b) => b.badgeType))

    // Check FIRST_ANALYSIS
    if (!earnedTypes.has('FIRST_ANALYSIS')) {
      const analysisCount = await prisma.analysis.count({
        where: { userId, status: 'COMPLETED' },
      })
      if (analysisCount >= 1) {
        newBadges.push('FIRST_ANALYSIS')
      }
    }

    // Check PLAN_COMPLETED
    if (!earnedTypes.has('PLAN_COMPLETED')) {
      const completedPlans = await prisma.trainingPlan.count({
        where: { userId, status: 'COMPLETED' },
      })
      if (completedPlans >= 1) {
        newBadges.push('PLAN_COMPLETED')
      }
    }

    // Check IMPROVEMENT
    if (!earnedTypes.has('IMPROVEMENT')) {
      // Find analyses of same technique with improved score
      const analyses = await prisma.analysis.findMany({
        where: { userId, status: 'COMPLETED', overallScore: { not: null } },
        select: { techniqueId: true, overallScore: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })

      const techniqueScores: Record<string, number[]> = {}
      for (const analysis of analyses) {
        if (analysis.overallScore) {
          if (!techniqueScores[analysis.techniqueId]) {
            techniqueScores[analysis.techniqueId] = []
          }
          techniqueScores[analysis.techniqueId].push(analysis.overallScore)
        }
      }

      // Check if any technique has improvement of 1+ point
      for (const scores of Object.values(techniqueScores)) {
        if (scores.length >= 2) {
          const improvement = scores[scores.length - 1] - scores[0]
          if (improvement >= 1) {
            newBadges.push('IMPROVEMENT')
            break
          }
        }
      }
    }

    // Check streak badges
    const streak = await prisma.userStreak.findUnique({
      where: { userId },
    })

    if (streak) {
      if (!earnedTypes.has('STREAK_7') && streak.currentStreak >= 7) {
        newBadges.push('STREAK_7')
      }
      if (!earnedTypes.has('WEEK_PERFECT') && streak.currentStreak >= 7) {
        newBadges.push('WEEK_PERFECT')
      }
      if (!earnedTypes.has('STREAK_30') && streak.currentStreak >= 30) {
        newBadges.push('STREAK_30')
      }
      if (!earnedTypes.has('STREAK_100') && streak.currentStreak >= 100) {
        newBadges.push('STREAK_100')
      }
    }

    // Check DEDICATION_30
    if (!earnedTypes.has('DEDICATION_30')) {
      const activityDays = await prisma.activityLog.count({
        where: { userId },
      })
      if (activityDays >= 30) {
        newBadges.push('DEDICATION_30')
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      await prisma.userBadge.createMany({
        data: newBadges.map((badgeType) => ({
          userId,
          badgeType,
        })),
        skipDuplicates: true,
      })
    }

    return NextResponse.json({
      awarded: newBadges,
      definitions: newBadges.map((type) => BADGE_DEFINITIONS[type]),
    })
  } catch (error) {
    logger.error('Check badges error:', error)
    return NextResponse.json(
      { error: 'Error al verificar badges' },
      { status: 500 }
    )
  }
}
