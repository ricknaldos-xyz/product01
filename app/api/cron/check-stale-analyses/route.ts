import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock'
import { timingSafeCompare } from '@/lib/validation'

const STALE_THRESHOLD_MS = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
  if (!authHeader || !timingSafeCompare(authHeader, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const locked = await acquireCronLock('check-stale-analyses')
  if (!locked) {
    return NextResponse.json({ message: 'Job already running' }, { status: 200 })
  }

  try {
    const staleThreshold = new Date(Date.now() - STALE_THRESHOLD_MS)

    // Find analyses that have been processing for too long
    const staleAnalyses = await prisma.analysis.findMany({
      where: {
        status: 'PROCESSING',
        processingStartedAt: {
          lt: staleThreshold,
        },
      },
      select: {
        id: true,
        processingStartedAt: true,
        retryCount: true,
      },
    })

    if (staleAnalyses.length === 0) {
      return NextResponse.json({
        message: 'No stale analyses found',
        checked: 0,
        marked: 0,
      })
    }

    // Mark stale analyses as failed
    const result = await prisma.analysis.updateMany({
      where: {
        id: { in: staleAnalyses.map((a) => a.id) },
      },
      data: {
        status: 'FAILED',
        errorMessage: 'El analisis excedio el tiempo limite. Puedes intentarlo de nuevo.',
      },
    })

    logger.debug(`Marked ${result.count} stale analyses as failed`)

    return NextResponse.json({
      message: 'Stale analyses check completed',
      checked: staleAnalyses.length,
      marked: result.count,
    })
  } catch (error) {
    logger.error('Stale analyses check error:', error)
    return NextResponse.json(
      { error: 'Error checking stale analyses' },
      { status: 500 }
    )
  } finally {
    await releaseCronLock('check-stale-analyses')
  }
}
