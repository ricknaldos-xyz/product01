import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { reportLimiter } from '@/lib/rate-limit'

const reportSchema = z.object({
  targetId: z.string().min(1),
  targetType: z.enum(['profile', 'comment', 'match_rating']),
  reason: z.enum(['SPAM', 'INAPPROPRIATE', 'HARASSMENT', 'FAKE_PROFILE', 'OTHER']),
  description: z.string().max(1000).optional(),
})

// POST - Report content
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { success } = await reportLimiter.check(session.user.id)
    if (!success) {
      return NextResponse.json(
        { error: 'Demasiados intentos. Intenta de nuevo mas tarde.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = reportSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { targetId, targetType, reason, description } = parsed.data

    await prisma.report.create({
      data: {
        reporterId: session.user.id,
        targetId,
        targetType,
        reason,
        description,
      },
    })

    return NextResponse.json({ reported: true }, { status: 201 })
  } catch (error) {
    logger.error('Report error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
