import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import { sanitizeZodError } from '@/lib/validation'

const broadcastSchema = z.object({
  title: z.string().min(1, 'El titulo es requerido').max(200),
  body: z.string().max(1000).optional(),
  segment: z.enum(['all', 'free', 'pro', 'elite', 'coaches', 'players']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const json = await request.json()
    const parsed = broadcastSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { error: sanitizeZodError(parsed.error) },
        { status: 400 },
      )
    }

    const { title, body, segment } = parsed.data

    // Build user filter based on segment
    const where: Record<string, unknown> = {}
    switch (segment) {
      case 'free':
        where.subscription = 'FREE'
        break
      case 'pro':
        where.subscription = 'PRO'
        break
      case 'elite':
        where.subscription = 'ELITE'
        break
      case 'coaches':
        where.accountType = 'COACH'
        break
      case 'players':
        where.accountType = 'PLAYER'
        break
      case 'all':
      default:
        break
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    })

    if (users.length === 0) {
      return NextResponse.json({ sent: 0 })
    }

    const notifications = users.map((user) => ({
      userId: user.id,
      type: 'SYSTEM_ANNOUNCEMENT' as const,
      title,
      body: body || null,
    }))

    await prisma.notification.createMany({
      data: notifications,
    })

    logger.info('Admin broadcast notification sent', {
      adminId: session.user.id,
      segment,
      title,
      recipientCount: users.length,
    })

    return NextResponse.json({ sent: users.length })
  } catch (error) {
    logger.error('Admin broadcast error:', error)
    return NextResponse.json(
      { error: 'Error al enviar notificacion' },
      { status: 500 },
    )
  }
}
