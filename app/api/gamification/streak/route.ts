import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get or create user streak
    let streak = await prisma.userStreak.findUnique({
      where: { userId: session.user.id },
    })

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 0,
          longestStreak: 0,
        },
      })
    }

    return NextResponse.json(streak)
  } catch (error) {
    logger.error('Get streak error:', error)
    return NextResponse.json(
      { error: 'Error al obtener racha' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get or create user streak
    let streak = await prisma.userStreak.findUnique({
      where: { userId: session.user.id },
    })

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId: session.user.id,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityAt: new Date(),
        },
      })
      return NextResponse.json(streak)
    }

    // Check if already logged today
    if (streak.lastActivityAt) {
      const lastActivity = new Date(streak.lastActivityAt)
      lastActivity.setHours(0, 0, 0, 0)

      if (lastActivity.getTime() === today.getTime()) {
        // Already logged today, just return current streak
        return NextResponse.json(streak)
      }

      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastActivity.getTime() === yesterday.getTime()) {
        // Consecutive day - increment streak
        const newStreak = streak.currentStreak + 1
        streak = await prisma.userStreak.update({
          where: { userId: session.user.id },
          data: {
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActivityAt: new Date(),
          },
        })
      } else if (lastActivity.getTime() < yesterday.getTime()) {
        // Streak broken - check if user has a freeze
        if (streak.freezesAvailable > 0 && !streak.freezeUsedAt) {
          // Use freeze - don't reset streak, but mark freeze as used
          streak = await prisma.userStreak.update({
            where: { userId: session.user.id },
            data: {
              freezesAvailable: streak.freezesAvailable - 1,
              freezeUsedAt: new Date(),
              lastActivityAt: new Date(),
            },
          })
        } else {
          // Reset streak
          streak = await prisma.userStreak.update({
            where: { userId: session.user.id },
            data: {
              currentStreak: 1,
              lastActivityAt: new Date(),
            },
          })
        }
      }
    } else {
      // First activity ever
      streak = await prisma.userStreak.update({
        where: { userId: session.user.id },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(1, streak.longestStreak),
          lastActivityAt: new Date(),
        },
      })
    }

    return NextResponse.json(streak)
  } catch (error) {
    logger.error('Update streak error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar racha' },
      { status: 500 }
    )
  }
}
