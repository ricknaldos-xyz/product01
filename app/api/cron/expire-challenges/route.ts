import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { acquireCronLock, releaseCronLock } from '@/lib/cron-lock'
import { logger } from '@/lib/logger'
import { timingSafeCompare } from '@/lib/validation'

// POST - Expire old pending challenges
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const expected = `Bearer ${process.env.CRON_SECRET ?? ''}`
    if (!authHeader || !timingSafeCompare(authHeader, expected)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const locked = await acquireCronLock('expire-challenges')
    if (!locked) {
      return NextResponse.json({ message: 'Job already running' }, { status: 200 })
    }

    try {
      const result = await prisma.challenge.updateMany({
        where: {
          status: 'PENDING',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json({
        message: `Expired ${result.count} challenges`,
      })
    } finally {
      await releaseCronLock('expire-challenges')
    }
  } catch (error) {
    logger.error('Expire challenges cron error:', error)
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
