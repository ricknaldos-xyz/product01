import { NextRequest, NextResponse } from 'next/server'
import { computeAllRankings } from '@/lib/rankings'
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock'
import { logger } from '@/lib/logger'
import { timingSafeCompare } from '@/lib/validation'

// POST - Cron job to compute rankings daily
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for Vercel Cron Jobs
    const authHeader = request.headers.get('authorization')
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!authHeader || !timingSafeCompare(authHeader, expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locked = await acquireCronLock('compute-rankings')
    if (!locked) {
      return NextResponse.json({ message: 'Job already running' }, { status: 200 })
    }

    try {
      await computeAllRankings()

      return NextResponse.json({ message: 'Rankings computed successfully' })
    } finally {
      await releaseCronLock('compute-rankings')
    }
  } catch (error) {
    logger.error('Compute rankings cron error:', error)
    return NextResponse.json(
      { error: 'Error computing rankings' },
      { status: 500 }
    )
  }
}
