import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const [
    user,
    playerProfile,
    sportProfiles,
    analyses,
    trainingPlans,
    goals,
    badges,
    notifications,
    follows,
    followers,
    comments,
    shopOrders,
    stringingOrders,
    courtBookings,
    challenges,
    matches,
  ] = await Promise.all([
    // Core user data (exclude password)
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        accountType: true,
        subscription: true,
        emailVerified: true,
        onboardingCompleted: true,
        emailNotifications: true,
        weeklyDigestEnabled: true,
        reminderTime: true,
        favoriteSports: true,
        preferredAngles: true,
        createdAt: true,
        lastLoginAt: true,
      },
    }),

    // Player profile
    prisma.playerProfile.findUnique({
      where: { userId },
      select: {
        displayName: true,
        bio: true,
        avatarUrl: true,
        city: true,
        country: true,
        compositeScore: true,
        skillTier: true,
        createdAt: true,
      },
    }),

    // Sport profiles
    prisma.sportProfile.findMany({
      where: { profile: { userId } },
      select: {
        sport: { select: { name: true } },
        compositeScore: true,
        skillTier: true,
        totalAnalyses: true,
        matchesPlayed: true,
        matchesWon: true,
        globalRank: true,
      },
    }),

    // Analyses with issues
    prisma.analysis.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        overallScore: true,
        summary: true,
        strengths: true,
        priorityFocus: true,
        createdAt: true,
        technique: { select: { name: true, sport: { select: { name: true } } } },
        variant: { select: { name: true } },
        issues: {
          select: {
            category: true,
            title: true,
            description: true,
            severity: true,
            correction: true,
            drills: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Training plans with progress
    prisma.trainingPlan.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        createdAt: true,
        completedAt: true,
        exercises: {
          select: {
            name: true,
            description: true,
            sets: true,
            reps: true,
            durationMins: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Goals
    prisma.improvementGoal.findMany({
      where: { userId },
      select: {
        title: true,
        description: true,
        targetScore: true,
        currentScore: true,
        status: true,
        createdAt: true,
        completedAt: true,
      },
    }),

    // Badges
    prisma.userBadge.findMany({
      where: { userId },
      select: {
        badgeType: true,
        earnedAt: true,
      },
    }),

    // Notifications
    prisma.notification.findMany({
      where: { userId },
      select: {
        type: true,
        title: true,
        body: true,
        read: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),

    // Following
    prisma.follow.findMany({
      where: { follower: { userId } },
      select: {
        following: { select: { displayName: true } },
        createdAt: true,
      },
    }),

    // Followers
    prisma.follow.findMany({
      where: { following: { userId } },
      select: {
        follower: { select: { displayName: true } },
        createdAt: true,
      },
    }),

    // Comments
    prisma.comment.findMany({
      where: { author: { userId } },
      select: {
        content: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Shop orders
    prisma.shopOrder.findMany({
      where: { userId },
      select: {
        status: true,
        totalCents: true,
        createdAt: true,
        items: {
          select: {
            quantity: true,
            priceCents: true,
            productName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Stringing orders
    prisma.stringingOrder.findMany({
      where: { userId },
      select: {
        status: true,
        totalCents: true,
        racketBrand: true,
        racketModel: true,
        stringName: true,
        tensionMain: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Court bookings
    prisma.courtBooking.findMany({
      where: { userId },
      select: {
        status: true,
        date: true,
        startTime: true,
        endTime: true,
        totalCents: true,
        court: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Challenges
    prisma.challenge.findMany({
      where: { OR: [{ challenger: { userId } }, { challenged: { userId } }] },
      select: {
        status: true,
        message: true,
        proposedDate: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),

    // Matches
    prisma.match.findMany({
      where: {
        OR: [
          { player1: { userId } },
          { player2: { userId } },
        ],
      },
      select: {
        score: true,
        player1Result: true,
        player2Result: true,
        playedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    platform: 'SportTek',
    user,
    playerProfile,
    sportProfiles,
    analyses,
    trainingPlans,
    goals,
    badges,
    notifications,
    social: {
      following: follows.map((f) => ({
        name: f.following.displayName,
        since: f.createdAt,
      })),
      followers: followers.map((f) => ({
        name: f.follower.displayName,
        since: f.createdAt,
      })),
      comments,
    },
    purchases: {
      shopOrders,
      stringingOrders,
      courtBookings,
    },
    competitions: {
      challenges,
      matches,
    },
  }

  const json = JSON.stringify(exportData, null, 2)
  const filename = `SportTek-export-${new Date().toISOString().slice(0, 10)}.json`

  return new NextResponse(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
